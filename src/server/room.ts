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

  private nextPlayerID : number = 1;
  private createPlayerID() : number {
    return this.nextPlayerID++;
  }

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

  addAIPlayer(aiFactory : new (player : Player) => PlayerAI) : Player {
    var player = this.createPlayer()
    this.addPlayer(player)
    this.ais.push(new aiFactory(player))
    return player
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
    _.chain(this.ais)
      .filter((ai) => ai.player.state === PlayerState.Alive)
      .each((ai) => ai.update(this))

    this.bullets.forEach((bullet) => bullet.update())
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

  sendPlayerKilled(killed : Player, killerID : number) {
    console.log("Player killed ", killed.name)
    killed.state = PlayerState.Dead
    var message = {
      playerID : killed.id,
      killerID : killerID,
      respawnIn: 2000
    }
    this.sendToAll({playerKilled: message})
  }

  sendFireBullet(owner : Player, bulletInfo) {
    this.sendToAll({fireBullet: bulletInfo})
    var bullet = SmokeBullet.fromBulletInfo(bulletInfo)
    this.bullets.push(bullet)
  }
}
