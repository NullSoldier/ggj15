var PORT = 8001
// Sync with client for move speed
var MAKE_UPDATES_PER_SECOND = 60
// Number doesn't matter; lag vs bandwidth tradeoff
var SEND_UPDATES_PER_SECOND = 30

var express = require('express')
var http = require('http')
var util = require('util')
var websocket = require('ws')
var protocol = require('./protocol.server.js')

var app = express()
app.use(express.static(__dirname))

var witch = new Game()

var server = http.createServer(app)
server.listen(PORT, () => {
  var s = new Server(new websocket.Server({server: server}))
  // Needed by grunt-express-server.
  console.log('Server ready =D')
})
