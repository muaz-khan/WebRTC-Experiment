var $ = function(term, selectAll, elem) {
    try {
        if (!elem) {
            if (term && !selectAll) return window.document.querySelector(term);
            return window.document.querySelectorAll(term);
        } else {
            if (term && !selectAll) return elem.querySelector(term);
            return elem.querySelectorAll(term);
        }
    } catch(error) {
        return document.getElementById(term.replace('#', ''));
    }
};

Object.prototype.bind = function(eventName, callback) {
    if (this.length != undefined) {
        var length = this.length;
        for (var i = 0; i < length; i++) {
            this[i].addEventListener(eventName, callback, false);
        }
    } else if (typeof this == 'object') this.addEventListener(eventName, callback, false);
    return this;
};

Object.prototype.each = function(callback) {
    var length = this.length;
    for (var i = 0; i < length; i++) {
        callback(this[i]);
    }
    return this;
};

Object.prototype.find = function(element) {
    return this.querySelector(element);
};

FormData.prototype.appendData = function (name, value) {
    if (value || value == 0) this.append(name, value);
};

$.ajax = function(url, options) {

    var _url = options ? url : url.url;
    options = options || url;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200)
            options.success(JSON.parse(xhr.responseText));
    };
	
	//_url = 'http://webrtc.somee.com' + _url;
    xhr.open(options.type ? options.type : 'POST', _url);

    var formData = new window.FormData(),
        data = options.data;

    if (data) {
        formData.appendData('ownerName', data.ownerName);
        formData.appendData('ownerToken', data.ownerToken);

        formData.appendData('roomName', data.roomName);
        formData.appendData('roomToken', data.roomToken);

        formData.appendData('partnerEmail', data.partnerEmail);
        formData.appendData('userToken', data.userToken);
        formData.appendData('participant', data.participant);

        formData.appendData('sdp', data.sdp);
        formData.appendData('candidate', data.candidate);
        formData.appendData('label', data.label);

        formData.appendData('message', data.message);
    }

    xhr.send(formData);
};

Object.prototype.prepend = function(prependMe) {
    return this.insertBefore(prependMe, this.firstChild);
};

Object.prototype.hide = function() /* set display:none; to one or more elements */
{
    if (this.length != undefined) /* if more than one elements */ {
        this.each(function(elem) {
            elem.style.display = 'none';
        });
    } else if (typeof this == 'object') /* if only one element */ {
        this.style.display = 'none';
    }
    return this;
};
Object.prototype.show = function(value) /* set display:block; to one or more elements */
{
    if (this.length != undefined) /* if more than one elemens */ {
        this.each(function(elem) {
            if (value) elem.style.display = value;
            else elem.style.display = 'block';
        });
    } else if (typeof this == 'object') /* if only one element */ {
        if (value) this.style.display = value;
        else this.style.display = 'block';
    }
    return this;
};

Object.prototype.css = function(prop, value) {
    this.style[prop] = value;
    return this;
};
Object.prototype.html = function (value) {
    if (value) this.innerHTML = value;
    else return this.innerHTML;
    return this;
};
$.once = function(seconds, callback) {
    var counter = 0;
    var time = window.setInterval(function() {
        counter++;
        if (counter >= seconds) {
            callback();
            window.clearInterval(time);
        }
    }, 1000);
};

Object.prototype.slideDown = function(maxHeight) {
    return this.css('max-height', (maxHeight || 1000000) + 'px');
};

Object.prototype.slideUp = function() {
    return this.css('max-height', '0');
};

