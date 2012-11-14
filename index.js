var server = require("./server"),
    socketsHandlers = require("./socketsHandlers");

server.start(socketsHandlers.handler);