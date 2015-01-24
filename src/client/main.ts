var SCREEN_WIDTH  = 1280
var SCREEN_HEIGHT = 720
var STAGE_COLOR   = "#6495FF"

var game : Phaser.Game
var player : Player
var controls : any

function preload() {
  game.load.image('player', 'assets/player.png')
}

function create() {
  game.stage.backgroundColor = STAGE_COLOR
  game.stage.disableVisibilityChange = true;

  // eat these so the browser doesn't get them
  game.input.keyboard.addKeyCapture(Phaser.Keyboard.DOWN);
  game.input.keyboard.addKeyCapture(Phaser.Keyboard.UP);
  game.input.keyboard.addKeyCapture(Phaser.Keyboard.SPACEBAR);

  controls = {
    up   : game.input.keyboard.addKey(Phaser.Keyboard.W),
    right: game.input.keyboard.addKey(Phaser.Keyboard.D),
    down : game.input.keyboard.addKey(Phaser.Keyboard.S),
    left : game.input.keyboard.addKey(Phaser.Keyboard.A)
  }

  player = new Player()
  player.sprite = game.add.sprite(0, 0, 'player')
  player.speed = 5
}

function update() {
  updatePlayerInput()
}

function render() {

}

function updatePlayerInput() {
  var moveToX = player.sprite.x
  var moveToY = player.sprite.y

  if(controls.left.isDown) {
    moveToX -= player.speed
  }
  if(controls.right.isDown) {
    moveToX += player.speed
  }
  if(controls.up.isDown) {
    moveToY -= player.speed
  }
  if(controls.down.isDown) {
    moveToY += player.speed
  }

  player.sprite.x = moveToX
  player.sprite.y = moveToY
}

window.onload = () => {
  game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, '', {
    preload: preload,
    create : create,
    update : update,
    render : render
  })

}
