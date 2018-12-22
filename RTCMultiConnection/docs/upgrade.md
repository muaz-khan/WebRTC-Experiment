# Upgrade

> This page explains how to upgrade to latest version (v3 or higher).

Use `streamEvents` instead of `connection.streams`:

```javascript
var stream = connection.streamEvents['streamid'];

// or use this code:
// backward compatibility
connection.streams = connection.streamEvents;
connection.numberOfConnectedUsers = 0;

if (Object.observe) {
    Object.observe(connection.streamEvents, function() {
        // for backward compatibility
        connection.streams = connection.streamEvents;
    });

    Object.observe(connection.peers, function() {
        // for backward compatibility
        connection.numberOfConnectedUsers = connection.getAllParticipants().length;
    });
}

# you can even use "getStreamById"
var stream = connection.attachStreams.getStreamById('streamid');

# to get remote stream by id
var allRemoteStreams = connection.getRemoteStreams('remote-user-id');
var stream = allRemoteStreams.getStreamByid('streamid');
```

Wanna check `isScreen` or `isVideo` or `isAudio`?

```javascript
connection.onstream = function(event) {
    if(event.stream.isScreen) {
        // screen stream
    }

    if(event.stream.isVideo) {
        // audio+video or video-only stream
    }

    if(event.stream.isAudio) {
        // audio-only stream
    }
};
```

### Mute/UnMute?

```javascript
var stream = connection.streamEvents['streamid'].stream;

stream.mute('audio'); // mute only audio tracks
stream.mute('video'); // mute only video tracks
stream.mute('both'); // mute both video and audio tracks

// or simply
stream.mute(); // mute both video and audio tracks
```

# Other Documents

1. [Getting Started guide for RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/getting-started.md)
2. [Installation Guide](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/installation-guide.md)
3. [How to Use?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/how-to-use.md)
4. [API Reference](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/api.md)
5. [Upgrade from v2 to v3](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/upgrade.md)
6. [How to write iOS/Android applications?](https://github.com/muaz-khan/RTCMultiConnection/tree/master/docs/ios-android.md)
7. [Tips & Tricks](https://github.com/muaz-khan/RTCMultiConnection/blob/master/docs/tips-tricks.md)

## Twitter

* https://twitter.com/WebRTCWeb i.e. @WebRTCWeb

## License

[RTCMultiConnection](https://github.com/muaz-khan/RTCMultiConnection) is released under [MIT licence](https://github.com/muaz-khan/RTCMultiConnection/blob/master/LICENSE.md) . Copyright (c) [Muaz Khan](http://www.MuazKhan.com/).
