class Connection {
  connection : WebSocket

  constructor(host : string, private game : WitchGame) {
    game.gameState = GameState.Joining

    this.connection = new WebSocket(host)
    this.connection.binaryType = 'arraybuffer';
    this.connection.addEventListener('open', (event : Event) => {
      this.send({authenticate: {}})
    })

    this.connection.addEventListener('message', (event : MessageEvent) => {
      var m : any = protocol.ServerMessage.decode(event.data)
      //console.log('recv', m)
      switch (m.message) {
      case 'authenticated':
        this.onAuthenticated(m.authenticated.playerID, m.authenticated.playerName)
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
      case 'playerSpawned':
        this.onPlayerSpawned(m.playerSpawned)
        break;
      case 'playerTeamChanged':
        this.onPlayerTeamChanged(
            m.playerTeamChanged.playerID,
            m.playerTeamChanged.teamID)
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

  private onAuthenticated(playerID : number, playerName) : void {
    console.info('Logged in as', playerName, playerID)
    this.game.createPlayer(playerID, playerName)
    this.game.gameState = GameState.Playing
  }

  private onRoomJoined(playerInfo) : void {
    console.info(playerInfo.name, ' joined the room')
    this.game.addPlayer(playerInfo.id, playerInfo.name)
  }

  private onRoomLeft(playerInfo) : void {
    var player = this.game.getPlayerByIDOrNull(playerInfo.id)
    console.info(player.name, ' left the room')
    this.game.removePlayer(player)
  }

  private onRoomList(playerInfos : Array<any>) : void {
    var msg = "Players"
    playerInfos.forEach((playerInfo) => {

      if(playerInfo.id !== this.game.player.id) {
        msg += "\n\t" + playerInfo.name
        var player = this.game.addPlayer(
          playerInfo.id,
          playerInfo.name,
          playerInfo.teamID)

        player.state = playerInfo.state

        if (player.state === PlayerState.Alive) {
          player.showClient()
        } else {
          player.hideClient()
        }
      }
    })
    console.info(msg)
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
        player.health = playerState.health
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

    if (!bulletInfo.expired) {
      this.game.removeBullet(bullet)
    } else {
      setTimeout(() => { this.game.removeBullet(bullet) }, 200)
      game.add.tween(bullet.sprite).to({ alpha: 0 }, 200, Phaser.Easing.Cubic.Out, true);
    }
  }

  private onPlayerKilled(message) {
    var player = this.game.getPlayerByIDOrNull(message.playerID)
    player.state = PlayerState.Dead
    player.teamID = message.teamID
    player.hideClient()
    this.game.addPoof(player.x, player.y - player.height / 2)
  }

  private onPlayerSpawned(message) {
    var player = this.game.getPlayerByIDOrNull(message.playerID)
    player.x = message.spawnX
    player.y = message.spawnY
    player.state = PlayerState.Alive
    player.teamID = message.teamID
    player.render()
    player.showClient()
  }

  private onPlayerTeamChanged(playerID, teamID) {
    var player = this.game.getPlayerByIDOrNull(playerID)
    this.game.setTeam(player, teamID)

    // FOR DEBUGGING
    var leader = this.game.getPlayerByIDOrNull(teamID)
    if (leader)
      console.log('Changing ', player.name, ' to ', leader.name, '\'s team')
    else
      console.log(player.name, '\'s leader was killed freeing them')
  }
}
