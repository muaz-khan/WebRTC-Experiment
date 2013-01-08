var clientVideo = $('#client-video');
function captureCamera(callback) {
    getUserMedia({
        video: clientVideo,
        onsuccess: function (stream) {
            global.clientStream = stream;
            clientVideo.play();

            callback && callback();
        },
        onerror: function () {
            alert('Either you not allowed access to your microphone/webcam or another application already using it.');
        }
    });
}

function hideListsAndBoxes() {
    disable(true);

    global.isGetAvailableRoom = false;
}

hideListsAndBoxes();

function showListsAndBoxes() {
    disable(false);
    $('table', true).show();

    global.isGetAvailableRoom = true;
}

global.mediaAccessAlertMessage = 'This app wants to use your camera and microphone.\n\nGrant it the access!';
global.userToken = uniqueToken();

$('#remote-video').css('width', innerWidth + 'px').css('height', innerHeight + 'px');
$('#client-video').css('width', innerWidth + 'px').css('height', innerHeight + 'px');

$('#is-private').onchange = function () {
    if (this.checked) $('#partner-email').css('padding', '10px 20px').css('height', 'auto').css('border-bottom', '1px double #CACACA').slideDown().querySelector('#partner-email').focus();
    else $('#partner-email').css('padding', 0).css('border-bottom', 0).slideUp();
};

$('#create-room').onclick = function () {
    var roomName = $('#room-name'),
        partnerEmail = $('input#partner-email');

    var isChecked = $('#is-private').checked;

    if (isChecked && partnerEmail.value.length <= 0) {
        alert('Please enter your partner\'s email or token.');
        partnerEmail.focus();
        return;
    }

    global.userName = 'Anonymous';
    global.roomName = roomName.value || 'Anonymous';
    global.isGetAvailableRoom = false;
    hideListsAndBoxes();
    global.roomToken = uniqueToken();

    global.offerer = true;

    captureCamera(function () {
        if (isChecked && partnerEmail.value.length) {
            pubnub.unsubscribe();
            pubnub.channel = partnerEmail.value;
            global.isPrivateRoom = true;

            initPubNub(spreadRoom);
        } else spreadRoom();
    });
};

function spreadRoom() {
    var g = global;

    pubnub.send({
        roomToken: g.roomToken,
        ownerToken: g.userToken,
        roomName: g.roomName
    });

    !global.participant && setTimeout(spreadRoom, 500);
}

$('#search-room').onclick = function () {
    var email = $('input#email');
    if (!email.value.length) {
        alert('Please enter the email or unique token/word that your partner given you.');
        email.focus();
        return;
    }

    global.searchPrivateRoom = email.value;

    pubnub.unsubscribe();
    pubnub.channel = email.value;
    initPubNub(function () {
        email.value = '';
    });
};

function refreshUI() {
    log('RTC room is closed by other user.');
    remoteVideo.css('top', '-100%').pause();
    remoteVideo.setAttribute('src', '');
    clientVideo.css('width', innerWidth + 'px').css('height', innerHeight + 'px').css('z-index', -1);

    $('table', true).show();
    disable(false);

    global.rtc = null;

    global.isGetAvailableRoom = true;
    global.isGotRemoteStream = false;

    pubnub.unsubscribe();
    pubnub.channel = global.defaultChannel;
}

global.isGetAvailableRoom = true;
var publicRooms = $('#public-rooms');
function getAvailableRooms(response) {
    if (!global.isGetAvailableRoom || !response.ownerToken) return;

    var alreadyExist = $('#' + response.ownerToken);
    if (alreadyExist) return;

    var blockquote = document.createElement('blockquote');
    blockquote.setAttribute('id', response.ownerToken);

    blockquote.innerHTML = response.roomName
            + '<a href="#" class="join" id="' + response.roomToken + '">Join Room</a>';

    publicRooms.insertBefore(blockquote, publicRooms.childNodes[0]);

    $('.join', true).each(function (span) {
        span.onclick = function () {
            global.userName = 'Anonymous';

            global.isGetAvailableRoom = false;
            hideListsAndBoxes();

            global.roomToken = this.id;

            var forUser = this.parentNode.id;

            captureCamera(function () {
                pubnub.send({
                    participant: global.userName,
                    userToken: global.userToken,
                    forUser: forUser,

                    /* let other end know that whether you support opus */
                    isopus: isopus
                });

                if (!global.searchPrivateRoom) {
                    pubnub.send({
                        userToken: global.userToken,
                        isBusyRoom: true,
                        ownerToken: forUser
                    });

                    pubnub.unsubscribe();

                    pubnub.channel = global.roomToken;
                    initPubNub();
                }
            });

            this.parentNode.parentNode.removeChild(this.parentNode);
        };
    });
}