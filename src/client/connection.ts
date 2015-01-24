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
