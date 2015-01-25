/// <reference path="PlayerAI.ts" />

class FollowNearestPlayerAI extends PlayerAI {
  minApproachDistance : number

  constructor(player : Player) {
    super(player)
    this.minApproachDistance = 100
  }

  update(room : Room) : void {
    var nearestEnemy = this.nearestEnemy(room.players)
    if (nearestEnemy === null) {
      this.player.move(0, 0)
      return
    }
    var dx = nearestEnemy.x - this.player.x
    var dy = nearestEnemy.y - this.player.y
    if (Math.sqrt(dx * dx + dy * dy) < this.minApproachDistance) {
      this.player.move(0, 0)
      return
    }
    this.player.move(dx, dy)
  }
}
