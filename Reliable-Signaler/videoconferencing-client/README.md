# [video conferencing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/video-conferencing) client using [Reliable Signaler](https://github.com/muaz-khan/Reliable-Signaler)

[![npm](https://img.shields.io/npm/v/videoconferencing-client.svg)](https://npmjs.org/package/videoconferencing-client) [![downloads](https://img.shields.io/npm/dm/videoconferencing-client.svg)](https://npmjs.org/package/videoconferencing-client)

It is a node.js and socket.io based reliable signaling implementation for [video conferencing](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/video-conferencing).

Windows users: 

* https://cdn.webrtc-experiment.com/packages/videoconferencing-client.zip

Linux users:

```
wget https://cdn.webrtc-experiment.com/packages/videoconferencing-client.tar
tar -xf videoconferencing-client.tar
node server
```

You can even install using NPM:

```
# install
npm install videoconferencing-client

# run
node ./node_modules/videoconferencing-client/server.js
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

* https://github.com/muaz-khan/Reliable-Signaler/tree/master/videoconferencing-client

## License

[videoconferencing-client](https://www.npmjs.org/package/videoconferencing-client) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
