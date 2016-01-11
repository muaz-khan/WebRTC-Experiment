// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

var listOfBroadcasts = {};
var listOfSockets = {};

module.exports = exports = function(socket, singleBroadcastAttendees) {
    try {
        singleBroadcastAttendees = parseInt(singleBroadcastAttendees) || 3;
    } catch (e) {
        singleBroadcastAttendees = 3;
    }

    var currentUser;
    socket.on('join-broadcast', function(user) {
        try {
            currentUser = user;

            user.numberOfViewers = 0;
            if (!listOfBroadcasts[user.broadcastid]) {
                listOfBroadcasts[user.broadcastid] = {
                    numberOfViewers: 0,
                    broadcasters: {},
                    allusers: {},
                    typeOfStreams: user.typeOfStreams // object-booleans: audio, video, screen
                };
            }

            if(!listOfSockets[user.userid]) {
                listOfSockets[user.userid] = socket;
            }

            var firstAvailableBroadcaster = getFirstAvailableBraodcater(user, singleBroadcastAttendees);
            if (firstAvailableBroadcaster) {
                listOfBroadcasts[user.broadcastid].broadcasters[firstAvailableBroadcaster.userid].numberOfViewers++;
                socket.emit('join-broadcaster', firstAvailableBroadcaster, listOfBroadcasts[user.broadcastid].typeOfStreams);

                socket.emit('logs', 'You <' + user.userid + '> are getting data/stream from <' + firstAvailableBroadcaster.userid + '>');

                var remoteSocket = listOfSockets[firstAvailableBroadcaster.userid];
                remoteSocket.emit('logs', 'You <' + firstAvailableBroadcaster.userid + '>' + ' are now relaying/forwarding data/stream to <' + user.userid + '>');
            } else {
                currentUser.isInitiator = true;
                socket.emit('start-broadcasting', listOfBroadcasts[user.broadcastid].typeOfStreams);

                socket.emit('logs', 'You <' + user.userid + '> are now serving the broadcast.');
            }

            listOfBroadcasts[user.broadcastid].broadcasters[user.userid] = user;
            listOfBroadcasts[user.broadcastid].allusers[user.userid] = user;
        } catch (e) {}
    });

    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });

    socket.on('disconnect', function() {
        try {
            if (!currentUser) return;
            
            if(listOfSockets[currentUser.userid]) {
                delete listOfSockets[currentUser.userid];
            }

            if (!listOfBroadcasts[currentUser.broadcastid]) return;
            if (!listOfBroadcasts[currentUser.broadcastid].broadcasters[currentUser.userid]) return;

            delete listOfBroadcasts[currentUser.broadcastid].broadcasters[currentUser.userid];
            if (currentUser.isInitiator) {
                delete listOfBroadcasts[currentUser.broadcastid];
            }
        } catch (e) {}
    });
};

function getFirstAvailableBraodcater(user, singleBroadcastAttendees) {
    try {
        var broadcasters = listOfBroadcasts[user.broadcastid].broadcasters;
        var firstResult;
        for (var userid in broadcasters) {
            if (!firstResult && broadcasters[userid].numberOfViewers <= singleBroadcastAttendees) {
                firstResult = broadcasters[userid];
                continue;
            } else {
                delete listOfBroadcasts[user.broadcastid].broadcasters[userid];
            }
        }
        return firstResult;
    } catch (e) {}
}
