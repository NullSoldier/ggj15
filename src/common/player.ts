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

  render() : void {
    super.render()
    this.influenceSprite.x = this.x
    this.influenceSprite.y = this.y
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
