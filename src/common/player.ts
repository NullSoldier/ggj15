 enum PlayerState {
  None  = 0,
  Alive = 1,
  Dead  = 2,
  Left  = 3
}

class Player {
  // Server
  connection : Connection  // Server only
  // Client
  sprite          : Phaser.Sprite
  influenceSprite : Phaser.Sprite
  // Both
  id    : number
  teamID: number  // ID of the team leader.
  name  : string
  state : PlayerState = PlayerState.None
  speed : number = 5
  x     : number = 0
  y     : number = 0

  constructor(id : number, name : string) {
    this.id = id
    this.teamID = id
    this.name = name
  }

  move(dx : number, dy : number) : void {
    // TODO(strager): Snap to eight directions.
    var vec = getMoveVector(dx, dy, this.speed)
    this.x += Math.round(vec[0])
    this.y += Math.round(vec[1])
  }

  render() : void {
    this.sprite.x = this.x
    this.sprite.y = this.y
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
