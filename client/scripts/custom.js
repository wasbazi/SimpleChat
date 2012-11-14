var socket = io.connect('/');

var ReservedWordsViewModel = function (){
    this.init();
}

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
}

ReservedWordsViewModel.prototype = {
    init: function(){
        var self = this;

        this.selectedRoom = ko.observable({type: 'room', name: 'lobby'});
        this.chats = ko.observableArray();
        this.friends = ko.observableArray();

        this.nick = ko.observable('');
        this.id = ko.observable('');

        this.messageText = ko.observable();
        this.messageText.subscribe(this.sendMessage, this);

        this.selectFriend = function(data, event){
            self.selectedRoom({type: 'user', id: data.id});
        };
        this.selectLobby = function(data, event){
            self.selectedRoom({type: 'room', name: "lobby"});
        };

        this.setSocketListeners();
    },
    setSocketListeners: function(){
        this.nick.subscribe(function(val){
            socket.emit('setNick', { name: val} );
        });

        socket.on('friendsList', this.friendsList.bind(this));
        socket.on('friendJoined', this.friendJoined.bind(this));
        socket.on('message', this.message.bind(this));
        socket.on('friendDisconnected', this.friendDisconnected.bind(this));

        socket.on('confirmNickname',function(data){
            this.id(data.id);
        }.bind(this));
    },

    friendJoined: function(f){ this.friends.push(f); },
    friendsList: function(f){ this.friends(f); },

    message: function(data){
        if(data.id = this.id())
            data.name = 'You';
        var message = new Message(data, this.selectedRoom);
        this.chats.push(message);
    },

    sendMessage: function(value){
        value = value || this.messageText();

        if(value != ''){
            console.log(this.selectedRoom());
            var message = $.extend({}, this.selectedRoom(), {text: value});
            socket.emit( 'messageSent',  message);
            this.messageText('')
        }
    },
    friendDisconnected: function(data){
        console.log(data);
        this.friends(data.users);
        if(this.selectedRoom().id == data.id)
            this.selectedRoom({type: 'room', name: 'lobby'});
    }

};

ko.applyBindings( new ReservedWordsViewModel() );