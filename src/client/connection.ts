class Connection {
  connection : WebSocket

  constructor(host : string, private game : WitchGame) {
    game.gameState = GameState.Joining

    this.connection = new WebSocket(host)
    this.connection.binaryType = 'arraybuffer';
    this.connection.addEventListener('open', (event : Event) => {
      this.send({
        authenticate: {playerName: 'Billy Bob'},
      })
    })

    this.connection.addEventListener('message', (event : MessageEvent) => {
      var m : any = protocol.ServerMessage.decode(event.data)
      //console.log('recv', m)
      switch (m.message) {
      case 'authenticated':
        this.onAuthenticated(m.authenticated.playerID)
        break
      case 'roomJoined':
        this.onRoomJoined(m.roomJoined)
        break
      case 'roomLeft':
        this.onRoomLeft(m.roomLeft)
        break
      case 'roomList':
        this.onRoomList(m.roomList.players)
        break
      case 'roomState':
        this.onRoomState(m.roomState.players)
        break
      case 'fireBullet':
        this.onFireBullet(m.fireBullet)
        break;
      case 'destroyBullet':
        this.onDestroyBullet(m.destroyBullet)
        break;
      case 'playerKilled':
        this.onPlayerKilled(m.playerKilled)
        break;
      default:
        throw new Error('Unknown message ' + m.message)
      }
    })

    this.connection.addEventListener('error', (event : ErrorEvent) => {
      console.error('SOCKET ERROR')
    })
  }

  send(messageObject : any) : void {
    //console.log('send', messageObject)
    this.connection.send(new protocol.ClientMessage(messageObject).toBuffer());
  }

  sendPlayerState(player : Player) {
    this.send({playerState: {
      x: player.x,
      y: player.y,
      animation: player.animation,
      lookDirX: player.lookDir[0],
      lookDirY: player.lookDir[1]
    }})
  }

  private onAuthenticated(playerID : number) : void {
    console.info('Logged in as Billy Bob ', playerID)
    this.game.createPlayer('Billy Bob', playerID)
    this.game.gameState = GameState.Playing
  }

  private onRoomJoined(playerInfo) : void {
    console.info(playerInfo.name, ' joined the room')
    var player = new Player(playerInfo.id, playerInfo.name, playerInfo.teamID)
    this.game.addPlayer(player)
  }

  private onRoomLeft(playerInfo) : void {
    var player = this.game.getPlayerByIDOrNull(playerInfo.id)
    console.info(player.name, ' left the room')
    this.game.removePlayer(player)
  }

  private onRoomList(playerInfos : Array<any>) : void {
    console.info("Players")
    playerInfos.forEach((playerInfo) => {
      if(playerInfo.id !== this.game.player.id) {
        var player = new Player(playerInfo.id, playerInfo.name, playerInfo.teamID)
        this.game.addPlayer(player)
        console.info("\t", playerInfo.name)
      }
    })
  }

  private onRoomState(playerStates : Array<any>) : void {

    playerStates.forEach((playerState) => {
      // sync server state with local state
      var player = this.game.getPlayerByIDOrNull(playerState.id)
      player.state = playerState.state

      if (player === this.game.player && player.state === PlayerState.Alive) {
        // Ignore updates to position for the current player if it's alive.
        // They'll be moving and they don't want to be bothered.
      } else {
        player.x = playerState.x
        player.y = playerState.y
        player.lookDir = [playerState.lookDirX, playerState.lookDirY]
        player.animation = playerState.animation
      }
    })
  }

  private onFireBullet(bulletInfo) : void {
    var bullet = SmokeBullet.fromBulletInfoClient(bulletInfo, game)
    this.game.addBullet(bullet)

    var player = witch.getPlayerByIDOrNull(bulletInfo.ownerID)
    if (player) {
      player.justFiredBullet()
    }
  }

  private onDestroyBullet(bulletInfo) : void {
    var bullet = _.find(this.game.bullets, (b) => Bullet.areEqual(b, bulletInfo))
    this.game.removeBullet(bullet)
  }

  private onPlayerKilled(message) {
    var player = this.game.getPlayerByIDOrNull(message.playerID)
    var killer = this.game.getPlayerByIDOrNull(message.killerID)

    player.state = PlayerState.Dead
    player.teamID = message.killerID
    player.sprite.visible = false
    player.influenceSprite.visible = false

    var influenceGroup = this.game.teamInfluenceGroups[message.killerID]
    influenceGroup.addChild(player.influenceSprite)

    setTimeout(() => {
      player.x = killer.x
      player.y = killer.y
      player.sprite.visible = true
      player.influenceSprite.visible = true
      player.state = PlayerState.Alive
    }, message.respawnIn)
  }
}
