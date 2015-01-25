class PlayerBoardEntry {
  nameLabel : Phaser.Text
  teamSizeLabel : Phaser.Text

  static textStyle : any = {
    fill: '#FFFFFF',
    font: 'bold 20px "Helvetica"',
  }

  constructor(public teamID : number, board : PlayerBoard) {
    this.nameLabel = game.add.text(0, 0, '', PlayerBoardEntry.textStyle)
    this.teamSizeLabel = game.add.text(0, 0, '', PlayerBoardEntry.textStyle)
    this.nameLabel.x = 40
    this.teamSizeLabel.x = 10
    board.sprite.addChild(this.nameLabel)
    board.sprite.addChild(this.teamSizeLabel)
  }

  render() : void {
    var leader = witch.getPlayerByIDOrNull(this.teamID)
    assertNotNull(leader)
    this.nameLabel.text = leader.name
    this.teamSizeLabel.text = '' + witch.getTeamPlayers(this.teamID).length
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
      if (witch.getTeamPlayers(this.entries[i].teamID).length < 2) {
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
        if (witch.getTeamPlayers(p.teamID).length >= 2) {
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
