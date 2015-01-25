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

      // if (m.message !== 'playerState') {
      //   console.log('recv: %s', util.inspect(m, {
      //     depth: null,
      //     colors: true,
      //   }))
      // }

      if(m.message == 'authenticate' && this.player)
        return
      else if (m.message !== 'authenticate' && !this.player)
        return

      switch (m.message) {
      case 'authenticate':
        this.onAuthenticate()
        break;
      case 'playerState':
        this.onPlayerState(m.playerState)
        break;
      case 'fireBullet':
        this.onFireBullet(m.fireBullet)
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
    // if (!('roomState' in messageObject) && !('fireBullet' in messageObject)) {
    //   console.log('send: %s', util.inspect(messageObject, {
    //     depth: null,
    //     colors: true,
    //   }))
    // }

    var msg = new protocol.ServerMessage(messageObject).toBuffer()

    try {
      this.socket.send(msg);
    } catch (e) {
      console.error(e)
      // Continue!
    }
  }

  private onAuthenticate() {
    this.player = this.server.room.createPlayer()
    this.send({authenticated: {playerID: this.player.id, playerName: this.player.name}})
    this.player.connection = this

    this.room = this.server.room
    this.room.addPlayer(this.player)
  }

  private onPlayerState(playerState : any) : void {
    this.player.x = playerState.x
    this.player.y = playerState.y
    this.player.lookDir = [playerState.lookDirX, playerState.lookDirY]
    this.player.animation = playerState.animation
  }

  private onFireBullet(bulletInfo) {
    this.room.sendFireBullet(this.player, bulletInfo)
  }
}
