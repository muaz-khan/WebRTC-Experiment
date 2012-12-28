/* ---------- common configuration -------- */
var config = {};

function initconfig()
{
	config = {
	    getice: sendice,
	    gotstream: gotstream,
	    iceServers: iceServers,
	    stream: global.clientStream,
	    isopus: isopus
	};
}

/* ---------- called in case of offer -------- */
function createOffer() {
	initconfig();
	config.onoffer = sendsdp;
    
    global.rtc = RTCPeerConnection(config);
}

/* ---------- called in case of answer -------- */
function createAnswer(sdp) {
	initconfig();
    config.onanswer = sendsdp;
    config.offer = sdp;
    global.rtc = RTCPeerConnection(config);
}