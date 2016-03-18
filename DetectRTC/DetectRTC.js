// Last time updated: 2016-02-26 11:47:17 AM UTC

// Latest file can be found here: https://cdn.webrtc-experiment.com/DetectRTC.js

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/DetectRTC
// ____________
// DetectRTC.js

// DetectRTC.hasWebcam (has webcam device!)
// DetectRTC.hasMicrophone (has microphone device!)
// DetectRTC.hasSpeakers (has speakers!)

(function() {

    'use strict';

    var navigator = window.navigator;

    if (typeof navigator !== 'undefined') {
        if (typeof navigator.webkitGetUserMedia !== 'undefined') {
            navigator.getUserMedia = navigator.webkitGetUserMedia;
        }

        if (typeof navigator.mozGetUserMedia !== 'undefined') {
            navigator.getUserMedia = navigator.mozGetUserMedia;
        }
    } else {
        navigator = {
            getUserMedia: function() {},
            userAgent: 'Fake/5.0 (FakeOS) AppleWebKit/123 (KHTML, like Gecko) Fake/12.3.4567.89 Fake/123.45'
        };
    }

    var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);
    var isEdge = navigator.userAgent.indexOf('Edge') !== -1 && (!!navigator.msSaveOrOpenBlob || !!navigator.msSaveBlob);

    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof window.InstallTrigger !== 'undefined';
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isChrome = !!window.chrome && !isOpera;
    var isIE = !!document.documentMode && !isEdge;

    // this one can also be used:
    // https://www.websocket.org/js/stuff.js (DetectBrowser.js)

    function getBrowserInfo() {
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName = navigator.appName;
        var fullVersion = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // In Opera, the true version is after 'Opera' or after 'Version'
        if (isOpera) {
            browserName = 'Opera';
            try {
                fullVersion = navigator.userAgent.split('OPR/')[1].split(' ')[0];
                majorVersion = fullVersion.split('.')[0];
            } catch (e) {
                fullVersion = '0.0.0.0';
                majorVersion = 0;
            }
        }
        // In MSIE, the true version is after 'MSIE' in userAgent
        else if (isIE) {
            verOffset = nAgt.indexOf('MSIE');
            browserName = 'IE';
            fullVersion = nAgt.substring(verOffset + 5);
        }
        // In Chrome, the true version is after 'Chrome' 
        else if (isChrome) {
            verOffset = nAgt.indexOf('Chrome');
            browserName = 'Chrome';
            fullVersion = nAgt.substring(verOffset + 7);
        }
        // In Safari, the true version is after 'Safari' or after 'Version' 
        else if (isSafari) {
            verOffset = nAgt.indexOf('Safari');
            browserName = 'Safari';
            fullVersion = nAgt.substring(verOffset + 7);

            if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                fullVersion = nAgt.substring(verOffset + 8);
            }
        }
        // In Firefox, the true version is after 'Firefox' 
        else if (isFirefox) {
            verOffset = nAgt.indexOf('Firefox');
            browserName = 'Firefox';
            fullVersion = nAgt.substring(verOffset + 8);
        }

        // In most other browsers, 'name/version' is at the end of userAgent 
        else if ((nameOffset = nAgt.lastIndexOf(' ') + 1) < (verOffset = nAgt.lastIndexOf('/'))) {
            browserName = nAgt.substring(nameOffset, verOffset);
            fullVersion = nAgt.substring(verOffset + 1);

            if (browserName.toLowerCase() === browserName.toUpperCase()) {
                browserName = navigator.appName;
            }
        }

        if (isEdge) {
            browserName = 'Edge';
            // fullVersion = navigator.userAgent.split('Edge/')[1];
            fullVersion = parseInt(navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)[2], 10).toString();
        }

        // trim the fullVersion string at semicolon/space if present
        if ((ix = fullVersion.indexOf(';')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
        }

        if ((ix = fullVersion.indexOf(' ')) !== -1) {
            fullVersion = fullVersion.substring(0, ix);
        }

        majorVersion = parseInt('' + fullVersion, 10);

        if (isNaN(majorVersion)) {
            fullVersion = '' + parseFloat(navigator.appVersion);
            majorVersion = parseInt(navigator.appVersion, 10);
        }

        return {
            fullVersion: fullVersion,
            version: majorVersion,
            name: browserName,
            isPrivateBrowsing: false
        };
    }

    // via: https://gist.github.com/cou929/7973956

    function retry(isDone, next) {
        var currentTrial = 0,
            maxRetry = 50,
            interval = 10,
            isTimeout = false;
        var id = window.setInterval(
            function() {
                if (isDone()) {
                    window.clearInterval(id);
                    next(isTimeout);
                }
                if (currentTrial++ > maxRetry) {
                    window.clearInterval(id);
                    isTimeout = true;
                    next(isTimeout);
                }
            },
            10
        );
    }

    function isIE10OrLater(userAgent) {
        var ua = userAgent.toLowerCase();
        if (ua.indexOf('msie') === 0 && ua.indexOf('trident') === 0) {
            return false;
        }
        var match = /(?:msie|rv:)\s?([\d\.]+)/.exec(ua);
        if (match && parseInt(match[1], 10) >= 10) {
            return true;
        }
        return false;
    }

    function detectPrivateMode(callback) {
        var isPrivate;

        if (window.webkitRequestFileSystem) {
            window.webkitRequestFileSystem(
                window.TEMPORARY, 1,
                function() {
                    isPrivate = false;
                },
                function(e) {
                    console.log(e);
                    isPrivate = true;
                }
            );
        } else if (window.indexedDB && /Firefox/.test(window.navigator.userAgent)) {
            var db;
            try {
                db = window.indexedDB.open('test');
            } catch (e) {
                isPrivate = true;
            }

            if (typeof isPrivate === 'undefined') {
                retry(
                    function isDone() {
                        return db.readyState === 'done' ? true : false;
                    },
                    function next(isTimeout) {
                        if (!isTimeout) {
                            isPrivate = db.result ? false : true;
                        }
                    }
                );
            }
        } else if (isIE10OrLater(window.navigator.userAgent)) {
            isPrivate = false;
            try {
                if (!window.indexedDB) {
                    isPrivate = true;
                }
            } catch (e) {
                isPrivate = true;
            }
        } else if (window.localStorage && /Safari/.test(window.navigator.userAgent)) {
            try {
                window.localStorage.setItem('test', 1);
            } catch (e) {
                isPrivate = true;
            }

            if (typeof isPrivate === 'undefined') {
                isPrivate = false;
                window.localStorage.removeItem('test');
            }
        }

        retry(
            function isDone() {
                return typeof isPrivate !== 'undefined' ? true : false;
            },
            function next(isTimeout) {
                callback(isPrivate);
            }
        );
    }

    var isMobile = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
        },
        getOsName: function() {
            var osName = 'Unknown OS';
            if (isMobile.Android()) {
                osName = 'Android';
            }

            if (isMobile.BlackBerry()) {
                osName = 'BlackBerry';
            }

            if (isMobile.iOS()) {
                osName = 'iOS';
            }

            if (isMobile.Opera()) {
                osName = 'Opera Mini';
            }

            if (isMobile.Windows()) {
                osName = 'Windows';
            }

            return osName;
        }
    };

    // via: http://jsfiddle.net/ChristianL/AVyND/
    function detectDesktopOS() {
        var unknown = '-';

        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;

        var os = unknown;
        var clientStrings = [{
            s: 'Windows 10',
            r: /(Windows 10.0|Windows NT 10.0)/
        }, {
            s: 'Windows 8.1',
            r: /(Windows 8.1|Windows NT 6.3)/
        }, {
            s: 'Windows 8',
            r: /(Windows 8|Windows NT 6.2)/
        }, {
            s: 'Windows 7',
            r: /(Windows 7|Windows NT 6.1)/
        }, {
            s: 'Windows Vista',
            r: /Windows NT 6.0/
        }, {
            s: 'Windows Server 2003',
            r: /Windows NT 5.2/
        }, {
            s: 'Windows XP',
            r: /(Windows NT 5.1|Windows XP)/
        }, {
            s: 'Windows 2000',
            r: /(Windows NT 5.0|Windows 2000)/
        }, {
            s: 'Windows ME',
            r: /(Win 9x 4.90|Windows ME)/
        }, {
            s: 'Windows 98',
            r: /(Windows 98|Win98)/
        }, {
            s: 'Windows 95',
            r: /(Windows 95|Win95|Windows_95)/
        }, {
            s: 'Windows NT 4.0',
            r: /(Windows NT 4.0|WinNT4.0|WinNT|Windows NT)/
        }, {
            s: 'Windows CE',
            r: /Windows CE/
        }, {
            s: 'Windows 3.11',
            r: /Win16/
        }, {
            s: 'Android',
            r: /Android/
        }, {
            s: 'Open BSD',
            r: /OpenBSD/
        }, {
            s: 'Sun OS',
            r: /SunOS/
        }, {
            s: 'Linux',
            r: /(Linux|X11)/
        }, {
            s: 'iOS',
            r: /(iPhone|iPad|iPod)/
        }, {
            s: 'Mac OS X',
            r: /Mac OS X/
        }, {
            s: 'Mac OS',
            r: /(MacPPC|MacIntel|Mac_PowerPC|Macintosh)/
        }, {
            s: 'QNX',
            r: /QNX/
        }, {
            s: 'UNIX',
            r: /UNIX/
        }, {
            s: 'BeOS',
            r: /BeOS/
        }, {
            s: 'OS/2',
            r: /OS\/2/
        }, {
            s: 'Search Bot',
            r: /(nuhk|Googlebot|Yammybot|Openbot|Slurp|MSNBot|Ask Jeeves\/Teoma|ia_archiver)/
        }];
        for (var id in clientStrings) {
            var cs = clientStrings[id];
            if (cs.r.test(nAgt)) {
                os = cs.s;
                break;
            }
        }

        var osVersion = unknown;

        if (/Windows/.test(os)) {
            if (/Windows (.*)/.test(os)) {
                osVersion = /Windows (.*)/.exec(os)[1];
            }
            os = 'Windows';
        }

        switch (os) {
            case 'Mac OS X':
                if (/Mac OS X (10[\.\_\d]+)/.test(nAgt)) {
                    osVersion = /Mac OS X (10[\.\_\d]+)/.exec(nAgt)[1];
                }
                break;
            case 'Android':
                if (/Android ([\.\_\d]+)/.test(nAgt)) {
                    osVersion = /Android ([\.\_\d]+)/.exec(nAgt)[1];
                }
                break;
            case 'iOS':
                if (/OS (\d+)_(\d+)_?(\d+)?/.test(nAgt)) {
                    osVersion = /OS (\d+)_(\d+)_?(\d+)?/.exec(nVer);
                    osVersion = osVersion[1] + '.' + osVersion[2] + '.' + (osVersion[3] | 0);
                }
                break;
        }

        return {
            osName: os,
            osVersion: osVersion
        };
    }

    var osName = 'Unknown OS';
    var osVersion = 'Unknown OS Version';

    if (isMobile.any()) {
        osName = isMobile.getOsName();
    } else {
        var osInfo = detectDesktopOS();
        osName = osInfo.osName;
        osVersion = osInfo.osVersion;
    }

    var isCanvasSupportsStreamCapturing = false;
    var isVideoSupportsStreamCapturing = false;
    ['captureStream', 'mozCaptureStream', 'webkitCaptureStream'].forEach(function(item) {
        if (!isCanvasSupportsStreamCapturing && item in document.createElement('canvas')) {
            isCanvasSupportsStreamCapturing = true;
        }

        if (!isVideoSupportsStreamCapturing && item in document.createElement('video')) {
            isVideoSupportsStreamCapturing = true;
        }
    });

    // via: https://github.com/diafygi/webrtc-ips
    function DetectLocalIPAddress(callback) {
        if (!DetectRTC.isWebRTCSupported) {
            return;
        }

        if (DetectRTC.isORTCSupported) {
            return;
        }

        getIPs(function(ip) {
            //local IPs
            if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
                callback('Local: ' + ip);
            }

            //assume the rest are public IPs
            else {
                callback('Public: ' + ip);
            }
        });
    }

    //get the IP addresses associated with an account
    function getIPs(callback) {
        var ipDuplicates = {};

        //compatibility for firefox and chrome
        var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var useWebKit = !!window.webkitRTCPeerConnection;

        // bypass naive webrtc blocking using an iframe
        if (!RTCPeerConnection) {
            var iframe = document.getElementById('iframe');
            if (!iframe) {
                //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
                throw 'NOTE: you need to have an iframe in the page right above the script tag.';
            }
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }

        // if still no RTCPeerConnection then it is not supported by the browser so just return
        if (!RTCPeerConnection) {
            return;
        }

        //minimal requirements for data connection
        var mediaConstraints = {
            optional: [{
                RtpDataChannels: true
            }]
        };

        //firefox already has a default stun server in about:config
        //    media.peerconnection.default_iceservers =
        //    [{"url": "stun:stun.services.mozilla.com"}]
        var servers;

        //add same stun server for chrome
        if (useWebKit) {
            servers = {
                iceServers: [{
                    urls: 'stun:stun.services.mozilla.com'
                }]
            };

            if (typeof DetectRTC !== 'undefined' && DetectRTC.browser.isFirefox && DetectRTC.browser.version <= 38) {
                servers[0] = {
                    url: servers[0].urls
                };
            }
        }

        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);

        function handleCandidate(candidate) {
            //match just the IP address
            var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
            var match = ipRegex.exec(candidate);
            if (!match) {
                console.warn('Could not match IP address in', candidate);
                return;
            }
            var ipAddress = match[1];

            //remove duplicates
            if (ipDuplicates[ipAddress] === undefined) {
                callback(ipAddress);
            }

            ipDuplicates[ipAddress] = true;
        }

        //listen for candidate events
        pc.onicecandidate = function(ice) {
            //skip non-candidate events
            if (ice.candidate) {
                handleCandidate(ice.candidate.candidate);
            }
        };

        //create a bogus data channel
        pc.createDataChannel('');

        //create an offer sdp
        pc.createOffer(function(result) {

            //trigger the stun server request
            pc.setLocalDescription(result, function() {}, function() {});

        }, function() {});

        //wait for a while to let everything done
        setTimeout(function() {
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');

            lines.forEach(function(line) {
                if (line.indexOf('a=candidate:') === 0) {
                    handleCandidate(line);
                }
            });
        }, 1000);
    }

    var MediaDevices = [];

    var audioInputDevices = [];
    var audioOutputDevices = [];
    var videoInputDevices = [];

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        // Firefox 38+ seems having support of enumerateDevices
        // Thanks @xdumaine/enumerateDevices
        navigator.enumerateDevices = function(callback) {
            navigator.mediaDevices.enumerateDevices().then(callback);
        };
    }

    // ---------- Media Devices detection
    var canEnumerate = false;

    /*global MediaStreamTrack:true */
    if (typeof MediaStreamTrack !== 'undefined' && 'getSources' in MediaStreamTrack) {
        canEnumerate = true;
    } else if (navigator.mediaDevices && !!navigator.mediaDevices.enumerateDevices) {
        canEnumerate = true;
    }

    var hasMicrophone = false;
    var hasSpeakers = false;
    var hasWebcam = false;

    var isWebsiteHasMicrophonePermissions = false;
    var isWebsiteHasWebcamPermissions = false;

    // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
    // todo: switch to enumerateDevices when landed in canary.
    function checkDeviceSupport(callback) {
        if (!canEnumerate) {
            return;
        }

        // This method is useful only for Chrome!

        if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
            navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
        }

        if (!navigator.enumerateDevices && navigator.enumerateDevices) {
            navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
        }

        if (!navigator.enumerateDevices) {
            if (callback) {
                callback();
            }
            return;
        }

        MediaDevices = [];

        audioInputDevices = [];
        audioOutputDevices = [];
        videoInputDevices = [];

        navigator.enumerateDevices(function(devices) {
            devices.forEach(function(_device) {
                var device = {};
                for (var d in _device) {
                    device[d] = _device[d];
                }

                // if it is MediaStreamTrack.getSources
                if (device.kind === 'audio') {
                    device.kind = 'audioinput';
                }

                if (device.kind === 'video') {
                    device.kind = 'videoinput';
                }

                var skip;
                MediaDevices.forEach(function(d) {
                    if (d.id === device.id && d.kind === device.kind) {
                        skip = true;
                    }
                });

                if (skip) {
                    return;
                }

                if (!device.deviceId) {
                    device.deviceId = device.id;
                }

                if (!device.id) {
                    device.id = device.deviceId;
                }

                if (!device.label) {
                    device.label = 'Please invoke getUserMedia once.';
                    if (location.protocol !== 'https:') {
                        if (document.domain.search && document.domain.search(/localhost|127.0./g) === -1) {
                            device.label = 'HTTPs is required to get label of this ' + device.kind + ' device.';
                        }
                    }
                } else {
                    if (device.kind === 'videoinput' && !isWebsiteHasWebcamPermissions) {
                        isWebsiteHasWebcamPermissions = true;
                    }

                    if (device.kind === 'audioinput' && !isWebsiteHasMicrophonePermissions) {
                        isWebsiteHasMicrophonePermissions = true;
                    }
                }

                if (device.kind === 'audioinput') {
                    hasMicrophone = true;

                    if (audioInputDevices.indexOf(device) === -1) {
                        audioInputDevices.push(device);
                    }
                }

                if (device.kind === 'audiooutput') {
                    hasSpeakers = true;

                    if (audioOutputDevices.indexOf(device) === -1) {
                        audioOutputDevices.push(device);
                    }
                }

                if (device.kind === 'videoinput') {
                    hasWebcam = true;

                    if (videoInputDevices.indexOf(device) === -1) {
                        videoInputDevices.push(device);
                    }
                }

                // there is no 'videoouput' in the spec.

                if (MediaDevices.indexOf(device) === -1) {
                    MediaDevices.push(device);
                }
            });

            if (typeof DetectRTC !== 'undefined') {
                // to sync latest outputs
                DetectRTC.MediaDevices = MediaDevices;
                DetectRTC.hasMicrophone = hasMicrophone;
                DetectRTC.hasSpeakers = hasSpeakers;
                DetectRTC.hasWebcam = hasWebcam;

                DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
                DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;

                DetectRTC.audioInputDevices = audioInputDevices;
                DetectRTC.audioOutputDevices = audioOutputDevices;
                DetectRTC.videoInputDevices = videoInputDevices;
            }

            if (callback) {
                callback();
            }
        });
    }

    // check for microphone/camera support!
    checkDeviceSupport();

    var DetectRTC = window.DetectRTC || {};

    // ----------
    // DetectRTC.browser.name || DetectRTC.browser.version || DetectRTC.browser.fullVersion
    DetectRTC.browser = getBrowserInfo();

    detectPrivateMode(function(isPrivateBrowsing) {
        DetectRTC.browser.isPrivateBrowsing = !!isPrivateBrowsing;
    });

    // DetectRTC.isChrome || DetectRTC.isFirefox || DetectRTC.isEdge
    DetectRTC.browser['is' + DetectRTC.browser.name] = true;

    var isNodeWebkit = !!(window.process && (typeof window.process === 'object') && window.process.versions && window.process.versions['node-webkit']);

    // --------- Detect if system supports WebRTC 1.0 or WebRTC 1.1.
    var isWebRTCSupported = false;
    ['RTCPeerConnection', 'webkitRTCPeerConnection', 'mozRTCPeerConnection', 'RTCIceGatherer'].forEach(function(item) {
        if (isWebRTCSupported) {
            return;
        }

        if (item in window) {
            isWebRTCSupported = true;
        }
    });
    DetectRTC.isWebRTCSupported = isWebRTCSupported;

    //-------
    DetectRTC.isORTCSupported = typeof RTCIceGatherer !== 'undefined';

    // --------- Detect if system supports screen capturing API
    var isScreenCapturingSupported = false;
    if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 35) {
        isScreenCapturingSupported = true;
    } else if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 34) {
        isScreenCapturingSupported = true;
    }

    if (location.protocol !== 'https:') {
        isScreenCapturingSupported = false;
    }
    DetectRTC.isScreenCapturingSupported = isScreenCapturingSupported;

    // --------- Detect if WebAudio API are supported
    var webAudio = {
        isSupported: false,
        isCreateMediaStreamSourceSupported: false
    };

    ['AudioContext', 'webkitAudioContext', 'mozAudioContext', 'msAudioContext'].forEach(function(item) {
        if (webAudio.isSupported) {
            return;
        }

        if (item in window) {
            webAudio.isSupported = true;

            if ('createMediaStreamSource' in window[item].prototype) {
                webAudio.isCreateMediaStreamSourceSupported = true;
            }
        }
    });
    DetectRTC.isAudioContextSupported = webAudio.isSupported;
    DetectRTC.isCreateMediaStreamSourceSupported = webAudio.isCreateMediaStreamSourceSupported;

    // ---------- Detect if SCTP/RTP channels are supported.

    var isRtpDataChannelsSupported = false;
    if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 31) {
        isRtpDataChannelsSupported = true;
    }
    DetectRTC.isRtpDataChannelsSupported = isRtpDataChannelsSupported;

    var isSCTPSupportd = false;
    if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 28) {
        isSCTPSupportd = true;
    } else if (DetectRTC.browser.isChrome && DetectRTC.browser.version > 25) {
        isSCTPSupportd = true;
    } else if (DetectRTC.browser.isOpera && DetectRTC.browser.version >= 11) {
        isSCTPSupportd = true;
    }
    DetectRTC.isSctpDataChannelsSupported = isSCTPSupportd;

    // ---------

    DetectRTC.isMobileDevice = isMobileDevice; // "isMobileDevice" boolean is defined in "getBrowserInfo.js"

    // ------
    var isGetUserMediaSupported = false;
    if (navigator.getUserMedia) {
        isGetUserMediaSupported = true;
    } else if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        isGetUserMediaSupported = true;
    }
    if (DetectRTC.browser.isChrome && DetectRTC.browser.version >= 46 && location.protocol !== 'https:') {
        DetectRTC.isGetUserMediaSupported = 'Requires HTTPs';
    }
    DetectRTC.isGetUserMediaSupported = isGetUserMediaSupported;

    // -----------
    DetectRTC.osName = osName;
    DetectRTC.osVersion = osVersion;

    var displayResolution = '';
    if (screen.width) {
        var width = (screen.width) ? screen.width : '';
        var height = (screen.height) ? screen.height : '';
        displayResolution += '' + width + ' x ' + height;
    }
    DetectRTC.displayResolution = displayResolution;

    // ----------
    DetectRTC.isCanvasSupportsStreamCapturing = isCanvasSupportsStreamCapturing;
    DetectRTC.isVideoSupportsStreamCapturing = isVideoSupportsStreamCapturing;

    // ------
    DetectRTC.DetectLocalIPAddress = DetectLocalIPAddress;

    DetectRTC.isWebSocketsSupported = 'WebSocket' in window && 2 === window.WebSocket.CLOSING;
    DetectRTC.isWebSocketsBlocked = !DetectRTC.isWebSocketsSupported;

    DetectRTC.checkWebSocketsSupport = function(callback) {
        callback = callback || function() {};
        try {
            var websocket = new WebSocket('wss://echo.websocket.org:443/');
            websocket.onopen = function() {
                DetectRTC.isWebSocketsBlocked = false;
                callback();
                websocket.close();
                websocket = null;
            };
            websocket.onerror = function() {
                DetectRTC.isWebSocketsBlocked = true;
                callback();
            };
        } catch (e) {
            DetectRTC.isWebSocketsBlocked = true;
            callback();
        }
    };

    // -------
    DetectRTC.load = function(callback) {
        callback = callback || function() {};
        checkDeviceSupport(callback);
    };

    DetectRTC.MediaDevices = MediaDevices;
    DetectRTC.hasMicrophone = hasMicrophone;
    DetectRTC.hasSpeakers = hasSpeakers;
    DetectRTC.hasWebcam = hasWebcam;

    DetectRTC.isWebsiteHasWebcamPermissions = isWebsiteHasWebcamPermissions;
    DetectRTC.isWebsiteHasMicrophonePermissions = isWebsiteHasMicrophonePermissions;

    DetectRTC.audioInputDevices = audioInputDevices;
    DetectRTC.audioOutputDevices = audioOutputDevices;
    DetectRTC.videoInputDevices = videoInputDevices;

    // ------
    var isSetSinkIdSupported = false;
    if ('setSinkId' in document.createElement('video')) {
        isSetSinkIdSupported = true;
    }
    DetectRTC.isSetSinkIdSupported = isSetSinkIdSupported;

    // -----
    var isRTPSenderReplaceTracksSupported = false;
    if (DetectRTC.browser.isFirefox /*&& DetectRTC.browser.version > 39*/ ) {
        /*global mozRTCPeerConnection:true */
        if ('getSenders' in mozRTCPeerConnection.prototype) {
            isRTPSenderReplaceTracksSupported = true;
        }
    } else if (DetectRTC.browser.isChrome && typeof webkitRTCPeerConnection !== 'undefined') {
        /*global webkitRTCPeerConnection:true */
        if ('getSenders' in webkitRTCPeerConnection.prototype) {
            isRTPSenderReplaceTracksSupported = true;
        }
    }
    DetectRTC.isRTPSenderReplaceTracksSupported = isRTPSenderReplaceTracksSupported;

    //------
    var isRemoteStreamProcessingSupported = false;
    if (DetectRTC.browser.isFirefox && DetectRTC.browser.version > 38) {
        isRemoteStreamProcessingSupported = true;
    }
    DetectRTC.isRemoteStreamProcessingSupported = isRemoteStreamProcessingSupported;

    //-------
    var isApplyConstraintsSupported = false;

    /*global MediaStreamTrack:true */
    if (typeof MediaStreamTrack !== 'undefined' && 'applyConstraints' in MediaStreamTrack.prototype) {
        isApplyConstraintsSupported = true;
    }
    DetectRTC.isApplyConstraintsSupported = isApplyConstraintsSupported;

    //-------
    var isMultiMonitorScreenCapturingSupported = false;
    if (DetectRTC.browser.isFirefox && DetectRTC.browser.version >= 43) {
        // version 43 merely supports platforms for multi-monitors
        // version 44 will support exact multi-monitor selection i.e. you can select any monitor for screen capturing.
        isMultiMonitorScreenCapturingSupported = true;
    }
    DetectRTC.isMultiMonitorScreenCapturingSupported = isMultiMonitorScreenCapturingSupported;

    window.DetectRTC = DetectRTC;

})();
