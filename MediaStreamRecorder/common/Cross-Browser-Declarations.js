// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Documentation - github.com/streamproc/MediaStreamRecorder

// _____________________________
// Cross-Browser-Declarations.js

// animation-frame used in WebM recording
if (!window.requestAnimationFrame) {
    requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
}

if (!window.cancelAnimationFrame) {
    cancelAnimationFrame = window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
}

// WebAudio API representer
if (!window.AudioContext) {
    window.AudioContext = window.webkitAudioContext || window.mozAudioContext;
}

URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

if (window.webkitMediaStream) window.MediaStream = window.webkitMediaStream;

IsChrome = !!navigator.webkitGetUserMedia;

// Merge all other data-types except "function"

function mergeProps(mergein, mergeto) {
    mergeto = reformatProps(mergeto);
    for (var t in mergeto) {
        if (typeof mergeto[t] !== 'function') {
            mergein[t] = mergeto[t];
        }
    }
    return mergein;
}

function reformatProps(obj) {
    var output = {};
    for (var o in obj) {
        if (o.indexOf('-') != -1) {
            var splitted = o.split('-');
            var name = splitted[0] + splitted[1].split('')[0].toUpperCase() + splitted[1].substr(1);
            output[name] = obj[o];
        } else output[o] = obj[o];
    }
    return output;
}

// "dropFirstFrame" has been added by Graham Roth
// https://github.com/gsroth

function dropFirstFrame(arr) {
    arr.shift();
    return arr;
}

function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
