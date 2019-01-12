import { Component, ViewChild } from '@angular/core';
import { Platform } from 'ionic-angular';
import { AndroidPermissions } from '@ionic-native/android-permissions';
import * as io from 'socket.io-client';
import * as RTCMultiConnection from 'rtcmulticonnection';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {
  connection: any;
  vid: any;
  @ViewChild('localVideo') localVideo;
  @ViewChild('localVideoContaner') localVideoContaner;
  @ViewChild('remoteVideo') remoteVideo;
  @ViewChild('txtRoomId') txtRoomId;
  @ViewChild('btnOpenOrJoinRoom') btnOpenOrJoinRoom;
  @ViewChild('h1') h1;
  @ViewChild('leaveRoom') leaveRoom;

  // public androidPermissions: AndroidPermissions
  constructor(public platform: Platform, androidPermissions: AndroidPermissions) {
        platform.ready().then(() => {
             this.localVideo = document.getElementById('localVideo');
             this.localVideoContaner = document.getElementById('localVideoContaner');
             this.remoteVideo = document.getElementById('remoteVideo');
             this.txtRoomId = document.getElementById('txtRoomId');
             this.btnOpenOrJoinRoom = document.getElementById('btnOpenOrJoinRoom');
             this.h1 = document.getElementById('h1');
             this.leaveRoom = document.getElementById('leaveRoom');

             var that = this;
             this.btnOpenOrJoinRoom.onclick = () => {
                 var roomid = that.txtRoomId.value;
                 if(!roomid || !roomid.replace(/ /g, '').length) {
                    alert('Please enter roomid.');
                    return;
                 }

                 that.btnOpenOrJoinRoom.style.display = 'none';
                 that.txtRoomId.style.display = 'none';

                 that.connection = new RTCMultiConnection();
                 that.setDefaults();
                 that.checkAndroidPermissions(androidPermissions, function() {
                    that.openOrJoin();
                 });
             };

             this.txtRoomId.onpaste = this.txtRoomId.onkeyup = this.txtRoomId.onblur = function() {
                localStorage.setItem('roomId', this.value);
             };

             if(localStorage.getItem('roomId')) {
                this.txtRoomId.value = localStorage.getItem('roomId');
             }

             this.leaveRoom.onclick = function() {
                this.style.display = 'none';
                location.reload();
             };
        });
  }

  openRoom() {
    var that = this;
    this.connection.open(this.txtRoomId.value, function (isRoomOpened, roomid, error) {
      if(error) {
        that.h1.innerHTML = error;
      }
    });
  }

  joinRoom() {
    var that = this;
    this.connection.join(this.txtRoomId.value, function (isRoomJoined, roomid, error) {
      if(error) {
        that.h1.innerHTML = error;
      }
    });
  }

  openOrJoin() {
    var that = this;
    this.connection.openOrJoin(this.txtRoomId.value, function (isRoomOpened, roomid, error) {
      if(error) {
        that.h1.innerHTML = error;
      }
    });
  }

  checkAndroidPermissions(permissions, callback) {
    this.connection.dontCaptureUserMedia = true;
    var that = this;
    navigator.getUserMedia({video: true, audio: true}, function(stream) {
        that.connection.attachStreams.push(stream);
        that.connection.onstream({
            type: 'local',
            stream: stream
        });
        callback();
    }, function(error) {
        that.h1.innerHTML = 'Please open settings for "com.ionic.conference" and manually enable both camera and microphone permissions.';
    });
  }

  checkAndroidPermissions___(permissions, callback) {
        var arr = [
            permissions.CAMERA,
            permissions.RECORD_AUDIO,
            permissions.MODIFY_AUDIO_SETTINGS
        ];

        permissions.hasPermission(arr, function(status) {
            if (status.hasPermission) {
                callback();
                return;
            }

            permissions.requestPermissions(arr, function(status) {
                if (status.hasPermission) {
                    callback();
                    return;
                }
                alert('Please manually enable camera and microphone permissions.');
            }, function() {
                alert('Please manually enable camera and microphone permissions.');
            });
        }, function() {
            alert('Please manually enable camera and microphone permissions.');
        });
  }

  closeRoom(){
    this.connection.close();
    this.connection.closeSocket();
  }

  setDefaults(){
    this.connection.setCustomSocketHandler(SocketConnection);
    this.connection.socketURL = 'https://rtcmulticonnection.herokuapp.com:443/';
    this.connection.socketMessageEvent = 'video-conference-demo';
    this.connection.session = {
      audio: true,
      video: true
    };

    this.connection.mediaConstraints = {
      audio: true,
      video: true
    };

    this.connection.sdpConstraints.mandatory = {
      OfferToReceiveAudio: true,
      OfferToReceiveVideo: true
    };

    this.connection.autoCreateMediaElement = false;

    var that = this;

    this.connection.onstream = function(event) {
        that.leaveRoom.style.display = 'block';

        if(event.type === 'local') {
            that.localVideo.muted = true;
            that.localVideo.volume = 0;
            that.localVideo.srcObject = event.stream;
            that.localVideoContaner.style.display = 'block';
        }
        
        if(event.type === 'remote') {
            that.remoteVideo.srcObject = event.stream;
            that.remoteVideo.style.display = 'block';
        }
    };

    this.connection.onstreamended = function(event) {
        that.remoteVideo.style.display = 'none';
        that.remoteVideo.srcObject = null;
    };
  }
}

