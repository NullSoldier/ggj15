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

  preload() {
    game.load.image('player', 'assets/player.png')
    game.load.image('level_sample', 'assets/level_sample.png')
  }

  create() {
    game.stage.backgroundColor = STAGE_COLOR
    game.stage.disableVisibilityChange = true;

    this.mapGroup = game.add.group(game.world)

    // eat these so the browser doesn't get them
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

    this.player = new Player()
    this.player.sprite = game.add.sprite(0, 0, 'player')
    this.player.speed = 5

    this.playerController = new PlayerController(this.player)

    var sampleLevel = new Level()
    sampleLevel.background = game.make.sprite(0, 0, 'level_sample')
    this.loadLevel(sampleLevel)
  }

  update() {
    this.playerController.update()
  }

  render() {
     game.debug.cameraInfo(game.camera, 32, 32);
  }

  loadLevel(level : Level) {
    this.mapGroup.add(level.background)
  }

  unloadLevel() {
    this.mapGroup.removeAll()
  }
}
