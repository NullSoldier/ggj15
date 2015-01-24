var PORT = 8001
var UPDATES_PER_SECOND = 30

var express = require('express')
var http = require('http')
var wslib = require('ws')

var protocol = require('./protocol.server.js')

var WebSocketServer = wslib.Server

class Room {
  players : Array<Player> = []

  private nextPlayerID : number = 1;

  createPlayerID() : number {
    return this.nextPlayerID++;
  }

  addPlayer(player : Player) : void {
    this.players.push(player)
    this.setNeedSendRoomInfo()
  }

  removePlayer(player : Player) : void {
    var index = this.players.indexOf(player)
    if (index === -1) {
      throw new Error('Tried to remove player not in array')
    }
    this.players.splice(index, 1)
    this.setNeedSendRoomInfo()
  }

  private setNeedSendRoomInfo() : void {
    this.players.forEach((player) => {
      player.connection.needSendRoomInfo = true
    })
  }

  sendUpdates() : void {
    var roomInfo : any = {
      players: this.players.map((player) => {
        return {
          id: player.id,
          name: player.name,
        }
      }),
    }
    this.players.forEach((player) => {
      if (player.connection.needSendRoomInfo) {
        player.connection.send({roomInfo: roomInfo})
      }
      player.connection.needSendRoomInfo = false
    })
  }
}

class Server {
  connections : Array<Connection> = []
  room = new Room()

  constructor(webSocketServer : any) {
    webSocketServer.on('connection', (socket : any) => {
      this.connections.push(new Connection(this, socket))
    })
    setInterval(() => {
      this.room.sendUpdates()
    }, 1000 / UPDATES_PER_SECOND)
  }
}

class Connection {
  room : Room = null
  player : Player = null

  needSendRoomInfo : Boolean = false

  constructor(private server : Server, private socket : any) {
    this.socket.on('message', (data : any, flags : any) => {
      if (!flags.binary) {
        return
      }
      var m : any = protocol.ClientMessage.decode(data)
      console.log('recv', m)
      switch (m.message) {
      case 'authenticate':
        this.onAuthenticate(m.authenticate.playerName)
        break;
      default:
        throw new Error('Unknown message ' + m.message)
      }
    })
    this.socket.on('close', () => {
      if (this.room && this.player) {
        this.room.removePlayer(this.player)
      }
    })
  }

  send(messageObject : any) : void {
    console.log('send', messageObject)
    this.socket.send(new protocol.ServerMessage(messageObject).toBuffer());
  }

  private onAuthenticate(name : string) {
    if (this.player) {
      // Drop bad request.
      return;
    }

    this.room = this.server.room
    this.player = new Player()
    this.player.id = this.room.createPlayerID()
    this.player.name = name
    this.player.connection = this
    this.room.addPlayer(this.player)
    this.send({
      authenticated: {
        playerID: this.player.id,
      },
    })
  }
}

var app = express()
app.use(express.static(__dirname))

var server = http.createServer(app);
server.listen(PORT, () => {
  var s = new Server(new WebSocketServer({
    server: server,
  }))

  // Needed by grunt-express-server.
  console.log('Server ready =D')
})
