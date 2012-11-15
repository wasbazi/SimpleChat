var socket = io.connect('/');

var ReservedWordsViewModel = function (){
    this.init();
}

var Message = function(data, selected){
    this.sender = data.name;
    this.message = data.message;
}

ReservedWordsViewModel.prototype = {
    init: function(){
        var self = this;

        this.chats = ko.observableArray();
        this.friends = ko.observableArray();
        this.nick = ko.observable('');

        this.messageText = ko.observable();
        this.messageText.subscribe(this.sendMessage, this);

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
    },

    friendJoined: function(f){ this.friends.push(f); },
    friendsList: function(f){ this.friends(f); },

    message: function(data){
        var message = new Message(data, this.selectedRoom);
        this.chats.push(message);
    },

    sendMessage: function(value){
        value = value || this.messageText();

        if(value != ''){
            var message = {text: value};
            socket.emit( 'messageSent',  message);
            this.messageText('');
        }
    },
    friendDisconnected: function(data){
        this.friends(data.users);
    }

};

ko.applyBindings( new ReservedWordsViewModel() );