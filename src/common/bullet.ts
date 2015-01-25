/// <reference path="Entity.ts" />

class Bullet extends Entity {

  constructor(ownerID, startX, startY) {
    super()
    this.ownerID = ownerID
    this.startX = startX
    this.startY = startY
    this.x = startX
    this.y = startY
  }

  ownerID: number // The id of the personal who fired the bullet
  damage : number
  startX : number
  startY : number

  update() {
    super.update()
    var moveVec = getMoveVector(
      this.lookDir[0],
      this.lookDir[1],
      this.speed)

    this.x += moveVec[0]
    this.y += moveVec[1]
  }

  animateIn(game : Phaser.Game) {
    this.sprite.scale.set(0.1, 0.1)
    game.add.tween(this.sprite.scale).to(
      { x: 0.5, y: 0.5 }, 1000, Phaser.Easing.Cubic.Out, true);
  }

  toBulletInfo() {
    return {
      ownerID : this.ownerID,
      startX  : this.x,
      startY  : this.y,
      lookDirX: this.lookDir[0],
      lookDirY: this.lookDir[1]
    }
  }
}

class SmokeBullet extends Bullet {
  width  = 10
  height = 10
  speed  = 10
  damage = 1

  static fromBulletInfo(bulletInfo) {
    var bullet = new SmokeBullet(
      bulletInfo.ownerID,
      bulletInfo.startX,
      bulletInfo.startY)

    bullet.lookDir = [
      bulletInfo.lookDirX,
      bulletInfo.lookDirY]

    bullet.ownerID = bulletInfo.ownerID
    return bullet
  }

  static fromBulletInfoClient(bulletInfo, game : Phaser.Game) {
    var bullet = SmokeBullet.fromBulletInfo(bulletInfo)
    bullet.sprite = game.add.sprite(bullet.x, bullet.y, 'smoke')
    bullet.sprite.anchor.set(0.5, 0.5)
    bullet.animateIn(game)
    return bullet
  }
}
