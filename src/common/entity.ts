class Entity {
  // Client
  sprite: Phaser.Sprite

  // Both
  x    : number = 0
  y    : number = 0
  speed: number = 5

  render() {
    // sync for client only
    this.sprite.x = this.x
    this.sprite.y = this.y
  }

  move(dx : number, dy : number) : Array<number> {
    var vec = getMoveVector(dx, dy, this.speed)
    this.x += Math.round(vec[0])
    this.y += Math.round(vec[1])
    return vec
  }
}
