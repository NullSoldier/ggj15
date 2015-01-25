/// <reference path="PlayerAI.ts" />

class AttackNearestPlayerAI extends PlayerAI {
  maxAttackDistance : number = 600

  update(room : Room) : void {
    super.update(room)

    var nearestPlayer = this.nearestEnemy(room.players)
    if (nearestPlayer === null) {
      return
    }

    var dx = nearestPlayer.x - this.player.x
    var dy = nearestPlayer.y - this.player.y
    if (Math.sqrt(dx * dx + dy * dy) > this.maxAttackDistance) {
      return
    }

    this.fireBullet(room, dx, dy)
  }
}

