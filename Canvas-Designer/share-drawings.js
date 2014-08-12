// -------------------------------------------------------------
// scripts on this page directly touches DOM-elements
// removing or altering anything may cause failures in the UI event handlers
// it is used only to bring collaboration for canvas-surface

// script on this page will simply setup UI that will be used to setup WebRTC connections
// -------------------------------------------------------------

var btnShareDrawings = find('share-drawing');
var alertBox = find('alert-box');
var fadeBox = find('fade');
var btnBoxCloseButton = find('alert-box-close-button');

addEvent(btnShareDrawings, 'click', function() {
    fadeBox.style.display = 'block';

    alertBox.style.opacity = 1;
    alertBox.style.visibility = 'visible';
    alertBox.style.zIndex = 1;

    var roomid = new RTCMultiConnection().token();

    find('unique-roomid').value = location.href.replace(location.hash, '') + '#' + roomid;
    setTimeout(function() {
        find('unique-roomid').focus();
    }, 500);

    // www.RTCMultiConnection.org/docs/userid/
    connection.userid = 
    
    // www.RTCMultiConnection.org/docs/sessionid/
    connection.sessionid = 
    
    // www.RTCMultiConnection.org/docs/channel-id/
    connection.channel = roomid;
    
    // www.RTCMultiConnection.org/docs/open/
    connection.open({
        dontTransmit: true
    });
});

addEvent(btnBoxCloseButton, 'click', function() {
    alertBox.style.opacity = 0;
    alertBox.style.visibility = 'hidden';
    alertBox.style.zIndex = -1;
    setTimeout(function() {
        fadeBox.style.display = 'none';
    }, 300);
});

// using RTCMultiConnection.js
// www.RTCMultiConnection.org
var connection = new RTCMultiConnection(roomid);

// www.RTCMultiConnection.org/docs/session/
connection.session = {
    data: true
};

// www.RTCMultiConnection.org/docs/sdpConstraints/
connection.sdpConstraints.mandatory = {
    OfferToReceiveAudio: false,
    OfferToReceiveVideo: false
};

// www.RTCMultiConnection.org/docs/getExternalIceServers/
connection.getExternalIceServers = false;

// using websockets over nodejs
// https://github.com/muaz-khan/WebRTC-Experiment/tree/master/websocket-over-nodejs
var SIGNALING_SERVER = 'wss://wsnodejs.nodejitsu.com:443';

// www.RTCMultiConnection.org/docs/openSignalingChannel/
connection.openSignalingChannel = function(config) {
    config.channel = config.channel || this.channel;
    var websocket = new WebSocket(SIGNALING_SERVER);
    websocket.channel = config.channel;
    websocket.onopen = function() {
        websocket.push(JSON.stringify({
            open: true,
            channel: config.channel
        }));
        if (config.callback)
            config.callback(websocket);
    };
    websocket.onmessage = function(event) {
        config.onmessage(JSON.parse(event.data));
    };
    websocket.push = websocket.send;
    websocket.send = function(data) {
        websocket.push(JSON.stringify({
            data: data,
            channel: config.channel
        }));
    };
};

// www.RTCMultiConnection.org/docs/send/
connection.push = connection.send;
connection.send = function(data) {
    connection.push(JSON.stringify(data));
};

var lastPoint = '';

// www.RTCMultiConnection.org/docs/onopen/
connection.onopen = function(event) {
    if (connection.isInitiator) {
        lastPoint = points.join('');
        connection.send(points || []);
    }

    btnShareDrawings.style.display = 'none';
};

// www.RTCMultiConnection.org/docs/onmessage/
connection.onmessage = function(event) {
    var data = JSON.parse(event.data);
    
    // this button is decorated in decorator.js line 330
    if (data.btnSelected) {
        selectBtn(find(data.btnSelected), true);
        return;
    }

    // target peer received last drawing
    // share new drawing if modified
    if (data == 'share-again') {
        if (points.join('') != lastPoint) {
            setTimeout(function() {
                lastPoint = points.join('');
                connection.send(points || []);
            }, 500);
        } else {
            (function loop() {
                if (points.join('') != lastPoint) {
                    lastPoint = points.join('');
                    connection.send(points || []);
                } else setTimeout(loop, 1000);
            })();
        }
        return;
    }

    // drawing is shared here (array of points)
    points = data;
    
    // redraw the <canvas> surfaces
    drawHelper.redraw();
    
    // ask other peer to resend drawing
    setTimeout(function() {
        connection.channels[event.userid].send('share-again');
    }, 500);

    // to support two-way sharing
    if (!lastPoint.length && !connection.isInitiator) {
        lastPoint = points.join('');
        connection.send(points || []);
    }
};

if (location.hash) {
    var roomid = location.hash.replace('#', '');
    connection.sessionid = connection.channel = roomid;
    
    // www.RTCMultiConnection.org/docs/join/
    connection.join({
        sessionid: roomid,
        userid: roomid,
        extra: {},
        session: connection.session
    });
}

