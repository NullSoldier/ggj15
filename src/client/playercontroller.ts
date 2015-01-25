class PlayerController {

  constructor(public player : Player) {
  }

  canFire : boolean = true

  controls : any = {
    up   : game.input.keyboard.addKey(Phaser.Keyboard.W),
    right: game.input.keyboard.addKey(Phaser.Keyboard.D),
    down : game.input.keyboard.addKey(Phaser.Keyboard.S),
    left : game.input.keyboard.addKey(Phaser.Keyboard.A),
    space: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
  }

  update() {
    var dx = 0
    var dy = 0

    if(this.controls.left.isDown) {
      dx -= 1
    }
    if(this.controls.right.isDown) {
      dx += 1
    }
    if(this.controls.up.isDown) {
      dy -= 1
    }
    if(this.controls.down.isDown) {
      dy += 1
    }

    this.player.move(dx, dy)

    if(this.controls.space.justDown && this.canFire) {
      this.fireBullet(dx, dy)
      this.canFire = false
      setTimeout(() => this.canFire = true, this.player.fireCooldown)
    }
  }

  fireBullet(dirX, dirY) {
    var direction : Direction = directionFromVec(this.player.lookDir)
    var bullet = new SmokeBullet(
      this.player.id,
      generateID(),
      this.player.x + Player.bulletFirePoints[direction][0],
      this.player.y + Player.bulletFirePoints[direction][1])

    bullet.lookDir = this.player.lookDir
    connection.send({fireBullet: bullet.toBulletInfo()})

    this.player.animation |= Animation.Shooting
    this.player.justFiredBullet()
  }
}
