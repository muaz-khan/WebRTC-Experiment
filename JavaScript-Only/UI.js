function uniqueToken ()
{
    var S4 = function ()
    {
        return Math.floor(Math.random() * 0x10000).toString(16);
    };

    return S4() + S4() + "-" +S4() + "-" +S4() + "-" +S4() + "-" +S4() + S4() + S4();
}

function hideListsAndBoxes() {
    $('.create-room-panel').css('left', '-100%');
    $('aside').css('right', '-100%');
    $('.private-room').css('bottom', '-100%');

    global.isGetAvailableRoom = false;
}

global.mediaAccessAlertMessage = 'This app wants to use your camera and microphone.\n\nGrant it the access!';

/* -------------------------------------------------------------------------------------------------------------------------- */
global.userToken = uniqueToken();
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

    if (!global.clientStream) {
        alert(global.mediaAccessAlertMessage);
        return;
    }


    global.userName = fullName.value;
    global.roomName = roomName.value;    

    global.isGetAvailableRoom = false;
	
        
    hideListsAndBoxes();

    global.roomToken = uniqueToken();   		

    if(isChecked && partnerEmail.value.length) global.roomToken = partnerEmail.value + global.roomToken;

    global.offerer = true;  

    pubnub.send({
            roomToken: global.roomToken,
            ownerName: global.userName,
            ownerToken: global.userToken,
            roomName: global.roomName,
            isPrivate: isChecked && partnerEmail.value.length
        });

    pubnub.channel = global.roomToken;
    initPubNub();
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
global.defaultChannel = 'WebRTC Experiments Room'

var pubnub = {
    channel: global.defaultChannel
};

pubnub.init = function(pub)
{
    PUBNUB.subscribe({
        channel    : pubnub.channel, 
        restore    : false, 
        callback   : pub.callback,        
        disconnect : pub.disconnect, 
        connect    : pub.connect
    });
};

pubnub.send = function(data)
{
    PUBNUB.publish({
        channel : pubnub.channel,
        message : data
    });
};

var aside = $('aside');
function getAvailableRooms(response) {
    if(!global.isGetAvailableRoom || !response.ownerToken) return;

    if(response.isPrivate === true)
    {
		document.title ='private';
        if(!global.searchPrivateRoom) return;
        if(response.roomToken.indexOf(global.searchPrivateRoom) !== 0) return;
    }
	
	var alreadyExist = $('#' + response.ownerToken);
	if(alreadyExist) return;
	
    aside.innerHTML = '<div id="'+ response.ownerToken +'"><h2>' + response.roomName + '</h2><small>Created by ' + response.ownerName + '</small><span id="' + response.roomToken + '">Join</span></div>' + aside.innerHTML;

    $('aside span', true).each(function (span) {
        span.bind('click', function() {
            global.userName = prompt('Enter your name');
            
            if(!global.userName.length)
            {
                alert('You\'ve not entered your name. Too bad!');
                return;
            }

            global.isGetAvailableRoom = false;
            hideListsAndBoxes();

            global.roomToken = this.id;
            pubnub.channel = global.roomToken;
			
			initPubNub();
			setTimeout(function() {
				pubnub.send({participant: global.userName, userToken: global.userToken});
			}, 1000);
        });
    });
}

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
}

function postChatMessage() {
    var chatBox = $('#chat-message'),
        message = chatBox.value;
	
	PUBNUB.publish({
        channel : pubnub.channel,
        message : { 
            userName: global.userName, 
            userToken: global.userToken,
            isChat: true,
            message: message
        }
    });

	chatBox.value = '';
    chatBox.focus();
}

var aside = $('aside');
function getChatMessage(response)
{
    aside.innerHTML = '<div><h2>' + response.userName + '</h2>' + response.message + '</div>' + aside.innerHTML;
    document.title = response.userName + ': ' + response.message;
}

function refreshUI() {
    $('footer').show();
    $('aside').innerHTML = '';
    $('aside').css('z-index', 100).css('top', 'auto').css('right', 'auto').show();    
    $('.chat-box').hide();
    $('.private-room').css('bottom', 'auto');
    $('.create-room-panel').css('left', 'auto');

    log('RTC room is closed by ' + response.userName);
    remoteVideo.css('top', '-100%').pause();
    clientVideo.css('width', innerWidth + 'px').css('height', innerHeight + 'px').css('z-index', -1);

    RTC.active = false;
    peerConnection.close();
    peerConnection = null;

    global.isGetAvailableRoom = true;
    global.isGotRemoteStream = false;

    pubnub.channel = global.defaultChannel;
    initPubNub();
}

function initPubNub() {
    pubnub.init({
        callback: function(response)
        {
            if(response.userToken === global.userToken) 
            {
                log('For other end-point!');
                return;
            }

            log(response);

            if(global.isGetAvailableRoom && response.roomToken) getAvailableRooms(response);
            else if(response.firstPart || response.secondPart) {
                if(response.firstPart) 
                {
                    global.firstPart = response.firstPart;
                    if(global.secondPart)
                    {
                        RTC.init(global.firstPart + global.secondPart);
                    }
                }
                if(response.secondPart) 
                {
                    global.secondPart = response.secondPart
                    if(global.firstPart) {
                        RTC.init(global.firstPart + global.secondPart);
                    }
                }
            }
            else if(response.participant) 
            {
                global.participant = response.participant;               

                RTC.init();
            }
            else if(response.sdp)
            {
                RTC.init(response);
            }
                
            else if(RTC.active && response.candidate && !global.isGotRemoteStream) 
    		{
                peerConnection.addIceCandidate(new IceCandidate({
                        sdpMLineIndex: response.candidate.sdpMLineIndex,
                        candidate: JSON.parse(response.candidate.candidate)
                    }));

                log('Processed ICE: ' + response.candidate.candidate);
    		}
            else if(response.isChat) getChatMessage(response);
            else if(response.end) refreshUI();            
        },
        connect: function()
        {
    		pubnub.send('Welecome to WebRTC Experiment!');
        },
        disconnect: function()
        {
            pubnub.send({
                end: true,
                userName: global.userName
            });
        }
    });
}

RTC.onicecandidate = function(event)
{
    if(global.isGotRemoteStream || !event.candidate || !peerConnection) return;
    pubnub.send({
        userToken: global.userToken,
        candidate: {
            sdpMLineIndex: event.candidate.sdpMLineIndex,
            candidate: JSON.stringify(event.candidate.candidate)
        }
    });
    
    log('Posted ICE: ' + event.candidate.candidate);
}

initPubNub();

setTimeout(captureCamera, 2000);

/* Google +1 Button */
(function () {
	var po = document.createElement('script'); po.type = 'text/javascript'; po.async = true;
	po.src = 'https://apis.google.com/js/plusone.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(po, s);
})();