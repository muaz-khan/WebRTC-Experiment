global.defaultChannel = 'WebRTC Experiments Room';
var pubnub = {
    channel: global.defaultChannel
};

var PUBNUB = window.PUBNUB || {};
pubnub.init = function (pub) {
    PUBNUB.subscribe({
        channel: pubnub.channel,
        restore: false,
        callback: pub.callback,
        disconnect: pub.disconnect,
        connect: pub.connect
    });
};

pubnub.send = function (data) {
    PUBNUB.publish({
        channel: pubnub.channel,
        message: data
    });
};

pubnub.unsubscribe = function () {
    PUBNUB.unsubscribe({ channel: pubnub.channel });
};

function initPubNub(callback) {
    pubnub.init({
        callback: function (response) {
            if (response.userToken === global.userToken) return;

            if (response.isBusyRoom && response.ownerToken !== global.userToken) {
                
                /* Remove room from all other peers! Because it is now a busy room! */
                var owner = $('#' + response.ownerToken);
                if (owner) {
                    owner = owner.parentNode;
                    owner.parentNode.removeChild(owner);
                }
            }
            else if (global.isGetAvailableRoom && response.roomToken) getAvailableRooms(response);
            else if (response.firstPart || response.secondPart) {
                if (response.firstPart) {
                    global.firstPart = response.firstPart;

                    if (global.secondPart) {
                        global.sdp = JSON.parse(global.firstPart + global.secondPart);

                        if (global.offerer) global.rtc.onanswer(global.sdp);
                        else createAnswer(global.sdp);
                    }
                }
                if (response.secondPart) {
                    global.secondPart = response.secondPart;
                    if (global.firstPart) {

                        global.sdp = JSON.parse(global.firstPart + global.secondPart);

                        if (global.offerer) global.rtc.onanswer(global.sdp);
                        else createAnswer(global.sdp);
                    }
                }
            } else if (response.participant && response.forUser == global.userToken) {
                setTimeout(function () {
                    global.participant = response.participant;

                    if (!global.isPrivateRoom) {
                        pubnub.unsubscribe();
                        pubnub.channel = global.roomToken;

                        initPubNub(createOffer);
                    }
                    else createOffer();
                }, 100);
            }
            else if (global.rtc && response.candidate && !global.isGotRemoteStream) {
                global.rtc.addice({
                    sdpMLineIndex: response.candidate.sdpMLineIndex,
                    candidate: JSON.parse(response.candidate.candidate)
                });

            }
            else if (response.gotStream) global.stopSendingICE = true;
            else if (response.end) refreshUI();
        },
        connect: function () {
            callback && callback();
        }
    });
}

window.onunload = window.onbeforeunload = function () {
    alert('You\'re trying to close the room.');
    pubnub.send({
        end: true,
        userName: global.userName,
        userToken: global.userToken
    });
};