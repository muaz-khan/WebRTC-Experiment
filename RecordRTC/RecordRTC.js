// Last time updated at March 13, 2015, 08:32:23

// links:
// Open-Sourced: https://github.com/muaz-khan/RecordRTC
// http://cdn.WebRTC-Experiment.com/RecordRTC.js
// http://www.WebRTC-Experiment.com/RecordRTC.js (for China users)
// http://RecordRTC.org/latest.js (for China users)
// npm install recordrtc
// http://recordrtc.org/

// updates?
/*
-. Fixed echo.
-. CanvasRecorder fixed.
-. You can pass "recorderType" - RecordRTC(stream, { recorderType: window.WhammyRecorder });
-. If MediaStream is suddenly stopped in Firefox.
-. Added "disableLogs"         - RecordRTC(stream, { disableLogs: true });
-. You can pass "bufferSize:0" - RecordRTC(stream, { bufferSize: 0 });
-. You can set "leftChannel"   - RecordRTC(stream, { leftChannel: true });
-. Fixed MRecordRTC.
-. Added functionality for analyse black frames and cut them - pull#293
-. if you're recording GIF, you must link: https://cdn.webrtc-experiment.com/gif-recorder.js
*/

//------------------------------------

// Browsers Support::
// Chrome (all versions) [ audio/video separately ]
// Firefox ( >= 29 ) [ audio/video in single webm/mp4 container or only audio in ogg ]
// Opera (all versions) [ same as chrome ]
// Android (Chrome) [ only video ]
// Android (Opera) [ only video ]
// Android (Firefox) [ only video ]

//------------------------------------
// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
//------------------------------------
// Note: RecordRTC.js is using 3 other libraries; you need to accept their licences as well.
//------------------------------------
// 1. RecordRTC.js
// 2. MRecordRTC.js
// 3. Cross-Browser-Declarations.js
// 4. Storage.js
// 5. MediaStreamRecorder.js
// 6. StereoRecorder.js
// 7. StereoAudioRecorder.js
// 8. CanvasRecorder.js
// 9. WhammyRecorder.js
// 10. Whammy.js
// 11. DiskStorage.js
// 12. GifRecorder.js
//------------------------------------

'use strict';
// ____________
// RecordRTC.js

/**
 * {@link https://github.com/muaz-khan/RecordRTC|RecordRTC} is a JavaScript-based media-recording library for modern web-browsers (supporting WebRTC getUserMedia API). It is optimized for different devices and browsers to bring all client-side (pluginfree) recording solutions in single place.
 * @summary JavaScript audio/video recording library runs top over WebRTC getUserMedia API.
 * @license {@link https://www.webrtc-experiment.com/licence/|MIT}
 * @author {@link https://www.MuazKhan.com|Muaz Khan}
 * @typedef RecordRTC
 * @class
 * @example
 * var recordRTC = RecordRTC(mediaStream, {
 *     type: 'video' // audio or video or gif or canvas
 * });
 *
 * // or, you can even use keyword "new"
 * var recordRTC = new RecordRTC(mediaStream[, config]);
 * @see For further information:
 * @see {@link https://github.com/muaz-khan/RecordRTC|RecordRTC Source Code}
 */

function RecordRTC(mediaStream, config) {
    config = config || {};

    if (!mediaStream) {
        throw 'MediaStream is mandatory.';
    }

    if (!config.type) {
        config.type = 'audio';
    }

    var self = this;

    function startRecording() {
        if (!config.disableLogs) {
            console.debug('started recording ' + config.type + ' stream.');
        }

        // Media Stream Recording API has not been implemented in chrome yet;
        // That's why using WebAudio API to record stereo audio in WAV format
        var Recorder = isChrome ? window.StereoRecorder : window.MediaStreamRecorder;

        // video recorder (in WebM format)
        if (config.type === 'video' && isChrome) {
            Recorder = window.WhammyRecorder;
        }

        // video recorder (in Gif format)
        if (config.type === 'gif') {
            Recorder = window.GifRecorder;
        }

        // html2canvas recording!
        if (config.type === 'canvas') {
            Recorder = window.CanvasRecorder;
        }

        if (config.recorderType) {
            Recorder = config.recorderType;
        }

        mediaRecorder = new Recorder(mediaStream);

        // Merge all data-types except "function"
        mediaRecorder = mergeProps(mediaRecorder, config);

        mediaRecorder.onAudioProcessStarted = function() {
            if (config.onAudioProcessStarted) {
                config.onAudioProcessStarted();
            }
        };

        mediaRecorder.onGifPreview = function(gif) {
            if (config.onGifPreview) {
                config.onGifPreview(gif);
            }
        };

        mediaRecorder.record();

        return self;
    }

    function stopRecording(callback) {
        if (!mediaRecorder) {
            return console.warn(WARNING);
        }

        /*jshint validthis:true */
        var recordRTC = this;

        if (!config.disableLogs) {
            console.warn('Stopped recording ' + config.type + ' stream.');
        }

        if (config.type !== 'gif') {
            mediaRecorder.stop(_callback);
        } else {
            mediaRecorder.stop();
            _callback();
        }

        function _callback() {
            for (var item in mediaRecorder) {
                if (self) {
                    self[item] = mediaRecorder[item];
                }

                if (recordRTC) {
                    recordRTC[item] = mediaRecorder[item];
                }
            }

            var blob = mediaRecorder.blob;
            if (callback) {
                var url = URL.createObjectURL(blob);
                callback(url);
            }

            if (blob && !config.disableLogs) {
                console.debug(blob.type, '->', bytesToSize(blob.size));
            }

            if (!config.autoWriteToDisk) {
                return;
            }

            getDataURL(function(dataURL) {
                var parameter = {};
                parameter[config.type + 'Blob'] = dataURL;
                DiskStorage.Store(parameter);
            });
        }
    }

    function pauseRecording() {
        if (!mediaRecorder) {
            return console.warn(WARNING);
        }

        // not all libs yet having  this method
        if (mediaRecorder.pause) {
            mediaRecorder.pause();
        } else if (!config.disableLogs) {
            console.warn('This recording library is having no "pause" method.');
        }
    }

    function resumeRecording() {
        if (!mediaRecorder) {
            return console.warn(WARNING);
        }

        // not all libs yet having  this method
        if (mediaRecorder.resume) {
            mediaRecorder.resume();
        } else if (!config.disableLogs) {
            console.warn('This recording library is having no "resume" method.');
        }
    }

    function getDataURL(callback, _mediaRecorder) {
        if (!callback) {
            throw 'Pass a callback function over getDataURL.';
        }

        var blob = _mediaRecorder ? _mediaRecorder.blob : mediaRecorder.blob;

        if (!blob) {
            if (!config.disableLogs) {
                console.warn('Blob encoder did not yet finished its job.');
            }

            setTimeout(function() {
                getDataURL(callback, _mediaRecorder);
            }, 1000);
            return;
        }

        if (!!window.Worker) {
            var webWorker = processInWebWorker(function readFile(_blob) {
                postMessage(new FileReaderSync().readAsDataURL(_blob));
            });

            webWorker.onmessage = function(event) {
                callback(event.data);
            };

            webWorker.postMessage(blob);
        } else {
            var reader = new FileReader();
            reader.readAsDataURL(blob);
            reader.onload = function(event) {
                callback(event.target.result);
            };
        }

        function processInWebWorker(_function) {
            var blob = URL.createObjectURL(new Blob([_function.toString(),
                'this.onmessage =  function (e) {readFile(e.data);}'
            ], {
                type: 'application/javascript'
            }));

            var worker = new Worker(blob);
            URL.revokeObjectURL(blob);
            return worker;
        }
    }

    var WARNING = 'It seems that "startRecording" is not invoked for ' + config.type + ' recorder.';

    var mediaRecorder;

    var returnObject = {
        /**
         * This method starts recording. It doesn't take any argument.
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.startRecording();
         */
        startRecording: startRecording,

        /**
         * This method stops recording. It takes single "callback" argument. It is suggested to get blob or URI in the callback to make sure all encoders finished their jobs.
         * @param {function} callback - This callback function is invoked after completion of all encoding jobs.
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function(videoURL) {
         *     video.src = videoURL;
         *     recordRTC.blob; recordRTC.buffer;
         * });
         */
        stopRecording: stopRecording,

        /**
         * This method pauses the recording process.
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.pauseRecording();
         */
        pauseRecording: pauseRecording,

        /**
         * This method resumes the recording process.
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.resumeRecording();
         */
        resumeRecording: resumeRecording,

        /**
         * It is equivalent to <code class="str">"recordRTC.blob"</code> property.
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function() {
         *     var blob = recordRTC.getBlob();
         *
         *     // equivalent to: recordRTC.blob property
         *     var blob = recordRTC.blob;
         * });
         */
        getBlob: function() {
            if (!mediaRecorder) {
                return console.warn(WARNING);
            }

            return mediaRecorder.blob;
        },

        /**
         * This method returns DataURL. It takes single "callback" argument.
         * @param {function} callback - DataURL is passed back over this callback.
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function() {
         *     recordRTC.getDataURL(function(dataURL) {
         *         video.src = dataURL;
         *     });
         * });
         */
        getDataURL: getDataURL,

        /**
         * This method returns Virutal/Blob URL. It doesn't take any argument.
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function() {
         *     video.src = recordRTC.toURL();
         * });
         */
        toURL: function() {
            if (!mediaRecorder) {
                return console.warn(WARNING);
            }

            return URL.createObjectURL(mediaRecorder.blob);
        },

        /**
         * This method saves blob/file into disk (by inovking save-as dialog). It takes single (optional) argument i.e. FileName
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function() {
         *     recordRTC.save('file-name');
         * });
         */
        save: function(fileName) {
            if (!mediaRecorder) {
                var that = this;
                setTimeout(function() {
                    that.save(fileName);
                }, 2000);
                return console.warn(WARNING);
            }

            var hyperlink = document.createElement('a');
            hyperlink.href = URL.createObjectURL(mediaRecorder.blob);
            hyperlink.target = '_blank';
            hyperlink.download = (fileName || (Math.round(Math.random() * 9999999999) + 888888888)) + '.' + mediaRecorder.blob.type.split('/')[1];

            var evt = new MouseEvent('click', {
                view: window,
                bubbles: true,
                cancelable: true
            });

            hyperlink.dispatchEvent(evt);

            (window.URL || window.webkitURL).revokeObjectURL(hyperlink.href);
        },

        /**
         * This method gets blob from indexed-DB storage. It takes single "callback" argument.
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.getFromDisk(function(dataURL) {
         *     video.src = dataURL;
         * });
         */
        getFromDisk: function(callback) {
            if (!mediaRecorder) {
                return console.warn(WARNING);
            }

            RecordRTC.getFromDisk(config.type, callback);
        },

        /**
         * This method appends prepends array of webp images to the recorded video-blob. It takes an "array" object.
         * @type {Array.<Array>}
         * @param {Array} arrayOfWebPImages - Array of webp images.
         * @method
         * @memberof RecordRTC
         * @instance
         * @example
         * var arrayOfWebPImages = [];
         * arrayOfWebPImages.push({
         *     duration: index,
         *     image: 'data:image/webp;base64,...'
         * });
         * recordRTC.setAdvertisementArray(arrayOfWebPImages);
         */
        setAdvertisementArray: function(arrayOfWebPImages) {
            this.advertisement = [];

            var length = arrayOfWebPImages.length;
            for (var i = 0; i < length; i++) {
                this.advertisement.push({
                    duration: i,
                    image: arrayOfWebPImages[i]
                });
            }
        },

        /**
         * It is equivalent to <code class="str">"recordRTC.getBlob()"</code> method.
         * @property {Blob} blob - Recorded Blob can be accessed using this property.
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function() {
         *     var blob = recordRTC.blob;
         *
         *     // equivalent to: recordRTC.getBlob() method
         *     var blob = recordRTC.getBlob();
         * });
         */
        blob: null,

        /**
         * @todo Add descriptions.
         * @property {number} bufferSize - Either audio device's default buffer-size, or your custom value.
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function() {
         *     var bufferSize = recordRTC.bufferSize;
         * });
         */
        bufferSize: 0,

        /**
         * @todo Add descriptions.
         * @property {number} sampleRate - Audio device's default sample rates.
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function() {
         *     var sampleRate = recordRTC.sampleRate;
         * });
         */
        sampleRate: 0,

        /**
         * @todo Add descriptions.
         * @property {ArrayBuffer} buffer - Audio ArrayBuffer, supported only in Chrome.
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function() {
         *     var buffer = recordRTC.buffer;
         * });
         */
        buffer: null,

        /**
         * @todo Add descriptions.
         * @property {DataView} view - Audio DataView, supported only in Chrome.
         * @memberof RecordRTC
         * @instance
         * @example
         * recordRTC.stopRecording(function() {
         *     var dataView = recordRTC.view;
         * });
         */
        view: null
    };

    if (!this) {
        return returnObject;
    }

    // if someone wanna use RecordRTC with "new" keyword.
    for (var prop in returnObject) {
        this[prop] = returnObject[prop];
    }

    return returnObject;
}

