/// <reference path="PlayerAI.ts" />

class AvoidPlayerAI extends PlayerAI {
  maxAvoidDistance : number

  constructor(player : Player) {
    super(player)
    this.maxAvoidDistance = 200
  }

  update(players : Array<Player>) : void {
    // TODO(strager): Smarter algorithm.
    var nearestPlayer = this.nearestPlayer(players)
    if (nearestPlayer === null) {
      return
    }
    var dx = nearestPlayer.x - this.player.x
    var dy = nearestPlayer.y - this.player.y
    if (Math.sqrt(dx * dx + dy * dy) > this.maxAvoidDistance) {
      return
    }
    this.player.move(-dx, -dy)
  }
}
