class Poof extends Entity {
  tick : number = null

  constructor() {
    super()
  }

  startAnimation() : void {
    this.tick = 400
    this.sprite.scale.set(0, 0)
    this.sprite.alpha = 0
    game.add.tween(this.sprite.scale)
      .to({x: 2, y: 2}, 1000, Phaser.Easing.Linear.None)
      .start()
    game.add.tween(this.sprite)
      .to({alpha: 1}, 300, Phaser.Easing.Linear.None)
      .to({alpha: 1}, 200, Phaser.Easing.Linear.None)
      .to({alpha: 0}, 300, Phaser.Easing.Linear.None)
      .start()
  }

  update() : void {
    if (this.tick !== null) {
      this.tick -= 1
      if (this.tick === 0) {
        witch.removePoof(this)
      }
    }
  }

  render() : void {
  }
}
