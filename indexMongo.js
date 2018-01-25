'use strict';
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const url = require('url');
const cookie = require('./node-cookie/index');
const stat = require('./node-static/node-static');
const funcs = require('./server/funcs');
const auth = require('./server/authorizationMongo');
const router = require('./server/routerMongo');
const db =require('./server/db');

const server = http.createServer();
const io = socketio(server);
const port = 8081;

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
    res.addListener( 'writeHead', function () {


console.log('HEADERS WRITE!')
    } );    auth.checkSess(req, (access) => {
        console.log('access:  '+ access)
        if (access) router.route(req, res);
        else router.guest(req, res);
    });
});

server.listen(port, function () {
  console.log('Server running');
  db.dbConnect();
});


