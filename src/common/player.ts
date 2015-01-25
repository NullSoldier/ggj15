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
  teamID: number  // ID of the team leader.
  name  : string
  state : PlayerState = PlayerState.None
  maxHealth : number = 4
  health: number = this.maxHealth
  speed : number = 5
  width : number = 123
  height: number = 173

  constructor(id : number, name : string, teamID? : number) {
    super()
    this.id = id
    this.teamID = teamID == null ? id : teamID
    this.name = name
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

  toRoomList() {
    return {
      id: this.id,
      teamID: this.teamID,
      name: this.name,
    }
  }

  justFiredBullet() : void {
    this.animation |= Animation.Shooting
    this.shootAnimationCooldown = 20
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
}

Player.bulletFirePoints[Direction.Down] = [26, -54]
Player.bulletFirePoints[Direction.Up] = [-32, -93]
Player.bulletFirePoints[Direction.Left] = [-35, -79]
Player.bulletFirePoints[Direction.Right] = [35, -79]
Player.bulletFirePoints[Direction.DownLeft] = [-23, -52]
Player.bulletFirePoints[Direction.DownRight] = [45, -62]
Player.bulletFirePoints[Direction.UpLeft] = [13 - 122 / 2, 114 - 173]
Player.bulletFirePoints[Direction.UpRight] = [76 - 122 / 2, 91 - 173]
