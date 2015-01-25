 enum PlayerState {
  None  = 0,
  Alive = 1,
  Dead  = 2,
  Left  = 3
}

class Player extends Entity {

  static bulletFirePoints = {}
  static FIRE_COOLDOWN = 250

  // Server
  connection : Connection

  // Client
  influenceSprite : Phaser.Sprite
  nameLabel       : Phaser.Text
  leaderIcon      : Phaser.Sprite
  healthBarFront  : Phaser.Sprite
  healthBarBack   : Phaser.Sprite

  // Both
  id    : number
  teamID: number  // ID of the team leader, empty for no leader
  name  : string
  state : PlayerState = PlayerState.None
  maxHealth : number = 5
  health: number = this.maxHealth
  speed : number = 5
  width : number = 123
  height: number = 173

  constructor(id : number, name : string) {
    super()
    this.id = id
    this.name = name
    this.teamID = null
  }

  isLeader() : boolean {
    return this.isLeaderOf(this)
  }

  isLeaderOf(other : Player) : boolean {
    return this.id === other.teamID
  }

  getLeader() : Player {
    return witch.getPlayerByIDOrNull(this.teamID)
  }

  isBoosted() : boolean {
    var leader = this.getLeader()
    if (!leader) {
      // you have no leader
      return false
    }
    if (leader === this) {
      // TODO(strager): This should return 'true' when
      // teamless players are implemented.
      return false
    }
    var dx = leader.x - this.x
    var dy = leader.y - this.y
    var distance2 = dx * dx + dy * dy
    var r = this.influenceRadius()
    return distance2 < r * r
  }

  private influenceRadius() : number {
    return 150
  }

  // SERVER ONLY
  updatePhysicsServer(worldish : Worldish) : void {
    for(var i = 0; i < worldish.bullets.length; ++i) {
      var bullet = worldish.bullets[i]

      var owner = worldish.getPlayerByIDOrNull(bullet.ownerID)
      if (!owner) {
        // Owner left the game
        continue
      }

      // Could be buggy if the player shoes a bullet, dies, switches team
      // because the bullets can kill their previous team mate
      if (owner.teamID == this.teamID && owner.teamID !== null) {
        continue
      }

      // did the player get hit?
      if (originRectIntersects(bullet, this)) {
        console.log(this.name + "was hit by", owner.name)
        this.health -= bullet.damage

        var room : any = worldish
        room.sendDestroyBullet(bullet)
        i -= 1  // <3
      }

      // Is the player dead?
      if (this.health <= 0) {
        console.log(this.name, 'was killed by', owner.name)
        var room : any = worldish
        room.playerKilled(this, owner)
        break
      }
    }
  }

  render() : void {
    super.render()
    this.influenceSprite.x = this.x
    this.influenceSprite.y = this.y
    var scale = this.isLeader() ? 2 : 1
    this.influenceSprite.scale.x = scale
    this.influenceSprite.scale.y = scale

    this.nameLabel.text = this.name
    this.nameLabel.x = this.x
    this.nameLabel.y = this.y - this.height
    var teamColor = witch.getTeamColor(this.teamID)
    this.nameLabel.fill = makeHexColor(teamColor[0], teamColor[1], teamColor[2])

    // TODO(strager): Emit particles instead.
    this.sprite.tint = this.isBoosted() ? 0xFFFF88 : 0xFFFFFF

    this.leaderIcon.visible = this.isLeader()
    this.leaderIcon.x = this.x - this.nameLabel.width / 2
    this.leaderIcon.y = this.y - this.height

    var w = this.healthBarBack.width
    var h = this.healthBarBack.height
    this.healthBarFront.x = this.x - w / 2
    this.healthBarFront.y = this.y - this.height - 40 - h / 2
    this.healthBarFront.cropRect.width = w * this.health / this.maxHealth
    this.healthBarFront.updateCrop()
    this.healthBarFront.tint = Player.healthBarColor(this.health / this.maxHealth)
    this.healthBarBack.x = this.healthBarFront.x
    this.healthBarBack.y = this.healthBarFront.y
  }

