##### Nodejs/Socketio Server-Side Code

```javascript
io.sockets.on('connection', function (socket) {
    socket.on('message', function (data) {
        socket.broadcast.emit('message', data);
    });
});
```

=

##### `openSignalingChannel` for [RTCMultiConnection.js](http://www.RTCMultiConnection.org/docs/) and [DataChanel.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel) (Client-Side Code)

```javascript
var channels = {};
var currentUserUUID = Math.round(Math.random() * 60535) + 5000;
var socketio = io.connect('http://localhost:8888/');

socketio.on('message', function(data) {
    if(data.sender == currentUserUUID) return;
    
    if (channels[data.channel] && channels[data.channel].onmessage) {
        channels[data.channel].onmessage(data.message);
    };
});

connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    channels[channel] = config;

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
};
```

=

##### `openSocket` for all standalone WebRC Experiments

```javascript
var channels = {};
var currentUserUUID = Math.round(Math.random() * 60535) + 5000;
var socketio = io.connect('http://localhost:8888/');

socketio.on('message', function(data) {
    if(data.sender == currentUserUUID) return;
    
    if (channels[data.channel] && channels[data.channel].onmessage) {
        channels[data.channel].onmessage(data.message);
    };
});

var config = {
    openSocket = function (config) {
        var channel = config.channel || 'main-channel';
        channels[channel] = config;

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
var channels = {};
var currentUserUUID = Math.round(Math.random() * 60535) + 5000;
var websocket = new WebSocket('ws://localhost:8888/');

websocket.onmessage =  function(e) {
    data = JSON.parse(e.data);
    
    if(data.sender == currentUserUUID) return;
    
    if (channels[data.channel] && channels[data.channel].onmessage) {
        channels[data.channel].onmessage(data.message);
    };
};

// overriding "openSignalingChannel" method
connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    channels[channel] = config;

    if (config.onopen) setTimeout(config.onopen, 1000);
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

##### How to use any signaling server? E.g. SignalR, WebSync, etc.

First step: Define following "two" global variables:

```javascript
var channels = {};
var currentUserUUID = Math.round(Math.random() * 60535) + 5000;
```

Second Step: Initialize Signaling Server:

```javascript
var websocket = new WebSocket('ws://localhost:8888/');
```

Third Step: Receive/Subscribe transmitted messages/data:

```javascript
websocket.onmessage =  function(e) {
    data = JSON.parse(e.data);
    
    if(data.sender == currentUserUUID) return;
    
    if (channels[data.channel] && channels[data.channel].onmessage) {
        channels[data.channel].onmessage(data.message);
    };
};
```

Fourth and Last Step: Override "openSignalingChannel" or "openSocket" method:

```javascript
connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    channels[channel] = config;

    if (config.onopen) setTimeout(config.onopen, 1000);
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

A few points to remember:

1. The object returned by overridden `openSignalingChannel` or `openSocket` method MUST return an object with two things:
   i. `send` method. Used to send data via signaling gateway.
   ii. `channel` object. Used for video-conferencing. If you skip it; it will make one-to-many instead of many-to-many.
2. `onmessage` or `on('message', callback)` MUST have same code as you can see a few lines above.

You don't need to do anything else on your signaling server. You'll NEVER be asked to modify your existing signaling implementations! Just use existing stuff and enjoy WebRTC experiments!

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
var channels = {};
var username = Math.round(Math.random() * 60535) + 5000;

var client = new fm.websync.client('websync.ashx');

client.setAutoDisconnect({
    synchronous: true
});

client.connect({
    onSuccess: function () {
        client.join({
            channel: '/chat',
            userId: username,
            userNickname: username,
            onReceive: function (event) {
                var message = JSON.parse(event.getData().text);
                if (channels[message.channel] && channels[message.channel].onmessage) {
                    channels[message.channel].onmessage(message.message);
                }
            }
        });
    }
});

connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    channels[channel] = config;

    if (config.onopen) setTimeout(config.onopen, 1000);
    return {
        send: function (message) {
            client.publish({
                channel: '/chat',
                data: {
                    username: username,
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
var channels = {};

var connection = new RTCMultiConnection();

var hub = $.connection.webRtcHub3;
$.support.cors = true;

$.connection.hub.url = '/signalr/hubs';

hub.client.onMessageReceived = function (message) {
    var message = JSON.parse(message);
    if (channels[message.channel] && channels[message.channel].onmessage) {
        channels[message.channel].onmessage(message.message);
    }
};

// start the hub
$.connection.hub.start();

```

**Third Step:** Overriding `openSignalingChannel` method:

```javascript
connection.openSignalingChannel = function (config) {
    var channel = config.channel || this.channel;
    channels[channel] = config;

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

[WebRTC Experiments](https://www.webrtc-experiment.com/) are released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
