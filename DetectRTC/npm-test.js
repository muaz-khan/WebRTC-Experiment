// https://tonicdev.com/npm/detectrtc

var DetectRTC = require('detectrtc');

console.log(DetectRTC.browser);

console.log('\n\n-------\n\n');

DetectRTC.load(function() {
    console.log(DetectRTC);
});
