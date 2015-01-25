enum Direction {
  Down = 1,
  Up = 2,
  Left = 4,
  Right = 8,
  DownLeft = Down | Left,
  DownRight = Down | Right,
  UpLeft = Up | Left,
  UpRight = Up | Right,
}

enum Animation {
  Idle = 0,
  Walking = 32,
  Shooting = 64,
  ShootingWalking = Shooting | Walking,
}

class Entity {
  // Client
  sprite: Phaser.Sprite
  lookDir: Array<number> = [0, 1]

  // Both
  x         : number = 0
  y         : number = 0
  width     : number = 0
  height    : number = 0
  speed     : number = 5
  animation : Animation = Animation.Idle

  shootAnimationCooldown : number = 0

  update() : void {
    var cooldown = this.shootAnimationCooldown
    if (cooldown > 0) {
      this.shootAnimationCooldown -= 1
    } else {
      this.animation &= ~Animation.Shooting
    }
  }

  render() {
    // sync for client only
    this.sprite.x = this.x
    this.sprite.y = this.y

    var animationFPS = 8
    var animationLoop = true
    var direction = directionFromVec(this.lookDir)

    this.sprite.animations.play(
      Animation[this.animation] + Direction[direction],
      animationFPS,
      animationLoop)
  }

  move(dx : number, dy : number) : Array<number> {
    var vec = getMoveVector(dx, dy, this.speed)

    // Check collisions
    var isColliding = witch.level.isCollision(this.x + vec[0], this.y + vec[1])
    if(isColliding) {vec = [0, 0]}

    // move the player
    this.x += Math.round(vec[0])
    this.y += Math.round(vec[1])

    // clamp to level
    this.x = Math.min(witch.level.width, Math.max(0, this.x))
    this.y = Math.min(witch.level.height, Math.max(0, this.y))

    if (vec[0] === 0 && vec[1] === 0) {
      this.animation &= ~Animation.Walking
    } else {
      this.animation |= Animation.Walking
    }

    if(!isVecZero(vec)) {
      this.lookDir = vec
    }

    return vec
  }
}
