'use strict';
const http = require('http');
const socketio = require('socket.io');
const funcs = require('./server/funcs');
const auth = require('./server/authorization');
const router = require('./server/router');
const db =require('./server/db');

const server = http.createServer();
const io = socketio(server);
const port = 8080;

io.on('connection', function (socket) {
  socket.on('message', function (data) {
    io.emit('broadcast', data);
    funcs.messageLog(data.nickname,data.chatId,data.message);
  });
  socket.on('clear', function () {
    io.emit('clear1' );
  });
});

server.on('request', function (req, res) {
  auth.checkSess(req, (access) => {
    if (access) router.route(req, res);
    else router.guest(req, res);
  });
});

server.listen(port, function () {
  console.log('Server running');
  db.dbConnect();
});