/**
 * This method can be used to get all recorded blobs from IndexedDB storage.
 * @param {string} type - 'all' or 'audio' or 'video' or 'gif'
 * @param {function} callback - Callback function to get all stored blobs.
 * @method
 * @memberof RecordRTC
 * @example
 * RecordRTC.getFromDisk('all', function(dataURL, type){
 *     if(type === 'audio') { }
 *     if(type === 'video') { }
 *     if(type === 'gif')   { }
 * });
 */
RecordRTC.getFromDisk = function(type, callback) {
    if (!callback) {
        throw 'callback is mandatory.';
    }

    console.log('Getting recorded ' + (type === 'all' ? 'blobs' : type + ' blob ') + ' from disk!');
    DiskStorage.Fetch(function(dataURL, _type) {
        if (type !== 'all' && _type === type + 'Blob' && callback) {
            callback(dataURL);
        }

        if (type === 'all' && callback) {
            callback(dataURL, _type.replace('Blob', ''));
        }
    });
};

/**
 * This method can be used to store recorded blobs into IndexedDB storage.
 * @param {object} options - {audio: Blob, video: Blob, gif: Blob}
 * @method
 * @memberof RecordRTC
 * @example
 * RecordRTC.writeToDisk({
 *     audio: audioBlob,
 *     video: videoBlob,
 *     gif  : gifBlob
 * });
 */
RecordRTC.writeToDisk = function(options) {
    console.log('Writing recorded blob(s) to disk!');
    options = options || {};
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
// _____________
// MRecordRTC.js

/**
 * MRecordRTC runs top over {@link RecordRTC} to bring multiple recordings in single place, by providing simple API.
 * @summary MRecordRTC stands for "Multiple-RecordRTC".
 * @license {@link https://www.webrtc-experiment.com/licence/|MIT}
 * @author {@link https://www.MuazKhan.com|Muaz Khan}
 * @typedef MRecordRTC
 * @class
 * @example
 * var recorder = new MRecordRTC();
 * recorder.addStream(MediaStream);
 * recorder.mediaType = {
 *     audio: true,
 *     video: true,
 *     gif: true
 * };
 * recorder.startRecording();
 * @see For further information:
 * @see {@link https://github.com/muaz-khan/RecordRTC/tree/master/MRecordRTC|MRecordRTC Source Code}
 */

function MRecordRTC(mediaStream) {

    /**
     * This method attaches MediaStream object to {@link MRecordRTC}.
     * @param {MediaStream} mediaStream - A MediaStream object, either fetched using getUserMedia API, or generated using captureStreamUntilEnded or WebAudio API.
     * @method
     * @memberof MRecordRTC
     * @example
     * recorder.addStream(MediaStream);
     */
    this.addStream = function(_mediaStream) {
        if (_mediaStream) {
            mediaStream = _mediaStream;
        }
    };

    /**
     * This property can be used to set recording type e.g. audio, or video, or gif, or canvas.
     * @property {object} mediaType - {audio: true, video: true, gif: true}
     * @memberof MRecordRTC
     * @example
     * var recorder = new MRecordRTC();
     * recorder.mediaType = {
     *     audio: true,
     *     video: true,
     *     gif  : true
     * };
     */
    this.mediaType = {
        audio: true,
        video: true
    };

    /**
     * This method starts recording.
     * @method
     * @memberof MRecordRTC
     * @example
     * recorder.startRecording();
     */
    this.startRecording = function() {
        if (!isChrome && mediaStream && mediaStream.getAudioTracks && mediaStream.getAudioTracks().length && mediaStream.getVideoTracks().length) {
            // Firefox is supporting both audio/video in single blob
            this.mediaType.audio = false;
        }

        if (this.mediaType.audio) {
            this.audioRecorder = new RecordRTC(mediaStream, {
                type: 'audio',
                bufferSize: this.bufferSize,
                sampleRate: this.sampleRate
            });
            this.audioRecorder.startRecording();
        }

        if (this.mediaType.video) {
            this.videoRecorder = new RecordRTC(mediaStream, {
                type: 'video',
                video: this.video,
                canvas: this.canvas
            });
            this.videoRecorder.startRecording();
        }

        if (this.mediaType.gif) {
            this.gifRecorder = new RecordRTC(mediaStream, {
                type: 'gif',
                frameRate: this.frameRate || 200,
                quality: this.quality || 10
            });
            this.gifRecorder.startRecording();
        }
    };

    /**
     * This method stop recording.
     * @param {function} callback - Callback function is invoked when all encoders finish their jobs.
     * @method
     * @memberof MRecordRTC
     * @example
     * recorder.stopRecording(function(recording){
     *     var audioBlob = recording.audio;
     *     var videoBlob = recording.video;
     *     var gifBlob   = recording.gif;
     * });
     */
    this.stopRecording = function(callback) {
        callback = callback || function() {};

        if (this.audioRecorder) {
            this.audioRecorder.stopRecording(function(blobURL) {
                callback(blobURL, 'audio');
            });
        }

        if (this.videoRecorder) {
            this.videoRecorder.stopRecording(function(blobURL) {
                callback(blobURL, 'video');
            });
        }

        if (this.gifRecorder) {
            this.gifRecorder.stopRecording(function(blobURL) {
                callback(blobURL, 'gif');
            });
        }
    };

    /**
     * This method can be used to manually get all recorded blobs.
     * @param {function} callback - All recorded blobs are passed back to "callback" function.
     * @method
     * @memberof MRecordRTC
     * @example
     * recorder.getBlob(function(recording){
     *     var audioBlob = recording.audio;
     *     var videoBlob = recording.video;
     *     var gifBlob   = recording.gif;
     * });
     */
    this.getBlob = function(callback) {
        var output = {};

        if (this.audioRecorder) {
            output.audio = this.audioRecorder.getBlob();
        }

        if (this.videoRecorder) {
            output.video = this.videoRecorder.getBlob();
        }

        if (this.gifRecorder) {
            output.gif = this.gifRecorder.getBlob();
        }

        if (callback) {
            callback(output);
        }
    };

    /**
     * This method can be used to manually get all recorded blobs' DataURLs.
     * @param {function} callback - All recorded blobs' DataURLs are passed back to "callback" function.
     * @method
     * @memberof MRecordRTC
     * @example
     * recorder.getDataURL(function(recording){
     *     var audioDataURL = recording.audio;
     *     var videoDataURL = recording.video;
     *     var gifDataURL   = recording.gif;
     * });
     */
    this.getDataURL = function(callback) {
        this.getBlob(function(blob) {
            getDataURL(blob.audio, function(_audioDataURL) {
                getDataURL(blob.video, function(_videoDataURL) {
                    callback({
                        audio: _audioDataURL,
                        video: _videoDataURL
                    });
                });
            });
        });

        function getDataURL(blob, callback00) {
            if (!!window.Worker) {
                var webWorker = processInWebWorker(function readFile(_blob) {
                    postMessage(new FileReaderSync().readAsDataURL(_blob));
                });

                webWorker.onmessage = function(event) {
                    callback00(event.data);
                };

                webWorker.postMessage(blob);
            } else {
                var reader = new FileReader();
                reader.readAsDataURL(blob);
                reader.onload = function(event) {
                    callback00(event.target.result);
                };
            }
        }

        function processInWebWorker(_function) {
            var blob = URL.createObjectURL(new Blob([_function.toString(),
                'this.onmessage =  function (e) {readFile(e.data);}'
            ], {
                type: 'application/javascript'
            }));

            var worker = new Worker(blob);
            URL.revokeObjectURL(blob);
            return worker;
        }
    };

    /**
     * This method can be used to ask {@link MRecordRTC} to write all recorded blobs into IndexedDB storage.
     * @method
     * @memberof MRecordRTC
     * @example
     * recorder.writeToDisk();
     */
    this.writeToDisk = function() {
        RecordRTC.writeToDisk({
            audio: this.audioRecorder,
            video: this.videoRecorder,
            gif: this.gifRecorder
        });
    };

    /**
     * This method can be used to invoke save-as dialog for all recorded blobs.
     * @param {object} args - {audio: 'audio-name', video: 'video-name', gif: 'gif-name'}
     * @method
     * @memberof MRecordRTC
     * @example
     * recorder.save({
     *     audio: 'audio-file-name',
     *     video: 'video-file-name',
     *     gif  : 'gif-file-name'
     * });
     */
    this.save = function(args) {
        args = args || {
            audio: true,
            video: true,
            gif: true
        };

        if (!!args.audio && this.audioRecorder) {
            this.audioRecorder.save(typeof args.audio === 'string' ? args.audio : '');
        }

        if (!!args.video && this.videoRecorder) {
            this.videoRecorder.save(typeof args.video === 'string' ? args.video : '');
        }
        if (!!args.gif && this.gifRecorder) {
            this.gifRecorder.save(typeof args.gif === 'string' ? args.gif : '');
        }
    };
}

/**
 * This method can be used to get all recorded blobs from IndexedDB storage.
 * @param {string} type - 'all' or 'audio' or 'video' or 'gif'
 * @param {function} callback - Callback function to get all stored blobs.
 * @method
 * @memberof MRecordRTC
 * @example
 * MRecordRTC.getFromDisk('all', function(dataURL, type){
 *     if(type === 'audio') { }
 *     if(type === 'video') { }
 *     if(type === 'gif')   { }
 * });
 */
MRecordRTC.getFromDisk = RecordRTC.getFromDisk;

/**
 * This method can be used to store recorded blobs into IndexedDB storage.
 * @param {object} options - {audio: Blob, video: Blob, gif: Blob}
 * @method
 * @memberof MRecordRTC
 * @example
 * MRecordRTC.writeToDisk({
 *     audio: audioBlob,
 *     video: videoBlob,
 *     gif  : gifBlob
 * });
 */
MRecordRTC.writeToDisk = RecordRTC.writeToDisk;
// _____________________________
// Cross-Browser-Declarations.js

// animation-frame used in WebM recording
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;
}

