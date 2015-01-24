function lerp(from, to, lerp) : number {
  return from + (to - from) * lerp
}

function lerpPos(x1, x2, y1, y2, lerp) : Phaser.Point {
  return new Phaser.Point(
    x1 + (x2 - x1) * lerp,
    y1 + (y2 - y1) * lerp
  )
}
