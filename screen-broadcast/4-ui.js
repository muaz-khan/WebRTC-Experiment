/* client video + capture client camera */
var clientVideo = $('#client-video');
function captureCamera(callback) {
    getUserMedia({
        video: clientVideo,
        onsuccess: function (stream) {
            global.clientStream = stream;

            clientVideo.show().play();
            
            setTimeout(function() {
                clientVideo.css('-webkit-transform', 'rotate(360deg)');
            }, 1000);

            $('.visible', true).hide();

            callback && callback();
        },
        onerror: function () {
            alert('Either you not allowed access to your microphone/webcam or another application already using it.');
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

/* generating a unique token for current user */
global.userToken = uniqueToken();

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
    
	if (alreadyExist && response.end)
	{
		window.alreadyExist = alreadyExist;
		alreadyExist.innerHTML += '<br /><br /><span style="color:red;">The broadcast is closed!</span>';
		alreadyExist.getElementsByTagName('a')[0].hide();
		return;
	}
	else if (alreadyExist) return;

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

                socket.answer && (socket.answer = null);

                answerSocket(global.userToken);
            });
        };
    });
}

function requestFullScreen(elem) {
    if (elem.requestFullscreen) {
        elem.requestFullscreen();
    } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
    }
}

clientVideo.click = function () {
    requestFullScreen(clientVideo);
};