if (!window.cancelAnimationFrame) {
    window.cancelAnimationFrame = window.webkitCancelAnimationFrame || window.mozCancelAnimationFrame;
}

// WebAudio API representer
if (!window.AudioContext) {
    window.AudioContext = window.webkitAudioContext || window.mozAudioContext;
}

window.URL = window.URL || window.webkitURL;
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

if (window.webkitMediaStream) {
    window.MediaStream = window.webkitMediaStream;
}

var isChrome = !!navigator.webkitGetUserMedia;

// Merge all other data-types except "function"

/**
 * @param {object} mergein - Merge another object in this object.
 * @param {object} mergeto - Merge this object in another object.
 * @returns {object} - merged object
 * @example
 * var mergedObject = mergeProps({}, {
 *     x: 10, // this will be merged
 *     y: 10, // this will be merged
 *     add: function() {} // this will be skipped
 * });
 */
function mergeProps(mergein, mergeto) {
    mergeto = reformatProps(mergeto);
    for (var t in mergeto) {
        if (typeof mergeto[t] !== 'function') {
            mergein[t] = mergeto[t];
        }
    }
    return mergein;
}

/**
 * @param {object} obj - If a property name is "sample-rate"; it will be converted into "sampleRate".
 * @returns {object} - formatted object.
 * @example
 * var mergedObject = reformatProps({
 *     'sample-rate': 44100,
 *     'buffer-size': 4096
 * });
 *
 * mergedObject.sampleRate === 44100
 * mergedObject.bufferSize === 4096
 */
function reformatProps(obj) {
    var output = {};
    for (var o in obj) {
        if (o.indexOf('-') !== -1) {
            var splitted = o.split('-');
            var name = splitted[0] + splitted[1].split('')[0].toUpperCase() + splitted[1].substr(1);
            output[name] = obj[o];
        } else {
            output[o] = obj[o];
        }
    }
    return output;
}

if (location.href.indexOf('file:') === 0) {
    console.error('Please load this HTML file on HTTP or HTTPS.');
}

// below function via: http://goo.gl/B3ae8c
/**
 * @param {number} bytes - Pass bytes and get formafted string.
 * @returns {string} - formafted string
 * @example
 * bytesToSize(1024*1024*5) === '5 GB'
 */
function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
        return '0 Bytes';
    }
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];
}
// __________ (used to handle stuff like http://goo.gl/xmE5eg) issue #129
// Storage.js

/**
 * Storage is a standalone object used by {@link RecordRTC} to store reusable objects e.g. "new AudioContext".
 * @example
 * Storage.AudioContext === webkitAudioContext
 * @property {webkitAudioContext} AudioContext - Keeps a reference to AudioContext object.
 */

var Storage = {
    AudioContext: window.AudioContext || window.webkitAudioContext
};
// ______________________
// MediaStreamRecorder.js

// todo: need to show alert boxes for incompatible cases
// encoder only supports 48k/16k mono audio channel

/*
 * Implementation of https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html
 * The MediaRecorder accepts a mediaStream as input source passed from UA. When recorder starts,
 * a MediaEncoder will be created and accept the mediaStream as input source.
 * Encoder will get the raw data by track data changes, encode it by selected MIME Type, then store the encoded in EncodedBufferCache object.
 * The encoded data will be extracted on every timeslice passed from Start function call or by RequestData function.
 * Thread model:
 * When the recorder starts, it creates a "Media Encoder" thread to read data from MediaEncoder object and store buffer in EncodedBufferCache object.
 * Also extract the encoded data and create blobs on every timeslice passed from start function or RequestData function called by UA.
 */

/**
 * MediaStreamRecorder is an abstraction layer for "MediaRecorder API". It is used by {@link RecordRTC} to record MediaStream(s) in Firefox.
 * @summary Runs top over MediaRecorder API.
 * @typedef MediaStreamRecorder
 * @class
 * @example
 * var recorder = new MediaStreamRecorder(MediaStream);
 * recorder.mimeType = 'video/webm'; // audio/ogg or video/webm
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 *
 *     // or
 *     var blob = recorder.blob;
 * });
 * @param {MediaStream} mediaStream - MediaStream object fetched using getUserMedia API or generated using captureStreamUntilEnded or WebAudio API.
 */

