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
    if (!('roomState' in messageObject) && !('fireBullet' in messageObject)) {
      console.log('send: %s', util.inspect(messageObject, {
        depth: null,
        colors: true,
      }))
    }

    try {
      this.socket.send(new protocol.ServerMessage(messageObject).toBuffer());
    } catch (e) {
      console.error(e)
      // Continue!
    }
  }

  private onAuthenticate(name : string) {
    if (this.player) {
      // Drop bad request.
      return;
    }

    this.player = this.server.room.createPlayer(name)
    this.room = this.server.room
    this.send({authenticated: {playerID: this.player.id}})
    this.player.connection = this
    this.room.addPlayer(this.player)
  }

  private onPlayerState(playerState : any) : void {
    if (!this.player) {
      return
    }
    this.player.x = playerState.x
    this.player.y = playerState.y
    this.player.animation = playerState.animation
    this.player.direction = playerState.direction
  }

  private onFireBullet(bulletInfo) {
    this.room.sendFireBullet(this.player, bulletInfo)
  }
}
