class PlayerAI {
  maxSeeDistance: number = 600
  canFire       : boolean = true

  constructor(public player : Player) {
  }

  update(room : Room) : void {
    // Override me!
  }

  protected nearestEnemy(players: Array<Player>) : Player {
    var maxSeeDistance2 = this.maxSeeDistance * this.maxSeeDistance
    var nearestDistance2 : number
    var nearestEnemy : Player = null
    players.forEach((player) => {
      if (player.teamID === this.player.teamID) {
        return
      }
      var dx = player.x - this.player.x
      var dy = player.y - this.player.y
      var distance2 = dx * dx + dy * dy
      if (distance2 > maxSeeDistance2) {
        return
      }
      if (nearestEnemy === null || distance2 < nearestDistance2) {
        nearestEnemy = player
        nearestDistance2 = distance2
      }
    })
    return nearestEnemy
  }

  protected fireBullet(room : Room, dx, dy) {
    if(!this.canFire) {
      return
    }

    var moveVec = getMoveVector(
      dx, dy, Bullet.BULLET_SPEED)

    room.sendFireBullet(this.player, {
      startX: this.player.x,
      startY: this.player.y,
      dirX  : moveVec[0],
      dirY  : moveVec[1]
    })

    this.player.justFiredBullet()

    this.canFire = false
    setTimeout(() => this.canFire = true, Player.FIRE_COOLDOWN)
  }
}
