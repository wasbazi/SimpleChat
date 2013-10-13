var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server);

function start(socketsHandler) {
    app.use(express.static(__dirname + '/client'));
    app.get('/', function (request, response) {
        response.sendfile(__dirname + '/client/index.html');
    });
    app.use(express.favicon());

    socketsHandler(io);

    server.listen(process.env.PORT || 4444);
    console.log("Server has started.");
}

exports.start = start;
