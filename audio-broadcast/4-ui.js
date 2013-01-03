/* client video + capture client camera */
var audio = $('#client-audio');
function captureCamera(callback) {
    getUserMedia({
        video: audio,
		constraints: { audio: true, video: false },
        onsuccess: function (stream) {
            global.clientStream = stream;

            audio.show().play();
            
            setTimeout(function() {
                audio.css('-webkit-transform', 'rotate(360deg)');
            }, 1000);

            $('.visible', true).hide();

            callback && callback();
        },
        onerror: function () {
            alert('Two possible situations: 1) another window is using your webcam, or 2) you\'ve not allowed you camera. Webcam is mandatory of this app!');
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
    if (this.checked) $('#partner-email').css('padding', '10px 20px').css('height', 'auto').css('border-bottom', '1px double #CACACA').slideDown().querySelector('#private-token').focus();
    else $('#partner-email').css('padding', 0).css('border-bottom', 0).slideUp();
};

/* you tried to create a new room! */
$('#create-room').onclick = function () {
    var roomName = $('#room-name'),
        privateToken = $('#private-token');

    roomName = roomName.value.length > 0 ? roomName.value : 'Anonymous';

    var isChecked = $('#is-private').checked;

    /* if you checked the box but not entered anything like email or token! */
    if (isChecked && privateToken.value.length <= 0) {
        alert('Please enter private token.');
        privateToken.focus();
        return;
    }

    /* setting users defaults */
    global.roomName = roomName;
    global.isGetAvailableRoom = false;

    /* don't allow user to play with input boxes because he created a room! */
    hideListsAndBoxes();

    /* generating a unique token for room! */
    global.roomToken = uniqueToken();
    global.offerer = true;

    captureCamera(function () {
        if (isChecked && privateToken.value.length) {
            global.isPrivateRoom = true;

            socket.master && (socket.master = null);

            masterSocket(privateToken.value, spreadRoom);
        }

        /* propagate room around the globe!! */
        else spreadRoom();
    });

    /* these 3 lines are extras! */
    socket.answer && (socket.answer = null);
};

function spreadRoom() {
    var g = global;

    socket.master.send({
        roomToken: g.roomToken,
        ownerToken: g.userToken,
        roomName: g.roomName
    });

    /* propagate room around the globe! */
    setTimeout(spreadRoom, 3000);
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

    answerSocket(email.value, function () {
        email.value = '';
        email.removeAttribute('disabled');
    });
};

/* if other end close the room; refreshing the UI for current user */

function refreshUI() {
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

    blockquote.innerHTML = response.roomName + '<a href="#" class="join" id="' + response.roomToken + '">Join Room</a>';

    publicRooms.insertBefore(blockquote, publicRooms.childNodes[0]);

    /* allowing user to join rooms! */
    $('.join', true).each(function (span) {
        span.onclick = function () {
            global.isGetAvailableRoom = false;
            hideListsAndBoxes();

            global.roomToken = this.id;

            var forUser = this.parentNode.id;

            captureCamera(function () {
                /* telling room owner that I'm your participant! */
                socket.answer.send({
                    participant: global.userToken,
                    userToken: global.userToken,
                    forUser: forUser,

                    /* let other end know that whether you support opus */
                    isopus: isopus
                });

                socket.master && (socket.master = null);
                socket.answer && (socket.answer = null);

                answerSocket(global.userToken);
            });
        };
    });
}