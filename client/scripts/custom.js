var socket = io.connect('/');

var Message = function(data, selected){
    this.sender = { id: data.sender, name: data.name };
    this.receiver = data.receiver || null;
    this.room = data.room || null;
    this.message = data.message;

    this.isVisible = ko.computed(function(){
        if(this.room){
            // console.log('this.room', this.room);
            return this.room == selected().name;
        }
        if(this.receiver){
            // console.log(this.receiver, selected());
            return this.receiver == selected().id || this.sender.id == selected().id;
        }
    }, this);
};

var FriendViewModel = function(friend){
    $.extend(this, friend);

    this.unreadMessages = ko.observable(false);
};

var FriendsListViewModel = function(socket){
    this._lobby = {type: 'room', name: "lobby", unreadMessages: ko.observable(false)};

    this.maxShownUsers = 10;
    this.curPosition = ko.observable(0);

    this.friendsOnline = ko.observableArray();

    this.renderedUsers = ko.computed(function(){
        var numFriendsOnline = this.friendsOnline().length;
        if(numFriendsOnline < 10)
            return this.friendsOnline();
        return this.friendsOnline().slice(this.curPosition(), this.curPosition() + this.maxShownUsers);
    }, this);

    this.selectedRoom = ko.observable(this._lobby);

    this.friendsOnline.subscribe(this.updateSelected.bind(this));

    this.selectFriend = function(data, event){
        this.selectedRoom({type: 'user', id: data.id});
        this.highlightFriend(data.id, false);
    }.bind(this);
    this.selectLobby = function(data, event){
        this.selectedRoom(this._lobby);
    }.bind(this);

    this.setSocketListeners(socket);
    this.setWindowScrollFunctions();
};

FriendsListViewModel.prototype = {
    friendJoined: function(f){
        this.friendsOnline.push(new FriendViewModel(f));
    },
    friendsList: function(f){
        var models = f.map(function(x){
            return new FriendViewModel(x);
        });
        this.friendsOnline(models);
    },

    updateSelected: function(users){
        if(this.selectedRoom().id == data.disconnectedId)
            this.selectedRoom(this._lobby);
    },
    friendDisconnected: function(data){
        var index = -1;
        this.friendsOnline().filter(function(friend, i){
            if(friend.id !== data.disconnectedId)
                return false;
            index = i;
            return true;
        });
        this.friendsOnline.splice(i, 1);
    },
    highlightFriend: function(senderId, unread){
        unread = typeof(unread) == "undefined" ? true : unread;
        var sender = this.findFriend(senderId);

        if(sender)
            sender.unreadMessages(unread);
    },
    findFriend: function(userId){
        return this.friendsOnline().filter(function(user){
            return user.id == userId;
        })[0];
    },
    setSocketListeners: function(socket){
        socket.on('friendsList', this.friendsList.bind(this));
        socket.on('friendJoined', this.friendJoined.bind(this));
        socket.on('friendDisconnected', this.friendDisconnected.bind(this));
    },
    setWindowScrollFunctions: function(){
        this.hasScrollUp = ko.computed(function(){
            return this.curPosition() >= 10;
        }.bind(this) );

        this.hasScrollDown = ko.computed(function(){
            var hiddenUsers = this.friendsOnline().length - this.curPosition();
            return hiddenUsers > 10;
        }.bind(this) );

        this.scrollUp = function(){
            var newPosition = this.curPosition() - 10;
            this.curPosition(newPosition);
        }.bind(this) ;

        this.scrollDown = function(){
            var newPosition = this.curPosition() + 10;
            this.curPosition(newPosition);
        }.bind(this) ;
    }
};

var ReservedWordsViewModel = function (){
    this.init();
}

ReservedWordsViewModel.prototype = {
    init: function(){
        var self = this;

        this.chats = ko.observableArray();
        this.friends = new FriendsListViewModel(socket);

        this.nick = ko.observable('');
        this.id = ko.observable('');

        this.messageText = ko.observable();
        this.messageText.subscribe(this.sendMessage, this);

        this.setSocketListeners();
    },
    setSocketListeners: function(){
        socket.on('message', this.message.bind(this));

        this.nick.subscribe(function(val){
            socket.emit('setNick', { name: val} );
        });
        socket.on('confirmNickname',function(data){
            this.id(data.id);
        }.bind(this));
    },

    message: function(data){
        var message = new Message(data, this.friends.selectedRoom);
        this.chats.push(message);

        if(this.friends.selectedRoom().id != data.sender.id)
            this.friends.highlightFriend(data.sender);
    },

    sendMessage: function(value){
        value = value || this.messageText();

        if(value != ''){
            var message = $.extend({}, this.friends.selectedRoom(), {text: value});
            socket.emit( 'messageSent',  message);
            this.messageText('');
        }
    }

};

ko.applyBindings(new ReservedWordsViewModel());
