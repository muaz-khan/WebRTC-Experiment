// background.js

chrome.runtime.onConnect.addListener(function(port) {
    port.onMessage.addListener(portOnMessageHanlder);

    var progressStarted = false;

    function portOnMessageHanlder(message) {
        if (!message || !message.changeIcon) {
            return;
        }

        if (message.defaultIcon) {
            chrome.browserAction.setIcon({
                path: 'images/fileCapture128.png'
            });
            progressStarted = false;
        }

        if (message.path && !progressStarted) {
            progressStarted = true;
            chrome.browserAction.setIcon({
                path: 'images/progress.gif'
            });
        }

        if(message.path){
            setBadgeText(message.percentage);
        }

        if(message.connected) {
            // setBadgeText('conn', message.color);
        }
    }
});

function setBadgeText(percentage, color) {
    chrome.browserAction.setBadgeBackgroundColor({
        color: color || [0, 0, 0, 255]
    });

    chrome.browserAction.setBadgeText({
        text: percentage
    });

    chrome.browserAction.setTitle({
        title: percentage + ' file progress'
    });
}
