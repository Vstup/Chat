'use strict';
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const url = require('url');
const cookie = require('../node-cookie/index');
const stat = require('../node-static/node-static');
const funcs = require('./funcs');
const auth = require('./authorization');

const server = http.createServer();
const io = socketio(server);
const port = 8080;

const fileServer = new stat.Server( './public/', {
  cache: 3600,
  gzip: true
} );


const route =  function (req, res) {

  const data = url.parse(req.url, true).query;
  const path = url.parse(req.url, true).pathname;
  // console.log(path)
  if ( path === '/styles/loginStyles.css' || path === '/styles/style.css' || path === '/scripts/common.js' || path === '/sounds/message-sound.mp3'){
    req.addListener( 'end', function () {

      fileServer.serve( req, res );

    } ).resume();
  }

  if (path === '/' || path === '/home' ) {

    res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
    res.end(funcs.generatePage(req));
  }


  if (path === '/logout') {
    const uname = funcs.getUser(req);
    auth.userSessionDelete(uname, res);
    res.end();
  }



  if (data) {
    const uname = data.uname;
    const pass = data.pass;
    const cause = req.headers.cause;

    if (cause === 'chatCreate') {
      const user1 = funcs.getUser(req);
      funcs.createChat(user1, uname);
      const result = [];
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
      const data = funcs.chatCheck(funcs.getUser(req));
      res.end(JSON.stringify(data));
    }

  }


};

const guest =  function (req, res) {

  const data = url.parse(req.url, true).query;
  const path = url.parse(req.url, true).pathname;
  // console.log(path);
  if (data) {
    const uname = data.uname;
    const pass = data.pass;
    const email = data.email;
    const cause = req.headers.cause;

    if (cause === 'login') {
      const accsses = auth.checkPass(uname, pass);
      if (!accsses) res.end('wrong');
      else {
        auth.userSessionCreate(uname, res);
        res.end();
      }
    }

    if (cause === 'register') {
      auth.addUser(uname, pass, email,res);
      auth.newUserSession(uname);
      auth.userSessionCreate(uname, res);
      res.end();
    }

    if ( path === '/styles/loginStyles.css'){
      req.addListener( 'end', function () {
        fileServer.serve(req, res, ()=>{
        });
      } ).resume();
    }

    if (path ==='/registration'){
      // res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
      res.end(fs.readFileSync('public/views/registration.html'));
    }else
    {
      // res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
      res.end(fs.readFileSync('public/views/login.html'));
    }




  }};



module.exports = {
  route,
  guest
};
