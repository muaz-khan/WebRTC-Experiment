// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

var users = {};

module.exports = exports = function(socket, maxRelayLimitPerUser) {
    try {
        maxRelayLimitPerUser = parseInt(maxRelayLimitPerUser) || 2;
    } catch (e) {
        maxRelayLimitPerUser = 2;
    }

    socket.on('join-broadcast', function(user) {
        try {
            if(!users[user.userid]) {
                socket.userid = user.userid;
                socket.isScalableBroadcastSocket = true;

                users[user.userid] = {
                    userid: user.userid,
                    broadcastId: user.broadcastId,
                    isBroadcastInitiator: false,
                    maxRelayLimitPerUser: maxRelayLimitPerUser,
                    relayReceivers: [],
                    receivingFrom: null,
                    canRelay: false,
                    typeOfStreams: user.typeOfStreams || {audio: true, video: true},
                    socket: socket
                }
            }

            var relayUser = getFirstAvailableBraodcater(user.broadcastId, maxRelayLimitPerUser);

            if(relayUser === 'ask-him-rejoin') {
                socket.emit('rejoin-broadcast', user.broadcastId);
                return;
            }

            if (relayUser && user.userid !== user.broadcastId) {
                var hintsToJoinBroadcast = {
                    typeOfStreams: relayUser.typeOfStreams,
                    userid: relayUser.userid
                };

                users[user.userid].receivingFrom = relayUser.userid;
                users[relayUser.userid].relayReceivers.push(
                    users[user.userid]
                );
                users[user.broadcastId].lastRelayuserid = relayUser.userid;

                socket.emit('join-broadcaster', hintsToJoinBroadcast);

                // logs for current socket
                socket.emit('logs', 'You <' + user.userid + '> are getting data/stream from <' + relayUser.userid + '>');

                // logs for target relaying user
                relayUser.socket.emit('logs', 'You <' + relayUser.userid + '>' + ' are now relaying/forwarding data/stream to <' + user.userid + '>');
            } else {
                users[user.userid].isBroadcastInitiator = true;
                socket.emit('start-broadcasting', users[user.userid].typeOfStreams);

                // logs to tell he is now broadcast initiator
                socket.emit('logs', 'You <' + user.userid + '> are now serving the broadcast.');
            }
        } catch (e) {
            consoleLog(e);
        }
    });

    socket.on('scalable-broadcast-message', function(message) {
        socket.broadcast.emit('scalable-broadcast-message', message);
    });

    socket.on('can-relay-broadcast', function() {
        if(users[socket.userid]) {
            users[socket.userid].canRelay = true;
        }
    });

    socket.on('can-not-relay-broadcast', function() {
        if(users[socket.userid]) {
            users[socket.userid].canRelay = false;
        }
    });

    socket.on('check-broadcast-presence', function(userid, callback) {
        // we can pass number of viewers as well
        try {
            callback(!!users[userid] && users[userid].isBroadcastInitiator === true);
        }
        catch(e) {
            consoleLog(e);
        }
    });

    socket.on('disconnect', function() {
        try {
            if (!socket.isScalableBroadcastSocket) return;

            var user = users[socket.userid];

            if(!user) return;

            if(user.isBroadcastInitiator === true) {
                consoleLog({
                    'initiator-left': true,
                    'userid': user.userid,
                    'broadcastId': user.broadcastId,
                    'isBroadcastInitiator': user.isBroadcastInitiator,
                    'relayReceivers': Object.keys(user.relayReceivers)
                });

                // need to stop entire broadcast?
                for(var n in users) {
                    var _user = users[n];
                    
                    if(_user.broadcastId === user.broadcastId) {
                        _user.socket.emit('broadcast-stopped', user.broadcastId);
                    }
                }

                delete users[socket.userid];
                return;
            }

            if(user.receivingFrom || user.isBroadcastInitiator === true) {
                var parentUser = users[user.receivingFrom];

                if(parentUser) {
                    var newArray = [];
                    parentUser.relayReceivers.forEach(function(n) {
                        if(n.userid !== user.userid) {
                            newArray.push(n);
                        }
                    });
                    users[user.receivingFrom].relayReceivers = newArray;
                }
            }

            if(user.relayReceivers.length && user.isBroadcastInitiator === false) {
                askNestedUsersToRejoin(user.relayReceivers);
            }

            delete users[socket.userid];
        } catch (e) {
            consoleLog(e);
        }
    });
};

function askNestedUsersToRejoin(relayReceivers) {
    try {
        var usersToAskRejoin = [];

        relayReceivers.forEach(function(receiver) {
            if(!!users[receiver.userid]) {
                users[receiver.userid].canRelay = false;
                users[receiver.userid].receivingFrom = null;
                receiver.socket.emit('rejoin-broadcast', receiver.broadcastId);
            }
            
        });
    }
    catch(e) {
        consoleLog(e);
    }
}

function getFirstAvailableBraodcater(broadcastId, maxRelayLimitPerUser) {
    try {
        var broadcastInitiator = users[broadcastId];

        // if initiator is capable to receive users
        if(broadcastInitiator.relayReceivers.length < maxRelayLimitPerUser) {
            return broadcastInitiator;
        }
        
        // otherwise if initiator knows who is current relaying user
        if(broadcastInitiator.lastRelayuserid) {
            var lastRelayUser = users[broadcastInitiator.lastRelayuserid];
            if(lastRelayUser && lastRelayUser.relayReceivers.length < maxRelayLimitPerUser) {
                return lastRelayUser;
            }
        }

        // otherwise, search for a user who not relayed anything yet
        var userFound;
        for(var n in users) {
            var user = users[n];
            
            if(userFound) {
                continue;
            }
            else if(user.broadcastId === broadcastId) {
                if(!user.relayReceivers.length && user.canRelay === true) {
                    userFound = user;
                }
            }
        }

        if(userFound) {
            return userFound;
        }

        // need to increase "maxRelayLimitPerUser" in this situation
        // so that each relaying user can distribute the bandwidth
        return broadcastInitiator;
    } catch (e) {
        consoleLog(e);
    }
}

function consoleLog() {
    // return; // comment this line for development testings

    // console.log(arguments);
}