function MediaStreamRecorder(mediaStream) {
    var self = this;

    // if user chosen only audio option; and he tried to pass MediaStream with
    // both audio and video tracks;
    // using a dirty workaround to generate audio-only stream so that we can get audio/ogg output.
    if (self.mimeType && self.mimeType !== 'video/webm' && mediaStream.getVideoTracks && mediaStream.getVideoTracks().length) {
        var context = new AudioContext();
        var mediaStreamSource = context.createMediaStreamSource(mediaStream);

        var destination = context.createMediaStreamDestination();
        mediaStreamSource.connect(destination);

        mediaStream = destination.stream;
    }

    var dataAvailable = false;

    /**
     * This method records MediaStream.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        // http://dxr.mozilla.org/mozilla-central/source/content/media/MediaRecorder.cpp
        // https://wiki.mozilla.org/Gecko:MediaRecorder
        // https://dvcs.w3.org/hg/dap/raw-file/default/media-stream-capture/MediaRecorder.html

        // starting a recording session; which will initiate "Reading Thread"
        // "Reading Thread" are used to prevent main-thread blocking scenarios
        mediaRecorder = new window.MediaRecorder(mediaStream);

        // Dispatching OnDataAvailable Handler
        mediaRecorder.ondataavailable = function(e) {
            if (dataAvailable) {
                return;
            }

            if (!e.data.size) {
                if (!self.disableLogs) {
                    console.warn('Recording of', e.data.type, 'failed.');
                }
                return;
            }

            dataAvailable = true;

            /**
             * @property {Blob} blob - Recorded frames in video/webm blob.
             * @memberof MediaStreamRecorder
             * @example
             * recorder.stop(function() {
             *     var blob = recorder.blob;
             * });
             */
            self.blob = new Blob([e.data], {
                type: e.data.type || self.mimeType || 'audio/ogg'
            });

            if (self.callback) {
                self.callback();
            }
        };

        mediaRecorder.onerror = function(error) {
            if (!self.disableLogs) {
                console.warn(error);
            }

            // When the stream is "ended" set recording to 'inactive' 
            // and stop gathering data. Callers should not rely on 
            // exactness of the timeSlice value, especially 
            // if the timeSlice value is small. Callers should 
            // consider timeSlice as a minimum value

            mediaRecorder.stop();
            self.record(0);
        };

        // void start(optional long mTimeSlice)
        // The interval of passing encoded data from EncodedBufferCache to onDataAvailable
        // handler. "mTimeSlice < 0" means Session object does not push encoded data to
        // onDataAvailable, instead, it passive wait the client side pull encoded data
        // by calling requestData API.
        mediaRecorder.start(0);

        // Start recording. If timeSlice has been provided, mediaRecorder will
        // raise a dataavailable event containing the Blob of collected data on every timeSlice milliseconds.
        // If timeSlice isn't provided, UA should call the RequestData to obtain the Blob data, also set the mTimeSlice to zero.

        if (self.onAudioProcessStarted) {
            self.onAudioProcessStarted();
        }
    };

    /**
     * This method stops recording MediaStream.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        if (!mediaRecorder) {
            return;
        }

        this.callback = callback;
        // mediaRecorder.state === 'recording' means that media recorder is associated with "session"
        // mediaRecorder.state === 'stopped' means that media recorder is detached from the "session" ... in this case; "session" will also be deleted.

        if (mediaRecorder.state === 'recording') {
            // "stop" method auto invokes "requestData"!
            // mediaRecorder.requestData();
            mediaRecorder.stop();
        }
    };

    /**
     * This method pauses the recording process.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        if (!mediaRecorder) {
            return;
        }

        if (mediaRecorder.state === 'recording') {
            mediaRecorder.pause();

            if (!this.disableLogs) {
                console.debug('Paused recording.');
            }
        }
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof MediaStreamRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        if (!mediaRecorder) {
            return;
        }

        if (mediaRecorder.state === 'paused') {
            mediaRecorder.resume();

            if (!this.disableLogs) {
                console.debug('Resumed recording.');
            }
        }
    };

    // Reference to "MediaRecorder" object
    var mediaRecorder;
}
// _________________
// StereoRecorder.js

/**
 * StereoRecorder is a standalone class used by {@link RecordRTC} to bring audio-recording in chrome. It runs top over {@link StereoAudioRecorder}.
 * @summary JavaScript standalone object for stereo audio recording.
 * @typedef StereoRecorder
 * @class
 * @example
 * var recorder = new StereoRecorder(MediaStream);
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 * });
 * @param {MediaStream} mediaStream - MediaStream object fetched using getUserMedia API or generated using captureStreamUntilEnded or WebAudio API.
 */

