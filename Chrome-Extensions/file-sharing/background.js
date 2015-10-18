chrome.browserAction.onClicked.addListener(function() {
    chrome.tabs.create({
        windowId: window.id,
        active: true,
        selected: true,
        url: chrome.extension.getURL("file-sharing.html")
    }, function() { });
});
