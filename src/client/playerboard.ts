class PlayerBoardEntry {
  nameLabel : Phaser.Text
  teamSizeLabel : Phaser.Text

  constructor(public teamID : number, board : PlayerBoard) {
    var color = witch.getTeamColor(teamID)
    var textStyle : any = {
      fill: makeHexColor(color[0], color[1], color[2]),
      font: 'bold 20px "Helvetica"',
    }

    this.nameLabel = game.add.text(0, 0, '', textStyle)
    this.teamSizeLabel = game.add.text(0, 0, '', textStyle)
    this.nameLabel.x = 40
    this.teamSizeLabel.x = 10
    board.sprite.addChild(this.nameLabel)
    board.sprite.addChild(this.teamSizeLabel)
  }

  render() : void {
    var leader = witch.getPlayerByIDOrNull(this.teamID)
    assertNotNull(leader)
    this.nameLabel.text = leader.name

    var teamPlayers = witch.getTeamPlayers(this.teamID)
    this.teamSizeLabel.text = '' + teamPlayers.length

    if (teamPlayers.length < 2) {
      this.nameLabel.fill = '#FFFFFF'
      this.teamSizeLabel.fill = '#FFFFFF'
    } else {
      var color = witch.getTeamColor(this.teamID)
      var hex = makeHexColor(color[0], color[1], color[2])
      this.nameLabel.fill = hex
      this.teamSizeLabel.fill = hex
    }
  }

  remove() : void {
    this.nameLabel.parent.removeChild(this.nameLabel)
    this.teamSizeLabel.parent.removeChild(this.teamSizeLabel)
  }
}

class PlayerBoard {
  sprite  : Phaser.Sprite
  private entries : Array<PlayerBoardEntry> = []

  constructor() {
    this.sprite = game.add.sprite(0, 0)
  }

  update() : void {
    // Prune old teams.
    for (var i = 0; i < this.entries.length; ++i) {
      if (witch.getTeamPlayers(this.entries[i].teamID).length < 1) {
        this.entries[i].remove()
        this.entries.splice(i, 1)
        i -= 1  // =D
      }
    }

    // Add new teams.
    var existingEntryTeamIDs : Array<number> = this.entries.map((entry) => entry.teamID)
    for (var i = 0; i < witch.players.length; ++i) {
      var p = witch.players[i]
      if (p.teamID !== null && existingEntryTeamIDs.indexOf(p.teamID) === -1) {
        if (witch.getTeamPlayers(p.teamID).length >= 1) {
          this.entries.push(new PlayerBoardEntry(p.teamID, this))
          existingEntryTeamIDs.push(p.teamID)
        }
      }
    }
  }

  render() : void {
    var y = 10
    this.entries.forEach((entry) => {
      entry.render()
      entry.nameLabel.y = y
      entry.teamSizeLabel.y = y
      y += 20
    })
  }
}
