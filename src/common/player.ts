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

  // Both
  id    : number
  teamID: number  // ID of the team leader.
  name  : string
  state : PlayerState = PlayerState.None
  health: number = 4
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

    this.leaderIcon.visible = this.isLeader()
    this.leaderIcon.x = this.x - this.nameLabel.width / 2
    this.leaderIcon.y = this.y - this.height
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
      lookDirY: this.lookDir[1]
    }
  }
}

Player.bulletFirePoints[Direction.Down] = [26, -54]
Player.bulletFirePoints[Direction.Up] = [-32, -93]
Player.bulletFirePoints[Direction.Left] = [-35, -79]
Player.bulletFirePoints[Direction.Right] = [35, -79]
Player.bulletFirePoints[Direction.DownLeft] = [-23, -52]
Player.bulletFirePoints[Direction.DownRight] = [45, -62]
