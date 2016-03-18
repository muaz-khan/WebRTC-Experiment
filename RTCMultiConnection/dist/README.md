## Link Script Files

All files from `/dist` directory are available on CDN: `https://cdn.webrtc-experiment.com:443/`

```html
<script src="/RTCMultiConnection.min.js"></script>

<!-- or -->
<script src="/dist/rmc3.min.js"></script>

<!-- CDN non-minified or minified -->
<script src="https://cdn.webrtc-experiment.com:443/rmc3.min.js"></script>

<!-- or specific version -->
<script src="https://github.com/muaz-khan/RTCMultiConnection/releases/download/3.2.83/rmc3.min.js"></script>
```

If you're sharing files, you also need to link:

```html
<script src="/dev/FileBufferReader.js"></script>

<!-- or CDN -->
<script src="https://cdn.webrtc-experiment.com:443/rmc3.fbr.min.js"></script>

<!-- or specific version -->
<script src="https://github.com/muaz-khan/RTCMultiConnection/releases/download/3.2.83/rmc3.fbr.min.js"></script>
```

> You can link multiple files from `dev` directory. Order doesn't matters.
