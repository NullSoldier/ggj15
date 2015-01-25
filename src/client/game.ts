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

class WitchGame implements Worldish {
  gameState               : GameState
  mapBottomGroup          : Phaser.Group
  mapTopGroup             : Phaser.Group
  entitiesGroup           : Phaser.Group
  player                  : Player
  playerController        : PlayerController
  teamInfluenceGroupGroup : Phaser.Group
  teamInfluenceGroups     : any = {}  // Team ID => Phaser.Group
  level                   : Level
  shouldShowDebug         : Boolean = false
  ambientLightFilter      : AmbientLightFilter
  playerBoard             : PlayerBoard

  players : Array<Player> = []
  bullets : Array<Bullet> = []
  entities : Array<Entity> = [] // Includes players and bullets.  Sorted by Z index.
  teamColors : any = {}  // Team ID => [r, g, b]

  controls : any = {
  }

  preload() {
    game.load.image('smoke', 'assets/smoke.png')
    game.load.image('player_influence', 'assets/metaball-falloff.png')
    game.load.image('leader_icon', 'assets/leader-icon.png')
    game.load.image('health_bar_front', 'assets/health-bar-front.png')
    game.load.image('health_bar_back', 'assets/health-bar-back.png')
    game.load.image('particle1', 'assets/particle1.png')
    game.load.image('background_01', 'assets/background-plain_01.jpg')
    game.load.image('background_02', 'assets/background-plain_02.jpg')
    game.load.image('background_03', 'assets/background-plain_03.jpg')
    game.load.image('background_04', 'assets/background-plain_04.jpg')
    game.load.atlasJSONHash('player', 'assets/player.png', 'assets/player.json')
    game.load.atlasJSONHash('foreground', 'assets/Trees.png', 'assets/Trees.json')

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

  getPlayerByID(id : number) : Player {
    var p = this.getPlayerByIDOrNull(id)
    assertNotNull(p)
    return p
  }

  getTeamPlayers(teamID : number) : Array<Player> {
    var players : Array<Player> = []
    for (var i : number = 0; i < this.players.length; ++i) {
      if (this.players[i].teamID === teamID) {
        players.push(this.players[i])
      }
    }
    return players
  }

  createPlayer(id : number, name : string) {
    this.player = this.addPlayer(id, name)
    this.playerController = new PlayerController(this.player)
  }

  setTeam(player : Player, teamID : number) {
    player.teamID = teamID

    // if you set the team to null, clear the influence sprite
    if (teamID === null && player.influenceSprite.parent) {
      player.influenceSprite.parent.removeChild(player.influenceSprite)
      return
    }

    var group = this.teamInfluenceGroups[player.teamID]

    if(!group) {
      var influenceFilter = new InfluenceFilter(game)
      this.applyTeamInfluenceColor(player.teamID, influenceFilter)

      group = game.add.group(this.teamInfluenceGroupGroup)
      group.filters = [influenceFilter]
      this.teamInfluenceGroups[teamID] = group
    }

    group.addChild(player.influenceSprite)
  }

  addPlayer(id : number, name : string, teamID = null) : Player {
    var player = new Player(id, name)
    player.loadClient(game, this)
    this.setTeam(player, teamID)

    player.healthBarBack = game.add.sprite(0, 0, 'health_bar_back')
    player.healthBarFront = game.add.sprite(0, 0, 'health_bar_front')
    player.healthBarFront.crop(new Phaser.Rectangle(
      0, 0,
      player.healthBarFront.width,
      player.healthBarFront.height), false)

    this.players.push(player)
    this.addEntity(player)
    return player
  }

  removePlayer(player : Player) : void {
    var index : number

    removeFromArray(this.players, player)
    removeFromArray(this.entities, player)

    player.sprite.parent.removeChild(player.sprite)
    player.influenceSprite.parent.removeChild(player.influenceSprite)
    player.nameLabel.parent.removeChild(player.nameLabel)
    player.leaderIcon.parent.removeChild(player.leaderIcon)
    player.healthBarFront.parent.removeChild(player.healthBarFront)
    player.healthBarBack.parent.removeChild(player.healthBarBack)
  }

  addBullet(bullet : Bullet) : void {
    this.bullets.push(bullet)
    this.addEntity(bullet)
  }

  removeBullet(bullet : Bullet) : void {
    bullet.sprite.parent.removeChild(bullet.sprite)
    bullet.emitter.parent.removeChild(bullet.emitter)
    removeFromArray(this.bullets, bullet)
    removeFromArray(this.entities, bullet)
  }

  addObstacle(obstacle : Obstacle) : void {
    this.addEntity(obstacle)
  }

  private addEntity(entity : Entity) : void {
    this.entities.push(entity)
    this.entitiesGroup.addChild(entity.sprite)
  }

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

    this.mapBottomGroup = game.add.group(game.world)
    this.teamInfluenceGroupGroup = game.add.group(game.world)
    this.entitiesGroup = game.add.group(game.world)
    this.mapTopGroup = game.add.group(game.world)

    this.playerBoard = new PlayerBoard()

    // eat these so the browser doesn't get them
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.TAB);
    game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);

    this.controls.debugToggle = game.input.keyboard.addKey(Phaser.Keyboard.TAB),

    this.ambientLightFilter = new AmbientLightFilter(game)
    this.ambientLightFilter.setColor(0x08 / 0xFF, 0x1B / 0xFF, 0x19 / 0xFF, 0.55)

    var sampleLevel = new Level()
    sampleLevel.backgroundSprites.push(game.make.sprite(0, 0, 'background_01'))
    sampleLevel.backgroundSprites.push(game.make.sprite(2560, 0, 'background_02'))
    sampleLevel.backgroundSprites.push(game.make.sprite(0, 1353, 'background_03'))
    sampleLevel.backgroundSprites.push(game.make.sprite(2560, 1353, 'background_04'))
    sampleLevel.foregroundSprites.push(game.make.sprite(0, 0, 'foreground', 'environment2-front-tree-left.png'))
    sampleLevel.foregroundSprites.push(game.make.sprite(0, 0, 'foreground', 'environment2-front-trees-right.png'))
    sampleLevel.foregroundSprites.push(game.make.sprite(0, 0, 'foreground', 'environment3-thicket1.png'))
    sampleLevel.foregroundSprites.push(game.make.sprite(0, 0, 'foreground', 'environment4-thicket2.png'))
    sampleLevel.foregroundSprites.push(game.make.sprite(0, 0, 'foreground', 'environment5-thicket3.png'))
    sampleLevel.foregroundSprites.push(game.make.sprite(0, 0, 'foreground', 'environment6-thicket4.png'))
    sampleLevel.width = 5120
    sampleLevel.height = 2880
    this.loadLevel(sampleLevel)
  }

  update() {
    if (this.controls.debugToggle.justDown) {
      this.shouldShowDebug = !this.shouldShowDebug
      // FIXME(strager): Why does disabling again not work?
    }

    if (this.gameState === GameState.Playing && this.player.state === PlayerState.Alive) {
      this.playerController.update()
      this.moveCameraTo(this.player)
      connection.sendPlayerState(this.player)
    }

    this.entities.forEach((e) => e.update())

    this.playerBoard.update()
  }

  render() {
    this.sortEntities()
    this.entities.forEach((entity) => entity.render())

    this.playerBoard.render()
    // lolhacks
    this.playerBoard.sprite.x = game.camera.x
    this.playerBoard.sprite.y = game.camera.y

    if (this.shouldShowDebug) {
      var y = 20
      function appendText(text) {
        game.debug.text(text, 20, y);
        y += 20
      }

      appendText(GameState[this.gameState])

      this.players.forEach((player) => {
        var id    = player.name + ' (' + player.id + ',' + player.teamID + ')'
        var loc   = ': ' + player.x + ', ' + player.y
        var state = '; ' + PlayerState[player.state]
        var health = '; ' + player.health + '/' + player.maxHealth + ' HP'
        appendText(id + loc + state + health)
      })

      if (this.player) {
        var mouseX = game.input.activePointer.worldX - this.player.x
        var mouseY = game.input.activePointer.worldY - this.player.y
        appendText('Mouse (' + mouseX + ', ' + mouseY + ')')
      }
    }
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
      this.mapBottomGroup.add(sprite)
    })
    level.foregroundSprites.forEach((sprite) => {
      this.mapTopGroup.add(sprite)
    })
    this.level = level
    game.camera.bounds = new Phaser.Rectangle(0, 0, 5120, 2880)
  }
}
