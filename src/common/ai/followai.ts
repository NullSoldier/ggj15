/// <reference path="PlayerAI.ts" />

class FollowNearestPlayerAI extends PlayerAI {
  minApproachDistance : number

  constructor(player : Player) {
    super(player)
    this.minApproachDistance = 100
  }

  update(players : Array<Player>) : void {
    var nearestPlayer = this.nearestPlayer(players)
    if (nearestPlayer === null) {
      return
    }
    var dx = nearestPlayer.x - this.player.x
    var dy = nearestPlayer.y - this.player.y
    if (Math.sqrt(dx * dx + dy * dy) < this.minApproachDistance) {
      return
    }
    this.player.move(dx, dy)
  }
}
