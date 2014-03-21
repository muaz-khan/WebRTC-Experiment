// Last time updated at 21 March 2014, 16:32:23

// Muaz Khan         - www.MuazKhan.com
// MIT License       - www.WebRTC-Experiment.com/licence
// Documentation     - github.com/muaz-khan/WebRTC-Experiment/tree/master/RecordRTC

// Note: RecordRTC.js is using 3 other libraries; you need to accept their licences as well.

// ____________
// RecordRTC.js

// recordRTC.setAdvertisementArray( [ 'data:image-webp', 'data:image-webp', 'data:image-webp' ] );

function RecordRTC(mediaStream, config) {
    config = config || { };

    if (!mediaStream) throw 'MediaStream is mandatory.';
    if (!config.type) config.type = 'audio';

    function startRecording() {
        console.debug('started recording ' + (IsChrome ? config.type : 'audio+video') + ' stream.');

        // Media Stream Recording API has not been implemented in chrome yet;
        // That's why using WebAudio API to record stereo audio in WAV format
        var Recorder = IsChrome ? window.StereoRecorder : window.MediaStreamRecorder;

        // video recorder (in WebM format)
        if (config.type == 'video') Recorder = window.WhammyRecorder;

        // video recorder (in Gif format)
        if (config.type == 'gif') Recorder = window.GifRecorder;

        // html2canvas recording!
        if (config.type == 'canvas') Recorder = window.CanvasRecorder;

        mediaRecorder = new Recorder(mediaStream);

        // Merge all data-types except "function"
        mediaRecorder = mergeProps(mediaRecorder, config);

        mediaRecorder.record();

        return this;
    }

    function stopRecording(callback) {
        if (!mediaRecorder) return console.warn(WARNING);

        console.warn('stopped recording ' + (IsChrome ? config.type : 'audio+video') + ' stream.');

        if ((config.type == 'audio' && !IsChrome) || (config.type == 'video' && IsChrome)) {
            mediaRecorder.stop(_callback);
        } else {
            mediaRecorder.stop();
            _callback();
        }

        function _callback() {
            if (callback && mediaRecorder) {
                var url = URL.createObjectURL(mediaRecorder.recordedBlob);
                callback(url);
            }

            if (config.autoWriteToDisk) {
                getDataURL(function(dataURL) {
                    var parameter = { };
                    parameter[config.type + 'Blob'] = dataURL;
                    DiskStorage.Store(parameter);
                });
            }
        }
    }

    function getDataURL(callback, _mediaRecorder) {
        if (!callback) throw 'Pass a callback function over getDataURL.';

        var reader = new FileReader();
        reader.readAsDataURL(_mediaRecorder ? _mediaRecorder.recordedBlob : mediaRecorder.recordedBlob);
        reader.onload = function(event) {
            callback(event.target.result);
        };
    }

    var WARNING = 'It seems that "startRecording" is not invoked for ' + config.type + ' recorder.';

    var mediaRecorder;

    return {
        startRecording: startRecording,
        stopRecording: stopRecording,
        getBlob: function() {
            if (!mediaRecorder) return console.warn(WARNING);
            return mediaRecorder.recordedBlob;
        },
        getDataURL: getDataURL,
        toURL: function() {
            if (!mediaRecorder) return console.warn(WARNING);
            return URL.createObjectURL(mediaRecorder.recordedBlob);
        },
        save: function() {
            if (!mediaRecorder) return console.warn(WARNING);
            console.log('saving recorded ' + config.type + ' stream to disk!');

            // bug: should we use "getBlob" instead; to handle aww-snaps!
            this.getDataURL(function(dataURL) {
                var hyperlink = document.createElement('a');
                hyperlink.href = dataURL;
                hyperlink.target = '_blank';
                hyperlink.download = (Math.round(Math.random() * 9999999999) + 888888888) + '.' + mediaRecorder.recordedBlob.type.split('/')[1];

                var evt = new MouseEvent('click', {
                    view: window,
                    bubbles: true,
                    cancelable: true
                });

                hyperlink.dispatchEvent(evt);

                (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
            });
        },
        getFromDisk: function(callback) {
            if (!mediaRecorder) return console.warn(WARNING);
            RecordRTC.getFromDisk(config.type, callback);
        },
        setAdvertisementArray: function(arrayOfWebPImages) {
            this.advertisement = [];

            var length = arrayOfWebPImages.length;
            for (var i = 0; i < length; i++) {
                this.advertisement.push({
                    duration: i,
                    image: arrayOfWebPImages[i]
                });
            }
        }
    };
}

RecordRTC.getFromDisk = function(type, callback) {
    if (!callback) throw 'callback is mandatory.';

    console.log('Getting recorded ' + (type == 'all' ? 'blobs' : type + ' blob ') + ' from disk!');
    DiskStorage.Fetch(function(dataURL, _type) {
        if (type != 'all' && _type == type + 'Blob') {
            if (callback) callback(dataURL);
        }

        if (type == 'all') {
            if (callback) callback(dataURL, _type.replace('Blob', ''));
        }
    });
};

RecordRTC.writeToDisk = function(options) {
    console.log('Writing recorded blob(s) to disk!');
    options = options || { };
    if (options.audio && options.video && options.gif) {
        options.audio.getDataURL(function(audioDataURL) {
            options.video.getDataURL(function(videoDataURL) {
                options.gif.getDataURL(function(gifDataURL) {
                    DiskStorage.Store({
                        audioBlob: audioDataURL,
                        videoBlob: videoDataURL,
                        gifBlob: gifDataURL
                    });
                });
            });
        });
    } else if (options.audio && options.video) {
        options.audio.getDataURL(function(audioDataURL) {
            options.video.getDataURL(function(videoDataURL) {
                DiskStorage.Store({
                    audioBlob: audioDataURL,
                    videoBlob: videoDataURL
                });
            });
        });
    } else if (options.audio && options.gif) {
        options.audio.getDataURL(function(audioDataURL) {
            options.gif.getDataURL(function(gifDataURL) {
                DiskStorage.Store({
                    audioBlob: audioDataURL,
                    gifBlob: gifDataURL
                });
            });
        });
    } else if (options.video && options.gif) {
        options.video.getDataURL(function(videoDataURL) {
            options.gif.getDataURL(function(gifDataURL) {
                DiskStorage.Store({
                    videoBlob: videoDataURL,
                    gifBlob: gifDataURL
                });
            });
        });
    } else if (options.audio) {
        options.audio.getDataURL(function(audioDataURL) {
            DiskStorage.Store({
                audioBlob: audioDataURL
            });
        });
    } else if (options.video) {
        options.video.getDataURL(function(videoDataURL) {
            DiskStorage.Store({
                videoBlob: videoDataURL
            });
        });
    } else if (options.gif) {
        options.gif.getDataURL(function(gifDataURL) {
            DiskStorage.Store({
                gifBlob: gifDataURL
            });
        });
    }
};
