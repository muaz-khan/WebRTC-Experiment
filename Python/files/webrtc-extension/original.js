var iceServers = null;
var socket_config = {
	publish_key: 'pub-f986077a-73bd-4c28-8e50-2e44076a84e0',
	subscribe_key: 'sub-b8f4c07a-352e-11e2-bb9d-c7df1d04ae4a',
	ssl: true
};
        
var global = {};


/* helps generating unique tokens for users and rooms */
function uniqueToken() {
    var s4 = function () {
        return Math.floor(Math.random() * 0x10000).toString(16);
    };
    return s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4();
}
		
/* send (i.e. transmit) offer/answer sdp */
function sendsdp(sdp, socket, isopus) {
    sdp = JSON.stringify(sdp);

    /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
    var firstPart = sdp.substr(0, 700),
        secondPart = sdp.substr(701, sdp.length - 1);

    /* transmitting first sdp part */
    socket && socket.send({
        userToken: global.userToken,
        firstPart: firstPart,

        /* let other end know that whether you support opus */
        isopus: isopus
    });

    /* transmitting second sdp part */
    socket && socket.send({
        userToken: global.userToken,
        secondPart: secondPart,

        /* let other end know that whether you support opus */
        isopus: isopus
    });
}

/* send (i.e. transmit) ICE candidates */

function sendice(candidate, socket) {
    socket && socket.send({
        userToken: global.userToken, /* unique ID to identify the sender */
        candidate: {
            sdpMLineIndex: candidate.sdpMLineIndex,
            candidate: JSON.stringify(candidate.candidate)
        }
    });
}

/* you wanted to create a private room! */


function broadcastNow(stream) {
    global.clientStream = stream;
    
    global.isGetAvailableRoom = false;
	
    global.roomName = uniqueToken();
    global.roomToken = uniqueToken();
	global.userName = global.userToken = uniqueToken();
	
    global.offerer = true;
    //masterSocket(null);
	spreadRoom();
}

function spreadRoom() {
    var g = global;
	
	if(global.isStopBroadcasting)
	{
		socket.master && socket.master.send({
			roomToken: g.roomToken,
			ownerToken: g.userToken,
			roomName: g.roomName,
			end: true
		});
		return;
	}

    socket.master && socket.master.send({
        roomToken: g.roomToken,
        ownerToken: g.userToken,
        roomName: g.roomName
    });
	
	console.log('broadcasting screen..');

    /* propagate room around the globe! */
    setTimeout(spreadRoom, 3000);
}
/* searching public (or private) rooms */
global.isGetAvailableRoom = true;

		
global.defaultChannel = 'WebRTC screen Broadcast';

/* container: contains videos from all participants */
var participants = {};
function showListsAndBoxes() {}

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
    socket.answer = io.connect('http://pubsub.pubnub.com/webrtc-experiment', socket_config);

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
    //if (global.isGetAvailableRoom && response.roomToken) getAvailableRooms(response);

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
        global.rtc.addice({
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
        getice: function(candidate) {
            sendice(candidate, socket);
        },
        gotstream: gotstream,
        iceServers: iceServers,
        stream: global.clientStream,
        onanswer: function(answerSDP) {
            sendsdp(answerSDP, socket, window.isopus);
        },
        
        isopus: window.isopus
    };

    /* pass offer sdp sent by master socket */
    config.offer = sdp;

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
		
masterSocket();

/* master socket handles all new/old connections/participants */
function masterSocket(channel, onopen) {
    var socket_config = window.socket_config;

    /* if private broadcasted room; unique channel will be passed */
    socket_config.channel = channel || global.defaultChannel;
    socket.master = io.connect('http://pubsub.pubnub.com/webrtc-experiment', socket_config);

    socket.master.on('connect', connect);
    socket.master.on('message', callback);

    function connect() {
        showListsAndBoxes();
        onopen && onopen();
    }

    function callback(data) {
        if (data.roomToken || data.userToken == global.userToken) return;
        if (!data.participant || data.forUser != global.userToken) return;
        if (data.participant) {
            /* found a participant? .... open new socket for him */
            openSocket(data.userToken);
        }
    }
}

/* this function creates unique sockets and unique peers to handle the real broadcasting!
*  in this case; participant closes his old (public) socket; and creates new socket and sets channel === his own unique token (global.userToken) */
function openSocket(channel) {
    var socket_config = window.socket_config,
        isGotRemoteStream,
        peer,

        /* inner variable stores firstPart and secondPart of the answer SDP sent by the participant */
        inner = {},
        
        /* unique remote video from participant */
        video,

        /* Amazing situation!....in the same broadcasted room; one or more peers can create peer connections
        *  using opus codec; while other peers can use some other codec. Everything is working fine! */
        isopus = window.isopus;

    /* here channel === unique token of the participant (global.userToken -> of the participant) */
    socket_config.channel = channel;
    var socket = io.connect('http://pubsub.pubnub.com/webrtc-experiment', socket_config);

    socket.on('connect', opened);
    socket.on('message', callback);

    /* unique socket opened */
    function opened() {
        var config = {
            iceServers: iceServers,
            stream: global.clientStream,
            onoffer: function (sdp) { sendsdp(sdp, socket, isopus); },
            getice: function(candidate) { sendice(candidate, socket); },
            gotstream: gotstream,
            isopus: isopus
        };

        /* unique peer got video from participant; */
        video = document.createElement('video');
        //video.css('-webkit-transform', 'rotate(0deg)');

        /* and added in the "participants" video list: <td id="participants"></td> */
        //participants.appendChild(video, participants.firstChild);

        /* unique peer connection opened */
        peer = RTCPeerConnection(config);
    }

    var invokedOnce = false;
    function selfInvoker() {
        if (invokedOnce) return;
        
        if (!peer) setTimeout(selfInvoker, 100);
        else {
            invokedOnce = true;
            peer.onanswer(inner.sdp);
        }
    }

    /* unique socket got message from participant */
    function callback(response) {
        if (response.userToken == global.userToken) return;

        /* both ends MUST support opus; otherwise don't use opus! */
        response.isopus !== 'undefined' && (isopus = response.isopus && isopus);

        /* because sdp size is larger than what pubnub supports for single request...that's why it is splitted into two parts */
        if (response.firstPart || response.secondPart) {
            if (response.firstPart) {
                inner.firstPart = response.firstPart;
                if (inner.secondPart) {
                    inner.sdp = JSON.parse(inner.firstPart + inner.secondPart);
                    selfInvoker();
                }
            }
            if (response.secondPart) {
                inner.secondPart = response.secondPart;
                if (inner.firstPart) {
                    inner.sdp = JSON.parse(inner.firstPart + inner.secondPart);
                    selfInvoker();
                }
            }
        }

        /* process ice candidates sent by participant */
        if (response.candidate && !isGotRemoteStream) {
            peer && peer.addice({
                sdpMLineIndex: response.candidate.sdpMLineIndex,
                candidate: JSON.parse(response.candidate.candidate)
            });
        }

        if (response.end)
		{
			console.log('A person left you!');
			webkitNotifications.createHTMLNotification('extras/left.html').show();
			socket = null;
		}
    }

    /* sub socket got stream --- no need for this extension */
    function gotstream() {
		console.log('A new person started watching your screen.');
		webkitNotifications.createHTMLNotification('extras/participant.html').show();
	}
}