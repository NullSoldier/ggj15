class PlayerAI {
  maxSeeDistance: number = 600
  canFire       : boolean = true

  constructor(public player : Player) {
  }

  update(room : Room) : void {
    this.player.updatePhysicsServer(room)
  }

  protected nearestEnemy(players: Array<Player>) : Player {

    var maxSeeDistance2 = this.maxSeeDistance * this.maxSeeDistance
    var nearestDistance2 : number
    var nearestEnemy : Player = null

    var isEnemy = (player) => {
      var isPlayer      = this.player.id == player.id
      var hasNoTeam     = this.player.teamID == null
      var areTeamsEqual = this.player.teamID == player.teamID
      if (isPlayer)
        return false
      return !areTeamsEqual || hasNoTeam
    }

    var enemies = _.filter(players, isEnemy)

    enemies.forEach((player) => {
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

    var bullet = new SmokeBullet(
      this.player.id,
      generateID(),
      this.player.x,
      this.player.y)

    bullet.lookDir = [dx, dy]
    room.sendFireBullet(this.player, bullet.toBulletInfo())

    this.player.justFiredBullet()

    this.canFire = false
    setTimeout(() => this.canFire = true, this.player.fireCooldown)
  }
}
