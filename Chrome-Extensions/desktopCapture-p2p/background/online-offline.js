window.addEventListener('offline', function() {
    if (!connection || !connection.attachStreams.length) return;

    // setDefaults();
    // chrome.runtime.reload();
}, false);

window.addEventListener('online', function() {
    if (!connection) return;

    // setDefaults();
    // chrome.runtime.reload();
}, false);