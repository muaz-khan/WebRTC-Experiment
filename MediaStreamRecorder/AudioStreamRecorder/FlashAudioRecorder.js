// muazkh - github.com/muaz-khan 
// @neizerth - github.com/neizerth
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder
// ==========================================================
// FlashAudioRecorder.js
// Based on recorder.js - https://github.com/jwagener/recorder.js

function FlashAudioRecorder(o) {
    if (o == null) {
        o = {};
    }
    var self = this,
        baseUrl = getBaseUrl(),
        defaults = {
            swfObjectPath: baseUrl + 'lib/recorder.js/recorder.swf',
            jsLibPath: baseUrl + 'lib/recorder.js/recorder.js',
            encoderPath: baseUrl + 'lib/wavencoder/wavencoder.js',
            flashContainer: null,
            dataType: 'url', // url | blob | raw | dataUri | false
            uploadParams: {
                url: '',
                audioParam: "",
                params: {}
            },
            ondataavailable: null,
            onstop: function(e) {

            },
            onstart: function(e) {

            },
            onFlashSecurity: function(e) {
                var flashContainer = Recorder.options.flashContainer;
                flashContainer.style.left = ((window.innerWidth || document.body.offsetWidth) / 2) - 115 + "px";
                flashContainer.style.top = ((window.innerHeight || document.body.offsetHeight) / 2) - 70 + "px";
            },
            onready: function(e) {

            },
            onerror: function(e) {

            }
        },
        _initialized = false,
        _startRequest = false,
        options = extend(defaults, o);

    include(options.jsLibPath, init);

    function init() {
        if (!_initialized) {
            Recorder._defaultOnShowFlash = true;

            Recorder.initialize({
                swfSrc: options.swfObjectPath,
                flashContainer: options.flashContainer,
                onFlashSecurity: function(e) {
                    self.onFlashSecurity(e);
                },
                initialized: function(e) {
                    self.onready();

                    _initialized = true;

                    if (_startRequest) {
                        start();
                    }
                }
            });
        }

    }

    function initEncoder() {
        WavEncoder.defaults = {
            numChannels: 1, // mono
            sampleRateHz: 44100, // 44100 Hz
            bytesPerSample: 2, // 16 bit
            clip: true
        };
    }

    function start(interval) {
        _startRequest = true;
        if (_initialized) {
            if (self.state != 'inactive') {
                var error = {
                    message: 'The object is in an invalid state',
                    code: DOMException.INVALID_STATE_ERR
                }
                self.onerror(error);
                throw error;
            }
            self.state = 'recording';

            _startRequest = false;
            Recorder.record({
                start: function(e) {
                    self.onstart(e);
                }
            });
        }
    }

    function stop() {
        if (self.state == 'inactive') {
            var error = {
                message: 'The object is in an invalid state',
                code: DOMException.INVALID_STATE_ERR
            }
            self.onerror(error);
            throw error;
        }
        self.state = 'inactive';
        _startRequest = false;
        Recorder.stop();
        self.onstop();
        if (typeof self.ondataavailable == 'function') {

            if (self.dataType == 'url') {
                upload();
            } else if (self.dataType != false) {
                handleBinaryData();
            }
        }
    }

    function handleBinaryData() {
        Recorder.getAudioData(function(data) {
            if (self.dataType == 'raw') {
                return self.ondataavailable({
                    data: data,
                    dataType: self.dataType
                });
            };

            include(options.encoderPath, function() {
                initEncoder();
                var datauri = WavEncoder.encode(data);
                if (self.dataType == 'datauri') {
                    return self.ondataavailable({
                        data: datauri,
                        dataType: self.dataType
                    });
                };
                var audioBlob = new Blob([datauri], {
                    type: self.mimeType
                });
                if (self.dataType == 'blob') {
                    return self.ondataavailable({
                        data: audioBlob,
                        dataType: self.dataType
                    });
                };
            });
        });


    }

    function upload(params) {
            if (params == null)
                params = self.uploadParams;

            params.success = function(msg) {
                self.ondataavailable({
                    data: msg,
                    dataType: 'url'
                });
            };
            params.error = function(msg) {
                self.onerror({
                    msg: msg
                });
            }
            Recorder.upload(params);
        }
        // get script folder
    function getBaseUrl() {
            var scripts = document.head.getElementsByTagName("script");
            var loc = scripts[scripts.length - 1].src;
            return loc.substring(0, loc.lastIndexOf('/')) + '/';
        }
        //  extending user options
    function extend(o1, o2) {
        var obj = {};
        for (var i in o1) {
            if (o2[i] != null) {
                if (typeof o2[i] == "object") {
                    obj[i] = extend(o2[i], {});
                } else {
                    obj[i] = o2[i];
                }
            } else {
                if (typeof o2[i] == "object") {
                    obj[i] = extend(o1[i], {});
                } else {
                    obj[i] = o1[i];
                }
            }
        }
        return obj;
    }

    function include(src, callback) {
        var scripts = document.getElementsByTagName('script'),
            found = false;

        for (var i = 0, len = scripts.length; i < len; i++) {
            if (scripts[i].getAttribute('src') == src) {
                found = true;
            }
        }
        if (found) {
            if (typeof callback == 'function') {
                callback();
            }
        } else {
            var js = document.createElement("script");

            js.type = "text/javascript";
            js.src = src;
            if (typeof callback == 'function') {
                js.onload = callback;
            }

            document.body.appendChild(js);
        }

    }

    this.ondataavailable = options.ondataavailable;
    this.onstop = options.onstop;
    this.onstart = options.onstart;
    this.onFlashSecurity = options.onFlashSecurity;
    this.onerror = options.onerror;
    this.onready = options.onready;
    this.state = 'inactive';
    this.mimeType = 'audio/wav';

    this.uploadParams = options.uploadParams;
    this.dataType = options.dataType;

    this.start = start;
    this.upload = upload;
    this.stop = stop;
    this.baseUrl = baseUrl;
}
