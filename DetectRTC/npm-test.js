// https://tonicdev.com/npm/detectrtc

var DetectRTC = require('detectrtc');

console.log(DetectRTC.browser.name  + ' version ' + DetectRTC.browser.version);
console.log(DetectRTC.osName + ' version ' + DetectRTC.osVersion);
console.log(JSON.stringify(DetectRTC));
console.log(DetectRTC);
