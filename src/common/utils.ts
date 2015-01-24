function lerp(from, to, value) : number {
  return from + (to - from) * value
}

function lerpPos(x1, x2, y1, y2, value) : Phaser.Point {
  return new Phaser.Point(
    lerp(x1, x2, value),
    lerp(y1, y2, value))
}
