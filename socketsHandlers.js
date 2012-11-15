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
        this.socket.get('userData', function(err, userData){
            var disconnectedUser = deleteUser(userData.id);
            if(disconnectedUser){
                this.io.sockets.emit('friendDisconnected', { users: users});
                var messageObj = { message: userData.nickname + " Logged Off", name: 'SERVER' };
                this.io.sockets.emit('message', messageObj);
            }
        }.bind(this) );
    },
    messageSent: function (data){
        this.socket.get('userData', function(err, userData){
            this.socket.emit('message', {message: data.text, name: 'You' });
            this.socket.broadcast.emit('message', {message: data.text, name: userData.nickname });
        }.bind(this) );
    },
    setNick: function(data){
        var nickname = data.name;
        var id = users.length + 1;

        this.socket.set('userData', {id: id, nickname: nickname}, function(){
            users.push({ sid: this.socket.id, name: nickname, id: id });
            this.socket.broadcast.emit('friendJoined', {name: nickname, id: id});
            this.socket.broadcast.emit('message', {message: nickname + " Logged On", name: "SERVER"});
            this.socket.emit('confirmNickname', {name: nickname, id: id});
        }.bind(this) );
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