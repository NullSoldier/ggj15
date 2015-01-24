enum PlayerState {
  None  = 0,
  Alive = 1,
  Dead  = 2
}

class Player {
  // Server
  connection : Connection  // Server only
  // Client
  sprite : Phaser.Sprite
  // Both
  id    : number
  teamID: number  // ID of the team leader.
  name  : string
  speed : number = 5
  state : PlayerState = PlayerState.None
  x     : number = 0
  y     : number = 0

  constructor(id : number) {
    this.id = id
    this.teamID = id
  }

  move(dx : number, dy : number) : void {
    // TODO(strager): Snap to eight directions.
    var vec = getMoveVector(dx, dy, this.speed)
    this.x += Math.round(vec.x)
    this.y += Math.round(vec.y)
  }

  render() : void {
    this.sprite.x = this.x
    this.sprite.y = this.y
  }
}
