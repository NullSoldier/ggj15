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
    var moveToX = this.player.x
    var moveToY = this.player.y

    if(this.controls.left.isDown) {
      moveToX -= this.player.speed
    }
    if(this.controls.right.isDown) {
      moveToX += this.player.speed
    }
    if(this.controls.up.isDown) {
      moveToY -= this.player.speed
    }
    if(this.controls.down.isDown) {
      moveToY += this.player.speed
    }

    this.player.x = moveToX
    this.player.y = moveToY
  }
}
