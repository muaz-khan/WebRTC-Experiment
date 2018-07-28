var runtimePort = chrome.runtime.connect({
    name: location.href.replace(/\/|:|#|\?|\$|\^|%|\.|`|~|!|\+|@|\[|\||]|\|*. /g, '').split('\n').join('').split('\r').join('')
});

runtimePort.onMessage.addListener(function(message) {
    if (!message || !message.messageFromContentScript1234) {
        return;
    }
});

var isRecording = false;
chrome.storage.sync.get('isRecording', function(obj) {
    document.getElementById('default-section').style.display = obj.isRecording === 'true' ? 'none' : 'block';
    document.getElementById('stop-section').style.display = obj.isRecording === 'true' ? 'block' : 'none';

    isRecording = obj.isRecording === 'true';

    // auto-stop-recording
    if (isRecording === true) {
        document.getElementById('stop-recording').click();

        chrome.tabs.query({}, function(tabs) {
        var tabIds = [];
        var url = 'chrome-extension://' + chrome.runtime.id + '/video.html';
        for (var i = tabs.length - 1; i >= 0; i--) {
            if (tabs[i].url === url) {
                tabIds.push(tabs[i].id);
                chrome.tabs.update(tabs[i].id, {
                    active: true,
                    url: url
                });
                break;
            }
        }
        if (tabIds.length) {
            chrome.tabs.remove(tabIds);
        }
    });
    }
});

document.getElementById('stop-recording').onclick = function() {
    chrome.storage.sync.set({
        isRecording: 'false' // FALSE
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            stopRecording: true
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
        isRecording: 'true', // TRUE
        enableSpeakers: 'false' // FALSE
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startRecording: true
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
        isRecording: 'true', // TRUE
        enableSpeakers: 'true' // TRUE
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startRecording: true
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
        isRecording: 'true', // TRUE
        enableSpeakers: 'false'
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startRecording: true
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
        isRecording: 'true', // TRUE
        enableSpeakers: 'false'
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startRecording: true
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
        isRecording: 'true', // TRUE
        enableSpeakers: 'false'
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startRecording: true
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
        isRecording: 'true', // TRUE
        enableSpeakers: 'false'
    }, function() {
        runtimePort.postMessage({
            messageFromContentScript1234: true,
            startRecording: true
        });
        window.close();
    });
};

document.getElementById('btn-options').onclick = function(e) {
    e.preventDefault();
    location.href = this.href;
};
