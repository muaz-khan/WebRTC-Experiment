# RTCMultiConnection client using [Reliable Signaler](https://github.com/muaz-khan/Reliable-Signaler)

[![npm](https://img.shields.io/npm/v/rtcmulticonnection-client.svg)](https://npmjs.org/package/rtcmulticonnection-client) [![downloads](https://img.shields.io/npm/dm/rtcmulticonnection-client.svg)](https://npmjs.org/package/rtcmulticonnection-client)

It is a node.js and socket.io based reliable signaling implementation for RTCMultiConnection.js

Windows users: 

* https://cdn.webrtc-experiment.com/packages/rtcmulticonnection-client.zip

Linux users:

```
wget https://cdn.webrtc-experiment.com/packages/rtcmulticonnection-client.tar
tar -xf rtcmulticonnection-client.tar
node server
```

You can even install using NPM:

```
# install
npm install rtcmulticonnection-client

# run
node ./node_modules/rtcmulticonnection-client/server.js
```

Now open localhost port:`8080`.

# How it works?

1. You can store a room-id on server using `createNewRoomOnServer` method.
2. You can get that room-id using `getRoomFromServer` method.

# How to use?

1. In your Node.js server, invoke `require('reliable-signaler')` and pass HTTP-Server object.
2. In your HTML file, link this script: `/reliable-signaler/signaler.js`
3. In your `<script>` tag, invoke `initReliableSignaler` constructor.
4. Invoke `createNewRoomOnServer` method for room-moderator.
5. Invoke `getRoomFromServer` method from room-participants (multiple participants).

Source code of this demo is available here:

* https://github.com/muaz-khan/Reliable-Signaler/tree/master/rtcmulticonnection-client

## License

[rtcmulticonnection-client](https://www.npmjs.org/package/rtcmulticonnection-client) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