function StereoRecorder(mediaStream) {
    var self = this;

    /**
     * This method records MediaStream.
     * @method
     * @memberof StereoRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        mediaRecorder = new StereoAudioRecorder(mediaStream, this);
        mediaRecorder.onAudioProcessStarted = function() {
            if (self.onAudioProcessStarted) {
                self.onAudioProcessStarted();
            }
        };
        mediaRecorder.record();
    };

    /**
     * This method stops recording MediaStream.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof StereoRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.stop(function() {
            for (var item in mediaRecorder) {
                self[item] = mediaRecorder[item];
            }

            if (callback) {
                callback();
            }
        });
    };

    /**
     * This method pauses the recording process.
     * @method
     * @memberof StereoRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.pause();
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof StereoRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        if (!mediaRecorder) {
            return;
        }

        mediaRecorder.resume();
    };

    // Reference to "StereoAudioRecorder" object
    var mediaRecorder;
}
// source code from: http://typedarray.org/wp-content/projects/WebAudioRecorder/script.js
// https://github.com/mattdiamond/Recorderjs#license-mit
// ______________________
// StereoAudioRecorder.js

/**
 * StereoAudioRecorder is a standalone class used by {@link RecordRTC} to bring "stereo" audio-recording in chrome.
 * @summary JavaScript standalone object for stereo audio recording.
 * @typedef StereoAudioRecorder
 * @class
 * @example
 * var recorder = new StereoAudioRecorder(MediaStream, {
 *     sampleRate: 44100,
 *     bufferSize: 4096
 * });
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 * });
 * @param {MediaStream} mediaStream - MediaStream object fetched using getUserMedia API or generated using captureStreamUntilEnded or WebAudio API.
 * @param {object} config - {sampleRate: 44100, bufferSize: 4096}
 */

var __stereoAudioRecorderJavacriptNode;

function StereoAudioRecorder(mediaStream, config) {
    if (!mediaStream.getAudioTracks().length) {
        throw 'Your stream has no audio tracks.';
    }

    var self = this;

    // variables
    var leftchannel = [];
    var rightchannel = [];
    var recording = false;
    var recordingLength = 0;

    /**
     * This method records MediaStream.
     * @method
     * @memberof StereoAudioRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        // reset the buffers for the new recording
        leftchannel.length = rightchannel.length = 0;
        recordingLength = 0;

        recording = true;
    };

    function mergeLeftRightBuffers(config, callback) {
        function mergeAudioBuffers(config) {
            var leftBuffers = config.leftBuffers;
            var rightBuffers = config.rightBuffers;
            var sampleRate = config.sampleRate;

            leftBuffers = mergeBuffers(leftBuffers[0], leftBuffers[1]);
            rightBuffers = mergeBuffers(rightBuffers[0], rightBuffers[1]);

            function mergeBuffers(channelBuffer, rLength) {
                var result = new Float64Array(rLength);
                var offset = 0;
                var lng = channelBuffer.length;

                for (var i = 0; i < lng; i++) {
                    var buffer = channelBuffer[i];
                    result.set(buffer, offset);
                    offset += buffer.length;
                }

                return result;
            }

            function interleave(leftChannel, rightChannel) {
                var length = leftChannel.length + rightChannel.length;

                var result = new Float64Array(length);

                var inputIndex = 0;

                for (var index = 0; index < length;) {
                    result[index++] = leftChannel[inputIndex];
                    result[index++] = rightChannel[inputIndex];
                    inputIndex++;
                }
                return result;
            }

            function writeUTFBytes(view, offset, string) {
                var lng = string.length;
                for (var i = 0; i < lng; i++) {
                    view.setUint8(offset + i, string.charCodeAt(i));
                }
            }

            // interleave both channels together
            var interleaved = interleave(leftBuffers, rightBuffers);

            var interleavedLength = interleaved.length;

            // create wav file
            var resultingBufferLength = 44 + interleavedLength * 2;

            var buffer = new ArrayBuffer(resultingBufferLength);

            var view = new DataView(buffer);

            // RIFF chunk descriptor/identifier 
            writeUTFBytes(view, 0, 'RIFF');

            // RIFF chunk length
            var blockAlign = 4;
            view.setUint32(blockAlign, 44 + interleavedLength * 2, true);

            // RIFF type 
            writeUTFBytes(view, 8, 'WAVE');

            // format chunk identifier 
            // FMT sub-chunk
            writeUTFBytes(view, 12, 'fmt ');

            // format chunk length 
            view.setUint32(16, 16, true);

            // sample format (raw)
            view.setUint16(20, 1, true);

            // stereo (2 channels)
            view.setUint16(22, 2, true);

            // sample rate 
            view.setUint32(24, sampleRate, true);

            // byte rate (sample rate * block align)
            view.setUint32(28, sampleRate * blockAlign, true);

            // block align (channel count * bytes per sample) 
            view.setUint16(32, blockAlign, true);

            // bits per sample 
            view.setUint16(34, 16, true);

            // data sub-chunk
            // data chunk identifier 
            writeUTFBytes(view, 36, 'data');

            // data chunk length 
            view.setUint32(40, interleavedLength * 2, true);

            // write the PCM samples
            var offset = 44,
                leftChannel;
            for (var i = 0; i < interleavedLength; i++, offset += 2) {
                var size = Math.max(-1, Math.min(1, interleaved[i]));
                var currentChannel = size < 0 ? size * 32768 : size * 32767;

                if (config.leftChannel) {
                    if (currentChannel !== leftChannel) {
                        view.setInt16(offset, currentChannel, true);
                    }
                    leftChannel = currentChannel;
                } else {
                    view.setInt16(offset, currentChannel, true);
                }
            }

            postMessage({
                buffer: buffer,
                view: view
            });
        }
        var webWorker = processInWebWorker(mergeAudioBuffers);

        webWorker.onmessage = function(event) {
            callback(event.data.buffer, event.data.view);
        };

        webWorker.postMessage(config);
    }

    function processInWebWorker(_function) {
        var blob = URL.createObjectURL(new Blob([_function.toString(),
            'this.onmessage =  function (e) {' + _function.name + '(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        var worker = new Worker(blob);
        URL.revokeObjectURL(blob);
        return worker;
    }

    /**
     * This method stops recording MediaStream.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof StereoAudioRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        // stop recording
        recording = false;

        // to make sure onaudioprocess stops firing
        audioInput.disconnect();

        mergeLeftRightBuffers({
            sampleRate: sampleRate,
            leftChannel: config.leftChannel,
            leftBuffers: [leftchannel, recordingLength],
            rightBuffers: [rightchannel, recordingLength]
        }, function(buffer, view) {
            /**
             * @property {Blob} blob - The recorded blob object.
             * @memberof StereoAudioRecorder
             * @example
             * recorder.stop(function(){
             *     var blob = recorder.blob;
             * });
             */
            self.blob = new Blob([view], {
                type: 'audio/wav'
            });

            /**
             * @property {ArrayBuffer} buffer - The recorded buffer object.
             * @memberof StereoAudioRecorder
             * @example
             * recorder.stop(function(){
             *     var buffer = recorder.buffer;
             * });
             */
            self.buffer = new ArrayBuffer(view);

            /**
             * @property {DataView} view - The recorded data-view object.
             * @memberof StereoAudioRecorder
             * @example
             * recorder.stop(function(){
             *     var view = recorder.view;
             * });
             */
            self.view = view;

            self.sampleRate = sampleRate;
            self.bufferSize = bufferSize;

            // recorded audio length
            self.length = recordingLength;

            if (callback) {
                callback();
            }

            isAudioProcessStarted = false;
        });
    };

    if (!Storage.AudioContextConstructor) {
        Storage.AudioContextConstructor = new Storage.AudioContext();
    }

    var context = Storage.AudioContextConstructor;

    // creates an audio node from the microphone incoming stream
    var audioInput = context.createMediaStreamSource(mediaStream);

    var legalBufferValues = [0, 256, 512, 1024, 2048, 4096, 8192, 16384];

    /**
     * From the spec: This value controls how frequently the audioprocess event is
     * dispatched and how many sample-frames need to be processed each call.
     * Lower values for buffer size will result in a lower (better) latency.
     * Higher values will be necessary to avoid audio breakup and glitches
     * The size of the buffer (in sample-frames) which needs to
     * be processed each time onprocessaudio is called.
     * Legal values are (256, 512, 1024, 2048, 4096, 8192, 16384).
     * @property {number} bufferSize - Buffer-size for how frequently the audioprocess event is dispatched.
     * @memberof StereoAudioRecorder
     * @example
     * recorder = new StereoAudioRecorder(mediaStream, {
     *     bufferSize: 4096
     * });
     */

    // "0" means, let chrome decide the most accurate buffer-size for current platform.
    var bufferSize = typeof config.bufferSize === 'undefined' ? 4096 : config.bufferSize;

    if (legalBufferValues.indexOf(bufferSize) === -1) {
        if (!config.disableLogs) {
            console.warn('Legal values for buffer-size are ' + JSON.stringify(legalBufferValues, null, '\t'));
        }
    }


    /**
     * The sample rate (in sample-frames per second) at which the
     * AudioContext handles audio. It is assumed that all AudioNodes
     * in the context run at this rate. In making this assumption,
     * sample-rate converters or "varispeed" processors are not supported
     * in real-time processing.
     * The sampleRate parameter describes the sample-rate of the
     * linear PCM audio data in the buffer in sample-frames per second.
     * An implementation must support sample-rates in at least
     * the range 22050 to 96000.
     * @property {number} sampleRate - Buffer-size for how frequently the audioprocess event is dispatched.
     * @memberof StereoAudioRecorder
     * @example
     * recorder = new StereoAudioRecorder(mediaStream, {
     *     sampleRate: 44100
     * });
     */
    var sampleRate = typeof config.sampleRate !== 'undefined' ? config.sampleRate : context.sampleRate || 44100;

    if (sampleRate < 22050 || sampleRate > 96000) {
        // Ref: http://stackoverflow.com/a/26303918/552182
        if (!config.disableLogs) {
            console.warn('sample-rate must be under range 22050 and 96000.');
        }
    }

    if (context.createJavaScriptNode) {
        __stereoAudioRecorderJavacriptNode = context.createJavaScriptNode(bufferSize, 2, 2);
    } else if (context.createScriptProcessor) {
        __stereoAudioRecorderJavacriptNode = context.createScriptProcessor(bufferSize, 2, 2);
    } else {
        throw 'WebAudio API has no support on this browser.';
    }

    // connect the stream to the gain node
    audioInput.connect(__stereoAudioRecorderJavacriptNode);

    bufferSize = __stereoAudioRecorderJavacriptNode.bufferSize;

    if (!config.disableLogs) {
        console.log('sample-rate', sampleRate);
        console.log('buffer-size', bufferSize);
    }

    var isPaused = false;
    /**
     * This method pauses the recording process.
     * @method
     * @memberof StereoAudioRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        isPaused = true;

        if (!config.disableLogs) {
            console.debug('Paused recording.');
        }
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof StereoAudioRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        isPaused = false;

        if (!config.disableLogs) {
            console.debug('Resumed recording.');
        }
    };

    var isAudioProcessStarted = false;

    __stereoAudioRecorderJavacriptNode.onaudioprocess = function(e) {
        if (isPaused) {
            return;
        }

        // if MediaStream().stop() or MediaStreamTrack.stop() is invoked.
        if (mediaStream.ended) {
            __stereoAudioRecorderJavacriptNode.onaudioprocess = function() {};
            return;
        }

        if (!recording) {
            audioInput.disconnect();
            return;
        }

        /**
         * This method is called on "onaudioprocess" event's first invocation.
         * @method {function} onAudioProcessStarted
         * @memberof StereoAudioRecorder
         * @example
         * recorder.onAudioProcessStarted: function() { };
         */
        if (!isAudioProcessStarted) {
            isAudioProcessStarted = true;
            if (self.onAudioProcessStarted) {
                self.onAudioProcessStarted();
            }
        }

        var left = e.inputBuffer.getChannelData(0);
        var right = e.inputBuffer.getChannelData(1);

        // we clone the samples
        leftchannel.push(new Float32Array(left));
        rightchannel.push(new Float32Array(right));

        recordingLength += bufferSize;
    };

    // to prevent self audio to be connected with speakers
    __stereoAudioRecorderJavacriptNode.connect(context.destination);
}
// _________________
// CanvasRecorder.js

/**
 * CanvasRecorder is a standalone class used by {@link RecordRTC} to bring HTML5-Canvas recording into video WebM. It uses HTML2Canvas library and runs top over {@link Whammy}.
 * @summary HTML2Canvas recording into video WebM.
 * @typedef CanvasRecorder
 * @class
 * @example
 * var recorder = new CanvasRecorder(htmlElement);
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 * });
 * @param {HTMLElement} htmlElement - querySelector/getElementById/getElementsByTagName[0]/etc.
 */

function CanvasRecorder(htmlElement) {
    if (!window.html2canvas) {
        throw 'Please link: //cdn.webrtc-experiment.com/screenshot.js';
    }

    var isRecording;

    /**
     * This method records Canvas.
     * @method
     * @memberof CanvasRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        isRecording = true;
        whammy.frames = [];
        drawCanvasFrame();
    };

    /**
     * This method stops recording Canvas.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof CanvasRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        isRecording = false;
        
        var that = this;

        /**
         * @property {Blob} blob - Recorded frames in video/webm blob.
         * @memberof CanvasRecorder
         * @example
         * recorder.stop(function() {
         *     var blob = recorder.blob;
         * });
         */
        whammy.compile(function(blob) {
            that.blob = blob;
            
            if (that.blob.forEach) {
                that.blob = new Blob([], {
                    type: 'video/webm'
                });
            }
            
            if (callback) {
                callback(that.blob);
            }
        });
    };

    var isPausedRecording = false;

    /**
     * This method pauses the recording process.
     * @method
     * @memberof CanvasRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        isPausedRecording = true;

        if (!this.disableLogs) {
            console.debug('Paused recording.');
        }
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof CanvasRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        isPausedRecording = false;

        if (!this.disableLogs) {
            console.debug('Resumed recording.');
        }
    };

    function drawCanvasFrame() {
        if (isPausedRecording) {
            lastTime = new Date().getTime();
            return setTimeout(drawCanvasFrame, 100);
        }

        window.html2canvas(htmlElement, {
            onrendered: function(canvas) {
                var duration = new Date().getTime() - lastTime;
                if (!duration) {
                    return drawCanvasFrame();
                }

                // via #206, by Jack i.e. @Seymourr
                lastTime = new Date().getTime();

                whammy.frames.push({
                    duration: duration,
                    image: canvas.toDataURL('image/webp')
                });

                if (isRecording) {
                    requestAnimationFrame(drawCanvasFrame);
                }
            }
        });
    }

    var lastTime = new Date().getTime();

    var whammy = new Whammy.Video(100);
}
// _________________
// WhammyRecorder.js

/**
 * WhammyRecorder is a standalone class used by {@link RecordRTC} to bring video recording in Chrome. It runs top over {@link Whammy}.
 * @summary Video recording feature in Chrome.
 * @typedef WhammyRecorder
 * @class
 * @example
 * var recorder = new WhammyRecorder(mediaStream);
 * recorder.record();
 * recorder.stop(function(blob) {
 *     video.src = URL.createObjectURL(blob);
 * });
 * @param {MediaStream} mediaStream - MediaStream object fetched using getUserMedia API or generated using captureStreamUntilEnded or WebAudio API.
 */

