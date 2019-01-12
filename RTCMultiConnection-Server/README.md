<a href="https://www.rtcmulticonnection.org/"><img src="https://i.imgur.com/MFfRBSM.png" /></a>

## RTCMultiConnection Socket.io Server

[![npm](https://img.shields.io/npm/v/rtcmulticonnection-server.svg)](https://npmjs.org/package/rtcmulticonnection-server) [![downloads](https://img.shields.io/npm/dm/rtcmulticonnection-server.svg)](https://npmjs.org/package/rtcmulticonnection-server)

> Since version `1.3.1`: now `rtcmulticonnection-server` does not creates any HTTP server.
> 
> Now you need to use this: `require('rtcmulticonnection-server').addSocket(socket)` where `socket` is your socket.io connection object.
> 
> It means  that now you can integrate `rtcmulticonnection-server` inside any socket.io application or expressjsj/angular frameworks.

```sh
npm install rtcmulticonnection-server

# either
node server.js --help

# or
require('rtcmulticonnection-server').addSocket(socket);
```

**Installation Guide:**

* https://github.com/muaz-khan/RTCMultiConnection-Server/wiki

## Free socket.io servers

```javascript
connectin.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
connectin.socketURL = 'https://webrtcweb.com:9002/';
```

## `config.json`

* https://github.com/muaz-khan/RTCMultiConnection-Server/wiki/config.json

## Integrate inside nodejs applications

```javascript
const ioServer = require('socket.io');
const RTCMultiConnectionServer = require('rtcmulticonnection-server');

ioServer(httpApp).on('connection', function(socket) {
    RTCMultiConnectionServer.addSocket(socket);
});
```

For more information:

* https://github.com/muaz-khan/RTCMultiConnection-Server/wiki/Integrate-inside-nodejs-applications

## Demos

* https://rtcmulticonnection.herokuapp.com/demos/

## License

[RTCMultiConnection Socket.io Server](https://github.com/muaz-khan/RTCMultiConnection-Server) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](https://MuazKhan.com/).
