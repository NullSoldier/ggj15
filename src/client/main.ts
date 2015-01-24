declare var protocol

var SCREEN_WIDTH  = 1280
var SCREEN_HEIGHT = 720
var STAGE_COLOR   = "#6495FF"

var game : Phaser.Game
var player : Player
var controls : any

function onAuthenticated(playerID : number) {
  console.log('Authenticated!')
}

function onRoomInfo(playerInfos : any) : void {
  playerInfos.forEach((playerInfo) => {
    console.log(playerInfo)
  })
}

class Connection {
  connection : WebSocket

  constructor(host : string) {
    this.connection = new WebSocket(host)
    this.connection.binaryType = 'arraybuffer';
    this.connection.addEventListener('open', (event : Event) => {
      this.send({
        authenticate: {
          playerName: 'Billy Bob',
        },
      })
    })
    this.connection.addEventListener('message', (event : MessageEvent) => {
      var m : any = protocol.ServerMessage.decode(event.data)
      console.log('recv', m)
      switch (m.message) {
      case 'authenticated':
        onAuthenticated(m.authenticated.playerID)
        break
      case 'roomInfo':
        onRoomInfo(m.roomInfo.players)
        break
      default:
        throw new Error('Unknown message ' + m.message)
      }
    })
    this.connection.addEventListener('error', (event : ErrorEvent) => {
      console.error('SOCKET ERROR')
    })
  }

  send(messageObject : any) : void {
    console.log('send', messageObject)
    this.connection.send(new protocol.ClientMessage(messageObject).toBuffer());
  }
}

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
  var connection = new Connection('ws://' + window.document.location.host)

  game = new Phaser.Game(SCREEN_WIDTH, SCREEN_HEIGHT, Phaser.AUTO, '', {
    preload: preload,
    create : create,
    update : update,
    render : render
  })

}
