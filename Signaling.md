You can use any signaling implementation with any [WebRTC Experiment](https://www.webrtc-experiment.com/); whether it is XMPP/SIP or PHP/MySQL or Socket.io/WebSockets or WebSync/SignalR or PeerServer/SignalMaster or other gateway.

Remember, there are some built-in implementations:

1. [RTCMultiConnection.js and Reliable Signaling](https://github.com/muaz-khan/Reliable-Signaler/tree/master/rtcmulticonnection-client)
2. [DataChanel.js and Reliable Signaling](https://github.com/muaz-khan/Reliable-Signaler/tree/master/datachannel-client)
1. [Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/socketio-over-nodejs)
2. [WebSocket over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket-over-nodejs)
3. [WebSync for Signaling](https://github.com/muaz-khan/WebSync-Signaling) — useful only for .NET developers
4. [XHR/XMLHttpRequest Signaling](https://github.com/muaz-khan/XHR-Signaling) — useful for both .NET and PHP developers!

If you wanna understand basics of WebRTC signaling; then scroll to bottom and check [this section](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/Signaling.md#a-few-other-resources).

=

##### Nodejs/Socketio Server-Side Code

Your server side code can be as simple as possible like this:

```javascript
io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});
```

You can even use existing services like (for server side code only!):

1. https://github.com/andyet/signalmaster
2. https://github.com/peers/peerjs-server
3. https://github.com/SignalR/SignalR
4. http://millermedeiros.github.io/js-signals/
5. https://github.com/sockjs/sockjs-client

=

#### Browser side coding?

There are dozens of WebRTC Experiments and Libraries; you can use any existing signaling server with any WebRTC Experiment/Library!

You just need to understand how signaling is implemented in WebRTC Experiments:

1. All WebRTC Experiments has `openSocket` method; that can be defined in the HTML page; which allows you override/use any signaling implementation there!
2. All WebRTC Libraries has a public method i.e. [`openSignalingChannel`](http://www.rtcmulticonnection.org/docs/openSignalingChannel/);  which can also be overridden/defined in the HTML page; also you can override it to easily use any signaling implementation exists out there!

Now you understood how default implementations can be overridden; it is time to understand how to override for any signaling implementation exists out there!

=

#### Example code to explain how to override `openSignalingChannel`

###### First Step: Initialize a global array-like object

This array-like object will store `onmessage` callbacks.

```javascript
var onMessageCallbacks = {};
```

###### Second Step: Initialize Signaling Server

```javascript
var websocket = new WebSocket('wss://something:port/');
var socket = io.connect('https://domain:port/');
var firebase = new Firebase('https://user.firebaseio.com/' + connection.channel);
```

For socket.io; you can pass default channel as URL parameter:

```javascript
var socket = io.connect('https://domain:port/?channel=' + connection.channel);
```

###### 3rd Step: Subscribe to server messages

Capture server messages:

```javascript
websocket.onmessage = function (event) {
    onMessageCallBack(event.data);
};

socket.on('message', function (data) {
    onMessageCallBack(data);
});

firebase.on('child_added', function (snap) {
    onMessageCallBack(snap.val());
    snap.ref().remove(); // for socket.io live behaviour
});
```

and `onMessageCallBack`:

```javascript
function onMessageCallBack(data) {
    data = JSON.parse(e.data);

    if (data.sender == connection.userid) return;

    if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
    };
}
```

###### 4th and final Step: Override `openSignalingChannel` method

```javascript
connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    onMessageCallbacks[channel] = config.onmessage;

    if (config.onopen) setTimeout(config.onopen, 1000);
    return {
        send: function (message) {
            websocket.send(JSON.stringify({
                sender: connection.userid,
                channel: channel,
                message: message
            }));
        },
        channel: channel
    };
};
```

Read more [here](https://github.com/muaz-khan/WebRTC-Experiment/issues/180#issuecomment-38318694).

=

##### `openSignalingChannel` for [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/) and [DataChanel.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel) (Client-Side Code)

Putting above 4-steps together! Here is your browser side code that overrides default signaling implementations:

```javascript
var onMessageCallbacks = {};
var socketio = io.connect('http://localhost:8888/');

socketio.on('message', function(data) {
    if(data.sender == connection.userid) return;
    
    if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
    };
});

connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    onMessageCallbacks[channel] = config.onmessage;

    if (config.onopen) setTimeout(config.onopen, 1000);
    return {
        send: function (message) {
            socketio.emit('message', {
                sender: connection.userid,
                channel: channel,
                message: message
            });
        },
        channel: channel
    };
};
```

=

##### `openSocket` for all standalone WebRTC Experiments

```javascript
var onMessageCallbacks = {};
var currentUserUUID = Math.round(Math.random() * 60535) + 5000;
var socketio = io.connect('http://localhost:8888/');

socketio.on('message', function(data) {
    if(data.sender == currentUserUUID) return;
    
    if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
    };
});

var config = {
    openSocket = function (config) {
        var channel = config.channel || 'main-channel';
        onMessageCallbacks[channel] = config.onmessage;

        if (config.onopen) setTimeout(config.onopen, 1000);
        return {
            send: function (message) {
                socketio.emit('message', {
                    sender: currentUserUUID,
                    channel: channel,
                    message: message
                });
            },
            channel: channel
        };
    }
};
```

=

##### "Any WebSocket Server!" for Signaling

```javascript
// global stuff
var onMessageCallbacks = {};
var currentUserUUID = Math.round(Math.random() * 60535) + 5000;
var websocket = new WebSocket('ws://localhost:8888/');

websocket.onmessage =  function(e) {
    data = JSON.parse(e.data);
    
    if(data.sender == currentUserUUID) return;
    
    if (onMessageCallbacks[data.channel]) {
        onMessageCallbacks[data.channel](data.message);
    };
};

websocket.push = websocket.send;
websocket.send = function(data) {
    data.sender = currentUserUUID;
    websocket.push(JSON.stringify(data));
};

// overriding "openSignalingChannel" method
connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    onMessageCallbacks[channel] = config.onmessage;

    if (config.onopen) setTimeout(config.onopen, 1000);
    
    // directly returning socket object using "return" statement
    return {
        send: function (message) {
            websocket.send(JSON.stringify({
                sender: currentUserUUID,
                channel: channel,
                message: message
            }));
        },
        channel: channel
    };
};
```

=

##### A few points to remember:

1. The object returned by overridden `openSignalingChannel` or `openSocket` method MUST return an object with two things:

   1. `send` method. Used to send data via signaling gateway.
   2. `channel` object. Used for video-conferencing. If you skip it; it will make one-to-many instead of many-to-many.
   
2. `onmessage` or `on('message', callback)` MUST have same code as you can see a few lines above.

`openSocket` method can return `socket` object in three ways:

1. Directly returning using `return` statement.
2. Passing back over `config.callback` object.
3. Passing back over `config.onopen` object.

Second option i.e. `config.callback` is preferred.

##### First Option

```javascript
 var config = {
     openSocket: function (config) {
         var channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
         var socket = new Firebase('https://chat.firebaseIO.com/' + channel);
         socket.channel = channel;
         socket.on("child_added", function (data) {
             config.onmessage && config.onmessage(data.val());
         });
         socket.send = function (data) {
             this.push(data);
         };
         socket.onDisconnect().remove();

         // first option: returning socket object using "return" statement!
         return socket;
     }
 };
```

##### Second Option

```javascript
 var config = {
     openSocket: function (config) {
         var SIGNALING_SERVER = 'wss://wsnodejs.nodejitsu.com:443';
         var channel = config.channel || location.href.replace(/\/|:|#|%|\.|\[|\]/g, '');
         var websocket = new WebSocket(SIGNALING_SERVER);
         websocket.channel = config.channel;
         websocket.onopen = function () {
             websocket.push(JSON.stringify({
                 open: true,
                 channel: config.channel
             }));

             // second option: returning socket object using "config.callback" method
             if (config.callback)
                 config.callback(websocket);
         };
         websocket.onmessage = function (event) {
             config.onmessage(JSON.parse(event.data));
         };
         websocket.push = websocket.send;
         websocket.send = function (data) {
             websocket.push(JSON.stringify({
                 data: data,
                 channel: config.channel
             }));
         };
     }
 };
```

##### Third Option

```javascript
 var config = {
     openSocket: function (config) {
         // --------
         websocket.onopen = function () {
             // --------

             // third option: returning socket object using "config.onopen" method
             if (config.onopen)
                 config.onopen(websocket);
         };
         // --------
     }
 };
```

=

##### How to use [WebSync for Signaling](https://github.com/muaz-khan/WebSync-Signaling)?

```html
<script src="fm.js"> </script>
<script src="fm.websync.js"> </script>
<script src="fm.websync.subscribers.js"> </script>
<script src="fm.websync.chat.js"> </script>
```

```javascript
// www.RTCMultiConnection.org/latest.js

var connection = new RTCMultiConnection();

// ------------------------------------------------------------------
// start-using WebSync for signaling
var onMessageCallbacks = {};

var client = new fm.websync.client('websync.ashx');

client.setAutoDisconnect({
    synchronous: true
});

client.connect({
    onSuccess: function () {
        client.join({
            channel: '/chat',
            userId: connection.userid,
            userNickname: connection.userid,
            onReceive: function (event) {
                var message = JSON.parse(event.getData().text);
                if (onMessageCallbacks[message.channel]) {
                    onMessageCallbacks[message.channel](message.message);
                }
            }
        });
    }
});

connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    onMessageCallbacks[channel] = config.onmessage;

    if (config.onopen) setTimeout(config.onopen, 1000);
    return {
        send: function (message) {
            client.publish({
                channel: '/chat',
                data: {
                    username: connection.userid,
                    text: JSON.stringify({
                        message: message,
                        channel: channel
                    })
                }
            });
        }
    };
};
// end-using WebSync for signaling
// ------------------------------------------------------------------

// check existing sessions
connection.connect();

// open new session
document.getElementById('open-new-session').onclick = function() {
    connection.open();
};
```

=

##### How to use SignalR for Signaling?

**First Step:** Create Hub class:

```csharp
public class WebRtcHub3: Hub {
    public void Send(string message) {
        Clients.All.onMessageReceived(message);
    }
}
```

**Second Step:** Client side stuff:

```javascript
var onMessageCallbacks = {};

var connection = new RTCMultiConnection();

var hub = $.connection.webRtcHub3;
$.support.cors = true;

$.connection.hub.url = '/signalr/hubs';

hub.client.onMessageReceived = function (message) {
    var message = JSON.parse(message);
    if (onMessageCallbacks[message.channel]) {
        onMessageCallbacks[message.channel](message.message);
    }
};

// start the hub
$.connection.hub.start();

```

**Third Step:** Overriding `openSignalingChannel` method:

```javascript
connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    onMessageCallbacks[channel] = config.onmessage;

    if (config.onopen) setTimeout(config.onopen, 1000);
    return {
        send: function (message) {
            message = JSON.stringify({
                message: message,
                channel: channel
            });

            hub.server.send(message);
        }
    };
};
```

=

##### Room Presence Detection

[Using Firebase](https://github.com/muaz-khan/WebRTC-Experiment/issues/38#issuecomment-20527305):

```javascript
new window.Firebase('https://' + connection.firebase + '.firebaseIO.com/' + connection.channel).once('value', function (data) {
    var isRoomPresent = data.val() != null;
    if (!isRoomPresent) {
        connection.open(connection.sessionid);
    } else {
        connection.join(connection.sessionid);
    }
});
```

#### [Using Socket.io over Node.js](https://github.com/muaz-khan/WebRTC-Experiment/issues/38#issuecomment-18821960):

```javascript
var socket = io.connect('/');

socket.on('presence', function (isChannelPresent) {
    if (!isChannelPresent)
        connection.opne(connection.sessionid);
    else
        connection.join(connection.sessionid);
});

socket.emit('presence', channel);
```

Socket.io over Node.js demos can be found [here](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/socketio-over-nodejs).

#### Using WebSocket over Node.js

```javascript
var SIGNALING_SERVER = 'wss://wsnodejs.nodejitsu.com:443';
var websocket = new WebSocket(SIGNALING_SERVER);

websocket.onmessage = function (event) {
    var data = JSON.parse(event.data);
  
    if (data.isChannelPresent == false) {
        connection.open(connection.sessionid);
    } else {
        connection.join(connection.sessionid);
    }
};

websocket.onopen = function () {
    websocket.send(JSON.stringify({
        checkPresence: true,
        channel: connection.channel
    }));
};
```

WebSocket over Node.js demos can be found [here](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/websocket-over-nodejs).

=

##### XHR/XMLHttpRequest for Signaling

```javascript
// database has a single table; which has two columns: 
// 1) Message (required to store JSON data)
// 2) ID (optional: as primary key)

// a simple function to make XMLHttpRequests
function xhr(url, callback, data) {
    if (!window.XMLHttpRequest || !window.JSON) return;

    var request = new XMLHttpRequest();
    request.onreadystatechange = function () {
        if (callback && request.readyState == 4 && request.status == 200) {
            // server MUST return JSON text
            callback(JSON.parse(request.responseText));
        }
    };
    request.open('POST', url);

    var formData = new FormData();

    // you're passing "message" parameter
    formData.append('message', data);

    request.send(formData);
}

// this object is used to store "onmessage" callbacks from "openSignalingChannel handler
var onMessageCallbacks = {};

// this object is used to make sure identical messages are not used multiple times
var messagesReceived = {};

function repeatedlyCheck() {
    xhr('/Home/GetData', function (data) {
        // if server says nothing; wait.
        if (data == false) return setTimeout(repeatedlyCheck, 400);

        // if already receied same message; skip.
        if (messagesReceived[data.ID]) return setTimeout(repeatedlyCheck, 400);
        messagesReceived[data.ID] = data.Message;

        // "Message" property is JSON-ified in "openSignalingChannel handler
        data = JSON.parse(data.Message);

        // don't pass self messages over "onmessage" handlers
        if (data.sender != connection.userid && onMessageCallbacks[data.channel]) {
            onMessageCallbacks[data.channel](data.message);
        }

        // repeatedly check the database
        setTimeout(repeatedlyCheck, 1);
    });
}

repeatedlyCheck();

// overriding "openSignalingChannel handler
connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    onMessageCallbacks[channel] = config.onmessage;

    // let RTCMultiConnection know that server connection is opened!
    if (config.onopen) setTimeout(config.onopen, 1);

    // returning an object to RTCMultiConnection
    // so it can send data using "send" method
    return {
        send: function (data) {
            data = {
                channel: channel,
                message: data,
                sender: connection.userid
            };

            // posting data to server
            // data is also JSON-ified.
            xhr('/Home/PostData', null, JSON.stringify(data));
        },
        channel: channel
    };
};
```

Source code is available here: https://github.com/muaz-khan/XHR-Signaling

Remember: You can use same code JavaScript code both for PHP and ASP.NET.

=

You can find many other good examples here:

http://www.RTCMultiConnection.org/docs/openSignalingChannel/

=

##### A few other resources:

1. https://www.webrtc-experiment.com/docs/WebRTC-Signaling-Concepts.html
2. http://www.RTCMultiConnection.org/FAQ/
3. http://www.RTCMultiConnection.org/docs/sessionid/
4. http://www.RTCMultiConnection.org/docs/channel-id/

=

##### License

[WebRTC Experiments](https://www.webrtc-experiment.com/) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
