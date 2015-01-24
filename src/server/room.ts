class Room {
  players : Array<Player> = []
  ais : Array<PlayerAI> = []

  private nextPlayerID : number = 1;

  private createPlayerID() : number {
    return this.nextPlayerID++;
  }

  // Does not add the player.
  createPlayer(name : string) : Player {
    var player = new Player(this.createPlayerID(), name)
    player.x = Math.floor(Math.random() * 1000)
    player.y = Math.floor(Math.random() * 1000)
    return player
  }

  addPlayer(player : Player) : void {
    if (!player) {
      throw new Error('Bad player')
    }
    player.state = PlayerState.Alive
    this.players.push(player)
    this.sendRoomJoined(player)

    // Don't send room list to AI
    if (player.connection) {
      this.sendRoomList(player)
    }
  }

  addAIPlayer(aiFactory : new (player : Player) => PlayerAI) : void {
    name = 'Artificial Indigo ' + Math.round(Math.random() * 10)
    var player = this.createPlayer(name)
    player.speed = 2 // HACK(strager): Make AI players easier to chase down.
    this.addPlayer(player)
    this.ais.push(new aiFactory(player))
  }

  removePlayer(player : Player) : void {
    var index = this.players.indexOf(player)
    if (index === -1) {
      throw new Error('Tried to remove player not in array')
    }
    this.players.splice(index, 1)
    player.state = PlayerState.Left
    this.sendRoomLeft(player)
  }

  tick() : void {
    this.ais.forEach((ai) => {
      ai.update(this.players)
    })
  }

  sendToAll(message) {
    this.sendToAllExcept(message, -1)
  }

  sendToAllExcept(message, exemptPlayerId : number) {
    this.players.forEach((player) => {
      if (player.connection && player.id !== exemptPlayerId) {
        player.connection.send(message)
      }
    })
  }

  sendRoomJoined(playerJoined : Player) {
    var message = playerJoined.toRoomList()
    this.sendToAllExcept({roomJoined: message}, playerJoined.id)
  }

  sendRoomLeft(playerLeft : Player) {
    var message = playerLeft.toRoomList()
    this.sendToAllExcept({roomJoined: message}, playerLeft.id)
  }

  sendRoomList(to : Player) {
    var message = {players: this.players.map((p) => p.toRoomList())}
    to.connection.send({roomList: message})
  }

  sendRoomState() {
    var message = {players: this.players.map((p) => p.toRoomState())}
    this.sendToAll({roomState: message})
  }
}
