class PlayerAI {
  maxSeeDistance: number = 600
  canFire       : boolean = true

  constructor(public player : Player) {
  }

  update(room : Room) : void {
    for(var i in room.bullets) {
      var bullet = room.bullets[i]

      // did the player get hit?

      if (originRectIntersects(bullet, this.player)) {
        console.log(this.player.name + " was hit!")
        this.player.health -= bullet.damage
        room.sendDestroyBullet(bullet)
      }

      // Is the player dead?
      if (this.player.health <= 0) {
        console.log(this.player.name + " died")
        this.player.state = PlayerState.Dead
        room.sendPlayerKilled(this.player, bullet.ownerID)
        break;
      }
    }
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

    var bullet = new SmokeBullet(this.player.id, this.player.x, this.player.y)
    bullet.lookDir = [dx, dy]
    room.sendFireBullet(this.player, bullet.toBulletInfo())

    this.player.justFiredBullet()

    this.canFire = false
    setTimeout(() => this.canFire = true, Player.FIRE_COOLDOWN)
  }
}
