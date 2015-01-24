/// <reference path="PlayerAI.ts" />

class FollowNearestPlayerAI extends PlayerAI {
  minApproachDistance : number

  constructor(player : Player) {
    super(player)
    this.minApproachDistance = 100
  }

  update(players : Array<Player>) : void {
    var nearestEnemy = this.nearestEnemy(players)
    if (nearestEnemy === null) {
      return
    }
    var dx = nearestEnemy.x - this.player.x
    var dy = nearestEnemy.y - this.player.y
    if (Math.sqrt(dx * dx + dy * dy) < this.minApproachDistance) {
      return
    }
    this.player.move(dx, dy)
  }
}
