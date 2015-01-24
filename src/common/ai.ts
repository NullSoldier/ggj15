interface PlayerAI {
  update(otherPlayers : Array<Player>) : void
}

class FollowNearestPlayerAI implements PlayerAI {
  maxSeeDistance : number
  minApproachDistance : number

  constructor(private player : Player) {
    this.maxSeeDistance = 600
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

  private nearestPlayer(players: Array<Player>) : Player {
    var maxSeeDistance2 = this.maxSeeDistance * this.maxSeeDistance
    var nearestDistance2 : number
    var nearestPlayer : Player = null
    players.forEach((player) => {
      if (player === this.player) {
        return
      }
      var dx = player.x - this.player.x
      var dy = player.y - this.player.y
      var distance2 = dx * dx + dy * dy
      if (distance2 > maxSeeDistance2) {
        return
      }
      if (nearestPlayer === null || distance2 < nearestDistance2) {
        nearestPlayer = player
        nearestDistance2 = distance2
      }
    })
    return nearestPlayer
  }
}
