// Last time updated at Fri Jan 08 2016 14:06

// gumadapter.js
// https://cdn.webrtc-experiment.com/gumadapter.js

// getUserMedia hacks from git/webrtc/adapter; 
// removed redundant codes
// A-to-Zee, all copyrights goes to:
// https://github.com/webrtc/adapter/blob/master/LICENSE.md

var getUserMedia = null;
var webrtcDetectedBrowser = null;
var webrtcDetectedVersion = null;
var webrtcMinimumVersion = null;

var webrtcUtils = window.webrtcUtils || {};
if (!webrtcUtils.enableLogs) {
    webrtcUtils.enableLogs = true;
}
if (!webrtcUtils.log) {
    webrtcUtils.log = function() {
        if (!webrtcUtils.enableLogs) {
            return;
        }

        // suppress console.log output when being included as a module.
        if (typeof module !== 'undefined' ||
            typeof require === 'function' && typeof define === 'function') {
            return;
        }
        console.log.apply(console, arguments);
    };
}

if (!webrtcUtils.extractVersion) {
    webrtcUtils.extractVersion = function(uastring, expr, pos) {
        var match = uastring.match(expr);
        return match && match.length >= pos && parseInt(match[pos], 10);
    };
}

if (typeof window === 'object') {
    if (window.HTMLMediaElement &&
        !('srcObject' in window.HTMLMediaElement.prototype)) {
        // Shim the srcObject property, once, when HTMLMediaElement is found.
        Object.defineProperty(window.HTMLMediaElement.prototype, 'srcObject', {
            get: function() {
                // If prefixed srcObject property exists, return it.
                // Otherwise use the shimmed property, _srcObject
                return 'mozSrcObject' in this ? this.mozSrcObject : this._srcObject;
            },
            set: function(stream) {
                if ('mozSrcObject' in this) {
                    this.mozSrcObject = stream;
                } else {
                    // Use _srcObject as a private property for this shim
                    this._srcObject = stream;
                    // TODO: revokeObjectUrl(this.src) when !stream to release resources?
                    this.src = stream ? URL.createObjectURL(stream) : null;
                }
            }
        });
    }

    // Proxy existing globals
    getUserMedia = window.navigator && window.navigator.getUserMedia;
}

