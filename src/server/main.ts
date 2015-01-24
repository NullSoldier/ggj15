var PORT = 8001

import express = require('express')
import http = require('http')

var wslib = require('ws')
var WebSocketServer = wslib.Server

var app = express()
app.use(express.static(__dirname + '/../..'))
app.listen(PORT, () => {
  var webSocketServer = new WebSocketServer({
    server: app,
  })
  webSocketServer.on('connect', () => {
    console.log('Connected')
  })

  // Needed by grunt-express-server.
  console.log('Server ready =D')
})
