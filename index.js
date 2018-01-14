'use strict';
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const url = require('url');
const cookie = require('./node-cookie/index');
const stat = require('./node-static/node-static');
const funcs = require('./server/funcs');
const auth = require('./server/authorization');
const router = require('./server/router');

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
  // console.log(auth.checkSess(req));
  if (auth.checkSess(req)){
    router.route(req, res)
  } else {
    router.guest(req, res);
  }
});

server.listen(port, function () {
  console.log('Server running');
});

