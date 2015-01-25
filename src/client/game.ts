enum GameState {
  None    = 0,
  Joining = 1,
  Playing = 2
}

var obstacleTypes = {
  'bush': 2,
  'grass_clump': 3,
  'tree': 9,
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

  // Includes players and bullets.  Sorted by Z index.
  entities : Array<Entity> = []

  preload() {
    game.load.image('smoke', 'assets/smoke.png')
    game.load.image('player_influence', 'assets/metaball-falloff.png')
    game.load.image('background_01', 'assets/background-plain_01.jpg')
    game.load.image('background_02', 'assets/background-plain_02.jpg')
    game.load.image('background_03', 'assets/background-plain_03.jpg')
    game.load.image('background_04', 'assets/background-plain_04.jpg')
    game.load.atlasJSONHash('player', 'assets/player.png', 'assets/player.json')

    for (var type in obstacleTypes) {
      var count : number = obstacleTypes[type]
      for (var i = 1; i <= count; ++i) {
        game.load.image(type + i, 'assets/' + type + i + '.png')
      }
    }
    // Generated from PSD using assets/jsx/export-layers.jsx.
    game.load.json('level_obstacles', 'assets/level-obstacles.json')
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
    player.sprite.filters = [this.ambientLightFilter]

    ;['Down', 'Up', 'Left', 'Right'].forEach((direction) => {
      var artDirection = {
        'Down': 'Front',
        'Up': 'Back',
        'Left': 'Left',
        'Right': 'Right',
      }[direction]

      player.sprite.animations.add('Idle' + direction, [
        'Player-' + artDirection + '-Static.png',
        'Player-' + artDirection + '-Static.png',
        'Player-' + artDirection + '-Bob.png',
        'Player-' + artDirection + '-Bob.png'])
      player.sprite.animations.add('Walking' + direction, [
        'Player-' + artDirection + '-LeftFoot.png',
        'Player-' + artDirection + '-Static.png',
        'Player-' + artDirection + '-RightFoot.png',
        'Player-' + artDirection + '-Static.png'])
      player.sprite.animations.add('Shooting' + direction, [
        'Player-' + artDirection + '-StaticShoot.png'])
      player.sprite.animations.add('ShootingWalking' + direction, [
        'Player-' + artDirection + '-LeftShoot.png',
        'Player-' + artDirection + '-StaticShoot.png',
        'Player-' + artDirection + '-RightShoot.png',
        'Player-' + artDirection + '-StaticShoot.png'])
    })

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
    this.entities.push(player)
  }

  removePlayer(player : Player) : void {
    var index : number

    index = this.players.indexOf(player)
    if (index === -1) {
      throw new Error('Tried to remove a player not in array')
    }
    this.players.splice(index, 1)

    index = this.entities.indexOf(player)
    if (index === -1) {
      throw new Error('Tried to remove a player not in array')
    }
    this.entities.splice(index, 1)

    player.sprite.parent.removeChild(player.sprite)
    player.influenceSprite.parent.removeChild(player.influenceSprite)
  }

  addBullet(bullet : Bullet) : void {
    this.bullets.push(bullet)
    this.entities.push(bullet)
  }

  addObstacle(obstacle : Obstacle) : void {
    this.entities.push(obstacle)
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

    this.ambientLightFilter = new AmbientLightFilter(game)
    this.ambientLightFilter.setColor(0x08 / 0xFF, 0x1B / 0xFF, 0x19 / 0xFF, 0.55)

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

    this.entities.forEach((e) => e.update())
  }

  render() {
    game.debug.text(GameState[this.gameState], 20, 20);

    this.sortEntities()
    this.entities.forEach((entity) => entity.render())

    var startY = 40
    this.players.forEach((player) => {
      var text = player.name + ' (' + player.id + '): ' + player.x + ', ' + player.y + '; ' + PlayerState[player.state]
      game.debug.text(text, 20, startY);
      startY += 20
    })
  }

  sortEntities() : void {
    // Z-sort entities by Y using Bubble Sort.
    // https://en.wikipedia.org/wiki/Bubble_sort
    var entities : Array<Entity> = this.entities
    var n = entities.length
    var swapped : Boolean
    do {
      swapped = false
      for (var i = 1; i < n; ++i) {
        var e1 = entities[i - 1]
        var e2 = entities[i]
        if (e1.y > e2.y) {
          e1.sprite.parent.swapChildren(e1.sprite, e2.sprite)
          entities[i] = e1
          entities[i - 1] = e2
          swapped = true
        }
      }
    } while (swapped)
  }

  moveCameraTo(player : Player) {
    var pos = lerpPos(
      game.camera.view.centerX, this.player.x,
      game.camera.view.centerY, this.player.y, 0.1)

    game.camera.setPosition(
      pos.x - game.camera.view.halfWidth,
      pos.y - game.camera.view.halfHeight)
  }

  loadLevel(level : Level) {
    level.backgroundSprites.forEach((sprite) => {
      this.mapGroup.add(sprite)
    })
    this.level = level
    this.spawnObstacles(game.cache.getJSON('level_obstacles'))
    game.camera.bounds = null
  }

  private spawnObstacles(photoshopLayers : any) : void {
    photoshopLayers.layers.forEach((layer) => {
      var obstacle : Obstacle = null
      for (var type in obstacleTypes) {
        var re = new RegExp('^\\s*' + type.replace('_', '\\s*') + '\\s*(\\d+)')
        var match = re.exec(layer.name)
        if (match) {
          obstacle = new Obstacle()
          obstacle.sprite = game.add.sprite(0, 0, type + match[1])
          obstacle.sprite.anchor.set(0.5, 1.0)
          obstacle.x = (layer.bounds.left + layer.bounds.right) / 2
          obstacle.y = layer.bounds.bottom
          console.log(type + match[1], obstacle.x, obstacle.y)
          break
        }
      }

      if (obstacle) {
        this.addObstacle(obstacle)
      }
    })
  }

  unloadLevel() {
    this.mapGroup.removeAll()
  }
}
