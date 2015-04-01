var DetectRTC = (function() {
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

    var detectRTC = {
        browser: browser,
        hasMicrophone: navigator.getMediaDevices || navigator.enumerateDevices ? false : 'unable to detect',
        hasSpeakers: navigator.getMediaDevices || navigator.enumerateDevices ? false : 'unable to detect',
        hasWebcam: navigator.getMediaDevices || navigator.enumerateDevices ? false : 'unable to detect',

        isWebRTCSupported: !!window.webkitRTCPeerConnection || !!window.mozRTCPeerConnection,
        isAudioContextSupported: (!!window.AudioContext && !!window.AudioContext.prototype.createMediaStreamSource) || (!!window.webkitAudioContext && !!window.webkitAudioContext.prototype.createMediaStreamSource),

        isScreenCapturingSupported: (isFirefox && browser.version >= 33) ||
            (isChrome && browser.version >= 26 && (isNodeWebkit ? true : location.protocol === 'https:')),

        isDesktopCapturingSupported: isHTTPs && ((isFirefox && browser.version >= 33) || (isChrome && browser.version >= 34) || isNodeWebkit || false),

        isSctpDataChannelsSupported: isFirefox || (isChrome && browser.version >= 25),
        isRtpDataChannelsSupported: isChrome && browser.version >= 31,
        isMobileDevice: !!navigator.userAgent.match(/Android|iPhone|iPad|iPod|BlackBerry|IEMobile/i),
        isWebSocketsSupported: 'WebSocket' in window && 2 === window.WebSocket.CLOSING
    };

    if (!isHTTPs) {
        detectRTC.isScreenCapturingSupported = detectRTC.isDesktopCapturingSupported = 'Requires HTTPs.';
    }

    detectRTC.browser = {
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

    detectRTC.osName = osName;

    detectRTC.MediaDevices = [];

    // http://dev.w3.org/2011/webrtc/editor/getusermedia.html#mediadevices
    // todo: switch to enumerateDevices when landed in canary.
    function CheckDeviceSupport(callback) {
        // This method is useful only for Chrome!

        // Firefox seems having no support of enumerateDevices feature.
        // Though there seems some clues of 'navigator.getMediaDevices' implementation.
        if (isFirefox) {
            if (callback) {
                callback();
            }
            return;
        }

        if (!navigator.getMediaDevices && !!window.MediaStreamTrack && !!window.MediaStreamTrack.getSources) {
            navigator.getMediaDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
        }

        if (!navigator.getMediaDevices && navigator.enumerateDevices) {
            navigator.getMediaDevices = navigator.enumerateDevices.bind(navigator);
        }

        // if still no 'getMediaDevices'; it MUST be Firefox!
        if (!navigator.getMediaDevices) {
            // assuming that it is older chrome or chromium implementation
            if (isChrome) {
                detectRTC.hasMicrophone = true;
                detectRTC.hasSpeakers = true;
                detectRTC.hasWebcam = true;
            }

            if (callback) {
                callback();
            }
            return;
        }

        detectRTC.MediaDevices = [];
        navigator.getMediaDevices(function(devices) {
            devices.forEach(function(device) {
                var skip;
                detectRTC.MediaDevices.forEach(function(d) {
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
                    if (location.protocol === 'https:') {
                        device.label = 'Please invoke getUserMedia once.';
                    }

                    if (location.protocol === 'http:') {
                        device.label = 'Plese use HTTPs instead.';
                    }
                }

                if (device.kind === 'audioinput' || device.kind === 'audio') {
                    detectRTC.hasMicrophone = true;
                }

                if (device.kind === 'audiooutput') {
                    detectRTC.hasSpeakers = true;
                }

                if (device.kind === 'videoinput' || device.kind === 'video') {
                    detectRTC.hasWebcam = true;
                }

                // there is no 'videoouput' in the spec.

                detectRTC.MediaDevices.push(device);
            });

            if (callback) {
                callback();
            }
        });
    }

    // check for microphone/camera support!
    new CheckDeviceSupport();
    detectRTC.load = CheckDeviceSupport;

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

    // get the IP addresses associated with an account
    // @credit: https://diafygi.github.io/webrtc-ips/
    function getIPs(callback) {
        var ip_dups = {};

        //compatibility for firefox and chrome
        var RTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        var useWebKit = !!window.webkitRTCPeerConnection;

        // bypass naive webrtc blocking
        if (!RTCPeerConnection) {
            var iframe = document.createElement('iframe');
            //invalidate content script
            iframe.sandbox = 'allow-same-origin';
            iframe.style.display = 'none';
            document.body.appendChild(iframe);
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection || win.mozRTCPeerConnection || win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }

        // minimal requirements for data connection
        var mediaConstraints = {
            optional: [{
                RtpDataChannels: true
            }]
        };

        // firefox already has a default stun server in about:config
        //    media.peerconnection.default_iceservers =
        //    [{"url": "stun:stun.services.mozilla.com"}]
        var servers = undefined;

        //add same stun server for chrome
        if (useWebKit)
            servers = {
                iceServers: [{
                    urls: "stun:stun.services.mozilla.com"
                }]
            };

        //construct a new RTCPeerConnection
        var pc = new RTCPeerConnection(servers, mediaConstraints);

        function handleCandidate(candidate) {
            //match just the IP address
            var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/
            var ip_addr = ip_regex.exec(candidate)[1];

            // remove duplicates
            if (ip_dups[ip_addr] === undefined)
                callback(ip_addr);

            ip_dups[ip_addr] = true;
        }

        //listen for candidate events
        pc.onicecandidate = function(ice) {

            //skip non-candidate events
            if (ice.candidate)
                handleCandidate(ice.candidate.candidate);
        };

        // create a bogus data channel
        pc.createDataChannel("");

        // create an offer sdp
        pc.createOffer(function(result) {

            // trigger the stun server request
            pc.setLocalDescription(result, function() {}, function() {});

        }, function() {});

        // wait for a while to let everything done
        setTimeout(function() {
            //read candidate info from local description
            var lines = pc.localDescription.sdp.split('\n');

            lines.forEach(function(line) {
                if (line.indexOf('a=candidate:') === 0)
                    handleCandidate(line);
            });
        }, 1000);
    }

    detectRTC.DetectLocalIPAddress = detectRTC.DetectIPAddresses = function(callback) {
        getIPs(function(ip) {
            var isLocal = ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/);
            callback((isLocal ? 'Local/System' : 'Modem/Public') + ': ' + ip);
        });
    };

    return detectRTC;
})();
