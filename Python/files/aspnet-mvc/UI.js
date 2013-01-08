function hideListsAndBoxes() {
    $('.create-room-panel').css('left', '-100%');
    $('aside').css('right', '-100%');
    $('.private-room').css('bottom', '-100%');
	$('.stats').css('top', '-100%');

    global.isGetAvailableRoom = false;
}

global.mediaAccessAlertMessage = 'This app wants to use your camera and microphone.\n\nGrant it the access!';

var Room = {
    createRoom: function (isChecked, partnerEmail) {
        if (!global.clientStream) {
            alert(global.mediaAccessAlertMessage);
            return;
        }
        
        hideListsAndBoxes();

        var data = {
            roomName: global.roomName.validate(),
            ownerName: global.userName.validate()
        };

        if (isChecked) data.partnerEmail = partnerEmail.value.validate();

        $.ajax('/WebRTC/CreateRoom', {
            data: data,
            success: function (response) {
                if (response !== false) {
                    global.roomToken = response.roomToken;
                    global.userToken = response.ownerToken;					
					log('Created room: ' + global.roomName);
                    Room.waitForParticipant();
                }
            }
        });
    },
    joinRoom: function (element) {
        if (!global.clientStream) {
            alert(global.mediaAccessAlertMessage);
            return;
        }
        
        hideListsAndBoxes();

		global.userName = prompt('Enter your name', 'Anonymous').validate()
		
        var data = {
            roomToken: element.id,
            participant: global.userName
        };
		
		

        var email = $('#email');
        if (email.value.length) data.partnerEmail = email.value.validate();

        $.ajax('/WebRTC/JoinRoom', {
            data: data,
            success: function (response) {
                if (response != false) {
                    global.userToken = response.participantToken;                    
					log('Connected with ' + response.friend + '!');                    
					RTC.checkRemoteICE();
					
					setTimeout(function() {
						RTC.waitForOffer();
					}, 3000);
                }
            }
        });
    },
    waitForParticipant: function () {
        log('Waiting for someone to participate.');

        var data = {
            roomToken: global.roomToken,
            ownerToken: global.userToken
        };

        $.ajax('/WebRTC/GetParticipant', {
            data: data,
            success: function (response) {
                if (response !== false) {
                    global.participant = response.participant;
                    log('Connected with ' + response.participant + '!');                    
                    RTC.createOffer();
                } else {
                    log('<img src="/images/loader.gif">');
                    setTimeout(Room.waitForParticipant, 3000);
                }
            }
        });
    }
};

/* -------------------------------------------------------------------------------------------------------------------------- */

$('#remote-video').css('width', innerWidth + 'px').css('height', innerHeight + 'px');
$('#client-video').css('width', innerWidth + 'px').css('height', innerHeight + 'px');

$('#is-private').bind('change', function() {
    if (this.checked) $('#partner-email').css('padding', '10px 20px').css('border-bottom', '2px solid rgba(32, 26, 26, 0.28)').slideDown().find('#partner-email').focus();
    else $('#partner-email').css('padding', 0).css('border-bottom', 0).slideUp();
});

$('#create-room').bind('click', function () {
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

    global.userName = fullName.value;
    global.roomName = roomName.value;

    Room.createRoom(isChecked, partnerEmail);
});

$('#search-room').bind('click', function () {
    var email = $('input#email');
    if (!email.value.length) {
        alert('Please enter the email or unique token/word that your partner given you.');
        email.focus();
        return;
    }

    global.searchPrivateRoom = email.value;
	
	$('.private-room').css('bottom', '-100%');
    log('Searching a private room for: ' + global.searchPrivateRoom);
});

/* -------------------------------------------------------------------------------------------------------------------------- */

var clientVideo = $('#client-video');

function captureCamera() {
    navigator.getUserMedia({ audio: true, video: true },
        function (stream) {

            if (!navigator.mozGetUserMedia) clientVideo.src = window.URL.createObjectURL(stream);
            else clientVideo.mozSrcObject = stream;

            global.clientStream = stream;

            clientVideo.play();
        },
        function () {
            location.reload();
        });
}

