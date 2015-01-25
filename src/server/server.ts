class Server {
  connections : Array<Connection> = []
  room = new Room()

  constructor(webSocketServer : any) {
    var followAI = this.room.addAIPlayer(FollowNearestPlayerAI)
    followAI.speed = 3

    // var avoidAI = this.room.addAIPlayer(AvoidPlayerAI)
    // avoidAI.speed = 2
    // avoidAI.teamID = followAI.id

    // var attackAI = this.room.addAIPlayer(AttackNearestPlayerAI)
    // attackAI.speed = 2
    // attackAI.teamID = followAI.id

    webSocketServer.on('connection', (socket : any) => {
      this.connections.push(new Connection(this, socket))
    })

    setInterval(() => this.room.tick(), 1000 / MAKE_UPDATES_PER_SECOND)
    setInterval(() => this.room.sendRoomState(), 1000 / SEND_UPDATES_PER_SECOND)
  }
}
