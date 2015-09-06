// Last time updated at August 17, 2015, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/DetectRTC.js

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/DetectRTC
// ____________
// DetectRTC.js

// DetectRTC.hasWebcam (has webcam device!)
// DetectRTC.hasMicrophone (has microphone device!)
// DetectRTC.hasSpeakers (has speakers!)
// DetectRTC.isScreenCapturingSupported
// DetectRTC.isSctpDataChannelsSupported
// DetectRTC.isRtpDataChannelsSupported
// DetectRTC.isAudioContextSupported
// DetectRTC.isWebRTCSupported
// DetectRTC.isDesktopCapturingSupported
// DetectRTC.isMobileDevice
// DetectRTC.isWebSocketsSupported

// DetectRTC.DetectLocalIPAddress(callback)

// ----------todo: add
// DetectRTC.videoResolutions
// DetectRTC.screenResolutions

(function() {
    'use strict';

    function warn(log) {
        if (window.console && typeof window.console.warn !== 'undefined') {
            console.warn(log);
        }
    }

    // detect node-webkit
    var browser = getBrowserInfo();

    // is this a chromium browser (opera or chrome)
    var isOpera = !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
    var isFirefox = typeof InstallTrigger !== 'undefined';
    var isSafari = Object.prototype.toString.call(window.HTMLElement).indexOf('Constructor') > 0;
    var isChrome = !!window.chrome && !isOpera;
    var isIE = !!document.documentMode;

    var isMobileDevice = !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i);

    // detect node-webkit
    var isNodeWebkit = !!(window.process && (typeof window.process === 'object') && window.process.versions && window.process.versions['node-webkit']);

    var isHTTPs = location.protocol === 'https:';

    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        // Firefox 38+ seems having support of enumerateDevices
        // Thanks @xdumaine/enumerateDevices
        navigator.enumerateDevices = function(callback) {
            navigator.mediaDevices.enumerateDevices().then(callback);
        };
    }

    window.DetectRTC = {
        browser: browser,
        hasMicrophone: navigator.enumerateDevices ? false : 'unable to detect',
        hasSpeakers: navigator.enumerateDevices ? false : 'unable to detect',
        hasWebcam: navigator.enumerateDevices ? false : 'unable to detect',

        isWebRTCSupported: !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection,
        isAudioContextSupported: (!!window.AudioContext && !!window.AudioContext.prototype.createMediaStreamSource) || (!!window.webkitAudioContext && !!window.webkitAudioContext.prototype.createMediaStreamSource),

        isScreenCapturingSupported: (isFirefox && browser.version >= 33) ||
            (isChrome && browser.version >= 26 && (isNodeWebkit ? true : location.protocol === 'https:')),

        isDesktopCapturingSupported: isHTTPs && ((isFirefox && browser.version >= 33) || (isChrome && browser.version >= 34) || isNodeWebkit || false),

        isSctpDataChannelsSupported: isFirefox || (isChrome && browser.version >= 25),
        isRtpDataChannelsSupported: isChrome && browser.version >= 31,
        isMobileDevice: !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i),
        isWebSocketsSupported: 'WebSocket' in window && 2 === window.WebSocket.CLOSING,
        isCanvasCaptureStreamSupported: false,
        isVideoCaptureStreamSupported: false
    };

    (function detectCanvasCaptureStream() {
        // latest Firefox nighly is supporting this "awesome" feature!
        var canvas = document.createElement('canvas');

        if (typeof canvas.captureStream === 'function') {
            DetectRTC.isCanvasCaptureStreamSupported = true;
        } else if (typeof canvas.mozCaptureStream === 'function') {
            DetectRTC.isCanvasCaptureStreamSupported = true;
        } else if (typeof canvas.webkitCaptureStream === 'function') {
            DetectRTC.isCanvasCaptureStreamSupported = true;
        }
    })();

    (function detectVideoCaptureStream() {
        var video = document.createElement('video');
        if (typeof video.captureStream === 'function') {
            DetectRTC.isVideoCaptureStreamSupported = true;
        } else if (typeof video.mozCaptureStream === 'function') {
            DetectRTC.isVideoCaptureStreamSupported = true;
        } else if (typeof video.webkitCaptureStream === 'function') {
            DetectRTC.isVideoCaptureStreamSupported = true;
        }
    })();

    if (!isHTTPs) {
        window.DetectRTC.isScreenCapturingSupported =
            window.DetectRTC.isDesktopCapturingSupported = 'Requires HTTPs.';
    }

    DetectRTC.browser = {
        isFirefox: isFirefox,
        isChrome: isChrome,
        isMobileDevice: isMobileDevice,
        isNodeWebkit: isNodeWebkit,
        isSafari: isSafari,
        isIE: isIE,
        isOpera: isOpera,
        name: browser.name,
        version: browser.version
    };

    var osName = 'Unknown OS';

    if (navigator.appVersion.indexOf('Win') !== -1) {
        osName = 'Windows';
    }

    if (navigator.appVersion.indexOf('Mac') !== -1) {
        osName = 'MacOS';
    }

    if (navigator.appVersion.indexOf('X11') !== -1) {
        osName = 'UNIX';
    }

    if (navigator.appVersion.indexOf('Linux') !== -1) {
        osName = 'Linux';
    }

    DetectRTC.osName = osName;

    DetectRTC.MediaDevices = [];

    if (!navigator.enumerateDevices) {
        warn('navigator.enumerateDevices API are not available.');
    }

    if (!navigator.enumerateDevices && (!window.MediaStreamTrack || !window.MediaStreamTrack.getSources)) {
        warn('MediaStreamTrack.getSources are not available.');
    }

    // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
    // todo: switch to enumerateDevices when landed in canary.
    function CheckDeviceSupport(callback) {
        // This method is useful only for Chrome!

        if (!navigator.enumerateDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
            navigator.enumerateDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
        }

        if (!navigator.enumerateDevices && navigator.enumerateDevices) {
            navigator.enumerateDevices = navigator.enumerateDevices.bind(navigator);
        }

        if (!navigator.enumerateDevices) {
            warn('navigator.enumerateDevices is undefined.');
            // assuming that it is older chrome or chromium implementation
            if (isChrome) {
                DetectRTC.hasMicrophone = true;
                DetectRTC.hasSpeakers = true;
                DetectRTC.hasWebcam = true;
            }

            if (callback) {
                callback();
            }
            return;
        }

        DetectRTC.MediaDevices = [];
        navigator.enumerateDevices(function(devices) {
            devices.forEach(function(_device) {
                var device = {};
                for (var d in _device) {
                    device[d] = _device[d];
                }

                var skip;
                DetectRTC.MediaDevices.forEach(function(d) {
                    if (d.id === device.id) {
                        skip = true;
                    }
                });

                if (skip) {
                    return;
                }

                // if it is MediaStreamTrack.getSources
                if (device.kind === 'audio') {
                    device.kind = 'audioinput';
                }

                if (device.kind === 'video') {
                    device.kind = 'videoinput';
                }

                if (!device.deviceId) {
                    device.deviceId = device.id;
                }

                if (!device.id) {
                    device.id = device.deviceId;
                }

                if (!device.label) {
                    device.label = 'Please invoke getUserMedia once.';
                }

                if (device.kind === 'audioinput' || device.kind === 'audio') {
                    DetectRTC.hasMicrophone = true;
                }

                if (device.kind === 'audiooutput') {
                    DetectRTC.hasSpeakers = true;
                }

                if (device.kind === 'videoinput' || device.kind === 'video') {
                    DetectRTC.hasWebcam = true;
                }

                // there is no 'videoouput' in the spec.

                DetectRTC.MediaDevices.push(device);
            });

            if (callback) {
                callback();
            }
        });
    }

    // check for microphone/camera support!
    new CheckDeviceSupport();
    DetectRTC.load = CheckDeviceSupport;

    function getBrowserInfo() {
        var nVer = navigator.appVersion;
        var nAgt = navigator.userAgent;
        var browserName = navigator.appName;
        var fullVersion = '' + parseFloat(navigator.appVersion);
        var majorVersion = parseInt(navigator.appVersion, 10);
        var nameOffset, verOffset, ix;

        // In Opera, the true version is after 'Opera' or after 'Version'
        if ((verOffset = nAgt.indexOf('Opera')) !== -1) {
            browserName = 'Opera';
            fullVersion = nAgt.substring(verOffset + 6);

            if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                fullVersion = nAgt.substring(verOffset + 8);
            }
        }
        // In MSIE, the true version is after 'MSIE' in userAgent
        else if ((verOffset = nAgt.indexOf('MSIE')) !== -1) {
            browserName = 'IE';
            fullVersion = nAgt.substring(verOffset + 5);
        }
        // In Chrome, the true version is after 'Chrome' 
        else if ((verOffset = nAgt.indexOf('Chrome')) !== -1) {
            browserName = 'Chrome';
            fullVersion = nAgt.substring(verOffset + 7);
        }
        // In Safari, the true version is after 'Safari' or after 'Version' 
        else if ((verOffset = nAgt.indexOf('Safari')) !== -1) {
            browserName = 'Safari';
            fullVersion = nAgt.substring(verOffset + 7);

            if ((verOffset = nAgt.indexOf('Version')) !== -1) {
                fullVersion = nAgt.substring(verOffset + 8);
            }
        }
        // In Firefox, the true version is after 'Firefox' 
        else if ((verOffset = nAgt.indexOf('Firefox')) !== -1) {
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
            name: browserName
        };
    }

    // via: https://github.com/diafygi/webrtc-ips
    DetectRTC.DetectLocalIPAddress = function(callback) {
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
    };

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
        }

        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);

        function handleCandidate(candidate) {
            //match just the IP address
            var ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
            var ipAddress = ipRegex.exec(candidate)[1];

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
})();
