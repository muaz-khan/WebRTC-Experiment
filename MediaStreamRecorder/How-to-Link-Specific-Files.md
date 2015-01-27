## [MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) - [Demos](https://www.webrtc-experiment.com/msr/) -   [![npm](https://img.shields.io/npm/v/msr.svg)](https://npmjs.org/package/msr) [![downloads](https://img.shields.io/npm/dm/msr.svg)](https://npmjs.org/package/msr)

You can link specific files:

To link specific files, you must [download](https://github.com/streamproc/MediaStreamRecorder) this ZIP:

* https://github.com/streamproc/MediaStreamRecorder/archive/master.zip

```html
<script src="/MediaStreamRecorder-v1.2.js" data-require="MediaRecorder" data-scripts-dir="/"> </script>
```

`data-require`: Comma separated modules names. Supported values are `StereoRecorder,MediaRecorder,WhammyRecorder,GifRecorder`.

```html
// to record audio only on chrome
data-require="StereoRecorder"

// to record audio only on firefox
data-require="MediaRecorder"

// to record audio both on chrome and firefox
data-require="MediaRecorder,StereoRecorder"

// to record only video (both on chrome and firefox)
data-require="MediaRecorder,WhammyRecorder"

// to record multiple streams in chrome
data-require="StereoAudioRecorder,WhammyRecorder,MultiStreamRecorder"

// to record only gif
data-require="GifRecorder"

// to record everything
data-require="StereoRecorder,MediaRecorder,WhammyRecorder,GifRecorder,MultiStreamRecorder"
```

`data-scripts-dir="/"`: Location of the directory where all required script files resides.

```html
// root-directory
data-scripts-dir="/"

// sub/nested directory
data-scripts-dir="../subdir/"

// same directory where HTML-file is placed
data-scripts-dir="../"

// you can use absolute-URIs
data-scripts-dir="//cdn.webrtc-experiment.com/msr/"
```

You can manually link the files as well; use `data-manual=true`:

```html
<!--
    This file provides public-API for all recording scenarios
    You need to use "data-manual" only with this script.
-->
<script src="MediaStreamRecorder-v1.2.js" data-manual="true"> </script>

<!-- cross-browser getUserMedia/AudioContext declarations -->
<script src="../common/Cross-Browser-Declarations.js"> </script>

<!-- stores AudioContext-level objects in memory for re-usability purposes -->
<script src="../common/ObjectStore.js"> </script>

<!-- both these files are used to support audio recording in chrome -->        
<script src="../AudioStreamRecorder/StereoRecorder.js"> </script>
<script src="../AudioStreamRecorder/StereoAudioRecorder.js"> </script>

<!-- this one uses MediaRecorder draft for voice & video recording (works only in Firefox) -->
<script src="../AudioStreamRecorder/MediaRecorder.js"> </script>

<!-- these files are supporting video-recording in chrome (webm) -->        
<script src="../VideoStreamRecorder/WhammyRecorder.js"> </script>
<script src="../VideoStreamRecorder/WhammyRecorderHelper.js"> </script>
<script src="../VideoStreamRecorder/lib/whammy.js"> </script>

<!-- these files are used to support gif-recording in both chrome & firefox -->
<script src="../VideoStreamRecorder/GifRecorder.js"> </script>
<script src="../VideoStreamRecorder/lib/gif-encoder.js"> </script>
```

## License

[MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) library is released under [MIT licence](https://www.webrtc-experiment.com/licence/).
