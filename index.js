'use strict';
const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const html = require('escape-html');
const url = require('url');
const cookie = require('node-cookie');
const token = require('./tokenGenerate');
const stat = require('node-static');
const funcs = require('./funcs');

const users = JSON.parse(fs.readFileSync('users.json'));
const sessions = JSON.parse(fs.readFileSync('sessions.json'));

const server = http.createServer();
const io = socketio(server);
const port = 8082;



    io.on('connection', function (socket) {
        socket.on('message', function (data) {
            io.emit('broadcast', data);
            console.log(data);
        });
        socket.on('clear', function () {
            io.emit('clear1' );
        });
    });

    server.on('request', function (req, res) {
        const data = url.parse(req.url, true).query;
        const path = url.parse(req.url, true).pathname;
        // console.log(path);

        if (path === '/' || path === '/home' ) {
            console.log('checkSess: ' + funcs.checkSess(req));
            if ( !funcs.checkSess(req) ) {
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                res.end(fs.readFileSync('login.html'));

                //}
            } else {
                res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
                res.end(fs.readFileSync('index.html'))
            }}

        if (path ==='/registration'){
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            res.end(fs.readFileSync('registration.html'))
        }

        if (path ==='/login'){
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf8'});
            res.end(fs.readFileSync('login.html'))
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
                    res.end(fs.readFileSync('index.html'));
                }
            }

            if (cause === 'register') {
                funcs.addUser(uname, pass);
                funcs.newUserSession(uname);
                funcs.userSessionCreate(uname, res);
                res.end(fs.readFileSync('index.html'));
            }

        }

    });

    server.listen(port, function () {
        console.log('Server running')
    });
