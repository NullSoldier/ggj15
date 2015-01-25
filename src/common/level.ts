class Level {
  backgroundSprites : Array<Phaser.Sprite> = []
  foregroundSprites : Array<Phaser.Sprite> = []
  collisionMap : Phaser.BitmapData = null
  width : number = 0
  height : number = 0

  isCollision(x : number, y : number) : boolean {
    assertNotNull(this.collisionMap)
    var px = Math.round(x * this.collisionMap.width / this.width)
    var py = Math.round(y * this.collisionMap.height / this.height)
    var p = this.collisionMap.getPixel32(px, py)
    return this.isCollsionPixel(p)
  }

  private isCollsionPixel(pixel : number) : boolean {
    return pixel == 0xFF000000
  }
}
