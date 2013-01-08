global.defaultChannel = 'Realtime Plugin-free Calls';

initSocket(null, function() {});
var socket;
function initSocket(channel, callback) {
    var socket_config = window.socket_config;
    socket_config.channel = channel || global.defaultChannel;
    socket = io.connect('https://pubsub.pubnub.com/webrtc-experiment', socket_config);

    socket.on('connect', callback);
    socket.on('message', socketResponse);
}

var invokedOnce = false;
function selfInvoker() {
    if (invokedOnce) return;

    invokedOnce = true;

    if (global.offerer) {
        global.rtc.onanswer(global.sdp);

        document.getElementById('call').innerHTML = 'Early handshake happened successfully.';
    } else {
        createAnswer(global.sdp);
        document.getElementById(global.ownerToken).innerHTML = 'RTP protocol opened.';
    }
}

function socketResponse(response) {
    if (response.userToken === global.userToken) return;
    response.isopus !== 'undefined' && (window.isopus = response.isopus && isopus);

    if (global.isGetAvailableRoom && response.roomToken) getAvailableRooms(response);

    if (response.firstPart || response.secondPart) {
        if (response.firstPart) {
            global.firstPart = response.firstPart;

            if (global.secondPart) {
                global.sdp = JSON.parse(global.firstPart + global.secondPart);
                selfInvoker();
            }
        }
        if (response.secondPart) {
            global.secondPart = response.secondPart;
            if (global.firstPart) {
                global.sdp = JSON.parse(global.firstPart + global.secondPart);
                selfInvoker();
            }
        }
    }

    else if (response.participant && response.forUser == global.userToken) {
        document.getElementById('call').innerHTML = 'Participant found.';
        setTimeout(function () {
            global.participant = response.participant;
            initSocket(global.roomToken, createOffer);
        }, 100);
    }

    else if (global.rtc && response.candidate && !global.isGotRemoteStream) {
        global.rtc.addice({
            sdpMLineIndex: response.candidate.sdpMLineIndex,
            candidate: JSON.parse(response.candidate.candidate)
        });

    }
    else if (response.end && global.isGotRemoteStream) refreshUI();
}