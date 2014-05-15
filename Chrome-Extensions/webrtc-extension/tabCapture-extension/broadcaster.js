/* MIT License: https://webrtc-experiment.appspot.com/licence/ */

window.isStopBroadcasting = false;
chrome.browserAction.onClicked.addListener(toggle);

function toggle() {
    if (localStorage['broadcasting'] == undefined) {
        localStorage.setItem('broadcasting', true);
        window.isStopBroadcasting = false;
        captureTab();

        chrome.contextMenus.update('000007', {
            title: 'Stop sharing this tab.'
        });
        console.log('Tab sharing started...');
    } else {
        window.clientStream && window.clientStream.stop();
        localStorage.removeItem('broadcasting');
        window.isStopBroadcasting = true;

        chrome.browserAction.setIcon({ path: 'images/tabCapture22.png' });

        chrome.contextMenus.update('000007', {
            title: 'Share this tab!'
        });

        console.log('Tab sharing stopped...');
        return;
    }
}

// this method captures tab stream
function captureTab() {
    chrome.tabs.getSelected(null, function(tab) {
        var video_constraints = {
            mandatory: {
                chromeMediaSource: 'tab'
            }
        };
        var constraints = {
            audio: false,
            video: true,
            videoConstraints: video_constraints
        };
        chrome.tabCapture.capture(constraints, function(stream) {
            window.clientStream = stream;
            startBroadcasting(stream);
        });
    });
    chrome.browserAction.setIcon({ path: 'images/pause22.png' });
}

chrome.contextMenus.create({
    title: 'Share this tab!',
    id: '000007'
});
chrome.contextMenus.onClicked.addListener(toggle);