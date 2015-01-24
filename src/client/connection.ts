class Connection {
  connection : WebSocket

  constructor(host : string, private game : WitchGame) {
    game.gameState = GameState.Joining
    this.connection = new WebSocket(host)
    this.connection.binaryType = 'arraybuffer';
    this.connection.addEventListener('open', (event : Event) => {
      this.send({
        authenticate: {
          playerName: 'Billy Bob',
        },
      })
    })
    this.connection.addEventListener('message', (event : MessageEvent) => {
      var m : any = protocol.ServerMessage.decode(event.data)
      //console.log('recv', m)
      switch (m.message) {
      case 'authenticated':
        this.onAuthenticated(m.authenticated.playerID)
        break
      case 'roomInfo':
        this.onRoomInfo(m.roomInfo.players)
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
    this.game.createPlayer('Billy Bobx', playerID)
    this.game.gameState = GameState.Playing
  }

  private onRoomInfo(playerInfos : Array<any>) : void {
    var playerIDs : Array<number> = []
    playerInfos.forEach((playerInfo) => {
      var id : number = playerInfo.id
      playerIDs.push(id)
      var player = this.game.getPlayerByIDOrNull(id)
      if (player) {
        player.name = playerInfo.name
      } else {
        player = new Player(id)
        player.name = playerInfo.name
        this.game.addPlayer(player)
      }
    })
    this.game.getPlayers().forEach((player) => {
      if (playerIDs.indexOf(player.id) === -1) {
        this.game.removePlayer(player)
      }
    })
  }

  private onRoomState(playerStates : Array<any>) : void {
    playerStates.forEach((playerState) => {
      var player = this.game.getPlayerByIDOrNull(playerState.id)
      if (player === this.game.player && player.state === PlayerState.Alive) {
        // Ignore updates to position for the current player if it's alive.
        // They'll be moving and they don't want to be bothered.
      } else {
        player.x = playerState.x
        player.y = playerState.y
      }
      player.state = playerState.state
    })
  }
}
