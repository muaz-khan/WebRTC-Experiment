var recorder;
var isRecording = false;
var bitsPerSecond = 0;
var isChrome = true; // used by RecordRTC

var enableTabCaptureAPI = false;
var enableTabCaptureAPIAudioOnly = false;

var enableScreen = true;
var enableMicrophone = false;
var enableCamera = false;
var cameraStream = false;

var enableSpeakers = true;

var videoCodec = 'Default';
var videoMaxFrameRates = '';
var videoResolutions = '1920x1080';

var startedVODRecordedAt = (new Date).getTime();

var startRecordingCallback = function() {};
var stopRecordingCallback = function(file) {};
var openPreviewOnStopRecording = true;
var openCameraPreviewDuringRecording = true;

var fixVideoSeekingIssues = false;

function isMediaRecorderCompatible() {
    return true;
}

function isMimeTypeSupported(mimeType) {
    if (typeof MediaRecorder.isTypeSupported !== 'function') {
        return true;
    }

    return MediaRecorder.isTypeSupported(mimeType);
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

var Storage = {};

if (typeof AudioContext !== 'undefined') {
    Storage.AudioContext = AudioContext;
} else if (typeof webkitAudioContext !== 'undefined') {
    Storage.AudioContext = webkitAudioContext;
}

MediaStream.prototype.stop = function() {
    this.getTracks().forEach(function(track) {
        track.stop();
    });
};

function getRandomString() {
    if (window.crypto && window.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
        var a = window.crypto.getRandomValues(new Uint32Array(3)),
            token = '';
        for (var i = 0, l = a.length; i < l; i++) {
            token += a[i].toString(36);
        }
        return token;
    } else {
        return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '');
    }
}

function getFileName(fileExtension) {
    var d = new Date();
    var year = d.getUTCFullYear() + '';
    var month = d.getUTCMonth() + '';
    var date = d.getUTCDate() + '';

    if(month.length === 1) {
        month = '0' + month;
    }

    if(date.length === 1) {
        date = '0' + date;
    }
    return year + month + date + getRandomString() + '.' + fileExtension;
}

function addStreamStopListener(stream, callback) {
    var streamEndedEvent = 'ended';
    if ('oninactive' in stream && !('onended' in stream)) {
        streamEndedEvent = 'inactive';
    }
    stream.addEventListener(streamEndedEvent, function() {
        callback();
        callback = function() {};
    });
    getTracks(stream, 'audio').forEach(function(track) {
        track.addEventListener(streamEndedEvent, function() {
            callback();
            callback = function() {};
        });
    });
    getTracks(stream, 'video').forEach(function(track) {
        track.addEventListener(streamEndedEvent, function() {
            callback();
            callback = function() {};
        });
    });
}

function getMixedAudioStream(arrayOfMediaStreams) {
    // via: @pehrsons
    if(typeof Storage === 'undefined') {
        window.Storage = {
            AudioContextConstructor: null,
            AudioContext: window.AudioContext || window.webkitAudioContext
        };
    }

    if (!Storage.AudioContextConstructor) {
        Storage.AudioContextConstructor = new Storage.AudioContext();
    }

    var context = Storage.AudioContextConstructor;

    var audioSources = [];

    var gainNode = context.createGain();
    gainNode.connect(context.destination);
    gainNode.gain.value = 0; // don't hear self

    var audioTracksLength = 0;
    arrayOfMediaStreams.forEach(function(stream) {
        if (!getTracks(stream, 'audio').length) {
            return;
        }

        audioTracksLength++;

        var audioSource = context.createMediaStreamSource(stream);
        audioSource.connect(gainNode);
        audioSources.push(audioSource);
    });

    if (!audioTracksLength) {
        return;
    }

    mediaStremDestination = context.createMediaStreamDestination();
    audioSources.forEach(function(audioSource) {
        audioSource.connect(mediaStremDestination);
    });

    return mediaStremDestination.stream;
}

function getTracks(stream, kind) {
    if (!stream || !stream.getTracks) {
        return [];
    }

    return stream.getTracks().filter(function(t) {
        return t.kind === (kind || 'audio');
    });
}

function getSeekableBlob(inputBlob, callback) {
    // EBML.js copyrights goes to: https://github.com/legokichi/ts-ebml
    if (typeof EBML === 'undefined') {
        throw new Error('Please link: https://cdn.webrtc-experiment.com/EBML.js');
    }

    var reader = new EBML.Reader();
    var decoder = new EBML.Decoder();
    var tools = EBML.tools;

    var fileReader = new FileReader();
    fileReader.onload = function(e) {
        var ebmlElms = decoder.decode(this.result);
        ebmlElms.forEach(function(element) {
            reader.read(element);
        });
        reader.stop();
        var refinedMetadataBuf = tools.makeMetadataSeekable(reader.metadatas, reader.duration, reader.cues);
        var body = this.result.slice(reader.metadataSize);
        var newBlob = new Blob([refinedMetadataBuf, body], {
            type: 'video/webm'
        });

        callback(newBlob);
    };
    fileReader.readAsArrayBuffer(inputBlob);
}
