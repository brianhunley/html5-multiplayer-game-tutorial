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

const gameloop = require('node-gameloop');

const { io } = require('./server/server');

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

  console.log(`client connected with socket id: ${player.id}, number: ${player.number}`);

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

/*
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
*/

// start the loop at 30 fps (1000/30ms per frame) and grab its id
// let frameCount = 0;
gameloop.setGameLoop((delta) => {
  // `delta` is the delta time from the last frame
  // console.log('Hi there! (frame=%s, delta=%s)', frameCount += 1, delta);

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
}, 1000 / 30);

/*
gameloop.setGameLoop(() => {
  pusage.stat(process.pid, (err, stat) => {
    // expect(err).to.be.null
    // expect(stat).to.be.an('object')
    // expect(stat).to.have.property('cpu')
    // expect(stat).to.have.property('memory')

    console.log('Pcpu: %s', stat.cpu);
    console.log('Mem: %s', stat.memory); // those are bytes
  });
}, 1000);
*/

// stop the loop 2 seconds later
/*
setTimeout(() => {
  console.log('5000ms passed, stopping the game loop');
  gameloop.clearGameLoop(id);
}, 5000);
*/
