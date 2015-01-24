var PORT = 8001

var express = require('express')
var http = require('http')
var wslib = require('ws')

var protocol = require('./protocol.server.js')

var WebSocketServer = wslib.Server

class Room {
  players : Array<Player> = []
}

var mainRoom : Room = new Room()

class Server {
  connections : Array<Connection> = []

  constructor(webSocketServer : any) {
	console.log('hi')
    webSocketServer.on('connection', (socket : any) => {
	console.log('connected')
      this.connections.push(new Connection(this, socket))
    })
  }

  onAuthenticate(connection : Connection, name : string) {
    connection.send({
      authenticated: {
	playerID: 42,
      },
    })
  }
}

class Connection {
  constructor(private server : Server, private socket : any) {
    this.socket.on('message', (data : any, flags : any) => {
      if (!flags.binary) {
	return
      }
      var m : any = protocol.ClientMessage.decode(data)
      console.log('recv', m)
      switch (m.message) {
      case 'authenticate':
	this.server.onAuthenticate(this, m.authenticate.name)
	break;
      default:
	throw new Error('Unknown message ' + m.message)
      }
    })
    this.socket.on('close', () => {
      console.error('SOCKET CLOSED')
    })
  }

  send(messageObject : any) : void {
    console.log('send', messageObject)
    this.socket.send(new protocol.ServerMessage(messageObject).toBuffer());
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
