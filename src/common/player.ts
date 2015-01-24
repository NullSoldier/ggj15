enum PlayerState {
  None  = 0,
  Alive = 1,
  Dead  = 2
}

class Player {
  connection : Connection  // Server only

  id    : number
  name  : string
  speed : number = 5
  sprite: Phaser.Sprite
  state : PlayerState = PlayerState.None

  x : number = 0
  y : number = 0

  move(dx : number, dy : number) : void {
    // TODO(strager): Snap to eight directions.
    var magnitude = Math.sqrt(dx * dx + dy * dy)
    if (magnitude !== 0) {
      dx = Math.round(dx * this.speed / magnitude)
      dy = Math.round(dy * this.speed / magnitude)
    }
    if (dx !== dx || dy !== dy) {
      throw new Error('NaN!')
    }
    this.x += dx
    this.y += dy
    if (this.x !== this.x || this.y !== this.y) {
      throw new Error('NaN!')
    }
  }

  render() : void {
    this.sprite.x = this.x
    this.sprite.y = this.y
  }
}
