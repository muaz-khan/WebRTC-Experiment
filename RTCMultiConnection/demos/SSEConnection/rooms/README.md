> "rooms" directory is used to store json-files created via "publish.php"

Live Demo: https://rtcmulticonnection.herokuapp.com/demos/SSEConnection.html

Server Sent Events (SSE) are used to setup WebRTC peer-to-peer connections.

1. Download above directory
2. Upload to your PHP webserver
3. Give the directory both read-and-write permissions
4. Go to [`dev/SSEConnection.js`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/SSEConnection.js) and replace [`sseDirPath`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/SSEConnection.js#L6) with `sseDirPath='https://php-server.com/SSEConnection/';`
5. Try [`demos/SSEConnection.html`](https://github.com/muaz-khan/RTCMultiConnection/blob/master/demos/SSEConnection.html) demo on HTTPs or localhost.

Relevant files:

1. https://github.com/muaz-khan/RTCMultiConnection/blob/master/dev/SSEConnection.js
2. https://github.com/muaz-khan/RTCMultiConnection/blob/master/demos/SSEConnection.html

PHP Source:

* https://github.com/muaz-khan/RTCMultiConnection/tree/master/demos/SSEConnection
