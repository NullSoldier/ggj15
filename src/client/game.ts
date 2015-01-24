enum GameState {
  Joining,
  Playing,
}

class Level {
  background: Phaser.Sprite;
}

class WitchGame {
  gameState       : GameState
  mapGroup        : Phaser.Group;
  player          : Player
  playerController: PlayerController

  private connection: Connection
  private players : Array<Player> = []

  preload() {
    game.load.image('player', 'assets/player.png')
    game.load.image('level_sample', 'assets/level_sample.png')
  }

  // Don't mutate the result, please...
  getPlayers() : Array<Player> {
    return this.players
  }

  getPlayerByIDOrNull(id : number) : Player {
    for (var i : number = 0; i < this.players.length; ++i) {
      if (this.players[i].id === id) {
        return this.players[i]
      }
    }
    return null
  }

  addPlayer(player : Player) : void {
    console.log('Adding player', player.name)
    player.sprite = game.add.sprite(0, 0, 'player')
    player.speed = 5
    this.players.push(player)
  }

  removePlayer(player : Player) : void {
    console.log('Removing player', player.name)
    var index = this.players.indexOf(player)
    if (index === -1) {
      throw new Error('Tried to remove a player not in array')
    }
    this.player.sprite.parent.removeChild(this.player.sprite)
    this.players.splice(index, 1)
  }

  create() {
    this.connection = new Connection('ws://' + window.document.location.host, this)

    game.stage.backgroundColor = STAGE_COLOR
    game.stage.disableVisibilityChange = true;

    this.mapGroup = game.add.group(game.world)

    // eat these so the browser doesn't get them
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

    var sampleLevel = new Level()
    sampleLevel.background = game.make.sprite(0, 0, 'level_sample')
    this.loadLevel(sampleLevel)
  }

  createPlayer(name : string, id : number) : void {
    this.player = new Player()
    this.player.id = id
    this.player.name = name
    this.playerController = new PlayerController(this.player)
    this.addPlayer(this.player)
  }

  update() {
    if (this.playerController) {
      this.playerController.update()
    }

    this.send()
  }

  send() {
    if (this.player) {
      this.connection.send({
        playerState: {
          x: this.player.x,
          y: this.player.y,
        }
      })
    }
  }

  render() {
    game.debug.cameraInfo(game.camera, 32, 32);
    this.players.forEach((player) => {
      player.render()
    })
  }

  loadLevel(level : Level) {
    this.mapGroup.add(level.background)
  }

  unloadLevel() {
    this.mapGroup.removeAll()
  }
}
