/* To understand how many global variables were are using in the code; 
*  Otherwise it is not necessary to put all global variables on the top of the file.
*  Because it is JavaScript!!!!!!
***************************************************/
var JsonRequest = window.XMLHttpRequest,
    clientVideo,
    remoteVideo,
    clientStream,
    remoteStream,
    roomsList, infoList,
    isGetAvailableRoom = true,
    mediaAlertBox,
    peerConnection,
    you = 'Anonymous',
    yourFellowUser,
    roomName = 'Anonymous',
    roomToken,
    isGotRemoteStream,
    processedCandidatesCount = 0,
    nameInput,
    roomInput,
    colors = {
        green: '#41D141',
        red: '#E7A4A4',
        yellow: 'yellow'
    };

function findDOMElement(id) {
    return document.getElementById(id);
}

nameInput = findDOMElement('yourname');
roomInput = findDOMElement('roomname');
clientVideo = findDOMElement('client-video');
remoteVideo = findDOMElement('remote-video');
roomsList = findDOMElement('rooms-list');
infoList = findDOMElement('info-list');
mediaAlertBox = findDOMElement('media-alert-box');

/* This function is irrelevant for you, just skip it please!
************************************************************/
function validate(value) {
    value = value.replace( /-/g , '__').replace( /\?/g , '-qmark').replace( / /g , '--').replace( /\n/g , '-n').replace( /</g , '-lt').replace( />/g , '-gt').replace( /&/g , '-amp').replace( /#/g , '-nsign').replace( /__t-n/g , '__t').replace( /\+/g , '_plus_').replace( /=/g , '-equal');
    return value;
}

/* This function is used in XHR request
***************************************/
FormData.prototype.appendData = function(name, value) {
    if (value || value == 0) this.append(name, value);
};

/* XHR Request
**************/
function xhr(url, data, callback) {
    if (!XMLHttpRequest || !JSON) return;

    var request = new JsonRequest();
    request.onreadystatechange = function() {
        if (request.readyState == 4 && request.status == 200) {
            callback(JSON.parse(request.responseText));
        }
    };

    request.open('POST', (navigator.onLine ? 'http://webrtc.somee.com/WebRTC/' : '/WebRTC/') + url);

    var formData = new window.FormData();
    if (data) {
        formData.appendData('sdp', data.sdp);
        formData.appendData('type', data.type);
        formData.appendData('you', data.you);
        formData.appendData('roomToken', data.roomToken);

        formData.appendData('skip', data.skip);
        formData.appendData('take', data.take);

        formData.appendData('room', data.room);
        formData.appendData('owner', data.owner);

        formData.appendData('name', data.name);
        formData.appendData('message', data.message);

        formData.appendData('candidate', data.candidate);
        formData.appendData('label', data.label);
    }

    request.send(formData);
}

/* Calling getUserMedia
***********************/
function captureCamera() {
    mediaAlertBox.style.display = 'block';

    navigator.webkitGetUserMedia({ audio: true, video: true },
        function(stream) {
            clientVideo.src = window.webkitURL.createObjectURL(stream);
            clientStream = stream;

            infoList.style.width = '623px';
            mediaAlertBox.style.display = 'none';
        },
        function() {
            location.reload();
        });
}

captureCamera();

/* UI function to show information about WebRTC connection's current state
**************************************************************************/
function info(message, backgroundColor) {
    var date = new Date(),
        hours = date.getHours(),
        minutes = date.getMinutes(),
        time = hours + ':' + minutes;

    infoList.innerHTML = '<div style="background:' + (backgroundColor || '#8EE8FF') + '">' + time + ' → ' + message + '</div>' + infoList.innerHTML;
    document.title = message;
}

/* UI function to create new room
*********************************/
function createButtonClick() {
    if (!nameInput.value.length || !roomInput.value.length) {
        nameInput.focus();
        return;
    }
    you = nameInput.value;
    roomName = roomInput.value;

    findDOMElement('room-title').innerHTML = roomName;
    createRoom();
    hideRoomsList();
}

/* UI function to get list of all available rooms
*************************************************/
function getAvailableRooms() {
    if (!isGetAvailableRoom) return;

    var data = { you: you };

    xhr('GetAvailableRooms', data,
        function(rooms) {
            if (!rooms.length) {
                info('No available room found!');
                roomsList.innerHTML = '<div>No available room found!</div>';
            } else {
                var length = rooms.length;
                roomsList.innerHTML = '';

                for (var i = 0; i < length; i++) {
                    var room = rooms[i];
                    roomsList.innerHTML += '<div id="' + room.token + '" room-name="' + room.name + '"><span class="join">Join</span>' + room.name + '</div>';
                }

                info(rooms.length + ' available room(s) found.', colors.yellow);
            }
            setTimeout(getAvailableRooms, 10000);
        }
    );
}

/* 1) if created new room
*  2) if joined any room
************************/
function hideRoomsList() {
    roomsList.style.display = 'none';
    findDOMElement('manage-room').style.display = 'none';
    isGetAvailableRoom = false;
}

function createRoom() {
    info('Creating room: ' + roomName, colors.yellow);

    var data = {
        owner: you,
        room: roomName
    };

    xhr('CreateRoom', data,
        function(response) {
            if (response) {
                roomToken = response;
                searchOtherUser();
                info('Created room: ' + roomName + ' successfully!', colors.green);
            }
        }
    );
}

/* Search other WebRTC end-point
********************************/
function searchOtherUser() {
    info('Searching your fellow user...', colors.yellow);

    var data = {
        you: you,
        roomToken: roomToken
    };

    xhr('GetFellowUser', data,
        function(response) {
            if (response) {
                yourFellowUser = response;
                info('Found your friend: ' + yourFellowUser, colors.green);

                webrtc_offer.create_offer();
            } else setTimeout(searchOtherUser, 3000);
        }
    );
}

/* Join an end-point
********************/
function joinRoom() {
    info('Joining room: ' + roomName, colors.yellow);
    var data = {
        you: you,
        roomToken: roomToken
    };
    xhr('JoinRoom', data,
        function(response) {
            if (response) {
                yourFellowUser = response;
                info('Joined room: ' + roomName, colors.green);

                checkRemoteCandidates();

                setTimeout(function() {
                    webrtc_answer.wait_for_offer();
                }, 3000);
            }
        }
    );
}

/* If both end-points got remote streams && handshake is successful
*******************************************************************/
function gotRemoteStream(remoteEvent) {
    if (remoteEvent) {
        info('Remote stream event fired from: ' + yourFellowUser, colors.yellow);

        remoteVideo.src = window.webkitURL.createObjectURL(remoteEvent.stream);
        remoteStream = remoteEvent.stream;
        traceRemoteStreamExecution();

        info('Waiting for remote stream from: ' + yourFellowUser);
    }
}

/* If both end-points are trying to make handshake
*  The process is on the way!
*****************************/
var remoteStreamChecked = 0;
function traceRemoteStreamExecution() {
    remoteStreamChecked++;

    info('Waiting for remote stream from: ' + yourFellowUser);
    if (!(remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || remoteVideo.paused || remoteVideo.currentTime <= 0)) {
        isGotRemoteStream = true;
        info('Successfully got remote stream from: ' + yourFellowUser, colors.yellow);

        setTimeout(function() {
            infoList.style.display = 'none';
        }, 2000);
    } else {
        if (remoteStreamChecked > 15) {
            info('Unable to get remote stream from ' + yourFellowUser, colors.yellow);
            info('Try again..');
            remoteStreamChecked = 0;
            setTimeout(traceRemoteStreamExecution, 3000);
        } else setTimeout(traceRemoteStreamExecution, 3000);
    }
}

/* If one end-point gets ICE candidates, he should post it for other end-point
******************************************************************************/
var postedCandidatesCount = 0;
function gotIceCandidate(event) {
    if (isGotRemoteStream) return;
    var candidate = event.candidate;

    if (candidate) {
        var data = {
            candidate: JSON.stringify(candidate.candidate),
            label: candidate.sdpMLineIndex,
            you: you,
            roomToken: roomToken
        };

        xhr('PostCandidate',
            data,
            function() {
                postedCandidatesCount++;
                info('Posted candidate number ' + postedCandidatesCount + ' successfully!', colors.green);
            });
    } else info("End of ICE Candidates!");
}

/* Geting ICE candidates posted from other end-point
****************************************************/
var receivedCandidatesCount = 0;
function checkRemoteCandidates() {
    if (isGotRemoteStream) return;

    if (!peerConnection) {
        setTimeout(checkRemoteCandidates, 1000);
        return;
    }

    var data = {
        you: you,
        roomToken: roomToken
    };

    xhr('GetCandidate', data,
        function(response) {
            if (response === false && !isGotRemoteStream) setTimeout(checkRemoteCandidates, 500);
            else {
                receivedCandidatesCount++;
                info('Got candidate number ' + receivedCandidatesCount + ' from your friend: ' + yourFellowUser, colors.yellow);

                try {
                    candidate = new window.RTCIceCandidate(
                        {
                            sdpMLineIndex: response.label,
                            candidate: JSON.parse(response.candidate)
                        });
                    peerConnection.addIceCandidate(candidate);

                    info('Processed Ice Message...', colors.green);

                    !isGotRemoteStream && setTimeout(checkRemoteCandidates, 100);
                } catch(e) {
                    try {
                        candidate = new window.RTCIceCandidate(
                            {
                                sdpMLineIndex: response.label,
                                candidate: response.candidate
                            });
                        peerConnection.addIceCandidate(candidate);

                        info('Processed Ice Message number ' + receivedCandidatesCount, colors.green);

                        !isGotRemoteStream && setTimeout(checkRemoteCandidates, 100);
                    } catch(e) {
                        info(e.stack, colors.red);
                        info('Unable to process ice message number ' + receivedCandidatesCount + '!', colors.yellow);

                        !isGotRemoteStream && setTimeout(checkRemoteCandidates, 100);
                    }
                }
            } //    </else>
        }   //      </anonymous function>
    ); //          </xhr>
}

/*========================================================== WebRTC ============================================================*/
/*================================================== WebRTC Offer/Answer Model ============================================================*/

/* Initializing the Peer Connection
***********************************/
function initPeer() {
    try {
        peerConnection = new window.webkitRTCPeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
        peerConnection.onicecandidate = gotIceCandidate;

        peerConnection.onaddstream = gotRemoteStream;
        peerConnection.addStream(clientStream);
    } catch(e) {
        info('WebRTC is not supported in this web browser!', colors.yellow);
    }
}

/*=============================================== WebRTC Offer Model ====================================================*/
var webrtc_offer = { };

/* Creating offer SDP from 1st end point
****************************************/
webrtc_offer.create_offer = function() {
    initPeer();

    info('Creating offer...');

    peerConnection.createOffer(function(sessionDescription) {
        info('Creating your offer...', colors.yellow);

        try {
            peerConnection.setLocalDescription(sessionDescription);
        } catch(e) {
            info('Unable to create your offer!', colors.yellow);
            info(e.stack, colors.red);
        }

        sdp = JSON.stringify(sessionDescription);

        var data = {
            sdp: sdp,
            type: 'offer',
            you: you,
            roomToken: roomToken
        };

        checkRemoteCandidates();
        xhr('PostSdp', data, function(response) {
            if (response) {
                info('Offer sent to your friend: ' + yourFellowUser, colors.green);
                webrtc_offer.wait_for_answer();
            }
        });
    }, null, { audio: true, video: true });
};

/* Waiting for 2nd end-point's answer
*************************************/
webrtc_offer.wait_for_answer = function() {
    info('Waiting for response from: ' + yourFellowUser + '!');

    var data = {
        type: 'offer',
        you: you,
        roomToken: roomToken
    };
    xhr('GetSdp', data, function(response) {

        if (response !== false) {
            info('Got response from your friend: ' + yourFellowUser);

            try {
                sdp = JSON.parse(response);
                peerConnection.setRemoteDescription(new window.RTCSessionDescription(sdp));
            } catch(e) {
                sdp = response;
                peerConnection.setRemoteDescription(new window.RTCSessionDescription(sdp));

                info('Completed the 2nd try!', colors.red);
            }
        } else
            setTimeout(webrtc_offer.wait_for_answer, 1000);
    });
};

/*============================================ WebRTC Answer Model =======================================================*/
var webrtc_answer = { };

/* Waiting for offer from 1st end-point
***************************************/
var offer_checking_times = 0;
webrtc_answer.wait_for_offer = function() {
    info('Waiting for offer from: ' + yourFellowUser);

    if (offer_checking_times > 50) {
        info('Too bad! --- Unable to get offer from ' + yourFellowUser, colors.yellow);
        return;
    }

    var data = {
        type: 'answer',
        you: you,
        roomToken: roomToken
    };

    xhr('GetSdp', data, function(response) {
        offer_checking_times++;

        if (response !== false) {
            info('Got offer from your friend: ' + yourFellowUser, colors.green);
            webrtc_answer.create_answer(response);
        } else setTimeout(webrtc_answer.wait_for_offer, 100);
    });
};

/* Got offer from 1st end point
*  Creating answer for 1st end point
************************************/
webrtc_answer.create_answer = function(sdpResponse) {
    initPeer();
    var sdp;
    try {
        sdp = JSON.parse(sdpResponse);

        peerConnection.setRemoteDescription(new window.RTCSessionDescription(sdp));
    } catch(e) {
        sdp = sdpResponse;

        peerConnection.setRemoteDescription(new window.RTCSessionDescription(sdp));
    }
    info('Trying to understand your friend\'s offer!');

    peerConnection.createAnswer(function(sessionDescription) {
        info('Creating your answer...', colors.yellow);

        try {
            peerConnection.setLocalDescription(sessionDescription);
        } catch(ee) {
            info('Unable to create your answer!', colors.yellow);
            info(e.stack, colors.red);
        }

        sdp = JSON.stringify(sessionDescription);

        var data = {
            sdp: sdp,
            type: 'answer',
            you: you,
            roomToken: roomToken
        };

        xhr('PostSdp', data, function(response) {
            response && info('Your answer created successfully!', colors.green);
        });
    }, null, { audio: true, video: true });
};


/*=============================================== UI specific functions ====================================================*/
nameInput.onkeypress = function(e) {
    if (!this.value.length) this.focus();
    else if (e.keyCode === 13) roomInput.focus();
};

roomInput.onkeyup = function(e) {
    if (!this.value.length) this.focus();
    else if (e.keyCode === 13 || e.keyCode === 9) {
        infoList.tabIndex = 0;
        infoList.focus();
        createButtonClick();
    }
};

findDOMElement('create-room').onclick = createButtonClick;

roomsList.onclick = function(e) {
    var target = e.target;
    if (!target.id) target = e.target.parentNode;

    if (target.id && target.id !== 'rooms-list') {
        roomToken = target.id;
        roomName = target.getAttribute('room-name');

        findDOMElement('room-title').innerHTML = roomName;

        you = prompt('Please enter your name', 'Anonymous');
        //captureCamera(joinRoom);
        joinRoom();
        hideRoomsList();
    }
};

getAvailableRooms();

/* feedback panel specific functions
************************************/
function feedbackRelevant() {
    var feedBackPreviewButton = findDOMElement('feedback-button'),
        feedBackPreview = findDOMElement('feedback-preview'),
        feedbacks = findDOMElement('feedbacks'),
        addFeedback = findDOMElement('feedback-now'),
        textarea = findDOMElement('feedback-message'),
        feedBackName = findDOMElement('name'),
        showMoreButton = findDOMElement('show-more');

    findDOMElement('close').onclick = function() {
        feedBackPreview.style.display = 'none';
        skipped = 0;
        took = 10;
    };
    
    var skipped = 0, took = 10;
    feedBackPreviewButton.onclick = function() {
        feedBackPreview.style.display = 'block';

        getFeedBacks(skipped, took, function(html) {
            feedbacks.innerHTML = html;
        });
    };

    function getFeedBacks(skip, take, callback) {
        var data = {
            skip: skip,
            take: take
        };
        xhr('GetFeedback', data, function(response) {
            var length = response.feedbacks.length, html = '';
            for (var i = 0; i < length; i++) {
                var feedback = response.feedbacks[i];
                html += '<section class="feedback"><time>' + feedback.time + '</time><div><span class="the-name">' + feedback.name + '</span> written:</div><div class="message">' + feedback.message + '</div></section>';
            }
            if (response.hasMore === true) showMoreButton.style.display = 'block';
            else showMoreButton.style.display = 'none';

            callback(html);
        });
    }

    addFeedback.onclick = function() {
        var name = validate(feedBackName.value),
            message = validate(textarea.value);

        if (!message.length) {
            alert('Please enter your feed back!');
            textarea.focus();
            return;
        }

        if (!name.length) {
            alert('Please enter your name!');
            feedBackName.focus();
            return;
        }

        name = name.length >= 20 ? (name.substr(0, 20) + '...') : name;
        message = message.length >= 2097000 ? (message.substr(0, 2097000) + '...') : message;

        textarea.value = feedBackName.value = '';

        var data = {
            name: name,
            message: message
        };
        xhr('NewFeedback', data, function(feedback) {
            feedbacks.innerHTML = '<section class="feedback"><time>' + feedback.time + '</time><div><span class="the-name">' + feedback.name + '</span> wrote:</div><div class="message">' + feedback.message + '</div></section>' + feedbacks.innerHTML;
            var first = feedbacks.getElementsByClassName('feedback')[0];
            first.tabIndex = 0;
            first.focus();
        });
    };

    findDOMElement('try-add-your-feedback').onclick = function() {
        findDOMElement('feedback-preview').innerHTML = '<iframe src="http://webchat.freenode.net?channels=webrtc&uio=Mj10cnVlJjQ9dHJ1ZSY5PXRydWUmMTA9dHJ1ZSYxMT01MSYxMj10cnVlce" width="900" height="' + (innerHeight - 20) + '"></iframe>';

    };
    showMoreButton.onclick = function() {
        skipped += 10;
        took += 10;
        getFeedBacks(skipped, took, function(html) {
            feedbacks.innerHTML += html;
        });
    };
}

feedbackRelevant();
xhr('TotalFeedbacks', null, function(total) {
    findDOMElement('total-feedback').innerHTML = total;
    findDOMElement('feedback-button').innerHTML = total;
});


/*=============================================== Good Luck! ====================================================
*  Muaz Khan
*  @muazkh:  http://twitter.com/muazkh
*  Github:   github.com/muaz-khan
*****************************************************************************************************************/