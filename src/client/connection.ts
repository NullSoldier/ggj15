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

  private onAuthenticated(playerID : number) : void {
    console.info('Logged in as Billy Bob ', playerID)
    this.game.createPlayer('Billy Bob', playerID)
    this.game.gameState = GameState.Playing
  }

  private onRoomJoined(playerInfo) : void {
    console.info(playerInfo.name, ' joined the room')
    var player = new Player(playerInfo.id, playerInfo.name)
    this.game.addPlayer(player)
  }

  private onRoomLeft(playerInfo) : void {
    console.info(playerInfo.name, ' left the room')
    var player = this.game.getPlayerByIDOrNull(playerInfo.id)
    this.game.removePlayer(player)
  }

  private onRoomList(playerInfos : Array<any>) : void {
    console.info("Players")
    playerInfos.forEach((playerInfo) => {
      if(playerInfo.id !== this.game.player.id) {
        var player = new Player(playerInfo.id, playerInfo.name)
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
      }
    })
  }
}
