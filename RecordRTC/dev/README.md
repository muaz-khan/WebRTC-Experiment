# [Development](https://github.com/muaz-khan/RecordRTC/tree/master/dev) directory

1. [RecordRTC API Reference](http://RecordRTC.org/RecordRTC.html)
2. [MRecordRTC API Reference](http://RecordRTC.org/MRecordRTC.html)
3. [MediaStreamRecorder API Reference](http://RecordRTC.org/MediaStreamRecorder.html)
5. [StereoAudioRecorder API Reference](http://RecordRTC.org/StereoAudioRecorder.html)
6. [WhammyRecorder API Reference](http://RecordRTC.org/WhammyRecorder.html)
7. [Whammy API Reference](http://RecordRTC.org/Whammy.html)
8. [CanvasRecorder API Reference](http://RecordRTC.org/CanvasRecorder.html)
9. [GifRecorder API Reference](http://RecordRTC.org/GifRecorder.html)
10. [Global API Reference](http://RecordRTC.org/global.html)

## Wanna Contribute?

```sh
mkdir node_modules
npm install --save-dev

# install grunt for code style verifications
npm install grunt-cli@0.1.13 -g

npm install grunt@0.4.5
npm install grunt-bump@0.7.0
npm install grunt-cli@0.1.13
npm install grunt-contrib-clean@0.6.0
npm install grunt-contrib-concat@0.5.1
npm install grunt-contrib-copy@0.8.2
npm install grunt-contrib-uglify@0.11.0
npm install grunt-contrib-watch@1.1.0
npm install grunt-jsbeautifier@0.2.10
npm install grunt-replace@0.11.0
npm install load-grunt-tasks@3.4.0
```

## Compile distribution

```sh
grunt

# or auto compile
grunt watch
```

It will generate `RecordRTC.js` and `RecordRTC.min.js` in the main directory.

# Success? Make a pull request!
