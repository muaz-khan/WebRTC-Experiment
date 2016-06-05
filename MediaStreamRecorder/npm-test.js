// https://tonicdev.com/npm/msr

var MediaStreamRecorder = require('msr');

console.log('require-msr', MediaStreamRecorder);

console.log('\n\n-------\n\n');

var recorder = new MediaStreamRecorder({});
console.log('MediaStreamRecorder', recorder);

console.log('\n\n-------\n\n');

var multiStreamRecorder = new MediaStreamRecorder.MultiStreamRecorder({});
console.log('MultiStreamRecorder', multiStreamRecorder);
