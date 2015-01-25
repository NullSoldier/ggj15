class PlayerBoardEntry {
  nameLabel : Phaser.Text
  teamSizeLabel : Phaser.Text

  constructor(public player : Player, board : PlayerBoard) {
    var textStyle : any = {
      font: 'bold 20px "Helvetica"',
    }
    this.nameLabel = game.add.text(0, 0, '', textStyle)
    this.teamSizeLabel = game.add.text(0, 0, '', textStyle)
    this.nameLabel.x = 40
    this.teamSizeLabel.x = 10
    board.sprite.addChild(this.nameLabel)
    board.sprite.addChild(this.teamSizeLabel)
  }

  count() : number {
    return witch.getTeamPlayers(this.player.teamID).length
  }

  render() : void {
    this.nameLabel.text = '' + this.player.name
    if (this.player.teamID === null) {
      this.teamSizeLabel.text = ''
      this.nameLabel.fill = '#FFFFFF'
      this.teamSizeLabel.fill = '#FFFFFF'
    } else {
      this.teamSizeLabel.text = '' + this.count()
      var color = witch.getTeamColor(this.player.teamID)
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
    // Prune old entries.
    for (var i = 0; i < this.entries.length; ++i) {
      var e = this.entries[i]
      if (witch.getPlayerByIDOrNull(e.player.id) === null) {
        this.entries[i].remove()
        this.entries.splice(i, 1)
        i -= 1  // =D
      }
    }

    // Add new entries.
    var existingEntryIDs : Array<number> = this.entries.map((entry) => entry.player.id)
    for (var i = 0; i < witch.players.length; ++i) {
      var p = witch.players[i]
      if (existingEntryIDs.indexOf(p.id) === -1) {
        this.entries.push(new PlayerBoardEntry(p, this))
        existingEntryIDs.push(p.id)  // Unnecessary (I think)
      }
    }

    this.entries.sort((a : PlayerBoardEntry, b : PlayerBoardEntry) => {
      if (a.count() > b.count()) return 1
      if (a.count() < b.count()) return -1

      if (a.player.name > b.player.name) return 1
      if (a.player.name < b.player.name) return -1
      return 0
    })
  }

  render() : void {
    var y = 10
    this.entries.forEach((entry) => {
      if (entry.player.teamID !== null && !entry.player.isLeader()) {
        entry.nameLabel.visible = false
        entry.teamSizeLabel.visible = false
      } else {
        entry.render()
        entry.nameLabel.visible = true
        entry.teamSizeLabel.visible = true
        entry.nameLabel.y = y
        entry.teamSizeLabel.y = y
        y += 24
      }
    })
  }
}