function WhammyRecorder(mediaStream) {
    /**
     * This method records video.
     * @method
     * @memberof WhammyRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        if (!this.width) {
            this.width = 320;
        }

        if (!this.height) {
            this.height = 240;
        }

        if (!this.video) {
            this.video = {
                width: this.width,
                height: this.height
            };
        }

        if (!this.canvas) {
            this.canvas = {
                width: this.width,
                height: this.height
            };
        }

        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;

        context = canvas.getContext('2d');

        // setting defaults
        if (this.video && this.video instanceof HTMLVideoElement) {
            video = this.video.cloneNode();
        } else {
            video = document.createElement('video');
            video.src = URL.createObjectURL(mediaStream);

            video.width = this.video.width;
            video.height = this.video.height;
        }

        video.muted = true;
        video.play();

        lastTime = new Date().getTime();
        whammy = new Whammy.Video();

        if (!this.disableLogs) {
            console.log('canvas resolutions', canvas.width, '*', canvas.height);
            console.log('video width/height', video.width || canvas.width, '*', video.height || canvas.height);
        }

        drawFrames();
    };

    function drawFrames() {
        var duration = new Date().getTime() - lastTime;
        if (!duration) {
            return setTimeout(drawFrames, 10);
        }

        if (isPausedRecording) {
            lastTime = new Date().getTime();
            return setTimeout(drawFrames, 100);
        }

        // via #206, by Jack i.e. @Seymourr
        lastTime = new Date().getTime();

        if (video.paused) {
            // via: https://github.com/muaz-khan/WebRTC-Experiment/pull/316
            // Tweak for Android Chrome
            video.play();
        }

        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        whammy.frames.push({
            duration: duration,
            image: canvas.toDataURL('image/webp')
        });

        if (!isStopDrawing) {
            setTimeout(drawFrames, 10);
        }
    }

    /**
     * remove black frames from the beginning to the specified frame
     * @param {Array} _frames - array of frames to be checked
     * @param {number} _framesToCheck - number of frame until check will be executed (-1 - will drop all frames until frame not matched will be found)
     * @param {number} _pixTolerance - 0 - very strict (only black pixel color) ; 1 - all
     * @param {number} _frameTolerance - 0 - very strict (only black frame color) ; 1 - all
     * @returns {Array} - array of frames
     */
    // pull#293 by @volodalexey
    function dropBlackFrames(_frames, _framesToCheck, _pixTolerance, _frameTolerance) {
        var localCanvas = document.createElement('canvas');
        localCanvas.width = canvas.width;
        localCanvas.height = canvas.height;
        var context2d = localCanvas.getContext('2d');
        var resultFrames = [];

        var checkUntilNotBlack = _framesToCheck === -1;
        var endCheckFrame = (_framesToCheck && _framesToCheck > 0 && _framesToCheck <= _frames.length) ?
            _framesToCheck : _frames.length;
        var sampleColor = {
            r: 0,
            g: 0,
            b: 0
        };
        var maxColorDifference = Math.sqrt(
            Math.pow(255, 2) +
            Math.pow(255, 2) +
            Math.pow(255, 2)
        );
        var pixTolerance = _pixTolerance && _pixTolerance >= 0 && _pixTolerance <= 1 ? _pixTolerance : 0;
        var frameTolerance = _frameTolerance && _frameTolerance >= 0 && _frameTolerance <= 1 ? _frameTolerance : 0;
        var doNotCheckNext = false;

        for (var f = 0; f < endCheckFrame; f++) {
            var matchPixCount, endPixCheck, maxPixCount;

            if (!doNotCheckNext) {
                var image = new Image();
                image.src = _frames[f].image;
                context2d.drawImage(image, 0, 0, canvas.width, canvas.height);
                var imageData = context2d.getImageData(0, 0, canvas.width, canvas.height);
                matchPixCount = 0;
                endPixCheck = imageData.data.length;
                maxPixCount = imageData.data.length / 4;

                for (var pix = 0; pix < endPixCheck; pix += 4) {
                    var currentColor = {
                        r: imageData.data[pix],
                        g: imageData.data[pix + 1],
                        b: imageData.data[pix + 2]
                    };
                    var colorDifference = Math.sqrt(
                        Math.pow(currentColor.r - sampleColor.r, 2) +
                        Math.pow(currentColor.g - sampleColor.g, 2) +
                        Math.pow(currentColor.b - sampleColor.b, 2)
                    );
                    // difference in color it is difference in color vectors (r1,g1,b1) <=> (r2,g2,b2)
                    if (colorDifference <= maxColorDifference * pixTolerance) {
                        matchPixCount++;
                    }
                }
            }

            if (!doNotCheckNext && maxPixCount - matchPixCount <= maxPixCount * frameTolerance) {
                // console.log('removed black frame : ' + f + ' ; frame duration ' + _frames[f].duration);
            } else {
                // console.log('frame is passed : ' + f);
                if (checkUntilNotBlack) {
                    doNotCheckNext = true;
                }
                resultFrames.push(_frames[f]);
            }
        }

        resultFrames = resultFrames.concat(_frames.slice(endCheckFrame));

        if (resultFrames.length <= 0) {
            // at least one last frame should be available for next manipulation
            // if total duration of all frames will be < 1000 than ffmpeg doesn't work well...
            resultFrames.push(_frames[_frames.length - 1]);
        }

        return resultFrames;
    }

    var isStopDrawing = false;

    /**
     * This method stops recording video.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof WhammyRecorder
     * @example
     * recorder.stop(function(blob) {
     *     video.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function(callback) {
        isStopDrawing = true;

        var _this = this;
        // analyse of all frames takes some time!
        setTimeout(function() {
            // e.g. dropBlackFrames(frames, 10, 1, 1) - will cut all 10 frames
            // e.g. dropBlackFrames(frames, 10, 0.5, 0.5) - will analyse 10 frames
            // e.g. dropBlackFrames(frames, 10) === dropBlackFrames(frames, 10, 0, 0) - will analyse 10 frames with strict black color
            whammy.frames = dropBlackFrames(whammy.frames, -1);

            // to display advertisement images!
            if (this.advertisement && this.advertisement.length) {
                whammy.frames = this.advertisement.concat(whammy.frames);
            }

            /**
             * @property {Blob} blob - Recorded frames in video/webm blob.
             * @memberof WhammyRecorder
             * @example
             * recorder.stop(function() {
             *     var blob = recorder.blob;
             * });
             */
            whammy.compile(function(blob) {
                _this.blob = blob;

                if (_this.blob.forEach) {
                    _this.blob = new Blob([], {
                        type: 'video/webm'
                    });
                }

                if (callback) {
                    callback(_this.blob);
                }
            });
        }, 10);
    };

    var isPausedRecording = false;

    /**
     * This method pauses the recording process.
     * @method
     * @memberof WhammyRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        isPausedRecording = true;

        if (!this.disableLogs) {
            console.debug('Paused recording.');
        }
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof WhammyRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        isPausedRecording = false;

        if (!this.disableLogs) {
            console.debug('Resumed recording.');
        }
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video;
    var lastTime;
    var whammy;
}
// https://github.com/antimatter15/whammy/blob/master/LICENSE
// _________
// Whammy.js

// todo: Firefox now supports webp for webm containers!
// their MediaRecorder implementation works well!
// should we provide an option to record via Whammy.js or MediaRecorder API is a better solution?

/**
 * Whammy is a standalone class used by {@link RecordRTC} to bring video recording in Chrome. It is written by {@link https://github.com/antimatter15|antimatter15}
 * @summary A real time javascript webm encoder based on a canvas hack.
 * @typedef Whammy
 * @class
 * @example
 * var recorder = new Whammy().Video(15);
 * recorder.add(context || canvas || dataURL);
 * var output = recorder.compile();
 */

