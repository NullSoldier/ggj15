/// <reference path="Entity.ts" />

class Bullet extends Entity {

  static BULLET_SPEED : number = 10

  owner_id: number // The id of the personal who fired the bullet
  dirX    : number = 0
  dirY    : number = 0
  speed   : number = 1

  update() {
    super.update()
    this.x += this.dirX
    this.y += this.dirY
  }

  start_animate(game) {
    this.sprite.scale.set(0.1, 0.1)
    game.add.tween(this.sprite.scale).to(
      { x: 0.5, y: 0.5 },
      1000,
      Phaser.Easing.Cubic.Out,
      true);
  }
}
