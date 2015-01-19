// Last time updated at Jan 19, 2015, 08:32:23

// Latest file can be found here: https://cdn.webrtc-experiment.com/DetectRTC.js

// Muaz Khan     - www.MuazKhan.com
// MIT License   - www.WebRTC-Experiment.com/licence
// Documentation - github.com/muaz-khan/WebRTC-Experiment/tree/master/DetectRTC
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

    window.DetectRTC = {
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

    if (!navigator.getMediaDevices) {
        console.warn('navigator.getMediaDevices API are not available.');
    }

    if (!navigator.enumerateDevices) {
        console.warn('navigator.enumerateDevices API are not available.');
    }

    if (!window.MediaStreamTrack || !window.MediaStreamTrack.getSources) {
        console.warn('MediaStreamTrack.getSources are not available.');
    }

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

        if (!navigator.getMediaDevices && window.MediaStreamTrack && window.MediaStreamTrack.getSources) {
            navigator.getMediaDevices = window.MediaStreamTrack.getSources.bind(window.MediaStreamTrack);
        }

        if (!navigator.getMediaDevices && navigator.enumerateDevices) {
            navigator.getMediaDevices = navigator.enumerateDevices.bind(navigator);
        }

        // if still no 'getMediaDevices'; it MUST be Firefox!
        if (!navigator.getMediaDevices) {
            console.warn('navigator.getMediaDevices is undefined.');
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
        navigator.getMediaDevices(function(devices) {
            devices.forEach(function(device) {
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
                    if (location.protocol === 'https:') {
                        device.label = 'Please invoke getUserMedia once.';
                    }

                    if (location.protocol === 'http:') {
                        device.label = 'Plese use HTTPs instead.';
                    }
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

    // via: http://net.ipcalf.com/
    DetectRTC.DetectLocalIPAddress = function(callback) {
        var RTCPeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection;

        (function() {
            var rtc = new RTCPeerConnection({
                iceServers: []
            });

            rtc.createDataChannel('', {
                reliable: false
            });

            rtc.onicecandidate = function(evt) {
                if (evt.candidate) {
                    grepSDP(evt.candidate.candidate);
                }
            };
            rtc.createOffer(function(offerDesc) {
                grepSDP(offerDesc.sdp);
                rtc.setLocalDescription(offerDesc);
            }, function(e) {
                console.warn('offer failed', e);
            }, {
                mandatory: {
                    OfferToReceiveAudio: false,
                    OfferToReceiveVideo: false
                },
                optional: []
            });

            var addrs = Object.create(null);
            addrs['0.0.0.0'] = false;

            function updateDisplay(newAddr) {
                if (newAddr in addrs) {
                    return;
                } else {
                    addrs[newAddr] = true;
                }

                var displayAddrs = Object.keys(addrs).filter(function(k) {
                    return addrs[k];
                });
                callback(displayAddrs.join(' or perhaps ') || 'n/a');
            }

            function grepSDP(sdp) {
                var hosts = [],
                    parts, addr, type;
                sdp.split('\r\n').forEach(function(line) {
                    if (~line.indexOf('candidate:')) {
                        parts = line.split(' ');
                        addr = parts[4];
                        type = parts[7];
                        if (type === 'host') {
                            updateDisplay(addr);
                        }
                    } else if (~line.indexOf('c=')) {
                        parts = line.split(' ');
                        addr = parts[2];
                        updateDisplay(addr);
                    }
                });
            }
        })();
    };
})();
