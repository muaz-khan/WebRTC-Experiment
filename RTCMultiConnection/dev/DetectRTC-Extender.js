// DetectRTC extender
var screenCallback;

DetectRTC.screen = {
    chromeMediaSource: 'screen',
    extensionid: ReservedExtensionID,
    getSourceId: function(callback) {
        if (!callback) throw '"callback" parameter is mandatory.';

        // make sure that chrome extension is installed.
        if (!!DetectRTC.screen.status) {
            onstatus(DetectRTC.screen.status);
        } else DetectRTC.screen.getChromeExtensionStatus(onstatus);

        function onstatus(status) {
            if (status == 'installed-enabled') {
                screenCallback = callback;
                window.postMessage('get-sourceId', '*');
                return;
            }

            DetectRTC.screen.chromeMediaSource = 'screen';
            callback('No-Response'); // chrome extension isn't available
        }
    },
    onMessageCallback: function(data) {
        if (!(isString(data) || !!data.sourceId)) return;

        log('chrome message', data);

        // "cancel" button is clicked
        if (data == 'PermissionDeniedError') {
            DetectRTC.screen.chromeMediaSource = 'PermissionDeniedError';
            if (screenCallback) return screenCallback('PermissionDeniedError');
            else throw new Error('PermissionDeniedError');
        }

        // extension notified his presence
        if (data == 'rtcmulticonnection-extension-loaded') {
            DetectRTC.screen.chromeMediaSource = 'desktop';
            if (DetectRTC.screen.onScreenCapturingExtensionAvailable) {
                DetectRTC.screen.onScreenCapturingExtensionAvailable();

                // make sure that this event isn't fired multiple times
                DetectRTC.screen.onScreenCapturingExtensionAvailable = null;
            }
        }

        // extension shared temp sourceId
        if (data.sourceId) {
            DetectRTC.screen.sourceId = data.sourceId;
            if (screenCallback) screenCallback(DetectRTC.screen.sourceId);
        }
    },
    getChromeExtensionStatus: function(extensionid, callback) {
        function _callback(status) {
            DetectRTC.screen.status = status;
            callback(status);
        }

        if (isFirefox) return _callback('not-chrome');

        if (arguments.length != 2) {
            callback = extensionid;
            extensionid = this.extensionid;
        }

        var image = document.createElement('img');
        image.src = 'chrome-extension://' + extensionid + '/icon.png';
        image.onload = function() {
            DetectRTC.screen.chromeMediaSource = 'screen';
            window.postMessage('are-you-there', '*');
            setTimeout(function() {
                if (DetectRTC.screen.chromeMediaSource == 'screen') {
                    _callback(
                        DetectRTC.screen.chromeMediaSource == 'desktop' ? 'installed-enabled' : 'installed-disabled' /* if chrome extension isn't permitted for current domain, then it will be installed-disabled all the time even if extension is enabled. */
                    );
                } else _callback('installed-enabled');
            }, 2000);
        };
        image.onerror = function() {
            _callback('not-installed');
        };
    }
};

// if IE
if (!window.addEventListener) {
    window.addEventListener = function(el, eventName, eventHandler) {
        if (!el.attachEvent) return;
        el.attachEvent('on' + eventName, eventHandler);
    };
}

function listenEventHandler(eventName, eventHandler) {
    window.removeEventListener(eventName, eventHandler);
    window.addEventListener(eventName, eventHandler, false);
}

window.addEventListener('message', function(event) {
    if (event.origin != window.location.origin) {
        return;
    }

    DetectRTC.screen.onMessageCallback(event.data);
});
