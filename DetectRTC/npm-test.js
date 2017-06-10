// https://tonicdev.com/npm/detectrtc

var DetectRTC;

try {
    DetectRTC = require('detectrtc');
}
catch(e) {
    DetectRTC = require('./DetectRTC.js');
}

console.log(DetectRTC.browser.name  + ' version ' + DetectRTC.browser.version);
console.log(DetectRTC.osName + ' version ' + DetectRTC.osVersion);
console.log(JSON.stringify(DetectRTC));
console.log(DetectRTC);

process.exit()
