var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

function start(socketsHandler) {
    app.use(express.static(__dirname + '../client'));
    app.get('/', function (request, response) {
        response.sendfile(__dirname + '../client/index.html');
    });

    socketsHandler(io);

    server.listen(80);
    console.log("Server has started.");
}

exports.start = start;