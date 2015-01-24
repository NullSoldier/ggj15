class Server {
  connections : Array<Connection> = []
  room = new Room()

  constructor(webSocketServer : any) {
    this.room.addAIPlayer(FollowNearestPlayerAI)
    this.room.addAIPlayer(AvoidPlayerAI)

    webSocketServer.on('connection', (socket : any) => {
      this.connections.push(new Connection(this, socket))
    })

    setInterval(() => this.room.tick(), 1000 / MAKE_UPDATES_PER_SECOND)
    setInterval(() => this.room.sendRoomState(), 1000 / SEND_UPDATES_PER_SECOND)
  }
}
