'use strict';
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const url = require('url');
const cookie = require('./node-cookie/index');
const stat = require('./node-static/node-static');
const funcs = require('./funcs');

const server = http.createServer();
const io = socketio(server);
const port = 8080;

const fileServer = new stat.Server( './public/', {
  cache: 3600,
  gzip: true
} );


io.on('connection', function (socket) {
  socket.on('message', function (data) {
    io.emit('broadcast', data);

    funcs.messageLog(data.nickname,data.chatId,data.message);
    //console.log(data);
  });
  socket.on('clear', function () {
    io.emit('clear1' );
  });
});

server.on('request', function (req, res) {




  const data = url.parse(req.url, true).query;
  const path = url.parse(req.url, true).pathname;
  // console.log(path);
    if (path === '/styles/style.css' || path === '/scripts/common.js' || path === '/sounds/message-sound.mp3'){
        req.addListener( 'end', function () {

            fileServer.serve( req, res );

        } ).resume()
    }

  if (path === '/' || path === '/home' ) {
    console.log('checkSess: ' + funcs.checkSess(req));
    if ( !funcs.checkSess(req) ) {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
      res.end(fs.readFileSync('login.html'));


    } else {
      res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
      res.end(funcs.generatePage(req));
    }}

  if (path ==='/registration'){
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
    res.end(fs.readFileSync('registration.html'));
  }

  if (path ==='/login'){
    res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
    res.end(fs.readFileSync('login.html'));
  }

  if (path === '/logout') {
    const uname = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');
    funcs.userSessionDelete(uname, res);
    res.end();
  }



  if (data) {
    const uname = data.uname;
    const pass = data.pass;
    const cause = req.headers.cause;
    
    if (cause === 'login') {
      const accsses = funcs.checkPass(uname, pass);
      if (!accsses) res.end('wrong');
      else {
        funcs.userSessionCreate(uname, res);
        res.end(fs.readFileSync('public/index.html'));
      }
    }

    if (cause === 'register') {
      funcs.addUser(uname, pass);
      funcs.newUserSession(uname);
      funcs.userSessionCreate(uname, res);
      res.end(fs.readFileSync('public/index.html'));
    }

    if (cause === 'chatCreate') {
      const user1 = cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1');
      funcs.createChat(user1, uname);
      const result = [];
      // const userLi = funcs.generateUserLi(req);
      const chatLi = funcs.generateChatLi(req);
      const chatId = funcs.getChatId(user1, uname);
      result.push(chatId);
      result.push(chatLi);
      res.end(JSON.stringify(result));
    }

    if (cause === 'chatOpen') {
      const chatId = data.chatId;
      const result = funcs.getMessagesFromChat(chatId);
      res.end(JSON.stringify(result));
    }

      if (cause === 'search') {
          const data = funcs.chatCheck(cookie.get(req, 'user', 'Hd1eR7v12SdfSGc1'));
          res.end(JSON.stringify(data));
      }

  }


});

server.listen(port, function () {
  console.log('Server running');
});