if (typeof window === 'undefined' || !window.navigator) {
    webrtcDetectedBrowser = 'not a browser';
} else if (navigator.mozGetUserMedia && window.mozRTCPeerConnection) {
    webrtcDetectedBrowser = 'firefox';

    // the detected firefox version.
    webrtcDetectedVersion = webrtcUtils.extractVersion(navigator.userAgent,
        /Firefox\/([0-9]+)\./, 1);

    // the minimum firefox version still supported by adapter.
    webrtcMinimumVersion = 31;

    // getUserMedia constraints shim.
    getUserMedia = function(constraints, onSuccess, onError) {
        var constraintsToFF37 = function(c) {
            if (typeof c !== 'object' || c.require) {
                return c;
            }
            var require = [];
            Object.keys(c).forEach(function(key) {
                if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                    return;
                }
                var r = c[key] = (typeof c[key] === 'object') ?
                    c[key] : {
                        ideal: c[key]
                    };
                if (r.min !== undefined ||
                    r.max !== undefined || r.exact !== undefined) {
                    require.push(key);
                }
                if (r.exact !== undefined) {
                    if (typeof r.exact === 'number') {
                        r.min = r.max = r.exact;
                    } else {
                        c[key] = r.exact;
                    }
                    delete r.exact;
                }
                if (r.ideal !== undefined) {
                    c.advanced = c.advanced || [];
                    var oc = {};
                    if (typeof r.ideal === 'number') {
                        oc[key] = {
                            min: r.ideal,
                            max: r.ideal
                        };
                    } else {
                        oc[key] = r.ideal;
                    }
                    c.advanced.push(oc);
                    delete r.ideal;
                    if (!Object.keys(r).length) {
                        delete c[key];
                    }
                }
            });
            if (require.length) {
                c.require = require;
            }
            return c;
        };
        if (webrtcDetectedVersion < 38) {
            webrtcUtils.log('spec: ' + JSON.stringify(constraints));
            if (constraints.audio) {
                constraints.audio = constraintsToFF37(constraints.audio);
            }
            if (constraints.video) {
                constraints.video = constraintsToFF37(constraints.video);
            }
            webrtcUtils.log('ff37: ' + JSON.stringify(constraints));
        }
        return navigator.mozGetUserMedia(constraints, onSuccess, onError);
    };

    navigator.getUserMedia = getUserMedia;

    // Shim for mediaDevices on older versions.
    if (!navigator.mediaDevices) {
        navigator.mediaDevices = {
            getUserMedia: requestUserMedia,
            addEventListener: function() {},
            removeEventListener: function() {}
        };
    }
    navigator.mediaDevices.enumerateDevices =
        navigator.mediaDevices.enumerateDevices || function() {
            return new Promise(function(resolve) {
                var infos = [{
                    kind: 'audioinput',
                    deviceId: 'default',
                    label: '',
                    groupId: ''
                }, {
                    kind: 'videoinput',
                    deviceId: 'default',
                    label: '',
                    groupId: ''
                }];
                resolve(infos);
            });
        };

    if (webrtcDetectedVersion < 41) {
        // Work around http://bugzil.la/1169665
        var orgEnumerateDevices =
            navigator.mediaDevices.enumerateDevices.bind(navigator.mediaDevices);
        navigator.mediaDevices.enumerateDevices = function() {
            return orgEnumerateDevices().then(undefined, function(e) {
                if (e.name === 'NotFoundError') {
                    return [];
                }
                throw e;
            });
        };
    }

} else if (navigator.webkitGetUserMedia && window.webkitRTCPeerConnection) {
    webrtcDetectedBrowser = 'chrome';

    webrtcDetectedVersion = webrtcUtils.extractVersion(navigator.userAgent,
        /Chrom(e|ium)\/([0-9]+)\./, 2);

    // the minimum chrome version still supported by adapter.
    webrtcMinimumVersion = 38;

    // getUserMedia constraints shim.
    var constraintsToChrome = function(c) {
        if (typeof c !== 'object' || c.mandatory || c.optional) {
            return c;
        }
        var cc = {};
        Object.keys(c).forEach(function(key) {
            if (key === 'require' || key === 'advanced' || key === 'mediaSource') {
                return;
            }
            var r = (typeof c[key] === 'object') ? c[key] : {
                ideal: c[key]
            };
            if (r.exact !== undefined && typeof r.exact === 'number') {
                r.min = r.max = r.exact;
            }
            var oldname = function(prefix, name) {
                if (prefix) {
                    return prefix + name.charAt(0).toUpperCase() + name.slice(1);
                }
                return (name === 'deviceId') ? 'sourceId' : name;
            };
            if (r.ideal !== undefined) {
                cc.optional = cc.optional || [];
                var oc = {};
                if (typeof r.ideal === 'number') {
                    oc[oldname('min', key)] = r.ideal;
                    cc.optional.push(oc);
                    oc = {};
                    oc[oldname('max', key)] = r.ideal;
                    cc.optional.push(oc);
                } else {
                    oc[oldname('', key)] = r.ideal;
                    cc.optional.push(oc);
                }
            }
            if (r.exact !== undefined && typeof r.exact !== 'number') {
                cc.mandatory = cc.mandatory || {};
                cc.mandatory[oldname('', key)] = r.exact;
            } else {
                ['min', 'max'].forEach(function(mix) {
                    if (r[mix] !== undefined) {
                        cc.mandatory = cc.mandatory || {};
                        cc.mandatory[oldname(mix, key)] = r[mix];
                    }
                });
            }
        });
        if (c.advanced) {
            cc.optional = (cc.optional || []).concat(c.advanced);
        }
        return cc;
    };

    getUserMedia = function(constraints, onSuccess, onError) {
        if (constraints.audio) {
            constraints.audio = constraintsToChrome(constraints.audio);
        }
        if (constraints.video) {
            constraints.video = constraintsToChrome(constraints.video);
        }
        webrtcUtils.log('chrome: ' + JSON.stringify(constraints));
        return navigator.webkitGetUserMedia(constraints, onSuccess, onError);
    };
    navigator.getUserMedia = getUserMedia;

    if (!navigator.mediaDevices) {
        navigator.mediaDevices = {
            getUserMedia: requestUserMedia
        };
    }

    // A shim for getUserMedia method on the mediaDevices object.
    // TODO(KaptenJansson) remove once implemented in Chrome stable.
    if (!navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
            return requestUserMedia(constraints);
        };
    } else {
        // Even though Chrome 45 has navigator.mediaDevices and a getUserMedia
        // function which returns a Promise, it does not accept spec-style
        // constraints.
        var origGetUserMedia = navigator.mediaDevices.getUserMedia.
        bind(navigator.mediaDevices);
        navigator.mediaDevices.getUserMedia = function(c) {
            webrtcUtils.log('spec:   ' + JSON.stringify(c)); // whitespace for alignment
            c.audio = constraintsToChrome(c.audio);
            c.video = constraintsToChrome(c.video);
            webrtcUtils.log('chrome: ' + JSON.stringify(c));
            return origGetUserMedia(c);
        };
    }

    // Dummy devicechange event methods.
    // TODO(KaptenJansson) remove once implemented in Chrome stable.
    if (typeof navigator.mediaDevices.addEventListener === 'undefined') {
        navigator.mediaDevices.addEventListener = function() {
            webrtcUtils.log('Dummy mediaDevices.addEventListener called.');
        };
    }
    if (typeof navigator.mediaDevices.removeEventListener === 'undefined') {
        navigator.mediaDevices.removeEventListener = function() {
            webrtcUtils.log('Dummy mediaDevices.removeEventListener called.');
        };
    }

} else if (navigator.mediaDevices && navigator.userAgent.match(/Edge\/(\d+).(\d+)$/)) {
    webrtcUtils.log('This appears to be Edge');
    webrtcDetectedBrowser = 'edge';

    webrtcDetectedVersion = webrtcUtils.extractVersion(navigator.userAgent, /Edge\/(\d+).(\d+)$/, 2);

    // the minimum version still supported by adapter.
    webrtcMinimumVersion = 12;
} else {
    webrtcUtils.log('Browser does not appear to be WebRTC-capable');
}

// Returns the result of getUserMedia as a Promise.
function requestUserMedia(constraints) {
    return new Promise(function(resolve, reject) {
        getUserMedia(constraints, resolve, reject);
    });
}

if (typeof module !== 'undefined') {
    module.exports = {
        getUserMedia: getUserMedia,
        webrtcDetectedBrowser: webrtcDetectedBrowser,
        webrtcDetectedVersion: webrtcDetectedVersion,
        webrtcMinimumVersion: webrtcMinimumVersion,
        webrtcUtils: webrtcUtils
    };
} else if ((typeof require === 'function') && (typeof define === 'function')) {
    // Expose objects and functions when RequireJS is doing the loading.
    define([], function() {
        return {
            getUserMedia: getUserMedia,
            webrtcDetectedBrowser: webrtcDetectedBrowser,
            webrtcDetectedVersion: webrtcDetectedVersion,
            webrtcMinimumVersion: webrtcMinimumVersion,
            webrtcUtils: webrtcUtils
        };
    });
}
