// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.webrtc-experiment.com/licence
// Documentation - github.com/streamproc/MediaStreamRecorder

// ______________________
// MediaStreamRecorder.js

function MediaStreamRecorder(mediaStream) {
    if (!mediaStream) throw 'MediaStream is mandatory.';

    // void start(optional long timeSlice)
    // timestamp to fire "ondataavailable"
    this.start = function(timeSlice) {
        // Media Stream Recording API has not been implemented in chrome yet;
        // That's why using WebAudio API to record stereo audio in WAV format
        var Recorder = IsChrome ? window.StereoRecorder : window.MediaRecorderWrapper;

        // video recorder (in WebM format)
        if (this.mimeType.indexOf('video') != -1) {
            Recorder = IsChrome ? window.WhammyRecorder : window.MediaRecorderWrapper;
        }

        // video recorder (in GIF format)
        if (this.mimeType === 'image/gif') Recorder = window.GifRecorder;

        mediaRecorder = new Recorder(mediaStream);
        mediaRecorder.ondataavailable = this.ondataavailable;
        mediaRecorder.onstop = this.onstop;

        // Merge all data-types except "function"
        mediaRecorder = mergeProps(mediaRecorder, this);

        mediaRecorder.start(timeSlice);
    };

    this.stop = function() {
        if (mediaRecorder) mediaRecorder.stop();
    };

    this.ondataavailable = function(blob) {
        console.log('ondataavailable..', blob);
    };

    this.onstop = function(error) {
        console.warn('stopped..', error);
    };

    // Reference to "MediaRecorder.js"
    var mediaRecorder;
}

// below scripts are used to auto-load required files.

function loadScript(src, onload) {
    var root = window.MediaStreamRecorderScriptsDir;

    var script = document.createElement('script');
    script.src = root + src;
    script.onload = onload || function() {};
    document.documentElement.appendChild(script);
}

var scripts = document.getElementsByTagName('script');
var scriptTag = scripts[scripts.length - 1];

if (!scriptTag.getAttribute('data-manual')) {
    var dataScriptsDir = scriptTag.getAttribute('data-scripts-dir');
    if (dataScriptsDir) {
        var selfDir = dataScriptsDir.indexOf('//') != -1 ? '' : scriptTag.src.replace('//', '-----').split('/')[0].replace('-----', '//');
        window.MediaStreamRecorderScriptsDir = selfDir + dataScriptsDir;
    } else {
        window.MediaStreamRecorderScriptsDir = scriptTag.src.replace(scriptTag.src.split('/').pop(), '');
    }

    var requiredScripts = scriptTag.getAttribute('data-require');
    if (!requiredScripts) {
        // for old users
        requiredScripts = 'StereoRecorder,MediaRecorder,WhammyRecorder,GifRecorder';
    }

    // cross-browser getUserMedia/AudioContext declarations
    loadScript('common/Cross-Browser-Declarations.js');

    requiredScripts.trim().toLowerCase().split(',').forEach(function(script) {
        if (script == 'stereorecorder') {
            // stores AudioContext-level objects in memory for re-usability purposes
            loadScript('common/ObjectStore.js');

            // both these files are used to support audio recording in chrome
            loadScript('AudioStreamRecorder/StereoRecorder.js');
            loadScript('AudioStreamRecorder/StereoAudioRecorder.js');
        }

        if (script == 'mediarecorder') {
            // this one uses MediaRecorder draft for voice & video recording (works only in Firefox)
            loadScript('AudioStreamRecorder/MediaRecorder.js');
        }

        if (script == 'whammyrecorder') {
            // these files are supporting video-recording in chrome (webm)
            loadScript('VideoStreamRecorder/WhammyRecorder.js');
            loadScript('VideoStreamRecorder/WhammyRecorderHelper.js');
            loadScript('VideoStreamRecorder/lib/whammy.js');
        }

        if (script == 'gifrecorder') {
            // these files are used to support gif-recording in both chrome & firefox
            loadScript('VideoStreamRecorder/GifRecorder.js');
            loadScript('VideoStreamRecorder/lib/gif-encoder.js');
        }
    });
}
