function lerp(from, to, value) : number {
  return from + (to - from) * value
}

function lerpPos(x1, x2, y1, y2, value) : Phaser.Point {
  return new Phaser.Point(
    lerp(x1, x2, value),
    lerp(y1, y2, value))
}

function getMoveVector(dx, dy, speed) : Phaser.Point {
  var magnitude = Math.sqrt(dx * dx + dy * dy)

  if (magnitude !== 0) {
    dx = dx * this.speed / magnitude
    dy = dy * this.speed / magnitude
  }

  if (dx !== dx || dy !== dy) {
    throw new Error('NaN!')
  }

  return new Point(dx, dy)
}
