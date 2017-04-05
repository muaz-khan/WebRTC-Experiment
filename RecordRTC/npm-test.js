// https://tonicdev.com/npm/recordrtc

var RecordRTC;

try {
    RecordRTC = require('recordrtc');
}
catch(e) {
    RecordRTC = require('./RecordRTC.js');
}

var recorder = RecordRTC({}, {
    type: 'video',
    recorderType: RecordRTC.WhammyRecorder
});

recorder.startRecording();

process.exit()
