var socket = io.connect('/');

var Message = function(data, selected){
    this.sender = { id: data.sender, name: data.name };
    this.receiver = data.receiver || null;
    this.room = data.room || null;
    this.message = data.message;

    this.isVisible = ko.computed(function(){
        if(this.room){
            console.log('this.room', this.room);
            return this.room == selected().name;
        }
        if(this.receiver){
            console.log(this.receiver, selected());
            return this.receiver == selected().id || this.sender.id == selected().id;
        }
    }, this);
};

var FriendsListViewModel = function(socket){
    this.maxShownUsers = 10;
    this.curPosition = ko.observable(0);

    this.friendsOnline = ko.observableArray();

    this.renderedUsers = ko.computed(function(){
        var numFriendsOnline = this.friendsOnline().length;
        if( numFriendsOnline < 10)
            return this.friendsOnline();
        return this.friendsOnline().slice(this.curPosition(), this.curPosition() + this.maxShownUsers);
    }, this);

    this.selectedRoom = ko.observable({type: 'room', name: 'lobby'});

    this.data = ko.observable();
    this.data.subscribe( this.updateSelected.bind(this) );

    this.selectFriend = function(data, event){
        this.selectedRoom({type: 'user', id: data.id});
    }.bind(this);
    this.selectLobby = function(data, event){
        this.selectedRoom({type: 'room', name: "lobby"});
    }.bind(this);

    this.setSocketListeners(socket);
    this.setWindowScrollFunctions();
};

FriendsListViewModel.prototype = {
    friendJoined: function(f){ this.friendsOnline.push(f); },
    friendsList: function(f){ this.friendsOnline(f); },

    updateSelected: function(users){
        if(this.selectedRoom().id == data.disconnectedId)
            this.selectedRoom({type: 'room', name: 'lobby'});
    },
    friendDisconnected: function(data){
        this.friendsOnline(data.users);
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
    },

    sendMessage: function(value){
        value = value || this.messageText();

        if(value != ''){
            var message = $.extend({}, this.friends.selectedRoom(), {text: value});
            socket.emit( 'messageSent',  message);
            this.messageText('')
        }
    }

};

ko.applyBindings( new ReservedWordsViewModel() );