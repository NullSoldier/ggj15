class Game {
  level : Level

  constructor() {
    this.level = new Level()
    this.level.width = 5120
    this.level.height = 2880

    var l : any = this.level
    l.isCollision = function() { return false }
  }

  getTeamColor(teamID : number) : Array<number> {
    throw new Error('LOL')
  }

  getPlayerByIDOrNull(id : number) : Player {
    throw new Error('LOL')
  }
}