String.prototype.validate = function() {
    return this.replace( /-/g , '__').replace( /\?/g , '-qmark').replace( / /g , '--').replace( /\n/g , '-n').replace( /</g , '-lt').replace( />/g , '-gt').replace( /&/g , '-amp').replace( /#/g , '-nsign').replace( /__t-n/g , '__t').replace( /\+/g , '_plus_').replace( /=/g , '-equal');
};


/* -------------------------------------------------------------------------------------------------------------------------- */

window.PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
window.IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

window.URL = window.webkitURL || window.URL;
navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

/* -------------------------------------------------------------------------------------------------------------------------- */
var global = { };

var RTC = { }, peerConnection;

RTC.init = function() {
    try {
        peerConnection = new window.PeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
        peerConnection.onicecandidate = RTC.checkLocalICE;

        peerConnection.onaddstream = RTC.checkRemoteStream;
        peerConnection.addStream(global.clientStream);
    } catch(e) {
		document.title = 'WebRTC is not supported in this web browser!';
        alert('WebRTC is not supported in this web browser!');
    }
};

RTC.createOffer = function() {
	document.title = 'Creating offer...';
	
    RTC.init();

    peerConnection.createOffer(function(sessionDescription) {
        peerConnection.setLocalDescription(sessionDescription);
		
		document.title = 'Created offer successfully!';
        sdp = JSON.stringify(sessionDescription);

        var data = {
            sdp: sdp,
            userToken: global.userToken,
            roomToken: global.roomToken
        };

		RTC.checkRemoteICE();
        $.ajax('/WebRTC/PostSDP', {
            data: data,
            success: function(response) {
                if (response) {
					document.title = 'Posted offer successfully!';
					RTC.waitForAnswer();
				}
            }
        });

    }, null, { audio: true, video: true });
};

RTC.waitForAnswer = function() {
	document.title = 'Waiting for answer...';
	
    var data = {
        userToken: global.userToken,
        roomToken: global.roomToken
    };

    $.ajax('/WebRTC/GetSDP', {
        data: data,
        success: function(response) {
            if (response !== false) {
				document.title  = 'Got answer...';
				response = response.sdp;
                try {
                    sdp = JSON.parse(response);
                    peerConnection.setRemoteDescription(new window.SessionDescription(sdp));
                } catch(e) {
                    sdp = response;
                    peerConnection.setRemoteDescription(new window.SessionDescription(sdp));
                }
            } else
                setTimeout(RTC.waitForAnswer, 100);
        }
    });
};

RTC.waitForOffer = function() {
	document.title = 'Waiting for offer...';
    var data = {
        userToken: global.userToken,
        roomToken: global.roomToken
    };

    $.ajax('/WebRTC/GetSDP', {
        data: data,
        success: function(response) {
            if (response !== false) 
			{
				document.title = 'Got offer...';
				
				RTC.init();				
				setTimeout(function() {
					RTC.createAnswer(response.sdp);
				}, 100);
			}
            else setTimeout(RTC.waitForOffer, 100);
        }
    });
};

RTC.createAnswer = function(sdpResponse) {
	document.title = 'Creating answer...';
	
    var sdp;
    try {
        sdp = JSON.parse(sdpResponse);

        peerConnection.setRemoteDescription(new window.SessionDescription(sdp));
    } catch(e) {
        sdp = sdpResponse;

        peerConnection.setRemoteDescription(new window.SessionDescription(sdp));
    }

    peerConnection.createAnswer(function(sessionDescription) {
        peerConnection.setLocalDescription(sessionDescription);
		
		document.title = 'Created answer successfully!';

        sdp = JSON.stringify(sessionDescription);

        var data = {
            sdp: sdp,
            userToken: global.userToken,
            roomToken: global.roomToken
        };

        $.ajax('/WebRTC/PostSDP', {
            data: data,
            success: function() {
				document.title = 'Posted answer successfully!';
			}
        });

    }, null, { audio: true, video: true });
};

RTC.checkRemoteICE = function() {
    if (global.isGotRemoteStream) return;

    if (!peerConnection) {
        setTimeout(RTC.checkRemoteICE, 1000);
        return;
    }

    var data = {
        userToken: global.userToken,
        roomToken: global.roomToken
    };

    $.ajax('/WebRTC/GetICE', {
        data: data,
        success: function(response) {
            if (response === false && !global.isGotRemoteStream) setTimeout(RTC.checkRemoteICE, 1000);
            else {
                try {
                    candidate = new window.IceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                    peerConnection.addIceCandidate(candidate);

                    !global.isGotRemoteStream && setTimeout(RTC.checkRemoteICE, 10);
                } catch(e) {
                    try {
                        candidate = new window.IceCandidate({ sdpMLineIndex: response.label, candidate: JSON.parse(response.candidate) });
                        peerConnection.addIceCandidate(candidate);

                        !global.isGotRemoteStream && setTimeout(RTC.checkRemoteICE, 10);
                    } catch(e) {
                        !global.isGotRemoteStream && setTimeout(RTC.checkRemoteICE, 1000);
                    }
                }
            }
        }
    });
};

RTC.checkLocalICE = function(event) {
    if (global.isGotRemoteStream) return;

    var candidate = event.candidate;

    if (candidate) {
        var data = {
            candidate: JSON.stringify(candidate.candidate),
            label: candidate.sdpMLineIndex,
            userToken: global.userToken,
            roomToken: global.roomToken
        };

        $.ajax('/WebRTC/PostICE', {
            data: data,
            success: function() {
				document.title = 'Posted an ICE candidate!';
			}
        });
    }
};

var remoteVideo = $('#remote-video');

RTC.checkRemoteStream = function(remoteEvent) {
    if (remoteEvent) {
		document.title = 'Got a clue for remote video stream!';
		
        clientVideo.pause();
        clientVideo.hide();
        
        remoteVideo.play();
        remoteVideo.show();

        if (!navigator.mozGetUserMedia) remoteVideo.src = window.URL.createObjectURL(remoteEvent.stream);
        else remoteVideo.mozSrcObject = remoteEvent.stream;

        RTC.waitUntilRemoteStreamStartFlowing();
    }
};

RTC.waitUntilRemoteStreamStartFlowing = function() {
	document.title = 'Waiting for remote stream flow!';
    if (!(remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || remoteVideo.paused || remoteVideo.currentTime <= 0)) {
        global.isGotRemoteStream = true;
		
		document.title = 'Finally got the remote stream!';
        
        startChatting();        
    } else setTimeout(RTC.waitUntilRemoteStreamStartFlowing, 3000);
};

/* -------------------------------------------------------------------------------------------------------------------------- */

function hideListsAndBoxes() {
    $('.create-room-panel').hide();
    $('aside').hide();
    $('.private-room').hide();

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
					
					document.title =  'Created room: ' + global.roomName;

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

        var data = {
            roomToken: element.id,
            participant: prompt('Enter your name', 'Anonymous').validate()
        };

        var email = $('#email');
        if (email.value.length) data.partnerEmail = email.value.validate();

        $.ajax('/WebRTC/JoinRoom', {
            data: data,
            success: function (response) {
                if (response != false) {
                    global.userToken = response.participantToken;
                    $('footer').html('Connected with ' + response.friend + '!');
					document.title = 'Connected with ' + response.friend + '!';
                    
					RTC.waitForOffer();
					RTC.checkRemoteICE();
                }
            }
        });
    },
    waitForParticipant: function () {
        $('footer').html('Waiting for someone to participate.');
		document.title = 'Waiting for someone to participate.';

        var data = {
            roomToken: global.roomToken,
            ownerToken: global.userToken
        };

        $.ajax('/WebRTC/GetParticipant', {
            data: data,
            success: function (response) {
                if (response !== false) {
                    global.participant = response.participant;

                    $('footer').html('Connected with ' + response.participant + '!');
					document.title = 'Connected with ' + response.participant + '!';
                    
                    RTC.createOffer();
                } else {
                    $('footer').html('<img src="/images/loader.gif">');
                    setTimeout(Room.waitForParticipant, 3000);
                }
            }
        });
    }
};

