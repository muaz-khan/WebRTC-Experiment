## [ConcatenateBlobs.js](https://github.com/muaz-khan/ConcatenateBlobs)  [![npm](https://img.shields.io/npm/v/concatenateblobs.svg)](https://npmjs.org/package/concatenateblobs) [![downloads](https://img.shields.io/npm/dm/concatenateblobs.svg)](https://npmjs.org/package/concatenateblobs)

Demo: https://www.WebRTC-Experiment.com/ConcatenateBlobs/

> Simply pass array of blobs.
> This javascript library will concatenate all blobs in single "Blob" object.

It is <a href="https://www.webrtc-experiment.com/licence/">MIT Licenced</a>, which means that you can use it in any commercial/non-commercial product, free of cost.

```
npm install concatenateblobs
```

To use it:

```htm
<script src="./node_modules/concatenateblobs/ConcatenateBlobs.js"></script>
```

## 1. Link The Library

```
https://cdn.webrtc-experiment.com/ConcatenateBlobs.js

// or
https://www.webrtc-experiment.com/ConcatenateBlobs.js
```

## 2. Use it

```javascript
// 2nd argument is type of "resulting-blob"
ConcatenateBlobs([arrayOfBlobs], 'audio/wav', function(resultingBlob) {

    POST_to_Server(resultingBlob);
    
    // or preview locally
    localVideo.src = URL.createObjectURL(resultingBlob);
});
```

## Credits

* [Muaz Khan](http://www.MuazKhan.com/)

## License

[ConcatenateBlobs.js](https://github.com/muaz-khan/ConcatenateBlobs) is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) [Muaz Khan](https://plus.google.com/+MuazKhan).
