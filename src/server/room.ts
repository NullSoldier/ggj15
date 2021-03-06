class Room implements Worldish {
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

  private gameRestarting : boolean = false

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
    var randSpawn = this.getRandomSpawnVec()
    player.x = Math.round(randSpawn[0])
    player.y = Math.round(randSpawn[1])
    return player
  }

  getPlayerByIDOrNull(id : number) : Player {
    return _.find(this.players, (p) => p.id === id)
  }

  getPlayerByID(id : number) : Player {
    var p = this.getPlayerByIDOrNull(id)
    assertNotNull(p)
    return p
  }

  tick() : void {
    _.each(this.players, (p) => p.updatePhysicsServer(this))
    _.each(this.bullets, (b) => b.update())

    _.chain(this.ais)
      .filter((ai) => ai.player.state === PlayerState.Alive)
      .each((ai) => ai.update(this))

    this.checkRestartGame()
    this.destroyInactiveBullets()
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
    this.sendRoomJoined(player)
    this.sendRoomList(player)
    this.spawnPlayer(player)
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

  sendDestroyBullet(bullet : Bullet, expired=false) {
    removeFromArray(this.bullets, bullet)

    var message = {
      ownerID: bullet.ownerID,
      bulletID: bullet.bulletID,
      expired: expired
    }
    this.sendToAll({destroyBullet: message})
  }

  checkRestartGame() {
    if (!this.isOneTeam() || this.gameRestarting) {
      return
    }

    this.destroyAllBullets()
    this.gameRestarting = true

    setTimeout(() => {
      this.gameRestarting = false
      for(var index in this.players) {
        var player = this.players[index]

        var message = {
          playerID: player.id,
          teamID  : null,
        }
        this.sendToAll({playerKilled: message})

        this.changeTeam(player, null)

          var randSpawn = this.getRandomSpawnVec()
          player.x = Math.round(randSpawn[0])
          player.y = Math.round(randSpawn[1])
          this.spawnPlayer(player)
      }
    }, 2000)
  }

  isOneTeam() {
    if (this.players.length <= 2)
      return false

    var lastTeam = -1
    for(var index in this.players) {
      var player = this.players[index]

      if (player.teamID === null) {
        return false
      }

      if(player.teamID != lastTeam && lastTeam != -1) {
        return false
      }

      lastTeam = player.teamID
    }
    return true
  }

  playerKilled(player : Player, killer : Player) {
    // Create a team if killer doesn't belong to one
    if (killer.teamID === null) {
      killer.teamID = killer.id
      this.changeTeam(killer, killer.id)
    }

    player.state = PlayerState.Dead

    if (player.isLeader()) {
      console.log("Leader", player.name, "died, demoting")
      _.chain(this.players)
        .filter((p) => player.isLeaderOf(p))
        .each((p) => this.changeTeam(p, null))
    }

    this.changeTeam(player, killer.teamID)

    var message = {
      playerID: player.id,
      teamID  : player.teamID,
    }
    this.sendToAll({playerKilled: message})

    setTimeout(() => {

      if (player.teamID === null) {
        var randSpawn = this.getRandomSpawnVec()
        player.x = Math.round(randSpawn[0])
        player.y = Math.round(randSpawn[1])
        console.log(player.name, "'s leader died spawning free")
      } else {
        var leader = this.getPlayerByIDOrNull(player.teamID)
        player.x = Math.round(leader.x)
        player.y = Math.round(leader.y)
        console.log("Spawning", player.name, "at leader", leader.name)
      }

      this.spawnPlayer(player)
    }, 500)
  }

  changeTeam(player : Player, toTeamID) {
    player.teamID = toTeamID
    var message = {
      playerID: player.id,
      teamID  : toTeamID,
    }
    this.sendToAll({playerTeamChanged: message})
  }

  sendFireBullet(owner : Player, bulletInfo) {
    this.sendToAll({fireBullet: bulletInfo})
    var bullet = SmokeBullet.fromBulletInfo(bulletInfo)
    this.bullets.push(bullet)
  }

  spawnPlayer(player : Player) {
    player.state = PlayerState.Alive
    player.health = player.maxHealth

    this.sendToAll({playerSpawned: {
      playerID: player.id,
      teamID  : player.teamID,
      spawnX  : player.x,
      spawnY  : player.y,
      health  : player.health
    }})
  }

  destroyInactiveBullets() {
    for(var i=this.bullets.length-1; i>=0; i--) {
      var bullet = this.bullets[i]
      if (!bullet.active) {
        this.sendDestroyBullet(bullet, bullet.expired)
      }
    }
  }

  destroyAllBullets() {
    for(var i=this.bullets.length-1; i>=0; i--) {
      var bullet = this.bullets[i]
      this.sendDestroyBullet(bullet, bullet.expired)
    }
  }

  getRandomSpawnVec() {
    var positions = [
      [758, 2314],
      [1100, 1885],
      [4030, 2366],
      [4450, 1333],
      [3050, 360],
      [1220, 1731],
      [680, 639],
    ]

    return positions[Math.floor(Math.random() * positions.length)]
  }
}
