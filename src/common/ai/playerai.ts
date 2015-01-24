class PlayerAI {
  maxSeeDistance : number

  constructor(public player : Player) {
    this.maxSeeDistance = 600
  }

  update(otherPlayers : Array<Player>) : void {
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
}
