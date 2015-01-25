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
  if (Math.abs(vec[0]) > Math.abs(vec[1])) {
    // X more prominent than Y.
    if (vec[0] > 0) {
      return Direction.Right
    } else {
      return Direction.Left
    }
  } else {
    if (vec[1] > 0) {
      return Direction.Down
    } else if (vec[1] < 0) {
      return Direction.Up
    }
  }
}

function isVecZero(vec) : Boolean {
  return (vec[0] === 0) && (vec[1] === 0)
}
