enum Direction {
  Down = 1,
  Up = 2,
  Left = 3,
  Right = 4,
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
  speed     : number = 5
  direction : Direction = Direction.Down
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
    this.sprite.animations.play(
      Animation[this.animation] + Direction[this.direction],
      animationFPS,
      animationLoop)
  }

  move(dx : number, dy : number) : Array<number> {
    var vec = getMoveVector(dx, dy, this.speed)
    this.x = Math.min(witch.level.width, Math.max(0, this.x + Math.round(vec[0])))
    this.y = Math.min(witch.level.height, Math.max(0, this.y + Math.round(vec[1])))

    var direction : Direction
    var animation : Animation = this.animation
    if (vec[0] === 0 && vec[1] === 0) {
      direction = this.direction
      animation &= ~Animation.Walking
    } else {
      animation |= Animation.Walking
      if (Math.abs(vec[0]) > Math.abs(vec[1])) {
        // X more prominent than Y.
        if (vec[0] > 0) {
          direction = Direction.Right
        } else {
          direction = Direction.Left
        }
      } else {
        if (vec[1] > 0) {
          direction = Direction.Down
        } else if (vec[1] < 0) {
          direction = Direction.Up
        }
      }
    }
    this.direction = direction
    this.animation = animation

    if(vec[0] !== 0 || vec[1] !== 0) {
      this.lookDir = vec
    }

    return vec
  }
}
