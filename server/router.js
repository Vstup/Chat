'use strict';
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const url = require('url');
const cookie = require('../node-cookie/index');
const stat = require('../node-static/node-static');
const funcs = require('./funcs');
const auth = require('./authorization');
const token = require('./tokenGenerate');

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
    funcs.generatePage(res,req,(page)=>{
      res.end(page);
    });
  }


  if (path === '/logout') {
    const uname = funcs.getUser(req);
    auth.userSessionDelete(res,uname,()=>{
      res.end();
    });
  }



  if (data) {
    const uname = data.uname;
    const pass = data.pass;
    const cause = req.headers.cause;

    if (cause === 'chatCreate') {
      const user1 = funcs.getUser(req);

      funcs.createChat(res, user1, uname,()=>{
        const result = [];
        funcs.getChatLi(req,(chatLi)=>{
          funcs.getChatId(user1, uname,(chatId)=>{
            result.push(chatId);
            result.push(chatLi[0]);
            result.push(chatLi[1]);
            res.end(JSON.stringify(result));
          });
        });
      });
    }

    if (cause === 'chatOpen') {
      const chatId = data.chatId;
      funcs.getMessagesFromChat(res,chatId,(result)=>{
        res.end(JSON.stringify(result));
      });
    }

    if (cause === 'search') {
      const data = funcs.chatCheck(res,funcs.getUser(req),(data)=>{
        res.end(JSON.stringify(data));
      });
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
      const tok = token.generateToken;
      cookie.create(res, 'user', uname, 'Hd1eR7v12SdfSGc1');
      cookie.create(res, 'token', tok, 'Hd1eR7v12SdfSGc1');
      auth.checkPass(uname, pass, (accsses)=>{
        if (!accsses) res.end('wrong');
        else {
          auth.userSessionCreate(res,uname,tok,()=>{
            res.end();
          });
        }
      });
    }


    if (cause === 'register') {
      const tok = token.generateToken;
      cookie.create(res, 'user', uname, 'Hd1eR7v12SdfSGc1');
      cookie.create(res, 'token', tok, 'Hd1eR7v12SdfSGc1');
      auth.addUser(res,uname, pass, email,()=>{
        auth.newUserSession(uname,()=>{
          auth.userSessionCreate(res,uname,tok,()=>{
            return res.end();
          });
        });
      });

    }

    if ( path === '/styles/loginStyles.css'){
      req.addListener( 'end', function () {
        fileServer.serve(req, res, ()=>{
        });
      } ).resume();
    }

    if (path ==='/registration'){
      res.end(fs.readFileSync('public/views/registration.html'));
    }else
    {
      res.end(fs.readFileSync('public/views/login.html'));
    }

  }};



module.exports = {
  route,
  guest
};
