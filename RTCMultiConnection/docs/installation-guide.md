# Installation Guide

> This page explains how to install RTCMultiConnection v3.

* Youtube Video: [NPM install](https://www.youtube.com/watch?v=EtsiYEW_T8Y) or [Other Videos](https://www.youtube.com/watch?v=EtsiYEW_T8Y&list=PLPRQUXAnRydKdyun-vjKPMrySoow2N4tl)

# Fetch from Github

> Github is strongly recommended. NPM or TAR are secondary options.

```sh
git clone https://github.com/muaz-khan/RTCMultiConnection.git ./
npm install --production
```

Or download ZIP:

* https://github.com/muaz-khan/RTCMultiConnection/archive/master.zip

Then call `npm install --production`.

Use `--production` to skip `grunt` dependencies. You don't need `grunt` until you modify library itself.

# Download TAR

```sh
wget http://webrtcweb.com/rtcmulticonnection-v3.tar.gz
tar -xf rtcmulticonnection-v3.tar.gz
```

# Install using NPM or Bower


```sh
npm install rtcmulticonnection-v3 --production

# or
bower install rtcmulticonnection-v3
```

# Run `server.js`

```sh
node server.js
```

Now open `http://localhost:9001/`.

# Use HTTPs

Open [server.js](https://github.com/muaz-khan/RTCMultiConnection/blob/master/server.js) and enable `isUseHTTPs`:

```javascript
var isUseHTTPs = true;
```

# Change Port

Open [server.js](https://github.com/muaz-khan/RTCMultiConnection/blob/master/server.js) and set `port`:

```javascript
var port = 443;
```

See how to enable SSL certificates:

* https://github.com/muaz-khan/WebRTC-Experiment/issues/62

> Remember: HTTPs is requires for screen-capturing on both Chrome & Firefox.
> 
> Chrome requires HTTPs for normal camera/mic as well.

# How to check if server is running correctly?

Open this URL: `https://localhost:9001/socket.io/socket.io.js`

If you can load `/socket.io/socket.io.js` on your server then it is working fine.

# Stop Old Processes

Check all processes running on port `9001` and stop process by `id`:

```sh
lsof -n -i4TCP:9001 | grep LISTEN
kill process-ID
```

Or stop all processes on a specific port. (It may require `sudo` privileges):

```sh
fuser -vk 9001/tcp
```

Now open: `http://localhost:9001/`

## Keep running server in background

```sh
nohup nodejs server.js > /dev/null 2>&1 &
```

Or:

```sh
nohup nodejs server.js &
```

Or use `forever`:

```sh
npm install forever -g
forever start server.js
```

To auto-start `server.js` on system-reboot (i.e. when Mac/Linux system shuts down or reboots):

```sh
npm install forever-service

cd __path to your npm install__
forever-service install ncustomAppName --script server.js
```

Commands to interact with `service ncustomAppName Start`:

```
- "sudo service ncustomAppName start" Stop
- "sudo service ncustomAppName stop" Status
- "sudo service ncustomAppName status" Restart - "sudo service ncustomAppName restart"
```

More info about `forever-service` [here](http://stackoverflow.com/a/36027516/552182).

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
