 enum PlayerState {
  None  = 0,
  Alive = 1,
  Dead  = 2,
  Left  = 3
}

class Player extends Entity {
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

  constructor(id : number, name : string) {
    super()
    this.id = id
    this.teamID = id
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
      name: this.name,
    }
  }

  toRoomState() {
    return {
      id: this.id,
      x: this.x,
      y: this.y,
      state: this.state,
    }
  }
}
