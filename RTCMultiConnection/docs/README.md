<a href="http://www.rtcmulticonnection.org/docs/">
    <img src="http://www.rtcmulticonnection.org/img/documentation.png" />
</a>

=

```html
<button id="openNewSessionButton">open New Session Button</button><br />

<script src="http://www.RTCMultiConnection.org/latest.js"> </script>
<script>
var connection = new RTCMultiConnection().connect();
document.getElementById('openNewSessionButton').onclick = function() {
    connection.open();
};
</script>
```

=

## http://www.rtcmulticonnection.org/docs/
## http://www.rtcmulticonnection.org/changes-log/
## http://www.rtcmulticonnection.org/FAQ/

[RTCMultiConnection Getting Started Guide](http://www.rtcmulticonnection.org/docs/getting-started/)

=

## License

[RTCMultiConnection.js](https://github.com/muaz-khan/WebRTC-Experiment/blob/master/RTCMultiConnection) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://plus.google.com/100325991024054712503).
