class Server {
  connections : Array<Connection> = []
  room = new Room()

  constructor(webSocketServer : any) {

    var followAI = this.addAIPlayer(FollowNearestPlayerAI)
    followAI.speed = 3
    this.room.spawnPlayer(followAI)

    var avoidAI = this.addAIPlayer(AvoidPlayerAI)
    avoidAI.speed = 2
    this.room.spawnPlayer(avoidAI)

    var attackAI = this.addAIPlayer(AttackNearestPlayerAI)
    attackAI.speed = 2
    this.room.spawnPlayer(attackAI)

    webSocketServer.on('connection', (socket : any) => {
      this.connections.push(new Connection(this, socket))
    })

    setInterval(() => this.room.tick(), 1000 / MAKE_UPDATES_PER_SECOND)
    setInterval(() => this.room.sendRoomState(), 1000 / SEND_UPDATES_PER_SECOND)
  }

  addAIPlayer(aiFactory : new (player : Player) => PlayerAI) : Player {
    var player = this.room.createPlayer()
    var ai = new aiFactory(player)

    // Mock connection for CPUs
    var p : any = player
    p.connection = {send: () => {}}
    p.isAI = true

    this.room.addPlayer(player)
    this.room.ais.push(ai)
    return player
  }
}
