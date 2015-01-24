 enum PlayerState {
  None  = 0,
  Alive = 1,
  Dead  = 2,
  Left  = 3
}

class Player extends Entity {

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
  speed : number = 5

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

  toRoomState() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      state: this.state,
      animation: this.animation,
    }
  }
}