/* -------------------------------------------------------------------------------------------------------------------------- */
global.isGetAvailableRoom = true;
function getAvailableRooms() {
    if (!global.isGetAvailableRoom) return;

    var data = {};
    if (global.searchPrivateRoom) data.partnerEmail = global.searchPrivateRoom;

    $.ajax('/WebRTC/SearchPublicRooms', {
        data: data,
        success: function (response) {
            if (!global.searchPrivateRoom) {
                $('#active-rooms').html(response.publicActiveRooms);
                $('#available-rooms').html(response.availableRooms);
                $('#private-rooms').html(response.privateAvailableRooms);
            }
			
			document.title = response.availableRooms + ' available public rooms, ' + response.publicActiveRooms + ' active public rooms and ' + response.privateAvailableRooms + ' available private rooms';

            var rooms = response.rooms;
            if (!rooms.length) {
                $('aside').html('<div><h2 style="font-size:1.2em;">No room found!</h2><small>No available room found.</small></div>');
            } else {
                var html = '';
                rooms.each(function (room) {
                    html += '<div><h2>' + room.roomName + '</h2><small>Created by ' + room.ownerName + '</small><span id="' + room.roomToken + '">Join</span></div>';
                });

                $('aside').html(html);
                $('aside span', true).each(function (span) {
                    span.bind('click', function() {
						global.roomToken = this.id;
						Room.joinRoom(this);
					});
                });
            }
            setTimeout(getAvailableRooms, 3000);
        }
    });
}
getAvailableRooms();

function getStats()
{
	$.ajax('/WebRTC/Stats', {
		success: function(response) {
			$('#number-of-rooms').html(response.numberOfRooms);
			$('#number-of-public-rooms').html(response.numberOfPublicRooms);
			$('#number-of-private-rooms').html(response.numberOfPrivateRooms);
			$('#number-of-empty-rooms').html(response.numberOfEmptyRooms);
			$('#number-of-full-rooms').html(response.numberOfFullRooms);
			
			$('.stats').css('top', '9.5%');
		}
	});
}
getStats();

/* -------------------------------------------------------------------------------------------------------------------------- */

function startChatting() {
    $('footer').hide();

    $('aside').innerHTML = '';
    $('aside').css('z-index', 100).css('top', 0).css('right', 0).show();
    
    $('.chat-box').show().find('#chat-message').bind('keyup', function(e) {
        if (e.keyCode == 13) postChatMessage();
    });
    
    $('#send-chat').bind('click', function() {
        postChatMessage();
    });

    startChannel();
}

function startChannel()
{
	var aside = $('aside');
	
    PUBNUB.subscribe({
        channel    : global.roomToken, 
        restore    : false, 
        callback   : function(response) {
			if(response.message) {			 
				 aside.innerHTML = '<div><h2>' + response.by + '</h2>' + response.message + '</div>' + aside.innerHTML;
				 document.title = response.by + ': ' + response.message;
			 }
			 else
			 {
				aside.innerHTML = '<div>'+ response	+'</div>' + aside.innerHTML;
				 document.title = response;
			 }
        },
		
		disconnect : function() {
			PUBNUB.publish({
                channel : global.roomToken,
                message : global.userName + ' is disconnected.'
            })
        },
 
        connect    : function() {
			PUBNUB.publish({
                channel : global.roomToken,
                message : global.userName + ' is ready to chat with you!'
            })
        }
    })
}

function postChatMessage() {
    var chatBox = $('#chat-message'),
        message = chatBox.value;
	
	PUBNUB.publish({
        channel : global.roomToken,
        message : { by: global.userName, message: message }
    });

	chatBox.value = '';
    chatBox.focus();
}

setTimeout(captureCamera, 2000);

/* Google +1 Button */
(function () {
	var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
	po.src = 'https://apis.google.com/js/plusone.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();