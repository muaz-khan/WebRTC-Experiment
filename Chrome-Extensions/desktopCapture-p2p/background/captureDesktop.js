function captureDesktop() {
    false && chrome.storage.sync.set({
        isSharingOn: 'false'
    });

    if (connection && connection.attachStreams[0]) {
        setDefaults();

        connection && connection.attachStreams.forEach(function(stream) {
            stream.getTracks().forEach(function(track) {
                track.stop();
            });
        });

        chrome.storage.sync.set({
            enableTabCaptureAPI: 'false',
            enableMicrophone: 'false',
            enableCamera: 'false',
            enableScreen: 'false',
            isSharingOn: 'false',
            enableSpeakers: 'false'
        });
        return;
    }

    chrome.browserAction.setTitle({
        title: 'Capturing Desktop'
    });

    desktop_id = null;
    constraints = null;
    room_password = '';
    room_id = '';
    codecs = 'default';
    bandwidth = null;

    enableTabCaptureAPI = null;
    enableMicrophone = null;
    enableSpeakers = null;
    enableCamera = null;
    enableScreen = null;
    isSharingOn = null;

    streaming_method = 'RTCMultiConnection';

    room_url_box = true;

    chrome.storage.sync.get(null, function(items) {
        var resolutions = {};

        if (items['room_password']) {
            room_password = items['room_password'];
        }

        if (items['room_id']) {
            room_id = items['room_id'];
        }

        if (items['streaming_method']) {
            streaming_method = items['streaming_method'];
        }

        if (items['room_url_box'] === 'false') {
            room_url_box = false;
        }

        if (items['codecs']) {
            codecs = items['codecs'];
        }

        if (items['bandwidth']) {
            bandwidth = items['bandwidth'];
        }

        if (items['enableTabCaptureAPI'] == 'true') {
            enableTabCaptureAPI = items['enableTabCaptureAPI'];
        }

        if (items['enableMicrophone'] == 'true') {
            enableMicrophone = items['enableMicrophone'];
        }

        if (items['enableSpeakers'] == 'true') {
            enableSpeakers = items['enableSpeakers'];
        }

        if (items['enableCamera'] == 'true') {
            enableCamera = items['enableCamera'];
        }

        if (items['enableScreen'] == 'true') {
            enableScreen = items['enableScreen'];
        }

        if (items['enableTabCaptureAPI'] == 'true') {
            enableTabCaptureAPI = items['enableTabCaptureAPI'];
        }

        if (items['isSharingOn'] == 'true') {
            isSharingOn = items['isSharingOn'];
        }

        var _resolutions = items['resolutions'];
        if (!_resolutions) {
            _resolutions = 'fit-screen';
            chrome.storage.sync.set({
                resolutions: 'fit-screen'
            }, function() {});
        }

        if (_resolutions === 'fit-screen') {
            // resolutions.maxWidth = screen.availWidth;
            // resolutions.maxHeight = screen.availHeight;

            resolutions.maxWidth = screen.width;
            resolutions.maxHeight = screen.height;
        }

        if (_resolutions === '4K') {
            resolutions.maxWidth = 3840;
            resolutions.maxHeight = 2160;
        }

        if (_resolutions === '1080p') {
            resolutions.maxWidth = 1920;
            resolutions.maxHeight = 1080;
        }

        if (_resolutions === '720p') {
            resolutions.maxWidth = 1280;
            resolutions.maxHeight = 720;
        }

        if (_resolutions === '480p') {
            resolutions.maxWidth = 853;
            resolutions.maxHeight = 480;
        }

        if (_resolutions === '360p') {
            resolutions.maxWidth = 640;
            resolutions.maxHeight = 360;
        }

        if (_resolutions === '4K') {
            alert('"4K" resolutions is not stable in Chrome. Please try "fit-screen" instead.');
        }

        var sources = ['screen', 'window', 'tab'];

        if (enableSpeakers) {
            sources.push('audio');
        }

        if (enableTabCaptureAPI) {
            captureTabUsingTabCapture(resolutions);
            return;
        }

        if (enableCamera || enableMicrophone) {
            captureCamera(function(stream) {
                if (!enableScreen) {
                    gotStream(stream);
                    return;
                }

                desktop_id = chrome.desktopCapture.chooseDesktopMedia(sources, function(chromeMediaSourceId, opts) {
                    opts = opts || {};
                    opts.resolutions = resolutions;
                    opts.stream = stream;
                    onAccessApproved(chromeMediaSourceId, opts);
                });
            });
            return;
        }

        desktop_id = chrome.desktopCapture.chooseDesktopMedia(sources, function(chromeMediaSourceId, opts) {
            opts = opts || {};
            opts.resolutions = resolutions;
            onAccessApproved(chromeMediaSourceId, opts);
        });
    });
}