/* -------------------------------------------------------------------------------------------------------------------------- */

$('#background-image').bind('load', function() {
    this.css('width', innerWidth + 'px').css('height', innerHeight + 'px');
});

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

    $('.private-room').hide();
    $('footer').html('Searching private room for: ' + global.searchPrivateRoom);
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
captureCamera();

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
            setTimeout(getAvailableRooms, 10000);
        }
    });
}
getAvailableRooms();

/* -------------------------------------------------------------------------------------------------------------------------- */

function startChatting() {
    $('footer').hide();

    $('aside').innerHTML = '';
    $('aside').css('z-index', 100).css('top', 0).show();
    
    $('.chat-box').show().find('#chat-message').bind('keyup', function(e) {
        if (e.keyCode == 13) postChatMessage();
    });
    
    $('#send-chat').bind('click', function() {
        postChatMessage();
    });

    getChatMessage();
}

function getChatMessage() {
    var data = {
        userToken: global.userToken,
        roomToken: global.roomToken
    };

    $.ajax('/WebRTC/GetChatMessage', {
        data: data,
        success: function (response) {
            if (response != false) {
                var aside = $('aside');
                aside.innerHTML = '<div><h2>' + response.by + '</h2><small>' + response.at + '</small><br />' + response.message + '</div>' + aside.innerHTML;
				document.title = response.by + ': ' + location.message;
            }
        }
    });

    setTimeout(getChatMessage, 10000);
}

function postChatMessage() {
    var chatBox = $('#chat-message'),
        message = chatBox.value;

    chatBox.setAttribute('disabled', true);

    var data = {
        userToken: global.userToken,
        roomToken: global.roomToken,
        message: message.validate()
    };

    $.ajax('/WebRTC/PostChatMessage', {
        data: data,
        success: function (response) {
            if (response == true) {
                var aside = $('aside');
                aside.innerHTML = '<div><h2>You:</h2><br />' + message + '</div>' + aside.innerHTML;
				document.title = 'You: '+ message;
				
                chatBox.removeAttribute('disabled');
                chatBox.value = '';
                chatBox.focus();
            }
        }
    });
}