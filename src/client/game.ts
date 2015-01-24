enum GameState {
  None    = 0,
  Joining = 1,
  Playing = 2
}

class WitchGame {
  gameState            : GameState
  mapGroup             : Phaser.Group;
  player               : Player
  playerController     : PlayerController
  playerInfluenceGroup : Phaser.Group

  private players : Array<Player> = []

  preload() {
    game.load.image('player', 'assets/player.png')
    game.load.image('player_influence', 'assets/metaball-falloff.png')
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
    player.state = PlayerState.Alive
    player.sprite.anchor.set(0.5, 1.0)
    player.influenceSprite = game.add.sprite(0, 0, 'player_influence')
    player.influenceSprite.anchor.set(0.5, 0.5)
    this.playerInfluenceGroup.addChild(player.influenceSprite)
    player.influenceSprite.blendMode = PIXI.blendModes.ADD
    this.players.push(player)
  }

  removePlayer(player : Player) : void {
    console.log('Removing player', player.name)
    var index = this.players.indexOf(player)
    if (index === -1) {
      throw new Error('Tried to remove a player not in array')
    }
    player.sprite.parent.removeChild(player.sprite)
    this.players.splice(index, 1)
  }

  create() {
    connection = new Connection('ws://' + window.document.location.host, this)

    game.stage.backgroundColor = STAGE_COLOR
    game.stage.disableVisibilityChange = true;

    this.mapGroup = game.add.group(game.world)
    this.playerInfluenceGroup = game.add.group(game.world)
    this.playerInfluenceGroup.filters = [new InfluenceFilter(game)]

    // eat these so the browser doesn't get them
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

    var sampleLevel = new Level()
    sampleLevel.background = game.make.sprite(0, 0, 'level_sample')
    this.loadLevel(sampleLevel)
  }

  createPlayer(name : string, id : number) : void {
    this.player = new Player(id)
    this.player.name = name
    this.playerController = new PlayerController(this.player)
    this.addPlayer(this.player)
  }

  update() {
    if (this.gameState === GameState.Playing && this.player.state === PlayerState.Alive) {
      this.playerController.update()
      this.moveCameraTo(this.player)
      this.sendPlayerState(this.player)
    }
  }

  sendPlayerState(player : Player) {
    connection.send({
      playerState: {
        x: player.x,
        y: player.y,
      }
    })
  }

  render() {
    game.debug.text(GameState[this.gameState], 20, 20);
    if (this.player) {
      game.debug.text(PlayerState[this.player.state], 20, 40);
    }

    this.players.forEach((player) => {
      player.render()
    })
  }

  moveCameraTo(player : Player) {
    var pos = lerpPos(
      game.camera.view.centerX, this.player.x,
      game.camera.view.centerY, this.player.y, 0.2)

    game.camera.setPosition(
      pos.x - game.camera.view.halfWidth,
      pos.y - game.camera.view.halfHeight)
  }

  loadLevel(level : Level) {
    this.mapGroup.add(level.background)
    game.camera.bounds = null
  }

  unloadLevel() {
    this.mapGroup.removeAll()
  }
}
