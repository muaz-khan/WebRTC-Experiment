var runtimePort = chrome.runtime.connect({
    name: location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')
});

runtimePort.onMessage.addListener(function(message) {
    if (!message || !message.messageFromContentScript1234) {
        return;
    }
});

document.getElementById('stop-sharing').onclick = function() {
    chrome.storage.sync.set({
        isSharingOn: 'false' // FALSE
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            stopSharing: true
        });
        window.close();
    });
};

document.getElementById('full-screen').onclick = function() {
    chrome.storage.sync.set({
        enableTabCaptureAPI: 'false',
        enableMicrophone: 'false',
        enableCamera: 'false',
        enableScreen: 'true', // TRUE
        isSharingOn: 'true', // TRUE
        enableSpeakers: 'false' // FALSE
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startSharing: true
        });
        window.close();
    });
};

document.getElementById('full-screen-audio').onclick = function() {
    chrome.storage.sync.set({
        enableTabCaptureAPI: 'false',
        enableMicrophone: 'false',
        enableCamera: 'false',
        enableScreen: 'true', // TRUE
        isSharingOn: 'true', // TRUE
        enableSpeakers: 'true' // TRUE
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startSharing: true
        });
        window.close();
    });
};

document.getElementById('full-screen-audio-microphone').onclick = function() {
    chrome.storage.sync.set({
        enableTabCaptureAPI: 'false',
        enableMicrophone: 'true', // TRUE
        enableCamera: 'false',
        enableScreen: 'true', // TRUE
        isSharingOn: 'true', // TRUE
        enableSpeakers: 'true' // TRUE
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startSharing: true
        });
        window.close();
    });
};

document.getElementById('full-screen-audio-microphone-camera').onclick = function() {
    chrome.storage.sync.set({
        enableTabCaptureAPI: 'false',
        enableMicrophone: 'true', // TRUE
        enableCamera: 'true',
        enableScreen: 'true', // TRUE
        isSharingOn: 'true', // TRUE
        enableSpeakers: 'true' // TRUE
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startSharing: true
        });
        window.close();
    });
};

document.getElementById('selected-tab').onclick = function() {
    chrome.storage.sync.set({
        enableTabCaptureAPI: 'true', // TRUE
        enableMicrophone: 'false',
        enableCamera: 'false',
        enableScreen: 'false',
        isSharingOn: 'true', // TRUE
        enableSpeakers: 'true'
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startSharing: true
        });
        window.close();
    });
};

document.getElementById('microphone-screen').onclick = function() {
    chrome.storage.sync.set({
        enableTabCaptureAPI: 'false',
        enableMicrophone: 'true', // TRUE
        enableCamera: 'false',
        enableScreen: 'true', // TRUE
        isSharingOn: 'true', // TRUE
        enableSpeakers: 'false'
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startSharing: true
        });
        window.close();
    });
};

document.getElementById('microphone-screen-camera').onclick = function() {
    chrome.storage.sync.set({
        enableTabCaptureAPI: 'false',
        enableMicrophone: 'true', // TRUE
        enableCamera: 'true', // TRUE
        enableScreen: 'true', // TRUE
        isSharingOn: 'true', // TRUE
        enableSpeakers: 'false'
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startSharing: true
        });
        window.close();
    });
};

document.getElementById('microphone-webcam').onclick = function() {
    chrome.storage.sync.set({
        enableTabCaptureAPI: 'false',
        enableMicrophone: 'true', // TRUE
        enableCamera: 'true', // TRUE
        enableScreen: 'false', // FALSE
        isSharingOn: 'true', // TRUE
        enableSpeakers: 'false'
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startSharing: true
        });
        window.close();
    });
};

document.getElementById('btn-options').onclick = function(e) {
    e.preventDefault();
    location.href = this.href;
};

var isSharingOn = false;
chrome.storage.sync.get('isSharingOn', function(obj) {
    document.getElementById('default-section').style.display = obj.isSharingOn === 'true' ? 'none' : 'block';
    document.getElementById('stop-section').style.display = obj.isSharingOn === 'true' ? 'block' : 'none';

    isSharingOn = obj.isSharingOn === 'true';

    // auto-stop-sharing
    if (isSharingOn === true) {
        document.getElementById('stop-sharing').click();
    }
});
