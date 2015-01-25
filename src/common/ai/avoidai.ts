/// <reference path="PlayerAI.ts" />

class AvoidPlayerAI extends PlayerAI {
  maxAvoidDistance : number

  constructor(player : Player) {
    super(player)
    this.maxAvoidDistance = 200
  }

  update(room : Room) : void {
    super.update(room)
    // TODO(strager): Smarter algorithm.
    var nearestEnemy = this.nearestEnemy(room.players)
    if (nearestEnemy === null) {
      this.player.move(0, 0)
      return
    }
    var dx = nearestEnemy.x - this.player.x
    var dy = nearestEnemy.y - this.player.y
    if (Math.sqrt(dx * dx + dy * dy) > this.maxAvoidDistance) {
      this.player.move(0, 0)
      return
    }
    this.player.move(-dx, -dy)
  }
}
