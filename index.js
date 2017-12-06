const http = require('http');
const fs = require('fs');
const socketio = require('socket.io');
const html = require('escape-html');

const server = http.createServer();
const io = socketio(server);
const port = 8080;

const data = fs.readFile('./index.html', function (err, html_str) {
    if(err) {
        throw err;
    };



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
        res.writeHeader(200, {'Content-type': 'text/html'})
        res.end(html_str);
    });
    server.listen(port, function () {
        console.log('Server running')
    });
});