function gotStream(stream) {
    if (!stream) {
        setDefaults();

        chrome.windows.create({
            url: "data:text/html,<h1>Internal error occurred while capturing the screen.</h1>",
            type: 'popup',
            width: screen.width / 2,
            height: 170
        });
        return;
    }

    chrome.browserAction.setTitle({
        title: 'Connecting to WebSockets server.'
    });

    chrome.browserAction.disable();

    addStreamStopListener(stream, function() {
        setDefaults();
        // chrome.runtime.reload();
    });

    // as it is reported that if you drag chrome screen's status-bar
    // and scroll up/down the screen-viewer page.
    // chrome auto-stops the screen without firing any 'onended' event.
    // chrome also hides screen status bar.
    chrome.windows.create({
        url: chrome.extension.getURL('_generated_background_page.html'),
        type: 'popup',
        focused: false,
        width: 1,
        height: 1,
        top: parseInt(screen.height),
        left: parseInt(screen.width)
    }, function(win) {
        var background_page_id = win.id;

        setTimeout(function() {
            // chrome.windows.remove(background_page_id);
        }, 3000);
    });

    setupWebRTCConnection(stream);

    chrome.browserAction.setIcon({
        path: 'images/pause22.png'
    });
}
