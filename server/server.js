const express = require('express');
const http = require('http');
const path = require('path');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '../client');
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

module.exports = { io };
