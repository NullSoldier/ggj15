class Room {
  players : Array<Player> = []
  ais : Array<PlayerAI> = []

  private nextPlayerID : number = 1;

  private createPlayerID() : number {
    return this.nextPlayerID++;
  }

  // Does not add the player.
  createPlayer(name : string) : Player {
    var player = new Player(this.createPlayerID())
    player.name = name
    player.x = Math.floor(Math.random() * 1000)
    player.y = Math.floor(Math.random() * 1000)
    player.state = PlayerState.Alive
    return player
  }

  addPlayer(player : Player) : void {
    if (!player) {
      throw new Error('Bad player')
    }
    this.players.push(player)
    this.setNeedSendRoomInfo()
  }

  addAIPlayer(aiFactory : new (player : Player) => PlayerAI) : void {
    var player = this.createPlayer('Artificial Indigo')
    // HACK(strager): Make AI players easier to chase down.
    player.speed = 2
    this.addPlayer(player)
    this.ais.push(new aiFactory(player))
  }

  removePlayer(player : Player) : void {
    var index = this.players.indexOf(player)
    if (index === -1) {
      throw new Error('Tried to remove player not in array')
    }
    this.players.splice(index, 1)
    this.setNeedSendRoomInfo()
  }

  private setNeedSendRoomInfo() : void {
    this.players.forEach((player) => {
      if (player.connection) {
        player.connection.needSendRoomInfo = true
      }
    })
  }

  makeUpdates() : void {
    this.updateAIs()
  }

  private updateAIs() : void {
    this.ais.forEach((ai) => {
      ai.update(this.players)
    })
  }

  sendUpdates() : void {
    var roomInfo : any = {
      players: this.players.map((player) => {
        return {
          id: player.id,
          name: player.name,
        }
      }),
    }
    this.players.forEach((player) => {
      if (player.connection) {
        if (player.connection.needSendRoomInfo) {
          player.connection.send({roomInfo: roomInfo})
        }
        player.connection.needSendRoomInfo = false
      }
    })

    var roomState : any = {
      players: this.players.map((player) => {
        return {
          id: player.id,
          x: player.x,
          y: player.y,
          state: player.state,
        }
      })
    }
    this.players.forEach((player) => {
      if (player.connection) {
        player.connection.send({roomState: roomState})
      }
    })
  }
}
