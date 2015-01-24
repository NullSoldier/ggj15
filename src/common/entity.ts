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
    this.x = Math.min(witch.level.width, Math.max(0, this.x + Math.round(vec[0])))
    this.y = Math.min(witch.level.height, Math.max(0, this.y + Math.round(vec[1])))
    if (this.sprite) {
      if (dy > 0) {
        this.sprite.animations.play('walk_down', 8, true)
      } else {
        this.sprite.animations.play('idle')
      }
    }
    return vec
  }
}