var Whammy = (function() {
    // a more abstract-ish API

    function WhammyVideo(duration) {
        this.frames = [];
        this.duration = duration || 1;
        this.quality = 100;
    }

    /**
     * Pass Canvas or Context or image/webp(string) to {@link Whammy} encoder.
     * @method
     * @memberof Whammy
     * @example
     * recorder = new Whammy().Video(0.8, 100);
     * recorder.add(canvas || context || 'image/webp');
     * @param {string} frame - Canvas || Context || image/webp
     * @param {number} duration - Stick a duration (in milliseconds)
     */
    WhammyVideo.prototype.add = function(frame, duration) {
        if ('canvas' in frame) { //CanvasRenderingContext2D
            frame = frame.canvas;
        }

        if ('toDataURL' in frame) {
            frame = frame.toDataURL('image/webp', this.quality);
        }

        if (!(/^data:image\/webp;base64,/ig).test(frame)) {
            throw 'Input must be formatted properly as a base64 encoded DataURI of type image/webp';
        }
        this.frames.push({
            image: frame,
            duration: duration || this.duration
        });
    };

    function processInWebWorker(_function) {
        var blob = URL.createObjectURL(new Blob([_function.toString(),
            'this.onmessage =  function (e) {' + _function.name + '(e.data);}'
        ], {
            type: 'application/javascript'
        }));

        var worker = new Worker(blob);
        URL.revokeObjectURL(blob);
        return worker;
    }

    function whammyInWebWorker(frames) {
        function ArrayToWebM(frames) {
            var info = checkFrames(frames);
            if (!info) {
                return [];
            }

            var clusterMaxDuration = 30000;

            var EBML = [{
                'id': 0x1a45dfa3, // EBML
                'data': [{
                    'data': 1,
                    'id': 0x4286 // EBMLVersion
                }, {
                    'data': 1,
                    'id': 0x42f7 // EBMLReadVersion
                }, {
                    'data': 4,
                    'id': 0x42f2 // EBMLMaxIDLength
                }, {
                    'data': 8,
                    'id': 0x42f3 // EBMLMaxSizeLength
                }, {
                    'data': 'webm',
                    'id': 0x4282 // DocType
                }, {
                    'data': 2,
                    'id': 0x4287 // DocTypeVersion
                }, {
                    'data': 2,
                    'id': 0x4285 // DocTypeReadVersion
                }]
            }, {
                'id': 0x18538067, // Segment
                'data': [{
                    'id': 0x1549a966, // Info
                    'data': [{
                        'data': 1e6, //do things in millisecs (num of nanosecs for duration scale)
                        'id': 0x2ad7b1 // TimecodeScale
                    }, {
                        'data': 'whammy',
                        'id': 0x4d80 // MuxingApp
                    }, {
                        'data': 'whammy',
                        'id': 0x5741 // WritingApp
                    }, {
                        'data': doubleToString(info.duration),
                        'id': 0x4489 // Duration
                    }]
                }, {
                    'id': 0x1654ae6b, // Tracks
                    'data': [{
                        'id': 0xae, // TrackEntry
                        'data': [{
                            'data': 1,
                            'id': 0xd7 // TrackNumber
                        }, {
                            'data': 1,
                            'id': 0x73c5 // TrackUID
                        }, {
                            'data': 0,
                            'id': 0x9c // FlagLacing
                        }, {
                            'data': 'und',
                            'id': 0x22b59c // Language
                        }, {
                            'data': 'V_VP8',
                            'id': 0x86 // CodecID
                        }, {
                            'data': 'VP8',
                            'id': 0x258688 // CodecName
                        }, {
                            'data': 1,
                            'id': 0x83 // TrackType
                        }, {
                            'id': 0xe0, // Video
                            'data': [{
                                'data': info.width,
                                'id': 0xb0 // PixelWidth
                            }, {
                                'data': info.height,
                                'id': 0xba // PixelHeight
                            }]
                        }]
                    }]
                }]
            }];

            //Generate clusters (max duration)
            var frameNumber = 0;
            var clusterTimecode = 0;
            while (frameNumber < frames.length) {

                var clusterFrames = [];
                var clusterDuration = 0;
                do {
                    clusterFrames.push(frames[frameNumber]);
                    clusterDuration += frames[frameNumber].duration;
                    frameNumber++;
                } while (frameNumber < frames.length && clusterDuration < clusterMaxDuration);

                var clusterCounter = 0;
                var cluster = {
                    'id': 0x1f43b675, // Cluster
                    'data': getClusterData(clusterTimecode, clusterCounter, clusterFrames)
                }; //Add cluster to segment
                EBML[1].data.push(cluster);
                clusterTimecode += clusterDuration;
            }

            return generateEBML(EBML);
        }

        function getClusterData(clusterTimecode, clusterCounter, clusterFrames) {
            return [{
                'data': clusterTimecode,
                'id': 0xe7 // Timecode
            }].concat(clusterFrames.map(function(webp) {
                var block = makeSimpleBlock({
                    discardable: 0,
                    frame: webp.data.slice(4),
                    invisible: 0,
                    keyframe: 1,
                    lacing: 0,
                    trackNum: 1,
                    timecode: Math.round(clusterCounter)
                });
                clusterCounter += webp.duration;
                return {
                    data: block,
                    id: 0xa3
                };
            }));
        }

        // sums the lengths of all the frames and gets the duration

        function checkFrames(frames) {
            if (!frames[0]) {
                postMessage({
                    error: 'Something went wrong. Maybe WebP format is not supported in the current browser.'
                });
                return;
            }

            var width = frames[0].width,
                height = frames[0].height,
                duration = frames[0].duration;

            for (var i = 1; i < frames.length; i++) {
                duration += frames[i].duration;
            }
            return {
                duration: duration,
                width: width,
                height: height
            };
        }

        function numToBuffer(num) {
            var parts = [];
            while (num > 0) {
                parts.push(num & 0xff);
                num = num >> 8;
            }
            return new Uint8Array(parts.reverse());
        }

        function strToBuffer(str) {
            return new Uint8Array(str.split('').map(function(e) {
                return e.charCodeAt(0);
            }));
        }

        function bitsToBuffer(bits) {
            var data = [];
            var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
            bits = pad + bits;
            for (var i = 0; i < bits.length; i += 8) {
                data.push(parseInt(bits.substr(i, 8), 2));
            }
            return new Uint8Array(data);
        }

        function generateEBML(json) {
            var ebml = [];
            for (var i = 0; i < json.length; i++) {
                var data = json[i].data;

                if (typeof data === 'object') {
                    data = generateEBML(data);
                }

                if (typeof data === 'number') {
                    data = bitsToBuffer(data.toString(2));
                }

                if (typeof data === 'string') {
                    data = strToBuffer(data);
                }

                var len = data.size || data.byteLength || data.length;
                var zeroes = Math.ceil(Math.ceil(Math.log(len) / Math.log(2)) / 8);
                var sizeToString = len.toString(2);
                var padded = (new Array((zeroes * 7 + 7 + 1) - sizeToString.length)).join('0') + sizeToString;
                var size = (new Array(zeroes)).join('0') + '1' + padded;

                ebml.push(numToBuffer(json[i].id));
                ebml.push(bitsToBuffer(size));
                ebml.push(data);
            }

            return new Blob(ebml, {
                type: 'video/webm'
            });
        }

        function toBinStrOld(bits) {
            var data = '';
            var pad = (bits.length % 8) ? (new Array(1 + 8 - (bits.length % 8))).join('0') : '';
            bits = pad + bits;
            for (var i = 0; i < bits.length; i += 8) {
                data += String.fromCharCode(parseInt(bits.substr(i, 8), 2));
            }
            return data;
        }

        function makeSimpleBlock(data) {
            var flags = 0;

            if (data.keyframe) {
                flags |= 128;
            }

            if (data.invisible) {
                flags |= 8;
            }

            if (data.lacing) {
                flags |= (data.lacing << 1);
            }

            if (data.discardable) {
                flags |= 1;
            }

            if (data.trackNum > 127) {
                throw 'TrackNumber > 127 not supported';
            }

            var out = [data.trackNum | 0x80, data.timecode >> 8, data.timecode & 0xff, flags].map(function(e) {
                return String.fromCharCode(e);
            }).join('') + data.frame;

            return out;
        }

        function parseWebP(riff) {
            var VP8 = riff.RIFF[0].WEBP[0];

            var frameStart = VP8.indexOf('\x9d\x01\x2a'); // A VP8 keyframe starts with the 0x9d012a header
            for (var i = 0, c = []; i < 4; i++) {
                c[i] = VP8.charCodeAt(frameStart + 3 + i);
            }

            var width, height, tmp;

            //the code below is literally copied verbatim from the bitstream spec
            tmp = (c[1] << 8) | c[0];
            width = tmp & 0x3FFF;
            tmp = (c[3] << 8) | c[2];
            height = tmp & 0x3FFF;
            return {
                width: width,
                height: height,
                data: VP8,
                riff: riff
            };
        }

        function getStrLength(string, offset) {
            return parseInt(string.substr(offset + 4, 4).split('').map(function(i) {
                var unpadded = i.charCodeAt(0).toString(2);
                return (new Array(8 - unpadded.length + 1)).join('0') + unpadded;
            }).join(''), 2);
        }

        function parseRIFF(string) {
            var offset = 0;
            var chunks = {};

            while (offset < string.length) {
                var id = string.substr(offset, 4);
                var len = getStrLength(string, offset);
                var data = string.substr(offset + 4 + 4, len);
                offset += 4 + 4 + len;
                chunks[id] = chunks[id] || [];

                if (id === 'RIFF' || id === 'LIST') {
                    chunks[id].push(parseRIFF(data));
                } else {
                    chunks[id].push(data);
                }
            }
            return chunks;
        }

        function doubleToString(num) {
            return [].slice.call(
                new Uint8Array((new Float64Array([num])).buffer), 0).map(function(e) {
                return String.fromCharCode(e);
            }).reverse().join('');
        }

        var webm = new ArrayToWebM(frames.map(function(frame) {
            var webp = parseWebP(parseRIFF(atob(frame.image.slice(23))));
            webp.duration = frame.duration;
            return webp;
        }));

        postMessage(webm);
    }

    /**
     * Encodes frames in WebM container. It uses WebWorkinvoke to invoke 'ArrayToWebM' method.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof Whammy
     * @example
     * recorder = new Whammy().Video(0.8, 100);
     * recorder.compile(function(blob) {
     *    // blob.size - blob.type
     * });
     */
    WhammyVideo.prototype.compile = function(callback) {
        var webWorker = processInWebWorker(whammyInWebWorker);

        webWorker.onmessage = function(event) {
            if (event.data.error) {
                console.error(event.data.error);
                return;
            }
            callback(event.data);
        };

        webWorker.postMessage(this.frames);
    };

    return {
        /**
         * A more abstract-ish API.
         * @method
         * @memberof Whammy
         * @example
         * recorder = new Whammy().Video(0.8, 100);
         * @param {?number} speed - 0.8
         * @param {?number} quality - 100
         */
        Video: WhammyVideo
    };
})();
// ______________ (indexed-db)
// DiskStorage.js

