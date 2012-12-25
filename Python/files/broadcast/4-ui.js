/* client video + capture client camera */
var clientVideo = $('#client-video');

captureCamera();

function captureCamera() {
    getUserMedia({
        video: clientVideo,
        onsuccess: function (stream) {
            global.clientStream = stream;
            clientVideo.play();

            clientVideo.css('margin', '0 30%');

            $('#video-table').show().scrollIntoView(true);
        },
        onerror: function () {
            location.reload();
        }
    });
}

/* possible situations
1) you joined a room
2) someone joined your room (i.e. you found a participant!)
*/

function hideListsAndBoxes() {
    disable(true);
    global.isGetAvailableRoom = false;
}

/* waiting until socket is open -- then we will enable input boxes */
hideListsAndBoxes();

/* primarily called when someone left your room */

function showListsAndBoxes() {
    disable(false);

    global.isGetAvailableRoom = true;
}

/* the user have not yet allowed his camera access */
global.mediaAccessAlertMessage = 'This app wants to use your camera and microphone.\n\nGrant it the access!';

/* generating a unique token for current user */
global.userToken = uniqueToken();

/* you wanted to create a private room! */
$('#is-private').onchange = function() {
    if (this.checked) $('#partner-email').css('padding', '10px 20px').css('height', 'auto').css('border-bottom', '1px double #CACACA').slideDown().querySelector('#partner-email').focus();
    else $('#partner-email').css('padding', 0).css('border-bottom', 0).slideUp();
};

/* you tried to create a new room! */
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

    /* if you checked the box but not entered anything like email or token! */
    if (isChecked && partnerEmail.value.length <= 0) {
        alert('Please enter your partner\'s email or token.');
        partnerEmail.focus();
        return;
    }

    /* client stream is MUST! */
    if (!global.clientStream) {
        alert(global.mediaAccessAlertMessage);
        return;
    }

    /* setting users defaults */
    global.userName = fullName.value;
    global.roomName = roomName.value;

    /* no need to get anymore rooms */
    global.isGetAvailableRoom = false;

    /* don't allow user to play with input boxes because he created a room! */
    hideListsAndBoxes();

    /* generating a unique token for room! */
    global.roomToken = uniqueToken();

    /* client is the one who created offer or...! */
    global.offerer = true;

    if (isChecked && partnerEmail.value.length) {
        global.isPrivateRoom = true;

        socket.master && (socket.master = null);

        masterSocket(partnerEmail.value, spreadRoom);
    }

    /* propagate room around the globe!! */
    else spreadRoom();

    /* these 3 lines are extras! */
    socket.answer && (socket.answer = null);
    remoteVideo.hide();
    disable(true);
};

function spreadRoom() {
    var g = global;

    socket.master.send({
        roomToken: g.roomToken,
        ownerName: g.userName,
        ownerToken: g.userToken,
        roomName: g.roomName
    });

    /* propagate room around the globe! */
    setTimeout(spreadRoom, 300);
}

/* you tried to search a private room! */
$('#search-room').onclick = function () {
    var email = $('input#email');
    if (!email.value.length) {
        alert('Please enter the email or unique token/word that your partner given you.');
        email.focus();
        return;
    }

    global.searchPrivateRoom = email.value;
    email.setAttribute('disabled', true);

    socket.master && (socket.master = null);
    socket.answer && (socket.answer = null);

    window.scrollTo(0, publicRooms.offsetTop);

    answerSocket(email.value, function () {
        email.value = '';
        email.removeAttribute('disabled');
    });
};

/* if other end close the room; refreshing the UI for current user */

function refreshUI() {
    log('Broadcasted RTC Room is closed by your partner!');
    remoteVideo.pause();
    remoteVideo.setAttribute('src', '');

    disable(false);

    global.rtc = null;

    global.isGetAvailableRoom = true;
    global.isGotRemoteStream = false;
}

/* searching public (or private) rooms */
global.isGetAvailableRoom = true;
var publicRooms = $('#public-rooms');

function getAvailableRooms(response) {
    if (!global.isGetAvailableRoom || !response.ownerToken) return;

    /* room is already visible in the current user's page */
    var alreadyExist = $('#' + response.ownerToken);
    if (alreadyExist) return;

    /* showing the room for current user */
    var blockquote = document.createElement('blockquote');
    blockquote.setAttribute('id', response.ownerToken);

    blockquote.innerHTML = response.roomName
        + '<a href="#" class="join" id="' + response.roomToken + '">Join Room</a><br/>'
            + '<br /><small>Created by <span class="roshan">' + response.ownerName + '</span></small>';

    publicRooms.insertBefore(blockquote, publicRooms.childNodes[0]);

    /* allowing user to join rooms! */
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

            /* telling room owner that I'm your participant! */
            socket.answer.send({
                participant: global.userName,
                userToken: global.userToken,
                forUser: forUser,

                /* let other end know that whether you support opus */
                isopus: isopus
            });

            socket.master && (socket.master = null);
            socket.answer && (socket.answer = null);

            answerSocket(global.userToken);

            this.parentNode.parentNode.removeChild(this.parentNode);

            participants.scrollIntoView(true);
        };
    });
}