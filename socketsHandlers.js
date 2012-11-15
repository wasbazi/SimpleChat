var users = [];

function findUser(id){
    if(!users.length)
        return false;

    var user = users.filter(function(x){
        return x.id == id;
    });
    return user && user[0];
}

function deleteUser(id){
    var user = findUser(id);
    if(!user)
        return false;

    var idx = users.indexOf(user);
    var removed = users.splice(idx, 1);
    return removed && removed[0];
}

function SocketConnection(io, socket){
    this.io = io;
    this.socket = socket;
}

SocketConnection.prototype = {
    disconnect: function(){
        var disconnectedUser = deleteUser(this.id);
        if(disconnectedUser){
            this.io.sockets.emit('friendDisconnected', { users: users});
            var messageObj = { message: this.nickname + " Logged Off", name: 'SERVER' };
            this.io.sockets.emit('message', messageObj);
        }
    },
    messageSent: function (data){
        this.socket.emit('message', {message: data.text, name: 'You' });
        this.socket.broadcast.emit('message', {message: data.text, name: this.nickname });
    },
    setNick: function(data){
        this.nickname = data.name;
        this.id = users.length + 1;

        users.push({ sid: this.socket.id, name: this.nickname, id: this.id });
        this.socket.broadcast.emit('friendJoined', {name: this.nickname});
        this.socket.broadcast.emit('message', {message: this.nickname + " Logged On", name: "SERVER"});
    }

};

function handler(io){
    io.sockets.on('connection', function(socket){
        socket.emit('friendsList', users);

        var listener = new SocketConnection(io, socket);

        socket.on('disconnect', listener.disconnect.bind(listener));
        socket.on('messageSent', listener.messageSent.bind(listener));
        socket.on('setNick', listener.setNick.bind(listener));
    });
}

exports.handler = handler;