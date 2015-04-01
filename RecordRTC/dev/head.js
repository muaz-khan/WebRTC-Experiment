// Last time updated at March 13, 2015, 08:32:23

// links:
// Open-Sourced: https://github.com/muaz-khan/RecordRTC
// http://cdn.WebRTC-Experiment.com/RecordRTC.js
// http://www.WebRTC-Experiment.com/RecordRTC.js (for China users)
// http://RecordRTC.org/latest.js (for China users)
// npm install recordrtc
// http://recordrtc.org/

// updates?
/*
-. Fixed echo.
-. CanvasRecorder fixed.
-. You can pass "recorderType" - RecordRTC(stream, { recorderType: window.WhammyRecorder });
-. If MediaStream is suddenly stopped in Firefox.
-. Added "disableLogs"         - RecordRTC(stream, { disableLogs: true });
-. You can pass "bufferSize:0" - RecordRTC(stream, { bufferSize: 0 });
-. You can set "leftChannel"   - RecordRTC(stream, { leftChannel: true });
-. Fixed MRecordRTC.
-. Added functionality for analyse black frames and cut them - pull#293
-. if you're recording GIF, you must link: https://cdn.webrtc-experiment.com/gif-recorder.js
*/

//------------------------------------

// Browsers Support::
// Chrome (all versions) [ audio/video separately ]
// Firefox ( >= 29 ) [ audio/video in single webm/mp4 container or only audio in ogg ]
// Opera (all versions) [ same as chrome ]
// Android (Chrome) [ only video ]
// Android (Opera) [ only video ]
// Android (Firefox) [ only video ]

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
// 6. StereoRecorder.js
// 7. StereoAudioRecorder.js
// 8. CanvasRecorder.js
// 9. WhammyRecorder.js
// 10. Whammy.js
// 11. DiskStorage.js
// 12. GifRecorder.js
//------------------------------------

'use strict';