/**
 * DiskStorage is a standalone object used by {@link RecordRTC} to store recorded blobs in IndexedDB storage.
 * @summary Writing blobs into IndexedDB.
 * @example
 * DiskStorage.Store({
 *     audioBlob: yourAudioBlob,
 *     videoBlob: yourVideoBlob,
 *     gifBlob  : yourGifBlob
 * });
 * DiskStorage.Fetch(function(dataURL, type) {
 *     if(type === 'audioBlob') { }
 *     if(type === 'videoBlob') { }
 *     if(type === 'gifBlob')   { }
 * });
 * // DiskStorage.dataStoreName = 'recordRTC';
 * // DiskStorage.onError = function(error) { };
 * @property {function} init - This method must be called once to initialize IndexedDB ObjectStore. Though, it is auto-used internally.
 * @property {function} Fetch - This method fetches stored blobs from IndexedDB.
 * @property {function} Store - This method stores blobs in IndexedDB.
 * @property {function} onError - This function is invoked for any known/unknown error.
 * @property {string} dataStoreName - Name of the ObjectStore created in IndexedDB storage.
 */


var DiskStorage = {
    /**
     * This method must be called once to initialize IndexedDB ObjectStore. Though, it is auto-used internally.
     * @method
     * @memberof DiskStorage
     * @internal
     * @example
     * DiskStorage.init();
     */
    init: function() {
        var self = this;
        var indexedDB = window.indexedDB || window.webkitIndexedDB || window.mozIndexedDB || window.OIndexedDB || window.msIndexedDB;
        var dbVersion = 1;
        var dbName = this.dbName || location.href.replace(/\/|:|#|%|\.|\[|\]/g, ''),
            db;
        var request = indexedDB.open(dbName, dbVersion);

        function createObjectStore(dataBase) {
            dataBase.createObjectStore(self.dataStoreName);
        }

        function putInDB() {
            var transaction = db.transaction([self.dataStoreName], 'readwrite');

            if (self.videoBlob) {
                transaction.objectStore(self.dataStoreName).put(self.videoBlob, 'videoBlob');
            }

            if (self.gifBlob) {
                transaction.objectStore(self.dataStoreName).put(self.gifBlob, 'gifBlob');
            }

            if (self.audioBlob) {
                transaction.objectStore(self.dataStoreName).put(self.audioBlob, 'audioBlob');
            }

            function getFromStore(portionName) {
                transaction.objectStore(self.dataStoreName).get(portionName).onsuccess = function(event) {
                    if (self.callback) {
                        self.callback(event.target.result, portionName);
                    }
                };
            }

            getFromStore('audioBlob');
            getFromStore('videoBlob');
            getFromStore('gifBlob');
        }

        request.onerror = self.onError;

        request.onsuccess = function() {
            db = request.result;
            db.onerror = self.onError;

            if (db.setVersion) {
                if (db.version !== dbVersion) {
                    var setVersion = db.setVersion(dbVersion);
                    setVersion.onsuccess = function() {
                        createObjectStore(db);
                        putInDB();
                    };
                } else {
                    putInDB();
                }
            } else {
                putInDB();
            }
        };
        request.onupgradeneeded = function(event) {
            createObjectStore(event.target.result);
        };
    },
    /**
     * This method fetches stored blobs from IndexedDB.
     * @method
     * @memberof DiskStorage
     * @internal
     * @example
     * DiskStorage.Fetch(function(dataURL, type) {
     *     if(type === 'audioBlob') { }
     *     if(type === 'videoBlob') { }
     *     if(type === 'gifBlob')   { }
     * });
     */
    Fetch: function(callback) {
        this.callback = callback;
        this.init();

        return this;
    },
    /**
     * This method stores blobs in IndexedDB.
     * @method
     * @memberof DiskStorage
     * @internal
     * @example
     * DiskStorage.Store({
     *     audioBlob: yourAudioBlob,
     *     videoBlob: yourVideoBlob,
     *     gifBlob  : yourGifBlob
     * });
     */
    Store: function(config) {
        this.audioBlob = config.audioBlob;
        this.videoBlob = config.videoBlob;
        this.gifBlob = config.gifBlob;

        this.init();

        return this;
    },
    /**
     * This function is invoked for any known/unknown error.
     * @method
     * @memberof DiskStorage
     * @internal
     * @example
     * DiskStorage.onError = function(error){
     *     alerot( JSON.stringify(error) );
     * };
     */
    onError: function(error) {
        console.error(JSON.stringify(error, null, '\t'));
    },

    /**
     * @property {string} dataStoreName - Name of the ObjectStore created in IndexedDB storage.
     * @memberof DiskStorage
     * @internal
     * @example
     * DiskStorage.dataStoreName = 'recordRTC';
     */
    dataStoreName: 'recordRTC',
    dbName: null
};
// ______________
// GifRecorder.js

/**
 * GifRecorder is standalone calss used by {@link RecordRTC} to record video as animated gif image.
 * @typedef GifRecorder
 * @class
 * @example
 * var recorder = new GifRecorder(mediaStream);
 * recorder.record();
 * recorder.stop(function(blob) {
 *     img.src = URL.createObjectURL(blob);
 * });
 * @param {MediaStream} mediaStream - MediaStream object fetched using getUserMedia API or generated using captureStreamUntilEnded or WebAudio API.
 */

function GifRecorder(mediaStream) {
    if (!window.GIFEncoder) {
        throw 'Please link: https://cdn.webrtc-experiment.com/gif-recorder.js';
    }

    /**
     * This method records MediaStream.
     * @method
     * @memberof GifRecorder
     * @example
     * recorder.record();
     */
    this.record = function() {
        if (!this.width) {
            this.width = video.offsetWidth || 320;
        }

        if (!this.height) {
            this.height = video.offsetHeight || 240;
        }

        if (!this.video) {
            this.video = {
                width: this.width,
                height: this.height
            };
        }

        if (!this.canvas) {
            this.canvas = {
                width: this.width,
                height: this.height
            };
        }

        canvas.width = this.canvas.width;
        canvas.height = this.canvas.height;

        video.width = this.video.width;
        video.height = this.video.height;

        // external library to record as GIF images
        gifEncoder = new window.GIFEncoder();

        // void setRepeat(int iter) 
        // Sets the number of times the set of GIF frames should be played. 
        // Default is 1; 0 means play indefinitely.
        gifEncoder.setRepeat(0);

        // void setFrameRate(Number fps) 
        // Sets frame rate in frames per second. 
        // Equivalent to setDelay(1000/fps).
        // Using "setDelay" instead of "setFrameRate"
        gifEncoder.setDelay(this.frameRate || 200);

        // void setQuality(int quality) 
        // Sets quality of color quantization (conversion of images to the 
        // maximum 256 colors allowed by the GIF specification). 
        // Lower values (minimum = 1) produce better colors, 
        // but slow processing significantly. 10 is the default, 
        // and produces good color mapping at reasonable speeds. 
        // Values greater than 20 do not yield significant improvements in speed.
        gifEncoder.setQuality(this.quality || 10);

        // Boolean start() 
        // This writes the GIF Header and returns false if it fails.
        gifEncoder.start();

        startTime = Date.now();

        var self = this;

        function drawVideoFrame(time) {
            if (isPausedRecording) {
                return setTimeout(function() {
                    drawVideoFrame(time);
                }, 100);
            }

            lastAnimationFrame = requestAnimationFrame(drawVideoFrame);

            if (typeof lastFrameTime === undefined) {
                lastFrameTime = time;
            }

            // ~10 fps
            if (time - lastFrameTime < 90) {
                return;
            }

            if (video.paused) {
                // via: https://github.com/muaz-khan/WebRTC-Experiment/pull/316
                // Tweak for Android Chrome
                video.play();
            }

            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            if (self.onGifPreview) {
                self.onGifPreview(canvas.toDataURL('image/png'));
            }

            gifEncoder.addFrame(context);
            lastFrameTime = time;
        }

        lastAnimationFrame = requestAnimationFrame(drawVideoFrame);
    };

    /**
     * This method stops recording MediaStream.
     * @param {function} callback - Callback function, that is used to pass recorded blob back to the callee.
     * @method
     * @memberof GifRecorder
     * @example
     * recorder.stop(function(blob) {
     *     img.src = URL.createObjectURL(blob);
     * });
     */
    this.stop = function() {
        if (lastAnimationFrame) {
            cancelAnimationFrame(lastAnimationFrame);
        }

        endTime = Date.now();

        /**
         * @property {Blob} blob - The recorded blob object.
         * @memberof GifRecorder
         * @example
         * recorder.stop(function(){
         *     var blob = recorder.blob;
         * });
         */
        this.blob = new Blob([new Uint8Array(gifEncoder.stream().bin)], {
            type: 'image/gif'
        });

        // bug: find a way to clear old recorded blobs
        gifEncoder.stream().bin = [];
    };

    var isPausedRecording = false;

    /**
     * This method pauses the recording process.
     * @method
     * @memberof GifRecorder
     * @example
     * recorder.pause();
     */
    this.pause = function() {
        isPausedRecording = true;

        if (!this.disableLogs) {
            console.debug('Paused recording.');
        }
    };

    /**
     * This method resumes the recording process.
     * @method
     * @memberof GifRecorder
     * @example
     * recorder.resume();
     */
    this.resume = function() {
        isPausedRecording = false;

        if (!this.disableLogs) {
            console.debug('Resumed recording.');
        }
    };

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    var video = document.createElement('video');
    video.muted = true;
    video.autoplay = true;
    video.src = URL.createObjectURL(mediaStream);
    video.play();

    var lastAnimationFrame = null;
    var startTime, endTime, lastFrameTime;

    var gifEncoder;
}
