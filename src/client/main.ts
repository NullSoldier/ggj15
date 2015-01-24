declare var protocol

var SCREEN_WIDTH  = 1280
var SCREEN_HEIGHT = 720
var STAGE_COLOR   = "#6495FF"

var game : Phaser.Game
var connection: Connection
var witch : WitchGame

window.onload = () => {
  witch = new WitchGame()

  game = new Phaser.Game(
    SCREEN_WIDTH,
    SCREEN_HEIGHT,
    Phaser.AUTO,
    '',
    witch)
}
