/*
Application Communication Summary

File communication (Express)
  Client asks server for a file (Ex: playerImg.png)

        mywebsite.com     :2000     /client/playerImg.png
URL =   DOMAIN            PORT      PATH
        laptop            usbport   query

Package communication (Socket.io)
  Client sends data to server (Ex: Input)
  Server sends data to client (Ex: Monster position)
*/

const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');
const gameloop = require('node-gameloop');

const publicPath = path.join(__dirname, 'client');
const port = process.env.PORT || 2000;
const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile('index.html');
});

server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const socketList = {};
const playerList = {};

const Entity = function() {
  const self = {
    x: 250,
    y: 250,
    speedX: 0,
    speedY: 0,
    id: '',
  };
  self.update = function() {
    self.updatePosition();
  };
  self.updatePosition = function() {
    self.x += self.speedX;
    self.y += self.speedY;
  };

  return self;
};

const Player = function(id) {
  const self = Entity();
  self.id = id;
  self.number = Math.floor(10 * Math.random()).toString();
  self.pressingRight = false;
  self.pressingLeft = false;
  self.pressingUp = false;
  self.pressingDown = false;
  self.maxSpeed = 10;

  self.updatePosition = function() {
    if (self.pressingRight) {
      self.x += self.maxSpeed;
    }

    if (self.pressingLeft) {
      self.x -= self.maxSpeed;
    }

    if (self.pressingUp) {
      self.y -= self.maxSpeed;
    }

    if (self.pressingDown) {
      self.y += self.maxSpeed;
    }
  };
  return self;
};

io.sockets.on('connection', (socket) => {
  socketList[socket.id] = socket;

  const player = Player(socket.id);
  playerList[socket.id] = player;

  /*
  Object.entries(playerList).forEach((p) => {
    const playerId = p[0];
    console.log(playerList[playerId].id);
  });
  */

  /*
  Object.entries(socketList).forEach((s) => {
    console.log(s);
    const socketId = s[0];
    console.log(socketId);
  });
  */

  console.log(`client connected with socket id: ${player.id}, number: ${player.number}`);

  /*
  socket.on('happy', (data) => {
    console.log(`received client "happy" message, data: ${data.reason}`);
  });
  */

  /*
  socket.emit('serverMsg', {
    msg: 'Hello, from the server!',
  });
  */

  socket.on('disconnect', () => {
    console.log(`client disconnected with socket id: ${socket.id}`);

    delete socketList[socket.id];
    delete playerList[socket.id];
  });

  socket.on('keyPress', (data) => {
    if (data.inputId === 'left') {
      player.pressingLeft = data.state;
    } else if (data.inputId === 'right') {
      player.pressingRight = data.state;
    } else if (data.inputId === 'up') {
      player.pressingUp = data.state;
    } else if (data.inputId === 'down') {
      player.pressingDown = data.state;
    }
  });
});

// console.log(Object.entries(playerList));

/*
Object.entries(playerList).forEach((player) => {
  console.log(player);
});
*/

setInterval(() => {
  const pack = [];

  Object.entries(playerList).forEach((playerObj) => {
    const playerId = playerObj[0];
    // console.log(playerList[playerId].id);
    const player = playerList[playerId];
    player.updatePosition();

    pack.push({
      x: player.x,
      y: player.y,
      number: player.number,
    });
  });

  Object.entries(socketList).forEach((socket) => {
    const socketId = socket[0];
    socketList[socketId].emit('newPosition', pack);
  });
}, 1000 / 25);
