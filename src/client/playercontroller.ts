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
      setTimeout(() => this.canFire = true, Player.FIRE_COOLDOWN)
    }
  }

  fireBullet(dirX, dirY) {
    var moveVec = getMoveVector(
      this.player.lookDir[0],
      this.player.lookDir[1],
      Bullet.BULLET_SPEED)

    connection.send({
      fireBullet: {
        startX: this.player.x,
        startY: this.player.y,
        dirX  : moveVec[0],
        dirY  : moveVec[1]
      }
    })
  }
}
