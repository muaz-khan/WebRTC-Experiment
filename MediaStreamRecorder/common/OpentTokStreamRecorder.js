// muazkh - github.com/muaz-khan 
// @neizerth - github.com/neizerth
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder
// ==========================================================
// OpentTokStreamRecorder.js

function OpenTokStreamRecorder(o) {
    var defaults = {
            webrtc: false,
            apiKey: null,
            remoteApiKey: null,
            sessionId: '',
            token: null,
            remoteToken: null,
            remoteArchive: null,
            saveAterStop: true,
            container: null,
            debug: false,
            pollWhileProcessing: true,
            style: null, // null | 'blank' | object (see http://www.tokbox.com/opentok/docs/js/reference/Recorder.html)
            loadingDuration: 2000, // dirty hack while opentox doesnt support onready event
            onerror: function() {

            },
            onstart: function() {

            },
            onstop: function() {

            },
            ondataavailable: function() {

            },
            onready: function() {

            },
            onsavecomplete: function() {

            }
        },
        remoteDefaults = {
            url: window.location,
            method: 'GET',
            data: {},
            success: function() {},
            error: function() {}
        },
        baseUrl = getBaseUrl(),
        self = this,
        _initialized = false,
        _startRequest = false,
        options = extend(defaults, o),
        recorder;

    include('https://swww.tokbox.com/v1.1/js/TB.min.js', init);

    function init() {
        if (options.remoteApiKey != null) {
            getUrlData(options.remoteApiKey, function(key) {
                options.apiKey = key;
                createRecorder();
            });
        }
        if (options.remoteToken != null) {
            getUrlData(options.remoteToken, function(token) {
                options.token = token;
                createRecorder();
            });
        }
        createRecorder();
    }

    function start() {
        _startRequest = true;
        if (_initialized) {
            _startRequest = false;
            if (self.state != 'inactive') {
                var obj = {
                    message: 'The object is in an invalid state',
                    code: DOMException.INVALID_STATE_ERR
                }
                self.onerror(obj);
                throw obj;
            }
            self.state = 'recording';

            recorder.startRecording();
        }
    }

    function stop() {
        if (self.state == 'inactive') {
            var obj = {
                message: 'The object is in an invalid state',
                code: DOMException.INVALID_STATE_ERR
            }
            self.onerror(obj);
            throw obj;
        }
        self.state = 'inactive';

        recorder.stopRecording();

        if (options.saveAterStop) {
            save();
        };
    }

    function save() {
        recorder.saveArchive();
    }

    function createRecorder() {
        if (options.apiKey != null && options.token != null && !_initialized) {
            _initialized = true;
            if (options.debug) {
                TB.setLogLevel(TB.DEBUG); // Prints out logging messages in console
            }
            var recorderManager = TB.initRecorderManager(options.apiKey),
                recDiv = document.createElement('div'),
                container = o.container == null ? document.body : o.container;

            recDiv.setAttribute('id', 'recorderElement');
            container.appendChild(recDiv);
            recorder = recorderManager.displayRecorder(options.token, recDiv.id);
            recorder.addEventListener('recordingStarted', self.onstart);
            recorder.addEventListener('recordingStopped', self.onstop);
            recorder.addEventListener('archiveSaved', onArchiveSaved);

            if (options.style != null) {
                var style = {};
                if (options.style == 'blank') {
                    style = {
                        buttonDisplayMode: 'off',
                        showControlBar: false,
                        showMicButton: false,
                        showRecordButton: false,
                        showRecordCounter: false,
                        showRecordStopButton: false,
                        showReRecordButton: false,
                        showPlayButton: false,
                        showPlayCounter: false,
                        showPlayStopButton: false,
                        showSaveButton: false,
                        showSettingsButton: false
                    };
                }
                recorder.setStyle(style);
            }

            if (_startRequest) {
                setTimeout(function() {
                    _initialized = true;
                    start();
                }, options.loadingDuration); // i have no idea how to handle ready event
            } else {
                _initialized = true;
            }
            self.onready();

        }
    }

    function onArchiveSaved(e) {
        self.onsavecomplete();

        if (options.remoteArchive != null) {
            var params = {},
                url;

            if (typeof options.remoteArchive == 'function') {
                params.url = options.remoteArchive(e);
            } else if (typeof options.remoteArchive == 'string') {
                params.url = options.remoteArchive;
            } else if (typeof options.remoteArchive == 'object') {
                params = options.remoteArchive;
            }

            getVideoURL(params);

        } else {
            self.ondataavailable({
                data: e,
                dataType: 'raw'
            });
        }

    }

    function getVideoURL(params) {
        getUrlData(params,
            function(answer) {
                if (answer == 'not_ready' && self.pollWhileProcessing) {
                    getVideoURL(params)
                } else {
                    self.ondataavailable({
                        data: answer,
                        dataType: 'url'
                    });
                }
            }
        );
    }

    function getUrlData(params, callback) {
        if (typeof params == 'string') {
            params = {
                url: params
            }
        }
        var options = extend(remoteDefaults, params);

        options.success = callback;
        options.error = self.onerror;

        if (window.jQuery != null) {
            jQuery.ajax(options);
        } else {
            include(baseUrl + 'lib/AjaxRequest/AjaxRequest.js', function() {
                switch (options.method) {
                    case 'GET':
                        AjaxRequest.get({
                            url: options.url,
                            parameters: options.data,
                            onSuccess: function(obj) {
                                options.success(obj.responseText)
                            },
                            onError: options.error
                        })
                        break;
                    case 'POST':
                        AjaxRequest.post({
                            url: options.url,
                            parameters: options.data,
                            onSuccess: function(obj) {
                                options.success(obj.responseText)
                            },
                            onError: options.error
                        })
                        break;
                }
            });
        }
    }

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
            runCallback = false;

        for (var i = 0, len = scripts.length; i < len; i++) {
            if (scripts[i].getAttribute('src') == src) {
                runCallback = true;
                if (scripts[i].getAttribute('loading') == 'loading') {
                    runCallback = false;
                    if (typeof callback == 'function') {
                        var onload = scripts[i].onload;
                        scripts[i].onload = function() {
                            callback();
                            if (typeof onload == 'function') {
                                onload();
                            }
                        }
                    }
                }
            }
        }

        if (runCallback) {
            if (typeof callback == 'function') {
                callback();
            }
        } else {
            var js = document.createElement("script");

            js.type = "text/javascript";
            js.src = src;
            js.setAttribute('loading', 'loading');
            if (typeof callback == 'function') {
                js.onload = function() {
                    callback()
                    js.removeAttribute('loading');
                }
            } else {
                js.onload = function() {
                    js.removeAttribute('loading');
                }
            }

            document.body.appendChild(js);
        }
    }
    this.baseUrl = baseUrl;
    this.onstart = options.onstart;
    this.onstop = options.onstop;
    this.onerror = options.onerror;
    this.onready = options.onready;
    this.onsavecomplete = options.onsavecomplete;
    this.start = start;
    this.stop = stop;
    this.save = save;
    this.state = 'inactive';
    this.ondataavailable = options.ondataavailable;
    this.getInterface = function() {
        return recorder
    };
}
