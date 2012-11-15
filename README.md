SimpleChat
==========

A simple chat application created using NodeJS, Express, SocketIO and Knockout.

"How is a chat program simple?"
----------

A question many people may be wondering. How in the world is a chat program simple? First you have to write handlers to deal with constantly keeping a connection from your client to your server. And then once done you have to make sure that you don't mix up the wires. And even after that is accomplished you have to attempt to send the information back to the client and dig through your mess of DOM manipulation to properly show that content to a user.

Have no fear!
==========

Go out on a limb with me and let's throw out all of your DOM manipulation tricks, and your worrying over the Client/Server connection. Because through the power of the INTERNET!! we can solve this problem.

"I still don't understand"
----------

As we all know, the internet is a serious of tubes, so we're going to have some tube mechanics come in and worry about all that fancy stuff. Instead we're going to just drop our packets of information down the tubes and hope for the best.

"This guy is a lunatic, who gave him a computer?"
----------

Another great question, join us next week for the answer. 

(But back to our tubes)

Once the information arrives at it's destination then we are going to move them into piles. Handy little worker fairies will take care of the rest.

Have I lost you?
==========

With the magic of SocketIO all we have to do is specify a function to run on a specific action, for example: 'message'. Then once this happens SocketIO can react, it might send out that message to the rest of the clients.

Once it reaches the client the magic continues to happen with Knockout. At this point we just have to store the information into Knockout's special variables, and tell them where those variables should be displayed. Ta-da! Knockout will take care of the rest.