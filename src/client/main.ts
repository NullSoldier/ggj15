var SCREEN_WIDTH  = 1280
var SCREEN_HEIGHT = 720

var game : Phaser.Game
var player : Player

function preload() {
  player = new Player()
  console.log(player)

}

function create() {

}

function update() {

}

function render() {

}

window.onload = () => {
  game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, '', {
    preload: preload,
    create : create,
    update : update,
    render : render
  })

}