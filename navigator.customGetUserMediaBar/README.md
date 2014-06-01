## [navigator.customGetUserMediaBar.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/navigator.customGetUserMediaBar) : Keep Users Privacy! / [Demo](https://www.WebRTC-Experiment.com/navigator.customGetUserMediaBar/)

<img src="https://www.webrtc-experiment.com/images/navigator.customGetUserMediaBar.gif" style="width:100%;" />

=

### How to use it?

```html
<script src="//www.webrtc-experiment.com/navigator.customGetUserMediaBar.js"></script>
```

=

```javascript
/*
 *. https => displaying custom prompt-bar for HTTPs domains!
 *. Keep users privacy as much as possible!
 */

var mediaConstraints = {
    audio: true,
    video: true
};

// navigator.customGetUserMediaBar(mediaConstraints, success_callback, failure_callback);
// arg1==mediaConstraints::: {audio:true, video:true}
// arg2==success_callback::: user accepted the request
// arg3==failure_callback::: user denied   the request

navigator.customGetUserMediaBar(mediaConstraints, function () {

    // now you can invoke "getUserMedia" to seamlessly capture user's media
    navigator.webkitGetUserMedia(mediaConstraints, success_callback, failure_callback);

}, function () {

    // user clicked "Deny" or "x" button
    throw new Error('PermissionDeniedError');

});
```

=

##### License

[navigator.customGetUserMediaBar.js](https://github.com/muaz-khan/WebRTC-Experiment/tree/master/navigator.customGetUserMediaBar) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
