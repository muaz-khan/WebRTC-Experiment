var clientVideo = $('#client-video');
function captureCamera() {
    getUserMedia({
        video: clientVideo,
        onsuccess: function (stream) {
            global.clientStream = stream;
            clientVideo.play();
        },
        onerror: function () {
            location.reload();
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
    var fullName = $('#full-name'),
            roomName = $('#room-name'),
            partnerEmail = $('input#partner-email');

    if (fullName.value.length <= 0) {
        alert('Please enter your full name.');
        fullName.focus();
        return;
    }

    if (roomName.value.length <= 0) {
        alert('Please enter room name.');
        roomName.focus();
        return;
    }

    var isChecked = $('#is-private').checked;

    if (isChecked && partnerEmail.value.length <= 0) {
        alert('Please enter your partner\'s email or token.');
        partnerEmail.focus();
        return;
    }

    if (!global.clientStream) {
        alert(global.mediaAccessAlertMessage);
        return;
    }

    global.userName = fullName.value;
    global.roomName = roomName.value;
    global.isGetAvailableRoom = false;
    hideListsAndBoxes();
    global.roomToken = uniqueToken();

    if (isChecked && partnerEmail.value.length) {
        pubnub.unsubscribe();
        pubnub.channel = partnerEmail.value;
        global.isPrivateRoom = true;

        initPubNub();
    }

    global.offerer = true;

    spreadRoom();
    window.scrollTo(0, 0);
};

function spreadRoom() {
    var g = global;

    pubnub.send({
        roomToken: g.roomToken,
        ownerName: g.userName,
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

    log('Creating channel: ' + email.value);

    pubnub.unsubscribe();
    pubnub.channel = email.value;
    initPubNub(function () {
        log('Searching a private room for: ' + global.searchPrivateRoom);
        email.value = '';
    });
    window.scrollTo(0, 0);
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
            + '<a href="#" class="join" id="' + response.roomToken + '">Join Room</a><br/>'
                + '<br /><small>Created by <span class="roshan">' + response.ownerName + '</span></small>';

    publicRooms.insertBefore(blockquote, publicRooms.childNodes[0]);

    $('.join', true).each(function (span) {
        span.onclick = function () {
            if (!global.clientStream) {
                alert(global.mediaAccessAlertMessage);
                return;
            }

            global.userName = prompt('Enter your name');

            if (!global.userName.length) {
                alert('You\'ve not entered your name. Too bad!');
                return;
            }

            global.isGetAvailableRoom = false;
            hideListsAndBoxes();

            global.roomToken = this.id;

            var forUser = this.parentNode.id;

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


            window.scrollTo(0, 0);
            this.parentNode.parentNode.removeChild(this.parentNode);
        };
    });
}