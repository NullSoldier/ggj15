function lerp(from, to, value) : number {
  return from + (to - from) * value
}

function lerpPos(x1, x2, y1, y2, value) : Phaser.Point {
  return new Phaser.Point(
    lerp(x1, x2, value),
    lerp(y1, y2, value))
}

function getMoveVector(dx, dy, speed) {
  var magnitude = Math.sqrt(dx * dx + dy * dy)

  if (magnitude !== 0) {
    dx = dx * speed / magnitude
    dy = dy * speed / magnitude
  }

  if (dx !== dx || dy !== dy) {
    throw new Error('NaN!')
  }

  return [dx, dy]
}

function originRectIntersects(a : Entity, b : Entity) {
  if (a.width <= 0 || a.height <= 0 || b.width <= 0 || b.height <= 0) {
      return false;
  }

  var aRight = a.x + a.width
  var aBottom = a.y + a.height
  var bRight = b.x + b.width
  var bBottom = b.y + b.height

  return !(aRight < b.x || aBottom < b.y || a.x > bRight || a.y > bBottom);
}

function directionFromVec(vec : Array<number>) : Direction {
  var p = Math.PI
  var p2 = p * 2
  var angle = Math.atan2(vec[1], vec[0])
  while (angle < 0) {
    angle += p2
  }
  while (angle >= p2) {
    angle -= p2
  }
  if (angle < p * 0.25) {
    return Direction.Right
  }
  if (angle < p * 0.5) {
    return Direction.DownRight
  }
  if (angle < p * 0.75) {
    return Direction.Down
  }
  if (angle < p) {
    return Direction.DownLeft
  }
  if (angle < p * 1.5) {
    return Direction.Left
  }
  return Direction.Up
}

function isVecZero(vec) : Boolean {
  return (vec[0] === 0) && (vec[1] === 0)
}