function SocketConnection(connection, connectCallback) {
    function isData(session) {
        return !session.audio && !session.video && !session.screen && session.data;
    }

    var parameters = '';

    parameters += '?userid=' + connection.userid;
    parameters += '&sessionid=' + connection.sessionid;
    parameters += '&msgEvent=' + connection.socketMessageEvent;
    parameters += '&socketCustomEvent=' + connection.socketCustomEvent;
    parameters += '&autoCloseEntireSession=' + !!connection.autoCloseEntireSession;

    if (connection.session.broadcast === true) {
        parameters += '&oneToMany=true';
    }

    parameters += '&maxParticipantsAllowed=' + connection.maxParticipantsAllowed;

    if (connection.enableScalableBroadcast) {
        parameters += '&enableScalableBroadcast=true';
        parameters += '&maxRelayLimitPerUser=' + (connection.maxRelayLimitPerUser || 2);
    }

    parameters += '&extra=' + JSON.stringify(connection.extra || {});

    if (connection.socketCustomParameters) {
        parameters += connection.socketCustomParameters;
    }

    try {
        io.sockets = {};
    } catch (e) {};

    if (!connection.socketURL) {
        connection.socketURL = '/';
    }

    if (connection.socketURL.substr(connection.socketURL.length - 1, 1) != '/') {
        // connection.socketURL = 'https://domain.com:9001/';
        throw '"socketURL" MUST end with a slash.';
    }

    if (connection.enableLogs) {
        if (connection.socketURL == '/') {
            console.info('socket.io url is: ', location.origin + '/');
        } else {
            console.info('socket.io url is: ', connection.socketURL);
        }
    }

    try {
        connection.socket = io(connection.socketURL + parameters);
    } catch (e) {
        connection.socket = io.connect(connection.socketURL + parameters, connection.socketOptions);
    }

    var mPeer = connection.multiPeersHandler;

    connection.socket.on('extra-data-updated', function(remoteUserId, extra) {
        if (!connection.peers[remoteUserId]) return;
        connection.peers[remoteUserId].extra = extra;

        connection.onExtraDataUpdated({
            userid: remoteUserId,
            extra: extra
        });

        updateExtraBackup(remoteUserId, extra);
    });

    function updateExtraBackup(remoteUserId, extra) {
        if (!connection.peersBackup[remoteUserId]) {
            connection.peersBackup[remoteUserId] = {
                userid: remoteUserId,
                extra: {}
            };
        }

        connection.peersBackup[remoteUserId].extra = extra;
    }

    function onMessageEvent(message) {
        if (message.remoteUserId != connection.userid) return;

        if (connection.peers[message.sender] && connection.peers[message.sender].extra != message.message.extra) {
            connection.peers[message.sender].extra = message.extra;
            connection.onExtraDataUpdated({
                userid: message.sender,
                extra: message.extra
            });

            updateExtraBackup(message.sender, message.extra);
        }

        if (message.message.streamSyncNeeded && connection.peers[message.sender]) {
            var stream = connection.streamEvents[message.message.streamid];
            if (!stream || !stream.stream) {
                return;
            }

            var action = message.message.action;

            if (action === 'ended' || action === 'inactive' || action === 'stream-removed') {
                if (connection.peersBackup[stream.userid]) {
                    stream.extra = connection.peersBackup[stream.userid].extra;
                }
                connection.onstreamended(stream);
                return;
            }

            var type = message.message.type != 'both' ? message.message.type : null;

            if (typeof stream.stream[action] == 'function') {
                stream.stream[action](type);
            }
            return;
        }

        if (message.message === 'dropPeerConnection') {
            connection.deletePeer(message.sender);
            return;
        }

        if (message.message.allParticipants) {
            if (message.message.allParticipants.indexOf(message.sender) === -1) {
                message.message.allParticipants.push(message.sender);
            }

            message.message.allParticipants.forEach(function(participant) {
                mPeer[!connection.peers[participant] ? 'createNewPeer' : 'renegotiatePeer'](participant, {
                    localPeerSdpConstraints: {
                        OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    remotePeerSdpConstraints: {
                        OfferToReceiveAudio: connection.session.oneway ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                        OfferToReceiveVideo: connection.session.oneway ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                    },
                    isOneWay: !!connection.session.oneway || connection.direction === 'one-way',
                    isDataOnly: isData(connection.session)
                });
            });
            return;
        }

        if (message.message.newParticipant) {
            if (message.message.newParticipant == connection.userid) return;
            if (!!connection.peers[message.message.newParticipant]) return;

            mPeer.createNewPeer(message.message.newParticipant, message.message.userPreferences || {
                localPeerSdpConstraints: {
                    OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                },
                remotePeerSdpConstraints: {
                    OfferToReceiveAudio: connection.session.oneway ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: connection.session.oneway ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                },
                isOneWay: !!connection.session.oneway || connection.direction === 'one-way',
                isDataOnly: isData(connection.session)
            });
            return;
        }

        if (message.message.readyForOffer) {
            if (connection.attachStreams.length) {
                connection.waitingForLocalMedia = false;
            }

            if (connection.waitingForLocalMedia) {
                // if someone is waiting to join you
                // make sure that we've local media before making a handshake
                setTimeout(function() {
                    onMessageEvent(message);
                }, 1);
                return;
            }
        }

        if (message.message.newParticipationRequest && message.sender !== connection.userid) {
            if (connection.peers[message.sender]) {
                connection.deletePeer(message.sender);
            }

            var userPreferences = {
                extra: message.extra || {},
                localPeerSdpConstraints: message.message.remotePeerSdpConstraints || {
                    OfferToReceiveAudio: connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: connection.sdpConstraints.mandatory.OfferToReceiveVideo
                },
                remotePeerSdpConstraints: message.message.localPeerSdpConstraints || {
                    OfferToReceiveAudio: connection.session.oneway ? !!connection.session.audio : connection.sdpConstraints.mandatory.OfferToReceiveAudio,
                    OfferToReceiveVideo: connection.session.oneway ? !!connection.session.video || !!connection.session.screen : connection.sdpConstraints.mandatory.OfferToReceiveVideo
                },
                isOneWay: typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!connection.session.oneway || connection.direction === 'one-way',
                isDataOnly: typeof message.message.isDataOnly !== 'undefined' ? message.message.isDataOnly : isData(connection.session),
                dontGetRemoteStream: typeof message.message.isOneWay !== 'undefined' ? message.message.isOneWay : !!connection.session.oneway || connection.direction === 'one-way',
                dontAttachLocalStream: !!message.message.dontGetRemoteStream,
                connectionDescription: message,
                successCallback: function() {}
            };

            connection.onNewParticipant(message.sender, userPreferences);
            return;
        }

        if (message.message.changedUUID) {
            if (connection.peers[message.message.oldUUID]) {
                connection.peers[message.message.newUUID] = connection.peers[message.message.oldUUID];
                delete connection.peers[message.message.oldUUID];
            }
        }

        if (message.message.userLeft) {
            mPeer.onUserLeft(message.sender);

            if (!!message.message.autoCloseEntireSession) {
                connection.leave();
            }

            return;
        }

        mPeer.addNegotiatedMessage(message.message, message.sender);
    }

    connection.socket.on(connection.socketMessageEvent, onMessageEvent);

    var alreadyConnected = false;

    connection.socket.resetProps = function() {
        alreadyConnected = false;
    };

    connection.socket.on('connect', function() {
        if (alreadyConnected) {
            return;
        }
        alreadyConnected = true;

        if (connection.enableLogs) {
            console.info('socket.io connection is opened.');
        }

        setTimeout(function() {
            connection.socket.emit('extra-data-updated', connection.extra);
        }, 1000);

        if (connectCallback) {
            connectCallback(connection.socket);
        }
    });

    connection.socket.on('disconnect', function() {
        if (connection.enableLogs) {
            console.warn('socket.io connection is closed');
        }
    });

    connection.socket.on('user-disconnected', function(remoteUserId) {
        if (remoteUserId === connection.userid) {
            return;
        }

        connection.onUserStatusChanged({
            userid: remoteUserId,
            status: 'offline',
            extra: connection.peers[remoteUserId] ? connection.peers[remoteUserId].extra || {} : {}
        });

        connection.deletePeer(remoteUserId);
    });

    connection.socket.on('user-connected', function(userid) {
        if (userid === connection.userid) {
            return;
        }

        connection.onUserStatusChanged({
            userid: userid,
            status: 'online',
            extra: connection.peers[userid] ? connection.peers[userid].extra || {} : {}
        });
    });

    connection.socket.on('closed-entire-session', function(sessionid, extra) {
        connection.leave();
        connection.onEntireSessionClosed({
            sessionid: sessionid,
            userid: sessionid,
            extra: extra
        });
    });

    connection.socket.on('userid-already-taken', function(useridAlreadyTaken, yourNewUserId) {
        connection.onUserIdAlreadyTaken(useridAlreadyTaken, yourNewUserId);
    });

    connection.socket.on('logs', function(log) {
        if (!connection.enableLogs) return;
        console.debug('server-logs', log);
    });

    connection.socket.on('number-of-broadcast-viewers-updated', function(data) {
        connection.onNumberOfBroadcastViewersUpdated(data);
    });

    connection.socket.on('set-isInitiator-true', function(sessionid) {
        if (sessionid != connection.sessionid) return;
        connection.isInitiator = true;
    });
}
