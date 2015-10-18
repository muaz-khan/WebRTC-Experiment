// links:
// Open-Sourced: https://github.com/muaz-khan/RecordRTC
// https://cdn.WebRTC-Experiment.com/RecordRTC.js
// https://www.WebRTC-Experiment.com/RecordRTC.js
// npm install recordrtc
// http://recordrtc.org/

// updates?
/*
-. Added support for MediaRecorder API in Chrome. Currently requires: RecordRTC(stream, {recorderType: MediaStreamRecorder})
-. mimeType, bitsPerSecond, audioBitsPerSecond, videoBitsPerSecond added.
-. CanvasRecorder.js updated to support Firefox. (experimental)
-. Now you can reuse single RecordRTC object i.e. stop/start/stop/start/ and so on.
-. GifRecorder.js can now record HTMLCanvasElement|CanvasRenderingContext2D as well.
-. added: frameInterval:20 for WhammyRecorder.js
-. chrome issue  audio plus 720p-video recording can be fixed by setting bufferSize:16384
-. fixed Firefox save-as dialog i.e. recordRTC.save('filen-name')
-. "indexedDB" bug fixed for Firefox.
-. numberOfAudioChannels:1 can be passed to reduce WAV size in Chrome.
-. StereoRecorder.js is removed. It was redundant. Now RecordRTC is directly using: StereoAudioRecorder.js
-. mergeProps is removed. It was redundant.
-. reformatProps is removed. Now plz pass exact frameRate/sampleRate instead of frame-rate/sample-rate
-. Firefox supports remote-audio-recording since v28 - RecordRTC(remoteStream, { recorderType: StereoAudioRecorder });
-. added 3 methods: initRecorder, setRecordingDuration and clearRecordedData
-. Microsoft Edge support added (only-audio-yet).
-. You can pass "recorderType" - RecordRTC(stream, { recorderType: StereoAudioRecorder });
-. If MediaStream is suddenly stopped in Firefox.
-. Added "disableLogs"         - RecordRTC(stream, { disableLogs: true });
-. You can pass "bufferSize:0" - RecordRTC(stream, { bufferSize: 0 });
-. You can set "leftChannel"   - RecordRTC(stream, { leftChannel: true });
-. Added functionality for analyse black frames and cut them - pull#293
-. if you're recording GIF, you must link: https://cdn.webrtc-experiment.com/gif-recorder.js
-. You can set "frameInterval" for video - RecordRTC(stream, { type: 'video', frameInterval: 100 });
*/

//------------------------------------

// Browsers Support::
// Chrome (all versions) [ audio/video separately ]
// Firefox ( >= 29 ) [ audio/video in single webm/mp4 container or only audio in ogg ]
// Opera (all versions) [ same as chrome ]
// Android (Chrome) [ only video ]
// Android (Opera) [ only video ]
// Android (Firefox) [ only video ]
// Microsoft Edge (Only Audio & Gif)

//------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
//------------------------------------
// Note: RecordRTC.js is using 3 other libraries; you need to accept their licences as well.
//------------------------------------
// 1. RecordRTC.js
// 2. MRecordRTC.js
// 3. Cross-Browser-Declarations.js
// 4. Storage.js
// 5. MediaStreamRecorder.js
// 6. StereoAudioRecorder.js
// 7. CanvasRecorder.js
// 8. WhammyRecorder.js
// 9. Whammy.js
// 10. DiskStorage.js
// 11. GifRecorder.js
//------------------------------------

'use strict';
