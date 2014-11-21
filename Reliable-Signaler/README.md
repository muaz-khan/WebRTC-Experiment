# Reliable Signaler  [![npm](https://img.shields.io/npm/v/reliable-signaler.svg)](https://npmjs.org/package/reliable-signaler) [![downloads](https://img.shields.io/npm/dm/reliable-signaler.svg)](https://npmjs.org/package/reliable-signaler)

It is a node.js and socket.io based reliable signaling implementation. Remember, reliable doesn't mean "scalable"; reliable simply means that it auto reconnects in any kind of failure or internet disconnect. It is having following features:

1. Auto reconnects if node.js gets down out of any reason.
2. Auto reconnects if internet connection disconnects.
3. It provides [custom-signaling](https://github.com/muaz-khan/RTCMultiConnection/wiki/Custom-Private-Servers#signaling-servers) for your [RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) applications!

```
npm install reliable-signaler
```

# Demos

* https://www.npmjs.org/package/rtcmulticonnection-client
* https://www.npmjs.org/package/datachannel-client

```
# install rtcmulticonnection-client
npm install rtcmulticonnection-client
node ./node_modules/rtcmulticonnection-client/server.js

# or intall datachannel-client
npm install datachannel-client
node ./node_modules/datachannel-client/server.js
```

Now open localhost port:`8080`.

# 1st Step: Node.js Server

To use it in your node.js code: (required)

```javascript
require('reliable-signaler')(httpServer || expressServer || portNumber);
```

# 2nd Step: Browser-side code

Note: Below code targets: [rtcmulticonnection-client](https://www.npmjs.org/package/rtcmulticonnection-client)

To use it in the browser: (required)

```htm
<script src="/reliable-signaler/rmc-signaler.js"></script>
```

> Remember, `/reliable-signaler/rmc-signaler.js` route is auto opened by this implementation. If you passed `portNumber` instead of `httpServer` then you need to provide absolute URL instead of static one i.e. `http://localhost:port/reliable-signaler/rmc-signaler.js`

And your RTCMultiConnection code:

```javascript
var connection = new RTCMultiConnection();

// invoke "initRMCSignaler" and pass "connection" object
var rmcSignaler = initRMCSignaler(connection);

// or to pass "socket-URL"
var rmcSignaler = initRMCSignaler({
    connection: connection,
    socketURL: 'http://domain:port/'
});
```

Call `openNewSession` method as soon as you'll call `open` method:

```javascript
connection.open();
rmcSignaler.openNewSession();

// or:
connection.open({
    onMediaCaptured: rmcSignaler.openNewSession
});
```

For participants, call `joinSession` method:

```javascript
rmcSignaler.joinSession('sessioin-id', function(sessionDescription) {
    connection.join(sessionDescription); // invoke "join" in callback
});
```

# Complete Client-Side Example

```html
<script src="/reliable-signaler/rmc-signaler.js"></script>
<script>
var connection = new RTCMultiConnection();

var rmcSignaler = initRMCSignaler({
    connection: connection,
    socketURL: '/'
});

btnOpenRoom.onclick = function() {
    connection.channel = connection.sessionid = connection.userid = sessionid;
    connection.open({
        onMediaCaptured: function() {
            rmcSignaler.openNewSession();
        }
    });
};

btnJoinRoom.onclick = function() {
    rmcSignaler.joinSession(sessionid, function(sessionDescription){
        connection.channel = connection.sessionid = sessionDescription.sessionid;
        connection.join(sessionDescription);
    });
};
</script>
```

## API Reference

Constructor takes either `RTCMultiConnection` instance or a `config` object:

```javascript
# 1st option: Pass RTCMultiConnection object
var rmcSignaler = initRMCSignaler(rtcMultiConnection);

# 2nd option: Pass "config" object
var rmcSignaler = initRMCSignaler({
    connection: rtcMultiConnection,
    socketURL: '/'
});
```

`initRMCSignaler` global-function exposes/returns 3-objects:

1. `socket`
2. `openNewSession`
3. `joinSession`

```javascript
// "socket" object
rmcSignaler.socket.emit('message', 'hello');

// "openNewSession" method
rmcSignaler.openNewSession(connection.sessionDescription || null);

// "joinSession" object
rmcSignaler.joinSession('sessioin-id', callback);
```

## `openNewSession`

This method simply takes `connection.sessionDescription` object and stores in node.js server.

## `joinSession`

This method looks for active `sessioin-id` in node.js server. Node.js server will fire callback only when session is found.

If session is absent, then node.js server will wait until someone opens that session; and node.js will fire `joinSession-callback` as soon a session is opened.

## License

[Reliable-Signaler](https://github.com/muaz-khan/Reliable-Signaler) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
