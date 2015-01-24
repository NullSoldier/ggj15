var PORT = 8001

// Sync with client for move speed
var MAKE_UPDATES_PER_SECOND = 60

// Number doesn't matter; lag vs bandwidth tradeoff
var SEND_UPDATES_PER_SECOND = 30

var express = require('express')
var http = require('http')
var util = require('util')
var wslib = require('ws')

var protocol = require('./protocol.server.js')

var WebSocketServer = wslib.Server

class Room {
  players : Array<Player> = []
  ais : Array<PlayerAI> = []

  private nextPlayerID : number = 1;

  private createPlayerID() : number {
    return this.nextPlayerID++;
  }

  // Does not add the player.
  createPlayer(name : string) : Player {
    var player = new Player()
    player.id = this.createPlayerID()
    player.name = name
    player.x = Math.floor(Math.random() * 1000)
    player.y = Math.floor(Math.random() * 1000)
    player.state = PlayerState.Alive
    return player
  }

  addPlayer(player : Player) : void {
    if (!player) {
      throw new Error('Bad player')
    }
    this.players.push(player)
    this.setNeedSendRoomInfo()
  }

  addAIPlayer(aiFactory : new (player : Player) => PlayerAI) : void {
    var player = this.createPlayer('Artificial Indigo')
    // HACK(strager): Make AI players easier to chase down.
    player.speed = 2
    this.addPlayer(player)
    this.ais.push(new aiFactory(player))
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
      if (player.connection) {
        player.connection.needSendRoomInfo = true
      }
    })
  }

  makeUpdates() : void {
    this.updateAIs()
  }

  private updateAIs() : void {
    this.ais.forEach((ai) => {
      ai.update(this.players)
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
      if (player.connection) {
        if (player.connection.needSendRoomInfo) {
          player.connection.send({roomInfo: roomInfo})
        }
        player.connection.needSendRoomInfo = false
      }
    })

    var roomState : any = {
      players: this.players.map((player) => {
        return {
          id: player.id,
          x: player.x,
          y: player.y,
          state: player.state,
        }
      })
    }
    this.players.forEach((player) => {
      if (player.connection) {
        player.connection.send({roomState: roomState})
      }
    })
  }
}

class Server {
  connections : Array<Connection> = []
  room = new Room()

  constructor(webSocketServer : any) {
    this.room.addAIPlayer(FollowNearestPlayerAI)
    this.room.addAIPlayer(AvoidPlayerAI)

    webSocketServer.on('connection', (socket : any) => {
      this.connections.push(new Connection(this, socket))
    })
    setInterval(() => {
      this.room.makeUpdates()
    }, 1000 / MAKE_UPDATES_PER_SECOND)
    setInterval(() => {
      this.room.sendUpdates()
    }, 1000 / SEND_UPDATES_PER_SECOND)
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

      if (m.message !== 'playerState') {
        console.log('recv: %s', util.inspect(m, {
          depth: null,
          colors: true,
        }))
      }

      switch (m.message) {
      case 'authenticate':
        this.onAuthenticate(m.authenticate.playerName)
        break;
      case 'playerState':
        this.onPlayerState(m.playerState.x, m.playerState.y)
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
    if (!('roomState' in messageObject)) {
      console.log('send: %s', util.inspect(messageObject, {
        depth: null,
        colors: true,
      }))
    }

    this.socket.send(new protocol.ServerMessage(messageObject).toBuffer());
  }

  private onAuthenticate(name : string) {
    if (this.player) {
      // Drop bad request.
      return;
    }

    this.room = this.server.room
    this.player = this.room.createPlayer(name)
    this.player.connection = this
    this.room.addPlayer(this.player)
    this.send({
      authenticated: {
        playerID: this.player.id,
      },
    })
  }

  private onPlayerState(x : number, y : number) : void {
    if (!this.player) {
      return
    }
    this.player.x = x
    this.player.y = y
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
