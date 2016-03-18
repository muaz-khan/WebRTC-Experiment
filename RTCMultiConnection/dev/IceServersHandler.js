// IceServersHandler.js

var iceFrame, loadedIceFrame;

function loadIceFrame(callback, skip) {
    if (loadedIceFrame) return;
    if (!skip) return loadIceFrame(callback, true);

    loadedIceFrame = true;

    var iframe = document.createElement('iframe');
    iframe.onload = function() {
        iframe.isLoaded = true;

        listenEventHandler('message', iFrameLoaderCallback);

        function iFrameLoaderCallback(event) {
            if (!event.data || !event.data.iceServers) return;
            callback(event.data.iceServers);
            window.removeEventListener('message', iFrameLoaderCallback);
        }

        iframe.contentWindow.postMessage('get-ice-servers', '*');
    };
    iframe.src = 'https://cdn.webrtc-experiment.com/getIceServers/';
    iframe.style.display = 'none';
    (document.body || document.documentElement).appendChild(iframe);
}

if (typeof window.getExternalIceServers !== 'undefined' && window.getExternalIceServers == true) {
    loadIceFrame(function(externalIceServers) {
        if (!externalIceServers || !externalIceServers.length) return;
        window.RMCExternalIceServers = externalIceServers;

        if (window.iceServersLoadCallback && typeof window.iceServersLoadCallback === 'function') {
            window.iceServersLoadCallback(externalIceServers);
        }
    });
}

function getSTUNObj(stunStr) {
    var urlsParam = 'urls';
    if (isPluginRTC) {
        urlsParam = 'url';
    }

    var obj = {};
    obj[urlsParam] = stunStr;
    return obj;
}

function getTURNObj(turnStr, username, credential) {
    var urlsParam = 'urls';
    if (isPluginRTC) {
        urlsParam = 'url';
    }

    var obj = {
        username: username,
        credential: credential
    };
    obj[urlsParam] = turnStr;
    return obj;
}

function getExtenralIceFormatted() {
    var iceServers;
    window.RMCExternalIceServers.forEach(function(ice) {
        if (!ice.urls) {
            ice.urls = ice.url;
        }

        if (ice.urls.search('stun|stuns') !== -1) {
            iceServers.push(getSTUNObj(ice.urls));
        }

        if (ice.urls.search('turn|turns') !== -1) {
            iceServers.push(getTURNObj(ice.urls, ice.username, ice.credential));
        }
    });
    return iceServers;
}

var IceServersHandler = (function() {
    function getIceServers(connection) {
        var iceServers = [];

        iceServers.push(getSTUNObj('stun:stun.l.google.com:19302'));
        iceServers.push(getTURNObj('turn:turn.bistri.com:80', 'homeo', 'homeo'));
        iceServers.push(getTURNObj('turn:turn.anyfirewall.com:443', 'webrtc', 'webrtc'));

        if (window.RMCExternalIceServers) {
            iceServers = iceServers.concat(getExtenralIceFormatted());
        } else if (typeof window.getExternalIceServers !== 'undefined' && window.getExternalIceServers == true) {
            connection.iceServers = iceServers;
            window.iceServersLoadCallback = function() {
                connection.iceServers = connection.iceServers.concat(getExtenralIceFormatted());
            };
        }

        return iceServers;
    }

    return {
        getIceServers: getIceServers
    };
})();
