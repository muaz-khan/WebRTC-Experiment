global.defaultChannel = 'WebRTC audio Broadcast22';

/* container: contains videos from all participants */
var participants = $('#participants').css('max-height', (innerHeight - 100) + 'px');

/* master socket is created for owner; answer socket for participant */
var socket = {
    master: null,
    answer: null
};

answerSocket(global.defaultChannel, showListsAndBoxes);

/* create answer socket; it connects with master socket to join broadcasted room */
function answerSocket(channel, onopen) {
    var socket_config = window.socket_config;

    socket_config.channel = channel || global.defaultChannel;
    socket.answer = io.connect('https://pubsub.pubnub.com/webrtc-experiment', socket_config);

    socket.answer.on('connect', onopen || function() {});
    socket.answer.on('message', socketResponse);
}

var invokedOnce = false;
function selfInvoker() {
    if (invokedOnce) return;

    invokedOnce = true;
    createAnswer(global.sdp, socket.answer);
}

function socketResponse(response) {
    /* if same user sent message; don't get! */
    if (response.userToken === global.userToken) return;

    /* both ends MUST support opus; otherwise don't use it! */
    response.isopus !== 'undefined' && (window.isopus = response.isopus && isopus);

    /* not yet joined or created any room!..search the room for current site visitor! */
    if (global.isGetAvailableRoom && response.roomToken) getAvailableRooms(response);

    /* either offer or answer sdp sent by other end */
    if (response.firstPart || response.secondPart) {

        /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
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

    /* process ice candidates sent by other end */
    else if (global.rtc && response.candidate && !global.isGotRemoteStream) {
        global.rtc.addICE({
            sdpMLineIndex: response.candidate.sdpMLineIndex,
            candidate: JSON.parse(response.candidate.candidate)
        });

    }
        /* other end closed the webpage! The user is being informed. */
    else if (response.end && global.isGotRemoteStream) refreshUI();
}

/* got offer sdp from master socket; pass your answer sdp over that socket to join broadcasted room */
function createAnswer(sdp, socket) {
    var config = {
        onICE: function(candidate) {
            sendice(candidate, socket);
        },
        onRemoteStream: gotstream,
        iceServers: iceServers,
        attachStream: global.clientStream,
        onAnswerSDP: function(answerSDP) {
            sendsdp(answerSDP, socket, window.isopus);
        },
        
        isopus: window.isopus
    };

    /* pass offer sdp sent by master socket */
    config.offerSDP = sdp;

    /* create RTC peer connection for participant */
    global.rtc = RTCPeerConnection(config);
}

/* other end tried to close the webpage.....ending the peer connection! */
function onexit() {
    /* if broadcaster (i.e. master socket) ? ... stop broadcasting */
    if (global.offerer)
        socket.master.send({
            end: true,
            userToken: global.userToken
        });

    /*not broadcaster? tell broadcaster that you're going away! */
    else
        socket.answer.send({
            end: true,
            userToken: global.userToken
        });
}

window.onbeforeunload = onexit;
window.onunload = onexit;