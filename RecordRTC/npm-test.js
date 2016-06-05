// https://tonicdev.com/npm/recordrtc

var RecordRTC = require('recordrtc');

var recorder = RecordRTC({}, {
    type: 'video',
    recorderType: RecordRTC.WhammyRecorder
});

console.log('\n--------\nRecordRTC\n--------\n');
console.log(recorder);

console.log('\n--------\nstartRecording\n--------\n');
recorder.startRecording();
console.log('\n--------\nprocess.exit()\n--------\n');

process.exit()
