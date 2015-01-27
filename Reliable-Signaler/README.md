# Reliable Signaler  [![npm](https://img.shields.io/npm/v/reliable-signaler.svg)](https://npmjs.org/package/reliable-signaler) [![downloads](https://img.shields.io/npm/dm/reliable-signaler.svg)](https://npmjs.org/package/reliable-signaler)

It is a node.js and socket.io based reliable signaling implementation. Remember, reliable doesn't mean "scalable"; reliable simply means that it auto reconnects in any kind of failure or internet disconnect. It is having following features:

1. Auto reconnects if node.js gets down out of any reason.
2. Auto reconnects if internet connection disconnects.
3. It provides [custom-signaling](https://github.com/muaz-khan/RTCMultiConnection/wiki/Custom-Private-Servers#signaling-servers) for your [RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) and [DataChannel](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/DataChannel) applications!

```
npm install reliable-signaler
```

# How it works?

1. You can store a room-id on server using `createNewRoomOnServer` method.
2. You can get that room-id using `getRoomFromServer` method.

# How to use?

1. In your Node.js server, invoke `require('reliable-signaler')` and pass HTTP-Server object.
2. In your HTML file, link this script: `/reliable-signaler/signaler.js`
3. In your `<script>` tag, invoke `initReliableSignaler` constructor.
4. Invoke `createNewRoomOnServer` method for room-moderator.
5. Invoke `getRoomFromServer` method from room-participants (multiple participants).

# Demos

* `rtcmulticonnection-client`: [![npm](https://img.shields.io/npm/v/rtcmulticonnection-client.svg)](https://npmjs.org/package/rtcmulticonnection-client) [![downloads](https://img.shields.io/npm/dm/rtcmulticonnection-client.svg)](https://npmjs.org/package/rtcmulticonnection-client)
* `datachannel-client`: [![npm](https://img.shields.io/npm/v/datachannel-client.svg)](https://npmjs.org/package/datachannel-client) [![downloads](https://img.shields.io/npm/dm/datachannel-client.svg)](https://npmjs.org/package/datachannel-client)
* `videoconferencing-client`: [![npm](https://img.shields.io/npm/v/videoconferencing-client.svg)](https://npmjs.org/package/videoconferencing-client) [![downloads](https://img.shields.io/npm/dm/videoconferencing-client.svg)](https://npmjs.org/package/videoconferencing-client)

```
# install rtcmulticonnection-client
npm install rtcmulticonnection-client
node ./node_modules/rtcmulticonnection-client/server.js

# or intall datachannel-client
npm install datachannel-client
node ./node_modules/datachannel-client/server.js

# or intall videoconferencing-client
npm install videoconferencing-client
node ./node_modules/videoconferencing-client/server.js
```

Now open localhost port:`8080`.

# 1st Step: Node.js Server-side code

To use it in your node.js code: (required)

```javascript
var httpServer = require('http').createServer(callback);

require('reliable-signaler')(httpServer || expressServer || portNumber, {
    // for custom socket handlers
    socketCallback: function(socket) {
        socket.on('custom-handler', function(message) {
            socket.broadcast.emit('custom-handler', message);
        });
    }
});
```

Constructor of the module `reliable-signaler` takes an `config` object where you can pass `socketCallback` and other configurations:

```javascript
var config = {
    socketCallback: function(socket) {}
};
require('reliable-signaler')(httpServer, config);
```

*. `socketCallback`: If you want to attach custom handlers over socket object.

# 2nd Step: Browser-side code

To use it in the browser: (required)

```htm
<script src="/reliable-signaler/signaler.js"></script>
```

And your client-side javascript code:

```javascript
var connection = new RTCMultiConnection();

// invoke "initReliableSignaler" and pass "connection" or "channel" object
var signaler = initReliableSignaler(connection, 'http://domain:port/');
```

Call `createNewRoomOnServer` method as soon as you'll call `open` method. You can even call `createNewRoomOnServer` earlier than `open` however it isn't suggested:

For RTCMultiConnection: 

```javascript
// for data-only sessions
connection.open();
signaler.createNewRoomOnServer(connection.sessionid);

// or (not recommended)
signaler.createNewRoomOnServer(connection.sessionid, function() {
    connection.open();
});

// or --- recommended.
connection.open({
    onMediaCaptured: function() {
        signaler.createNewRoomOnServer(connection.sessionid);
    }
});
```

For DataChannel: 

```javascript
channel.open('room-id');
signaler.createNewRoomOnServer('room-id', successCallback);
```

For participants, call `getRoomFromServer` method:

```javascript
// RTCMultiConnection
signaler.getRoomFromServer('sessioin-id', function(roomid) {
    // invoke "join" in callback
    connection.join({
        sessionid: roomid,
        userid: roomid,
        extra: {},
        session: connection.session
    });
    
    // or simply
    connection.join(roomid);
    
    // or
    connection.connect(roomid);
});

// DataChannel
signaler.getRoomFromServer('sessioin-id', function(roomid) {
    channel.join({
        id: roomid,
        owner: roomid
    });
    
    // or
    channel.connect(roomid);
});
```

# Complete Client-Side Example for RTCMultiConnection

```html
<script src="/reliable-signaler/signaler.js"></script>
<script>
var connection = new RTCMultiConnection();

var signaler = initReliableSignaler(connection, '/');

btnOpenRoom.onclick = function() {
    connection.channel = connection.sessionid = connection.userid = sessionid;
    connection.open({
        onMediaCaptured: function() {
            signaler.createNewRoomOnServer(connection.sessionid);
        }
    });
};

btnJoinRoom.onclick = function() {
    signaler.getRoomFromServer(roomid, function(roomid){
        connection.channel = connection.sessionid = roomid;
        connection.join({
            sessionid: roomid,
            userid: roomid,
            extra: {},
            session: connection.session
        });
    });
};
</script>
```

# Complete Client-Side Example for DataChannel

```html
<script src="/reliable-signaler/signaler.js"></script>
<script>
var channel = new DataChannel();

var signaler = initReliableSignaler(channel, '/');

btnOpenRoom.onclick = function() {
    signaler.createNewRoomOnServer(roomid, function() {
        channel.channel = channel.userid = roomid;
        channel.open(roomid);
    });
};

btnJoinRoom.onclick = function() {
    signaler.getRoomFromServer(roomid, function(roomid){
        channel.channel = roomid;
        channel.join({
            id: roomid,
            owner: roomid
        });
    });
};
</script>
```

## API Reference

Constructor takes either `RTCMultiConnection` instance or a `config` object:

```javascript
# 1st option: Pass RTCMultiConnection object
var signaler = initReliableSignaler(connection);

# 2nd option: Pass "config" object
var signaler = initReliableSignaler(connection, '/');
```

`initReliableSignaler` global-function exposes/returns 3-objects:

1. `socket`
2. `createNewRoomOnServer`
3. `getRoomFromServer`

```javascript
// "socket" object
signaler.socket.emit('message', 'hello');

// "createNewRoomOnServer" method
signaler.createNewRoomOnServer(connection.sessionid, successCallback);

// "getRoomFromServer" object
signaler.getRoomFromServer('sessioin-id', callback);
```

## `createNewRoomOnServer`

This method simply takes `sessioin-id` and stores in node.js server. You can even pass `successCallback`.

```javascript
signaler.createNewRoomOnServer(roomid, successCallback);
```

## `getRoomFromServer`

This method looks for active `sessioin-id` in node.js server. Node.js server will fire callback only when session is found.

If session is absent, then node.js server will wait until someone opens that session; and node.js will fire `getRoomFromServer-callback` as soon a session is opened.

```javascript
signaler.getRoomFromServer(roomid, successCallback);
```

## License

[Reliable-Signaler](https://github.com/muaz-khan/Reliable-Signaler) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
