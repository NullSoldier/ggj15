declare var protocol

var SCREEN_WIDTH  = 1280
var SCREEN_HEIGHT = 720
var STAGE_COLOR   = "#6495FF"

var game : Phaser.Game
var player : Player
var controls : any

window.onload = () => {
  var connection = new Connection('ws://' + window.document.location.host)

  game = new Phaser.Game(
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    Phaser.AUTO,
    '',
    new WitchGame())
}
