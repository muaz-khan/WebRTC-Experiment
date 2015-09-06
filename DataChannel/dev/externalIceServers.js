var loadedIceFrame;

function loadIceFrame(callback, skip) {
    if (loadedIceFrame) {
        return;
    }

    if (!skip) {
        return loadIceFrame(callback, true);
    }

    loadedIceFrame = true;

    var iframe = document.createElement('iframe');
    iframe.onload = function() {
        iframe.isLoaded = true;

        listenEventHandler('message', iFrameLoaderCallback);

        function iFrameLoaderCallback(event) {
            if (!event.data || !event.data.iceServers) {
                return;
            }
            callback(event.data.iceServers);

            // this event listener is no more needed
            window.removeEventListener('message', iFrameLoaderCallback);
        }

        iframe.contentWindow.postMessage('get-ice-servers', '*');
    };
    iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
    iframe.style.display = 'none';
    (document.body || document.documentElement).appendChild(iframe);
}

loadIceFrame(function(iceServers) {
    window.iceServers = iceServers;
});
