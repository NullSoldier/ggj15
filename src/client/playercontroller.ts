class PlayerController {

  constructor(public player : Player) {
  }

  controls : any = {
    up   : game.input.keyboard.addKey(Phaser.Keyboard.W),
    right: game.input.keyboard.addKey(Phaser.Keyboard.D),
    down : game.input.keyboard.addKey(Phaser.Keyboard.S),
    left : game.input.keyboard.addKey(Phaser.Keyboard.A)
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
  }
}
