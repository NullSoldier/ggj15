class Room {
  static playerNames : Array<string> = [
    'Billy Bob',
    'Willie Wonda',
    'Happy Camper',
    'Mean Buzz',
    'Wheat Crusher',
    'Angry Tooth',
    'The Wizz',
    'The Grinch',
  ]

  players: Array<Player> = []
  ais    : Array<PlayerAI> = []
  bullets: Array<Bullet> = []

  // Mapping from teamID to Team.colors index.
  private teamColors : any = {}
  private createPlayerID = createIDGenerator()

  private nextPlayerName : number = 0;
  private createPlayerName() : string {
    var index : number = this.nextPlayerName++;
    return Room.playerNames[index % Room.playerNames.length]
  }

  createPlayer() : Player {
    var player = new Player(this.createPlayerID(), this.createPlayerName())
    player.x = Math.floor(Math.random() * 1000)
    player.y = Math.floor(Math.random() * 1000)
    return player
  }

  getPlayerByIDOrNull(id : number) : Player {
    return _.find(this.players, (p) => p.id === id)
  }

  getPlayerByID(id : number) : Player {
    var player = this.getPlayerByID(id)
    assertNotNull(player)
    return player
  }

  tick() : void {
    _.chain(this.ais)
      .filter((ai) => ai.player.state === PlayerState.Alive)
      .each((ai) => ai.update(this))

    _.each(this.bullets, (b) => b.update())
  }

  sendToAll(message) {
    this.sendToAllExcept(message, -1)
  }

  sendToAllExcept(message, exemptPlayerId : number) {
    this.players.forEach((player) => {
      if (player.id !== exemptPlayerId) {
        player.connection.send(message)
      }
    })
  }

  addPlayer(player : Player) : void {
    assertNotNull(player)
    this.players.push(player)
    this.spawnPlayer(player)
    this.sendRoomJoined(player)
    this.sendRoomList(player)
  }

  removePlayer(player : Player) : void {
    assertNotNull(player)
    player.state = PlayerState.Left
    removeFromArray(this.players, player)
    this.sendRoomLeft(player)
  }

  sendRoomJoined(playerJoined : Player) {
    var message = playerJoined.toRoomList()
    this.sendToAllExcept({roomJoined: message}, playerJoined.id)
  }

  sendRoomLeft(playerLeft : Player) {
    this.sendToAllExcept({roomLeft: {id: playerLeft.id}}, playerLeft.id)
  }

  sendRoomList(to : Player) {
    var message = {players: this.players.map((p) => p.toRoomList())}
    to.connection.send({roomList: message})
  }

  sendRoomState() {
    var message = {players: this.players.map((p) => p.toRoomState())}
    this.sendToAll({roomState: message})
  }

  sendDestroyBullet(bullet : Bullet) {
    removeFromArray(this.bullets, bullet)

    var message = {
      ownerID: bullet.ownerID,
      bulletID: bullet.bulletID
    }
    this.sendToAll({destroyBullet: message})
  }

  playerKilled(player : Player, killer : Player) {
    // Create a team if killer doesn't belong to one
    if (killer.teamID === null) {
      killer.teamID = killer.id
    }

    player.state = PlayerState.Dead
    player.teamID = killer.teamID

    // if (player.isLeader()) {
    //   // Reassign all subordinates
    //   var sub = _.filter(this.players, (p) => player.isLeaderOf(p))
    //   _.each(sub, (s) => s.teamID = null)
    // }

    var message = {
      playerID: player.id,
      killerID: killer.id,
      teamID  : player.teamID
    }
    this.sendToAll({playerKilled: message})

    setTimeout(() => {
      this.spawnPlayer(player)

      if (player.teamID === null) {
        player.x = 100
        player.y = 100 // TODO: make random
      } else {
        var leader = this.getPlayerByID(player.teamID)
        player.x = leader.x
        player.y = leader.y
      }

      var message = {
        playerID: player.id,
        teamID  : player.teamID
      }
      this.sendToAll({playerSpawned: message})
    }, 500)
  }

  sendFireBullet(owner : Player, bulletInfo) {
    this.sendToAll({fireBullet: bulletInfo})
    var bullet = SmokeBullet.fromBulletInfo(bulletInfo)
    this.bullets.push(bullet)
  }

  spawnPlayer(player : Player) {
    player.state = PlayerState.Alive
    player.health = player.maxHealth
  }
}
