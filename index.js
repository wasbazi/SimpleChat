var server = require(__dirname + "/server"),
    socketsHandlers = require(__dirname + "/socketsHandlers");

server.start(socketsHandlers.handler);
