const WebSocket = require('ws')

// create new websocket server
const wss = new WebSocket.Server({port: 8080})

// empty object to store all players
var players = {}
var playernames = {}

// add general WebSocket error handler
wss.on('error', function error (error) {
  console.error('WebSocket error', error)
})

// on new client connect
wss.on('connection', function connection (client) {
  console.log('new client connected')
  // on new message recieved
  client.on('message', function incoming (data) {
      // get data from string
      //console.log(data.toString());
      var [udid, name, x, y, z, running, facing] = data.toString().split('\t')
      // store data to players object
      players[udid] = {
        name: name,
        position: {
          x: parseFloat(x),
          y: parseFloat(y),
          z: parseFloat(z)
        },
        running: running,
        facing: facing,
        timestamp: Date.now()
      }
      // save player udid to the client
      client.udid = udid
  })
})

function broadcastUpdate () {
  // broadcast messages to all clients
  wss.clients.forEach(function each (client) {
    // filter disconnected clients
    if (client.readyState !== WebSocket.OPEN) return
    // filter out current player by client.udid
    var otherPlayers = Object.keys(players).filter(udid => udid !== client.udid)
    // create array from the rest
    var otherPlayersPositions = otherPlayers.map(udid => players[udid])
    // send it
    //console.log(JSON.stringify({players: otherPlayersPositions}))
    client.send(JSON.stringify({players: otherPlayersPositions}))
  })
  //console.log(JSON.stringify(players));
}

// call broadcastUpdate every 0.1s
setInterval(broadcastUpdate, 25)
