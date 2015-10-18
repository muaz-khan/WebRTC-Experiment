var webAudioMediaStreamSources = [];

function convertToAudioStream(mediaStream) {
    if (!mediaStream) throw 'MediaStream is mandatory.';

    if (mediaStream.getVideoTracks && !mediaStream.getVideoTracks().length) {
        return mediaStream;
    }

    var context = new AudioContext();
    var mediaStreamSource = context.createMediaStreamSource(mediaStream);

    var destination = context.createMediaStreamDestination();
    mediaStreamSource.connect(destination);

    webAudioMediaStreamSources.push(mediaStreamSource);

    return destination.stream;
}

var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
var isFirefox = typeof window.InstallTrigger !== 'undefined';
var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
var isChrome = !!window.chrome && !isOpera;
var isIE = !!document.documentMode;

var isPluginRTC = isSafari || isIE;

var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

// detect node-webkit
var isNodeWebkit = !!(window.process && (typeof window.process == 'object') && window.process.versions && window.process.versions['node-webkit']);

window.MediaStream = window.MediaStream || window.webkitMediaStream;
window.AudioContext = window.AudioContext || window.webkitAudioContext;

function getRandomString() {
    // suggested by @rvulpescu from #154
    if (window.crypto && crypto.getRandomValues && navigator.userAgent.indexOf('Safari') == -1) {
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

var chromeVersion = 50;
var matchArray = navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./);
if (isChrome && matchArray && matchArray[2]) {
    chromeVersion = parseInt(matchArray[2], 10);
}

var firefoxVersion = 50;
matchArray = navigator.userAgent.match(/Firefox\/(.*)/);
if (isFirefox && matchArray && matchArray[1]) {
    firefoxVersion = parseInt(matchArray[1], 10);
}

function isData(session) {
    return !session.audio && !session.video && !session.screen && session.data;
}

function isNull(obj) {
    return typeof obj == 'undefined';
}

function isString(obj) {
    return typeof obj == 'string';
}

function isEmpty(session) {
    var length = 0;
    for (var s in session) {
        length++;
    }
    return length == 0;
}

// this method converts array-buffer into string
function ab2str(buf) {
    var result = '';
    try {
        result = String.fromCharCode.apply(null, new Uint16Array(buf));
    } catch (e) {}
    return result;
}

// this method converts string into array-buffer
function str2ab(str) {
    if (!isString(str)) str = JSON.stringify(str);

    var buf = new ArrayBuffer(str.length * 2); // 2 bytes for each char
    var bufView = new Uint16Array(buf);
    for (var i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function swap(arr) {
    var swapped = [],
        length = arr.length;
    for (var i = 0; i < length; i++)
        if (arr[i] && arr[i] !== true)
            swapped.push(arr[i]);
    return swapped;
}

function forEach(obj, callback) {
    for (var item in obj) {
        callback(obj[item], item);
    }
}

var console = window.console || {
    log: function() {},
    error: function() {},
    warn: function() {}
};

function log() {
    console.log(arguments);
}

function error() {
    console.error(arguments);
}

function warn() {
    console.warn(arguments);
}

if (isChrome || isFirefox || isSafari) {
    var log = console.log.bind(console);
    var error = console.error.bind(console);
    var warn = console.warn.bind(console);
}

function toStr(obj) {
    return JSON.stringify(obj, function(key, value) {
        if (value && value.sdp) {
            log(value.sdp.type, '\t', value.sdp.sdp);
            return '';
        } else return value;
    }, '\t');
}

function getLength(obj) {
    var length = 0;
    for (var o in obj)
        if (o) length++;
    return length;
}

// Get HTMLAudioElement/HTMLVideoElement accordingly

function createMediaElement(stream, session) {
    var mediaElement = document.createElement(stream.isAudio ? 'audio' : 'video');
    mediaElement.id = stream.streamid;

    if (isPluginRTC) {
        var body = (document.body || document.documentElement);
        body.insertBefore(mediaElement, body.firstChild);

        setTimeout(function() {
            Plugin.attachMediaStream(mediaElement, stream)
        }, 1000);

        return Plugin.attachMediaStream(mediaElement, stream);
    }

    // "mozSrcObject" is always preferred over "src"!!
    mediaElement[isFirefox ? 'mozSrcObject' : 'src'] = isFirefox ? stream : window.webkitURL.createObjectURL(stream);

    mediaElement.controls = true;
    mediaElement.autoplay = !!session.remote;
    mediaElement.muted = session.remote ? false : true;

    // http://goo.gl/WZ5nFl
    // Firefox don't yet support onended for any stream (remote/local)
    isFirefox && mediaElement.addEventListener('ended', function() {
        stream.onended();
    }, false);

    mediaElement.play();

    return mediaElement;
}

var onStreamEndedHandlerFiredFor = {};

function onStreamEndedHandler(streamedObject, connection) {
    if (streamedObject.mediaElement && !streamedObject.mediaElement.parentNode) return;

    if (onStreamEndedHandlerFiredFor[streamedObject.streamid]) return;
    onStreamEndedHandlerFiredFor[streamedObject.streamid] = streamedObject;
    connection.onstreamended(streamedObject);
}

var onLeaveHandlerFiredFor = {};

function onLeaveHandler(event, connection) {
    if (onLeaveHandlerFiredFor[event.userid]) return;
    onLeaveHandlerFiredFor[event.userid] = event;
    connection.onleave(event);
}

function takeSnapshot(args) {
    var userid = args.userid;
    var connection = args.connection;

    function _takeSnapshot(video) {
        var canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || video.clientWidth;
        canvas.height = video.videoHeight || video.clientHeight;

        var context = canvas.getContext('2d');
        context.drawImage(video, 0, 0, canvas.width, canvas.height);

        connection.snapshots[userid] = canvas.toDataURL('image/png');
        args.callback && args.callback(connection.snapshots[userid]);
    }

    if (args.mediaElement) return _takeSnapshot(args.mediaElement);

    for (var stream in connection.streams) {
        stream = connection.streams[stream];
        if (stream.userid == userid && stream.stream && stream.stream.getVideoTracks && stream.stream.getVideoTracks().length) {
            _takeSnapshot(stream.mediaElement);
            continue;
        }
    }
}

function invokeMediaCaptured(connection) {
    // to let user know that media resource has been captured
    // now, he can share "sessionDescription" using sockets
    if (connection.onMediaCaptured) {
        connection.onMediaCaptured();
        delete connection.onMediaCaptured;
    }
}

function merge(mergein, mergeto) {
    if (!mergein) mergein = {};
    if (!mergeto) return mergein;

    for (var item in mergeto) {
        mergein[item] = mergeto[item];
    }
    return mergein;
}

function loadScript(src, onload) {
    var script = document.createElement('script');
    script.src = src;
    script.onload = function() {
        log('loaded resource:', src);
        if (onload) onload();
    };
    document.documentElement.appendChild(script);
}

function capturePartOfScreen(args) {
    var connection = args.connection;
    var element = args.element;

    if (!window.html2canvas) {
        return loadScript(connection.resources.html2canvas, function() {
            capturePartOfScreen(args);
        });
    }

    if (isString(element)) {
        element = document.querySelector(element);
        if (!element) element = document.getElementById(element);
    }
    if (!element) throw 'HTML DOM Element is not accessible!';

    // todo: store DOM element somewhere to minimize DOM querying issues

    // html2canvas.js is used to take screenshots
    html2canvas(element, {
        onrendered: function(canvas) {
            args.callback(canvas.toDataURL());
        }
    });
}

function initFileBufferReader(connection, callback) {
    if (!window.FileBufferReader) {
        loadScript(connection.resources.FileBufferReader, function() {
            initFileBufferReader(connection, callback);
        });
        return;
    }

    function _private(chunk) {
        chunk.userid = chunk.extra.userid;
        return chunk;
    }

    var fileBufferReader = new FileBufferReader();
    fileBufferReader.onProgress = function(chunk) {
        connection.onFileProgress(_private(chunk), chunk.uuid);
    };

    fileBufferReader.onBegin = function(file) {
        connection.onFileStart(_private(file));
    };

    fileBufferReader.onEnd = function(file) {
        connection.onFileEnd(_private(file));
    };

    callback(fileBufferReader);
}

var screenFrame, loadedScreenFrame;

function loadScreenFrame(skip) {
    if (DetectRTC.screen.extensionid != ReservedExtensionID) {
        return;
    }

    if (loadedScreenFrame) return;
    if (!skip) return loadScreenFrame(true);

    loadedScreenFrame = true;

    var iframe = document.createElement('iframe');
    iframe.onload = function() {
        iframe.isLoaded = true;
        log('Screen Capturing frame is loaded.');
    };
    iframe.src = 'https://www.webrtc-experiment.com/getSourceId/';
    iframe.style.display = 'none';
    (document.body || document.documentElement).appendChild(iframe);

    screenFrame = {
        postMessage: function() {
            if (!iframe.isLoaded) {
                setTimeout(screenFrame.postMessage, 100);
                return;
            }
            iframe.contentWindow.postMessage({
                captureSourceId: true
            }, '*');
        }
    };
}

var iceFrame, loadedIceFrame;

function loadIceFrame(callback, skip) {
    if (loadedIceFrame) return;
    if (!skip) return loadIceFrame(callback, true);

    loadedIceFrame = true;

    var iframe = document.createElement('iframe');
    iframe.onload = function() {
        iframe.isLoaded = true;

        listenEventHandler('message', iFrameLoaderCallback);

        function iFrameLoaderCallback(event) {
            if (!event.data || !event.data.iceServers) return;
            callback(event.data.iceServers);

            // this event listener is no more needed
            window.removeEventListener('message', iFrameLoaderCallback);
        }

        iframe.contentWindow.postMessage('get-ice-servers', '*');
    };
    iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
    iframe.style.display = 'none';
    (document.body || document.documentElement).appendChild(iframe);
}

function muteOrUnmute(e) {
    var stream = e.stream,
        root = e.root,
        session = e.session || {},
        enabled = e.enabled;

    if (!session.audio && !session.video) {
        if (!isString(session)) {
            session = merge(session, {
                audio: true,
                video: true
            });
        } else {
            session = {
                audio: true,
                video: true
            };
        }
    }

    // implementation from #68
    if (session.type) {
        if (session.type == 'remote' && root.type != 'remote') return;
        if (session.type == 'local' && root.type != 'local') return;
    }

    log(enabled ? 'Muting' : 'UnMuting', 'session', toStr(session));

    // enable/disable audio/video tracks

    if (root.type == 'local' && session.audio && !!stream.getAudioTracks) {
        var audioTracks = stream.getAudioTracks()[0];
        if (audioTracks)
            audioTracks.enabled = !enabled;
    }

    if (root.type == 'local' && (session.video || session.screen) && !!stream.getVideoTracks) {
        var videoTracks = stream.getVideoTracks()[0];
        if (videoTracks)
            videoTracks.enabled = !enabled;
    }

    root.sockets.forEach(function(socket) {
        if (root.type == 'local') {
            socket.send({
                streamid: root.streamid,
                mute: !!enabled,
                unmute: !enabled,
                session: session
            });
        }

        if (root.type == 'remote') {
            socket.send({
                promptMuteUnmute: true,
                streamid: root.streamid,
                mute: !!enabled,
                unmute: !enabled,
                session: session
            });
        }
    });

    if (root.type == 'remote') return;

    // According to issue #135, onmute/onumute must be fired for self
    // "fakeObject" is used because we need to keep session for renegotiated streams; 
    // and MUST pass exact session over onStreamEndedHandler/onmute/onhold/etc. events.
    var fakeObject = merge({}, root);
    fakeObject.session = session;

    fakeObject.isAudio = !!fakeObject.session.audio && !fakeObject.session.video;
    fakeObject.isVideo = !!fakeObject.session.video;
    fakeObject.isScreen = !!fakeObject.session.screen;

    if (!!enabled) {
        // if muted stream is negotiated
        stream.preMuted = {
            audio: stream.getAudioTracks().length && !stream.getAudioTracks()[0].enabled,
            video: stream.getVideoTracks().length && !stream.getVideoTracks()[0].enabled
        };
        root.rtcMultiConnection.onmute(fakeObject);
    }

    if (!enabled) {
        stream.preMuted = {};
        root.rtcMultiConnection.onunmute(fakeObject);
    }
}

var Firefox_Screen_Capturing_Warning = 'Make sure that you are using Firefox Nightly and you enabled: media.getusermedia.screensharing.enabled flag from about:config page. You also need to add your domain in "media.getusermedia.screensharing.allowed_domains" flag. If you are using WinXP then also enable "media.getusermedia.screensharing.allow_on_old_platforms" flag. NEVER forget to use "only" HTTPs for screen capturing!';
var SCREEN_COMMON_FAILURE = 'HTTPs i.e. SSL-based URI is mandatory to use screen capturing.';
var ReservedExtensionID = 'ajhifddimkapgcifgcodmmfdlknahffk';

// if application-developer deployed his own extension on Google App Store
var useCustomChromeExtensionForScreenCapturing = document.domain.indexOf('webrtc-experiment.com') != -1;

function initHark(args) {
    if (!window.hark) {
        loadScript(args.connection.resources.hark, function() {
            initHark(args);
        });
        return;
    }

    var connection = args.connection;
    var streamedObject = args.streamedObject;
    var stream = args.stream;

    var options = {};
    var speechEvents = hark(stream, options);

    speechEvents.on('speaking', function() {
        if (connection.onspeaking) {
            connection.onspeaking(streamedObject);
        }
    });

    speechEvents.on('stopped_speaking', function() {
        if (connection.onsilence) {
            connection.onsilence(streamedObject);
        }
    });

    speechEvents.on('volume_change', function(volume, threshold) {
        if (connection.onvolumechange) {
            connection.onvolumechange(merge({
                volume: volume,
                threshold: threshold
            }, streamedObject));
        }
    });
}

attachEventListener = function(video, type, listener, useCapture) {
    video.addEventListener(type, listener, useCapture);
};

var Plugin = window.PluginRTC || {};
window.onPluginRTCInitialized = function(pluginRTCObject) {
    Plugin = pluginRTCObject;
    MediaStreamTrack = Plugin.MediaStreamTrack;
    RTCPeerConnection = Plugin.RTCPeerConnection;
    RTCIceCandidate = Plugin.RTCIceCandidate;
    RTCSessionDescription = Plugin.RTCSessionDescription;

    log(isPluginRTC ? 'Java-Applet' : 'ActiveX', 'plugin has been loaded.');
};
if (!isEmpty(Plugin)) window.onPluginRTCInitialized(Plugin);

// if IE or Safari
if (isPluginRTC) {
    loadScript('https://cdn.webrtc-experiment.com/Plugin.EveryWhere.js');
    // loadScript('https://cdn.webrtc-experiment.com/Plugin.Temasys.js');
}

var MediaStream = window.MediaStream;

if (typeof MediaStream === 'undefined' && typeof webkitMediaStream !== 'undefined') {
    MediaStream = webkitMediaStream;
}

/*global MediaStream:true */
if (typeof MediaStream !== 'undefined' && !('stop' in MediaStream.prototype)) {
    MediaStream.prototype.stop = function() {
        this.getAudioTracks().forEach(function(track) {
            track.stop();
        });

        this.getVideoTracks().forEach(function(track) {
            track.stop();
        });
    };
}
