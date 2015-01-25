/// <reference path="Entity.ts" />

class Bullet extends Entity {

  constructor(ownerID, bulletID, startX, startY) {
    super()
    this.ownerID = ownerID
    this.bulletID = bulletID
    this.startX = startX
    this.startY = startY
    this.x = startX
    this.y = startY
  }

  ownerID : number // The id of the personal who fired the bullet
  bulletID: number
  damage  : number
  startX  : number
  startY  : number
  distance: number
  active  : boolean = true
  expired : boolean = false // did it expire naturally?
  emitter : Phaser.Particles.Arcade.Emitter = null
  bulletSprite : Phaser.Sprite

  update() {
    if(!this.active) {
      console.log('bullet not cleaned up: ' + this.bulletID)
    }

    super.update()
    var moveVec = getMoveVector(
      this.lookDir[0],
      this.lookDir[1],
      this.speed)

    this.x += moveVec[0]
    this.y += moveVec[1]

    var travelled = distanceBetween(this.startX, this.startY, this.x, this.y)
    if (travelled > this.distance) {
      this.active = false
      this.expired = true
    }
  }

  animateIn(game : Phaser.Game) {
    this.bulletSprite.scale.set(0.2, 0.2)
    game.add.tween(this.bulletSprite.scale).to(
      { x: 1, y: 1 }, 1000, Phaser.Easing.Cubic.Out, true);
    game.add.tween(this.bulletSprite).to(
      { angle: 999999999 }, 999999999, Phaser.Easing.Linear.None, true);
  }

  toBulletInfo() {
    return {
      ownerID : this.ownerID,
      bulletID: this.bulletID,
      startX  : this.x,
      startY  : this.y,
      lookDirX: this.lookDir[0],
      lookDirY: this.lookDir[1]
    }
  }

  render() {
    // N.B. NO SUPER CALL.  We want to move the children of our container, not
    // the container.  If we move the container, the particles will move, too.

    this.bulletSprite.x = this.x
    this.bulletSprite.y = this.y
    this.emitter.x = this.x
    this.emitter.y = this.y
  }

  static areEqual(a, b) {
    return a.ownerID == b.ownerID && a.bulletID == b.bulletID
  }
}

class SmokeBullet extends Bullet {
  width    = 20
  height   = 20
  speed    = 10
  damage   = 1
  distance = 1000

  static fromBulletInfo(bulletInfo) {
    var bullet = new SmokeBullet(
      bulletInfo.ownerID,
      bulletInfo.bulletID,
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
    bullet.sprite = game.add.sprite(0, 0)
    bullet.sprite.anchor.set(0.5, 0.5)

    bullet.emitter = game.add.emitter(0, 0, 50)
    bullet.emitter.makeParticles('particle1')
    bullet.emitter.setAlpha(1, 0.3, 1000)
    bullet.emitter.setSize(30, 30)
    bullet.emitter.setRotation(-1000, 1000)
    bullet.emitter.setScale(1, 0, 1, 0, 1000, Phaser.Easing.Quintic.In)
    bullet.emitter.gravity = 300
    //bullet.emitter.start(false, 1000, 50)
    //bullet.emitter.blendMode = PIXI.blendModes.ADD

    bullet.bulletSprite = game.add.sprite(0, 0, 'smoke')
    bullet.bulletSprite.anchor.set(0.5, 0.5)

    bullet.sprite.addChild(bullet.bulletSprite)
    bullet.sprite.addChild(bullet.emitter)

    bullet.animateIn(game)
    return bullet
  }
}
