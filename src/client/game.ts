enum GameState {
  None    = 0,
  Joining = 1,
  Playing = 2
}

class WitchGame {
  gameState               : GameState
  mapGroup                : Phaser.Group;
  player                  : Player
  playerController        : PlayerController
  teamInfluenceGroupGroup : Phaser.Group
  teamInfluenceGroups     : any = {}  // Team ID => Phaser.Group
  level                   : Level

  private players : Array<Player> = []
  bullets : Array<Bullet> = []

  preload() {
    game.load.image('smoke', 'assets/smoke.png')
    game.load.image('player_influence', 'assets/metaball-falloff.png')
    game.load.image('background_01', 'assets/background_01.png')
    game.load.image('background_02', 'assets/background_02.png')
    game.load.image('background_03', 'assets/background_03.png')
    game.load.image('background_04', 'assets/background_04.png')
    game.load.atlasJSONHash('player', 'assets/player.png', 'assets/player.json');
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
    player.sprite = game.add.sprite(0, 0, 'player')
    player.sprite.anchor.set(0.5, 1.0)
    player.sprite.animations.add(Animation[Animation.Idle], [
      'Player-Front-Bob.png'])
    player.sprite.animations.add(Animation[Animation.WalkDown], [
      'Player-Front-LeftFoot.png',
      'Player-Front-Static.png',
      'Player-Front-RightFoot.png',
      'Player-Front-Static.png'])
    player.sprite.animations.add(Animation[Animation.WalkUp], [
      'Player-Back-LeftFoot.png',
      'Player-Back-Static.png',
      'Player-Back-RightFoot.png',
      'Player-Back-Static.png'])

    var influenceGroup : Phaser.Group = this.teamInfluenceGroups[player.teamID]
    if (!influenceGroup) {
      influenceGroup = game.add.group(this.teamInfluenceGroupGroup)
      this.teamInfluenceGroups[player.teamID] = influenceGroup
    }
    player.influenceSprite = game.add.sprite(0, 0, 'player_influence')
    player.influenceSprite.blendMode = PIXI.blendModes.ADD
    player.influenceSprite.anchor.set(0.5, 0.5)
    influenceGroup.addChild(player.influenceSprite)

    var influenceFilter = new InfluenceFilter(game)
    this.applyTeamInfluenceColor(player.teamID, influenceFilter)
    influenceGroup.filters = [influenceFilter]

    this.players.push(player)
  }

  removePlayer(player : Player) : void {
    var index = this.players.indexOf(player)
    if (index === -1) {
      throw new Error('Tried to remove a player not in array')
    }
    player.sprite.parent.removeChild(player.sprite)
    this.players.splice(index, 1)
  }

  private teamColors : any = {}  // Team ID => [r, g, b]
  getTeamColor(teamID : number) : Array<number> {
    if (!(teamID in this.teamColors)) {
      // Find an unused color.
      var unusedColors = Team.colors.slice()
      this.players.forEach((player) => {
        if (!(player.teamID in this.teamColors)) {
          return
        }
        var teamColor = this.teamColors[player.teamID]
        var index = unusedColors.indexOf(teamColor)
        if (index !== -1) {
          unusedColors.splice(index, 1)
        }
      })
      this.teamColors[teamID] = unusedColors.pop()
    }
    return this.teamColors[teamID]
  }

  private applyTeamInfluenceColor(teamID : number, filter : InfluenceFilter) : void {
    var teamColor = this.getTeamColor(teamID)
    filter.setColor(teamColor[0], teamColor[1], teamColor[2])
  }

  create() {
    connection = new Connection('ws://' + window.document.location.host, this)

    game.stage.backgroundColor = STAGE_COLOR
    game.stage.disableVisibilityChange = true;

    this.mapGroup = game.add.group(game.world)
    this.teamInfluenceGroupGroup = game.add.group(game.world)

    // eat these so the browser doesn't get them
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

    var sampleLevel = new Level()
    sampleLevel.backgroundSprites.push(game.make.sprite(0, 0, 'background_01'))
    sampleLevel.backgroundSprites.push(game.make.sprite(2560, 0, 'background_02'))
    sampleLevel.backgroundSprites.push(game.make.sprite(0, 1353, 'background_03'))
    sampleLevel.backgroundSprites.push(game.make.sprite(2560, 1353, 'background_04'))
    sampleLevel.width = 5120
    sampleLevel.height = 2880
    this.loadLevel(sampleLevel)
  }

  createPlayer(name : string, id : number) : void {
    this.player = new Player(id, name)
    this.playerController = new PlayerController(this.player)
    this.addPlayer(this.player)
  }

  update() {
    if (this.gameState === GameState.Playing && this.player.state === PlayerState.Alive) {
      this.playerController.update()
      this.moveCameraTo(this.player)
      connection.sendPlayerState(this.player)
    }

    this.bullets.forEach((b) => b.update())
  }

  render() {
    game.debug.text(GameState[this.gameState], 20, 20);

    var startY = 40
    this.players.forEach((player) => {
      player.render()
      var text = player.name + ' (' + player.id + '): ' + player.x + ', ' + player.y + '; ' + PlayerState[player.state]
      game.debug.text(text, 20, startY);
      startY += 20
    })

    this.bullets.forEach((bullet) => bullet.render())
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
    level.backgroundSprites.forEach((sprite) => {
      this.mapGroup.add(sprite)
    })
    this.level = level
    game.camera.bounds = null
  }

  unloadLevel() {
    this.mapGroup.removeAll()
  }
}
