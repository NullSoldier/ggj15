enum Animation {
  Idle = 0,
  WalkDown = 1,
  WalkUp = 2,
}

class Entity {
  // Client
  sprite: Phaser.Sprite

  // Both
  x         : number = 0
  y         : number = 0
  speed     : number = 5
  animation : Animation = Animation.Idle

  render() {
    // sync for client only
    this.sprite.x = this.x
    this.sprite.y = this.y
    this.sprite.animations.play(Animation[this.animation], 8, true)
  }

  move(dx : number, dy : number) : Array<number> {
    var vec = getMoveVector(dx, dy, this.speed)
    this.x = Math.min(witch.level.width, Math.max(0, this.x + Math.round(vec[0])))
    this.y = Math.min(witch.level.height, Math.max(0, this.y + Math.round(vec[1])))
    if (vec[1] > 0) {
      this.animation = Animation.WalkDown
    } else if (vec[1] < 0) {
      this.animation = Animation.WalkUp
    } else {
      this.animation = Animation.Idle
    }
    return vec
  }
}
