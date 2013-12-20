WebSocket Client & Server Implementation for Node
=================================================

Overview
--------
This is a (mostly) pure JavaScript implementation of the WebSocket protocol versions 8 and 13 for Node.  There are some example client and server applications that implement various interoperability testing protocols in the "test" folder.

Current News
------------

- As of version 1.0.7, ***Native modules are now optional.*** If they fail to compile, WebSocket-Node will still work but will not verify that received UTF-8 data is valid, and xor masking/unmasking of payload data for security purposes will not be as efficient as it is performed in JavaScript instead of native code.

- Version 1.0.7 requires node v0.6.10, since that's the first version that I can manage to successfully build the native extensions with node-gyp through npm.  If anyone can figure out how to build native extensions in a way that works with both older and newer versions of Node, I'm happy to accept a patch!

- If you want to support Unicode characters outside the Basic Multilingual Plane (BMP) you must use Node v0.8.x, which added support for representing these characters as surrogate pairs inside JavaScript strings.  Under Node v0.6.x, characters with code points greater than 65535 (greater than a 16-bit unsigned value) will have their code point truncated, resulting in seemingly unpredictable characters being returned.

- WebSocket-Node was already [one of the fastest WebSocket libraries for Node](http://hobbycoding.posterous.com/websockt-binary-data-transfer-benchmark-rsult), and thanks to a small patch from [kazuyukitanimura](https://github.com/kazuyukitanimura), this library is now [up to 200% faster](http://hobbycoding.posterous.com/how-to-make-websocket-work-2x-faster-on-nodej) as of version 1.0.3!

Changelog
---------

Current Version: 1.0.7

[View the changelog](https://github.com/Worlize/WebSocket-Node/blob/master/CHANGELOG.md)

Browser Support
---------------

* Firefox 7-9 (Old) (Protocol Version 8)
* Firefox 10+ (Protocol Version 13)
* Chrome 14,15 (Old) (Protocol Version 8)
* Chrome 16+ (Protocol Version 13)
* Internet Explorer 10 (Preview) (Protocol Version 13)
* Safari 6 (Protocol Version 13)

***Safari older than 6.0 is not supported since it uses a very old draft of WebSockets***

I made a decision early on to explicitly avoid maintaining multiple slightly different copies of the same code just to support the browsers currently in the wild.  The major browsers that support WebSocket are on a rapid-release schedule (with the exception of Safari) and now that the final version of the protocol has been [published as an official RFC](http://datatracker.ietf.org/doc/rfc6455/), it won't be long before support in the wild stabilizes on that version.  My client application is in Flash/ActionScript 3, so for my purposes I'm not dependent on the browser implementations.  *I made an exception to my stated intention here to support protocol version 8 along with 13, since only one minor thing changed and it was trivial to handle conditionally.*  The library now interoperates with other clients and servers implementing draft -08 all the way up through the final RFC.

***If you need to simultaneously support legacy browser versions that had implemented draft-75/draft-76/draft-00, take a look here: https://gist.github.com/1428579***

For a WebSocket client written in ActionScript 3, see my [AS3WebScocket](https://github.com/Worlize/AS3WebSocket) project.

Benchmarks
----------
There are some basic benchmarking sections in the Autobahn test suite.  I've put up a [benchmark page](http://worlize.github.com/WebSocket-Node/benchmarks/) that shows the results from the Autobahn tests run against AutobahnServer 0.4.10, WebSocket-Node 1.0.2, WebSocket-Node 1.0.4, and ws 0.3.4.

Autobahn Tests
--------------
The very complete [Autobahn Test Suite](http://www.tavendo.de/autobahn/testsuite.html) is used by most WebSocket implementations to test spec compliance and interoperability.

**Note about failing UTF-8 tests:** There are some UTF-8 validation tests that fail due to the fact that according to the ECMAScript spec, V8 and subsequently Node cannot support Unicode characters outside the BMP (Basic Multilingual Plane.)  JavaScript's String.fromCharCode() function truncates all code points to 16-bit, so you cannot decode higher plane code points in JavaScript.  Google's V8 uses UCS-2 as its internal string representation, and [they have no intention to change that any time soon](http://code.google.com/p/v8/issues/detail?id=761), so it is not possible to decode higher plane code points in C++, to the best of my knowledge, because those characters are not representable in UCS-2 anyway.  The Autobahn Test Suite requires that all valid Unicode code points survive a complete round trip, including code points that represent non-existent characters and characters above the BMP.  Since JavaScript cannot represent any characters with a code point >= 65535, no JavaScript implementation of WebSockets can pass these UTF-8 tests without using a cheat, such as echoing back the original binary data without decoding and re-encoding the UTF-8 data, which is not representative of real-world practical application.  ***I do not consider this to be a problem in the majority of circumstances*** since it is very unlikely to cause major issues in any real-world application as long as you don't need to use characters outside the BMP.
**Update:** This issue seems to have been resolved in the version of V8 used in Node 0.8.x.  I believe they are using surrogate-pairs to accommodate characters that are outside the BMP, but I haven't looked into it.

- [View Server Test Results](http://worlize.github.com/WebSocket-Node/test-report/servers/)
- [View Client Test Results](http://worlize.github.com/WebSocket-Node/test-report/clients/)

Notes
-----
This library has been used in production on [worlize.com](https://www.worlize.com) since April 2011 and seems to be stable.  Your mileage may vary.

**Tested with the following node versions:**

- 0.6.18
- 0.8.6

It may work in earlier or later versions but I'm not actively testing it outside of the listed versions.  YMMV.

Documentation
=============

For more complete documentation, see the [Documentation Wiki](https://github.com/Worlize/WebSocket-Node/wiki/Documentation).

Installation
------------

A few users have reported difficulties building the native extensions without first manually installing node-gyp.  If you have trouble building the native extensions, make sure you've got a C++ compiler, and have done `npm install -g node-gyp` first. 

Native extensions are optional, however, and WebSocket-Node will work even if the extensions cannot be compiled.

In your project root:

    $ npm install websocket
  
Then in your code:

```javascript
var WebSocketServer = require('websocket').server;
var WebSocketClient = require('websocket').client;
var WebSocketFrame  = require('websocket').frame;
var WebSocketRouter = require('websocket').router;
```

Note for Windows Users
----------------------
Because there is a small C++ component used for validating UTF-8 data, you will need to install a few other software packages in addition to Node to be able to build this module:

- [Microsoft Visual C++](http://www.microsoft.com/visualstudio/en-us/products/2010-editions/visual-cpp-express)
- [Python 2.7](http://www.python.org/download/) (NOT Python 3.x)


Current Features:
-----------------
- Licensed under the Apache License, Version 2.0
- Protocol version "8" and "13" (Draft-08 through the final RFC) framing and handshake
- Can handle/aggregate received fragmented messages
- Can fragment outgoing messages
- Router to mount multiple applications to various path and protocol combinations
- TLS supported for outbound connections via WebSocketClient
- TLS supported for server connections (use https.createServer instead of http.createServer)
  - Thanks to [pors](https://github.com/pors) for confirming this!
- Cookie setting and parsing
- Tunable settings
  - Max Receivable Frame Size
  - Max Aggregate ReceivedMessage Size
  - Whether to fragment outgoing messages
  - Fragmentation chunk size for outgoing messages
  - Whether to automatically send ping frames for the purposes of keepalive
  - Keep-alive ping interval
  - Whether or not to automatically assemble received fragments (allows application to handle individual fragments directly)
  - How long to wait after sending a close frame for acknowledgment before closing the socket.


Known Issues/Missing Features:
------------------------------
- No API for user-provided protocol extensions.


Usage Examples
==============

Server Example
--------------

Here's a short example showing a server that echos back anything sent to it, whether utf-8 or binary.

```javascript
#!/usr/bin/env node
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  return true;
}

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    var connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            connection.sendUTF(message.utf8Data);
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connection.sendBytes(message.binaryData);
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});
```

Client Example
--------------

This is a simple example client that will print out any utf-8 messages it receives on the console, and periodically sends a random number.

*This code demonstrates a client in Node.js, not in the browser*

```javascript
#!/usr/bin/env node
var WebSocketClient = require('websocket').client;

var client = new WebSocketClient();

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket client connected');
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
    function sendNumber() {
        if (connection.connected) {
            var number = Math.round(Math.random() * 0xFFFFFF);
            connection.sendUTF(number.toString());
            setTimeout(sendNumber, 1000);
        }
    }
    sendNumber();
});

client.connect('ws://localhost:8080/', 'echo-protocol');
```
    
Request Router Example
----------------------

For an example of using the request router, see `libwebsockets-test-server.js` in the `test` folder.


Resources
---------

A presentation on the state of the WebSockets protocol that I gave on July 23, 2011 at the LA Hacker News meetup.  [WebSockets: The Real-Time Web, Delivered](http://www.scribd.com/doc/60898569/WebSockets-The-Real-Time-Web-Delivered)