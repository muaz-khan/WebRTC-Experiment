## List of all bugs in MediaStreamRecorder.js

It is a list of all bugs need to be fixed.

=

##### AudioStreamRecorder/MediaRecorder.js `Line 27`

1. It is not a valid behavior
2. Mozilla Firefox Nightly crashes
3. Redundant memory usage

=

##### VideoStreamRecorder/GifRecorder.js `Line 79`

1. Must be able to clear old recorded GIFs
2. Both WebM and Gif recorders must work fine on Firefox

`context.drawImage` seems throwing error on Firefox: `NS_ERROR_NOT_AVAILABLE: Component is not available`.

Also, `uncaught exception: Input must be formatted properly as a base64 encoded DataURI of type image/webp`.

=

##### License

[MediaStreamRecorder.js](https://github.com/streamproc/MediaStreamRecorder) library is released under [MIT licence](https://www.webrtc-experiment.com/licence/) . Copyright (c) 2013 [Muaz Khan](https://github.com/muaz-khan) and [neizerth](https://github.com/neizerth).
