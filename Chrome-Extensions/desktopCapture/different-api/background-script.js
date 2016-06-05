// this background script is used to invoke desktopCapture API
// to capture screen-MediaStream.

var screenOptions = ['screen', 'window'];

chrome.runtime.onMessageExternal.addListener(function(message, sender, callback) {
    console.log(message);

    if (message == 'get-sourceId') {
        chrome.desktopCapture.chooseDesktopMedia(screenOptions, sender.tab, onAccessApproved);
        return;
    }

    if(!!message.screenOptions) {
        screenOptions = message.screenOptions;
    }

    if (message.getSourceId && message.requestURL) {
        // via code.google.com/p/chromium/issues/detail?id=425344
        sender.tab.url = message.requestURL;
        chrome.desktopCapture.chooseDesktopMedia(screenOptions, sender.tab, onAccessApproved);
    }

    if(message === 'are-you-there') {
        callback('rtcmulticonnection-extension-loaded');
    }

    // on getting sourceId
    // "sourceId" will be empty if permission is denied.
    function onAccessApproved(sourceId) {
        console.log('sourceId', sourceId);

        // if "cancel" button is clicked
        if (!sourceId || !sourceId.length || chrome.runtime.lastError) {
            return callback('PermissionDeniedError');
        }

        // "ok" button is clicked; share "sourceId" with the
        // content-script which will forward it to the webpage
        callback({
            sourceId: sourceId
        });
    }
});
