![WebRTC Experiment!](https://sites.google.com/site/muazkh/logo.png)

Real-time [WebRTC Experiment](https://webrtc-experiment.appspot.com/javascript/): A Realtime JavaScript Only WebRTC Experiment that uses PUBNUB to allow sharing of WebRTC audio/video streams smoothly and directly right in the JavaScript! No ASP.NET, No Python, No PHP and no Java! 

## Preview / Demo

* [JavaScript Only WebRTC Experiment](https://webrtc-experiment.appspot.com/javascript/) - [TURN](https://webrtc-experiment.appspot.com/javascript/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/javascript/)
* [ASPNET MVC specific WebRTC Experiment](https://webrtc-experiment.appspot.com/aspnet-mvc/) - [TURN](https://webrtc-experiment.appspot.com/aspnet-mvc/?turn=true) / [STUN](https://webrtc-experiment.appspot.com/aspnet-mvc/)

## Screenshot

![WebRTC Screenshot 2](https://muazkh.appspot.com/images/WebRTC.png)

##Credits

* Everything: [Muaz Khan](http://github.com/muaz-khan)
* WebRTC APIs: [WebRTC.org](http://www.webrtc.org/) - Thank you Google!

##Browsers

It works in Chrome 23 and upper. You'll see the support of Mozilla Firefox soon!

## JavaScript code!

```javascript
window.PeerConnection = window.webkitRTCPeerConnection || window.mozRTCPeerConnection || window.RTCPeerConnection;
            window.SessionDescription = window.RTCSessionDescription || window.mozRTCSessionDescription || window.RTCSessionDescription;
            window.IceCandidate = window.RTCIceCandidate || window.mozRTCIceCandidate || window.RTCIceCandidate;

            window.URL = window.webkitURL || window.URL;
            navigator.getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.getUserMedia;

            var global = {}, RTC = { active: false }, peerConnection;

            RTC.init = function(response) {
                if (!peerConnection) {
                    try {
                        peerConnection = new PeerConnection({ "iceServers": [{ "url": "stun:stun.l.google.com:19302" }] });
                    } catch(e) {
                        log('WebRTC is not supported in this web browser!');
                        alert('WebRTC is not supported in this web browser!');
                    }
                    peerConnection.onicecandidate = RTC.onicecandidate;
                    peerConnection.onaddstream = RTC.onaddstream;
                    peerConnection.addStream(global.clientStream);

                    RTC.active = true;
                }

                if (global.offerer && response) {
                    peerConnection.setRemoteDescription(new SessionDescription(JSON.parse(response)));
                } else if (response) {
                    peerConnection.setRemoteDescription(new SessionDescription(JSON.parse(response)));

                    peerConnection.createAnswer(function(sessionDescription) {
                        peerConnection.setLocalDescription(sessionDescription);

                        var sdp = JSON.stringify(sessionDescription);
                        var firstPart = sdp.substr(0, 700),
                            secondPart = sdp.substr(701, sdp.length - 1);

                        pubnub.send({
                            userToken: global.userToken,
                            firstPart: firstPart
                        });

                        pubnub.send({
                            userToken: global.userToken,
                            secondPart: secondPart
                        });
                    }, null, { audio: true, video: true });

                }

                if (!response && global.offerer && global.participant) {
                    peerConnection.createOffer(function(sessionDescription) {
                        peerConnection.setLocalDescription(sessionDescription);

                        var sdp = JSON.stringify(sessionDescription);
                        var firstPart = sdp.substr(0, 700),
                            secondPart = sdp.substr(701, sdp.length - 1);

                        pubnub.send({
                            userToken: global.userToken,
                            firstPart: firstPart
                        });

                        pubnub.send({
                            userToken: global.userToken,
                            secondPart: secondPart
                        });
                    }, null, { audio: true, video: true });
                }
            };

            RTC.onicecandidate = function (event) {
                if (global.stopSendingICE || !event.candidate || !peerConnection) return;
                
                pubnub.send({
                    userToken: global.userToken,
                    candidate: {
                        sdpMLineIndex: event.candidate.sdpMLineIndex,
                        candidate: JSON.stringify(event.candidate.candidate)
                    }
                });

                log('Posted ICE: ' + event.candidate.candidate);
            };

            var remoteVideo = $('#remote-video');
            RTC.onaddstream = function(remoteEvent) {
                if (remoteEvent) {
                    remoteVideo.css('top', '-100%').show().play();

                    if (!navigator.mozGetUserMedia) remoteVideo.src = window.URL.createObjectURL(remoteEvent.stream);
                    else remoteVideo.mozSrcObject = remoteEvent.stream;

                    RTC.waitUntilRemoteStreamStartFlowing();
                }
            };

            RTC.waitUntilRemoteStreamStartFlowing = function() {
                log('Waiting for remote stream flow!');
                if (!(remoteVideo.readyState <= HTMLMediaElement.HAVE_CURRENT_DATA || remoteVideo.paused || remoteVideo.currentTime <= 0)) {
                    global.isGotRemoteStream = true;

                    remoteVideo.css('top', 0);
                    clientVideo.css('width', (innerWidth / 4) + 'px').css('height', '').css('z-index', 2000000);

                    pubnub.send({
                        userToken: global.userToken,
                        gotStream: true
                    });

                    log('Finally got the remote stream!');
                    startChatting();
                } else setTimeout(RTC.waitUntilRemoteStreamStartFlowing, 200);
            };


            function uniqueToken() {
                var S4 = function() {
                    return Math.floor(Math.random() * 0x10000).toString(16);
                };

                return S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4();
            }

            function hideListsAndBoxes() {
                $('.create-room-panel').css('left', '-100%');
                $('aside').css('right', '-100%');
                $('.private-room').css('bottom', '-100%');

                global.isGetAvailableRoom = false;
            }

            hideListsAndBoxes();

            function showListsAndBoxes() {
                $('.create-room-panel').css('left', 'auto');
                $('aside').css('right', 'auto');
                $('.private-room').css('bottom', '4%');

                global.isGetAvailableRoom = true;
            }

            global.mediaAccessAlertMessage = 'This app wants to use your camera and microphone.\n\nGrant it the access!';

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

                if (isChecked && partnerEmail.value.length) global.roomToken = partnerEmail.value + global.roomToken;
                global.offerer = true;
                global.isPrivate = isChecked && partnerEmail.value.length;

                spreadRoom();
            });

            function spreadRoom() {
                var g = global;
                
                pubnub.send({
                    roomToken: g.roomToken,
                    ownerName: g.userName,
                    ownerToken: g.userToken,
                    roomName: g.roomName,
                    isPrivate: g.isPrivate
                });

                !global.participant && setTimeout(spreadRoom, 500);
            }

            $('#search-room').bind('click', function() {
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


            var clientVideo = $('#client-video');

            function captureCamera() {
                navigator.getUserMedia({ audio: true, video: true },
                    function(stream) {

                        if (!navigator.mozGetUserMedia) clientVideo.src = window.URL.createObjectURL(stream);
                        else clientVideo.mozSrcObject = stream;

                        global.clientStream = stream;

                        clientVideo.play();
                    },
                    function() {
                        location.reload();
                    });
            }

            global.isGetAvailableRoom = true;
            global.defaultChannel = 'WebRTC Experiments Room';
            var pubnub = {
                channel: global.defaultChannel
            };

            var PUBNUB = window.PUBNUB || {};
            pubnub.init = function(pub) {
                PUBNUB.subscribe({
                    channel: pubnub.channel,
                    restore: false,
                    callback: pub.callback,
                    disconnect: pub.disconnect,
                    connect: pub.connect
                });
            };

            pubnub.send = function(data) {
                PUBNUB.publish({
                    channel: pubnub.channel,
                    message: data
                });
            };

            var aside = $('aside');

            function getAvailableRooms(response) {
                if (!global.isGetAvailableRoom || !response.ownerToken) return;

                if (response.isPrivate === true) {
                    document.title = 'private';
                    if (!global.searchPrivateRoom) return;
                    if (response.roomToken.indexOf(global.searchPrivateRoom) !== 0) return;
                }

                var alreadyExist = $('#' + response.ownerToken);
                if (alreadyExist) return;

                aside.innerHTML = '<div id="' + response.ownerToken + '"><h2>' + response.roomName + '</h2><small>Created by ' + response.ownerName + '</small><span id="' + response.roomToken + '">Join</span></div>' + aside.innerHTML;

                $('aside span', true).each(function (span) {
                    span.bind('click', function () {
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
                                forUser: forUser
                            });

                        pubnub.channel = global.roomToken;
                        initPubNub();
                    });
                });
            }


            function startChatting() {
                $('footer').css('bottom', '-100%');
                
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

                pubnub.send({
                    userName: global.userName,
                    userToken: global.userToken,
                    isChat: true,
                    message: message
                });

                chatBox.value = '';
                chatBox.focus();
            }

            function getChatMessage(response) {
                if(!response.message.length) return;
                aside.innerHTML = '<div><h2>' + response.userName + '</h2>' + response.message + '</div>' + aside.innerHTML;
                document.title = response.userName + ': ' + response.message;
            }

            function refreshUI() {
                $('footer').css('bottom', '0');
                $('aside').innerHTML = '';
                $('aside').css('z-index', 100).css('top', 'auto').css('right', '0').show();
                $('.chat-box').hide();
                $('.private-room').css('bottom', '4%');
                $('.create-room-panel').css('left', 'auto');

                log('RTC room is closed by other user.');
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

            function initPubNub(callback) {
                pubnub.init({
                    callback: function (response) {
                        if (response.userToken === global.userToken) return;


                        if (global.isGetAvailableRoom && response.roomToken) getAvailableRooms(response);
                        else if (response.firstPart || response.secondPart) {
                            if (response.firstPart) {
                                global.firstPart = response.firstPart;
                                if (global.secondPart) {
                                    RTC.init(global.firstPart + global.secondPart);
                                }
                            }
                            if (response.secondPart) {
                                global.secondPart = response.secondPart;
                                if (global.firstPart) {
                                    RTC.init(global.firstPart + global.secondPart);
                                }
                            }
                        } else if (response.participant && response.forUser == global.userToken) {
                            setTimeout(function() {
                                global.participant = response.participant;
                                pubnub.channel = global.roomToken;
                                initPubNub(RTC.init);
                            }, 100);
                        } 
                        else if (response.sdp) {
                            RTC.init(response);
                        } 
                        else if (RTC.active && response.candidate && !global.isGotRemoteStream) {
                            peerConnection.addIceCandidate(new IceCandidate({
                                sdpMLineIndex: response.candidate.sdpMLineIndex,
                                candidate: JSON.parse(response.candidate.candidate)
                            }));
                        } 
                        else if (response.isChat) getChatMessage(response);
                        else if (response.gotStream) global.stopSendingICE = true;
                        else if (response.end) refreshUI();
                    },
                    connect: function () {
                        callback && callback();
                    },
                    disconnect: function () {
                        initPubNub(function () {
                            showListsAndBoxes();
                            pubnub.send({
                                end: true,
                                userName: global.userName
                            });
                        });
                    }
                });
            }

            initPubNub(function () {
                showListsAndBoxes();
                captureCamera();
            });
```

##Spec references 

* [http://dev.w3.org/2011/webrtc/editor/webrtc.html](http://dev.w3.org/2011/webrtc/editor/webrtc.html)


## License
Copyright (c) 2012 Muaz Khan
Licensed under the MIT license.