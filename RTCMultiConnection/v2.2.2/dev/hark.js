// original source code is taken from:
// github.com/SimpleWebRTC/hark
// copyright goes to &yet team
// edited by Muaz Khan for RTCMultiConnection.js

function hark(stream, options) {
    var audioContextType = window.webkitAudioContext || window.AudioContext;

    var harker = this;

    // make it not break in non-supported browsers
    if (!audioContextType) return harker;

    options = options || {};
    // Config
    var smoothing = (options.smoothing || 0.1),
        interval = (options.interval || 300),
        threshold = options.threshold,
        play = options.play,
        history = options.history || 10,
        running = true;

    // Setup Audio Context
    if (!window.audioContext00) {
        window.audioContext00 = new audioContextType();
    }

    var gainNode = audioContext00.createGain();
    gainNode.connect(audioContext00.destination);
    // don't play for self
    gainNode.gain.value = 0;

    var sourceNode, fftBins, analyser;

    analyser = audioContext00.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = smoothing;
    fftBins = new Float32Array(analyser.fftSize);

    //WebRTC Stream
    sourceNode = audioContext00.createMediaStreamSource(stream);
    threshold = threshold || -50;

    sourceNode.connect(analyser);
    if (play) analyser.connect(audioContext00.destination);

    harker.speaking = false;

    harker.setThreshold = function(t) {
        threshold = t;
    };

    harker.setInterval = function(i) {
        interval = i;
    };

    harker.stop = function() {
        running = false;
        options.onvolumechange(-100, threshold);
        if (harker.speaking) {
            harker.speaking = false;
            options.onsilence();
        }
    };

    stream.pause = function() {
        running = false;
        options.onsilence();
    };

    stream.resume = function() {
        if (running) return;

        running = true;
        looper();
    };

    harker.speakingHistory = [];
    for (var i = 0; i < history; i++) {
        harker.speakingHistory.push(0);
    }

    // Poll the analyser node to determine if speaking
    var looper = function() {
        setTimeout(function() {

            //check if stop has been called
            if (!running) {
                return;
            }

            var currentVolume = getMaxVolume(analyser, fftBins);

            options.onvolumechange(currentVolume, threshold);

            var history = 0;
            if (currentVolume > threshold && !harker.speaking) {
                // trigger quickly, short history
                for (var i = harker.speakingHistory.length - 3; i < harker.speakingHistory.length; i++) {
                    history += harker.speakingHistory[i];
                }
                if (history >= 2) {
                    harker.speaking = true;
                    options.onspeaking();
                }
            } else if (currentVolume < threshold && harker.speaking) {
                for (var j = 0; j < harker.speakingHistory.length; j++) {
                    history += harker.speakingHistory[j];
                }
                if (history === 0) {
                    harker.speaking = false;
                    options.onsilence();
                }
            }
            harker.speakingHistory.shift();
            harker.speakingHistory.push(0 + (currentVolume > threshold));

            looper();
        }, interval);
    };
    looper();

    function getMaxVolume(analyser, fftBins) {
        var maxVolume = -Infinity;
        analyser.getFloatFrequencyData(fftBins);

        for (var i = 4, ii = fftBins.length; i < ii; i++) {
            if (fftBins[i] > maxVolume && fftBins[i] < 0) {
                maxVolume = fftBins[i];
            }
        }

        return maxVolume;
    }

    return harker;
}
