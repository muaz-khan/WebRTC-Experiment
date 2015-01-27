# [DataChannel.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/DataChannel) client using [Reliable Signaler](https://github.com/muaz-khan/Reliable-Signaler)

[![npm](https://img.shields.io/npm/v/datachannel-client.svg)](https://npmjs.org/package/datachannel-client) [![downloads](https://img.shields.io/npm/dm/datachannel-client.svg)](https://npmjs.org/package/datachannel-client)

It is a node.js and socket.io based reliable signaling implementation for [DataChannel.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/DataChannel).

```
# install
npm install datachannel-client

# run
node ./node_modules/datachannel-client/server.js
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

* https://github.com/muaz-khan/Reliable-Signaler/tree/master/datachannel-client

## License

[datachannel-client](https://www.npmjs.org/package/datachannel-client) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