  private static healthBarColor(percentage : number) : number {
    var r : number
    var g : number
    var b : number
    if (percentage > 0.5) {
      var p = (percentage - 0.5) * 2
      r = Math.floor(lerp(0xBD, 0x3C, p))
      g = Math.floor(lerp(0xB4, 0x84, p))
      b = Math.floor(lerp(0x4F, 0x5E, p))
    } else {
      var p = percentage * 2
      r = Math.floor(lerp(0x95, 0xBD, p))
      g = Math.floor(lerp(0x36, 0xB4, p))
      b = Math.floor(lerp(0x31, 0x4F, p))
    }
    return (r << 16) | (g << 8) | (b << 0)
  }

  justFiredBullet() : void {
    this.animation |= Animation.Shooting
    this.shootAnimationCooldown = 20
  }

  toRoomList() {
    return {
      id: this.id,
      teamID: this.teamID,
      name: this.name,
      state: this.state
    }
  }

  toRoomState() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      state: this.state,
      animation: this.animation,
      lookDirX: this.lookDir[0],
      lookDirY: this.lookDir[1],
      health: this.health,
    }
  }

  showClient() {
    this.sprite.visible = true
    this.nameLabel.visible = true
    this.influenceSprite.visible = true
    this.healthBarFront.visible = true
    this.healthBarBack.visible = true
  }

  hideClient() {
    this.sprite.visible = false
    this.nameLabel.visible = false
    this.influenceSprite.visible = false
    this.healthBarFront.visible = false
    this.healthBarBack.visible = false
  }

  loadClient(game, witch) {
    var nameFont = "normal 18px Helvetica"

    this.sprite = game.add.sprite(0, 0, 'player')
    this.sprite.anchor.set(0.5, 1.0)
    this.sprite.filters = [witch.ambientLightFilter]
    this.sprite.visible = false

    this.influenceSprite = game.add.sprite(0, 0, 'player_influence')
    this.influenceSprite.blendMode = PIXI.blendModes.ADD
    this.influenceSprite.anchor.set(0.5, 0.5)
    this.influenceSprite.visible = false

    this.leaderIcon = game.add.sprite(0, 0, 'leader_icon')
    this.leaderIcon.anchor.set(1.0, 1.0)
    this.leaderIcon.visible = false

    this.nameLabel = game.add.text(0, 0, '', {font: nameFont})
    this.nameLabel.anchor.set(0.5, 1.0)
    this.nameLabel.visible = false

    ;['Down', 'Up', 'Left', 'Right', 'DownLeft', 'DownRight', 'UpLeft', 'UpRight'].forEach((direction) => {
      var artDirection = {
        'Down': 'Front-',
        'Up': 'Back-',
        'Left': 'Left-',
        'Right': 'Right-',
        'DownLeft': 'LeftDiagonal-',
        'DownRight': 'RightDiagonal-',
        'UpLeft': 'BackDiagonal-Left',
        'UpRight': 'BackDiagonal-Right',
      }[direction]

      this.sprite.animations.add('Idle' + direction, [
        'Player-' + artDirection + 'Static.png',
        'Player-' + artDirection + 'Static.png',
        'Player-' + artDirection + 'Bob.png',
        'Player-' + artDirection + 'Bob.png'])
      this.sprite.animations.add('Walking' + direction, [
        'Player-' + artDirection + 'LeftFoot.png',
        'Player-' + artDirection + 'Static.png',
        'Player-' + artDirection + 'RightFoot.png',
        'Player-' + artDirection + 'Static.png'])
      this.sprite.animations.add('Shooting' + direction, [
        'Player-' + artDirection + 'StaticShoot.png'])
      this.sprite.animations.add('ShootingWalking' + direction, [
        'Player-' + artDirection + 'LeftShoot.png',
        'Player-' + artDirection + 'StaticShoot.png',
        'Player-' + artDirection + 'RightShoot.png',
        'Player-' + artDirection + 'StaticShoot.png'])
    })
  }
}

Player.bulletFirePoints[Direction.Down] = [26, -54]
Player.bulletFirePoints[Direction.Up] = [-32, -93]
Player.bulletFirePoints[Direction.Left] = [-35, -79]
Player.bulletFirePoints[Direction.Right] = [35, -79]
Player.bulletFirePoints[Direction.DownLeft] = [-23, -52]
Player.bulletFirePoints[Direction.DownRight] = [45, -62]
Player.bulletFirePoints[Direction.UpLeft] = [13 - 122 / 2, 114 - 173]
Player.bulletFirePoints[Direction.UpRight] = [76 - 122 / 2, 91 - 173]
