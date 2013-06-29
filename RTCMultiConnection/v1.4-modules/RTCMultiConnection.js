// 2013, @muazkh - github.com/muaz-khan
// MIT License - https://webrtc-experiment.appspot.com/licence/
// Documentation - https://github.com/muaz-khan/WebRTC-Experiment/tree/master/RTCMultiConnection

// a middle-agent between public API and the Signaler object

window.RTCMultiConnection = function(channel) {
    var signaler, self = this;

    this.channel = channel || location.href.replace( /\/|:|#|%|\.|\[|\]/g , '');
    this.userid = getToken();

    // on each new session
    this.onNewSession = function(session) {
        if (self._roomid && self._roomid != session.roomid)
            return;

        if (self.detectedRoom)
            return;
        self.detectedRoom = true;

        self.join(session);
    };

    function initSignaler() {
        signaler = new Signaler(self);
    }

    function captureUserMedia(callback) {
        var session = self.session,
            constraints = {
                audio: true,
                video: true
            };

        console.debug(JSON.stringify(session, null, '\t'));

        // using "noMediaStream" instead of "dontAttachStream"
        // using "stream" instead of "attachStream"
        if (self.noMediaStream || self.stream)
            return callback();

        if (isData(session)) {
            self.stream = null;
            return callback();
        }

        if (session.audio && !session.video) {
            constraints = {
                audio: true,
                video: false
            };
        } else if (session.screen) {
            var screen_constraints = {
                mandatory: {
                    chromeMediaSource: 'screen'
                },
                optional: []
            };
            constraints = {
                audio: false,
                video: screen_constraints
            };
        } else if (session.video && !session.audio) {
            var video_constraints = {
                mandatory: { },
                optional: []
            };
            constraints = {
                audio: false,
                video: video_constraints
            };
        }

        navigator.getUserMedia(constraints, onstream, mediaError);

        function onstream(stream) {
            var mediaElement = getMediaElement(stream, session);

            // preferred to set "true"
            mediaElement.muted = true;

            var streamid = getToken();

            // if local stream is stopped
            stream.onended = function() {
                if (self.onstreamended)
                    self.onstreamended(streamOutput);
            };

            var streamOutput = {
                mediaElement: mediaElement,
                stream: stream,
                userid: 'self',
                extra: self.extra || { },
                streamid: streamid,
                session: self.session,
                type: 'local'
            };

            self.onstream(streamOutput);

            if (!self.streams)
                self.streams = { };
            self.streams[streamid] = getStream(stream);

            self.stream = stream;
            callback(stream);
        }
    }

    // it is used to capture renegotiation streams
    this.captureUserMedia = captureUserMedia;

    // open new connection
    this.open = function(roomid) {
        self.detectedRoom = true;
        captureUserMedia(function() {
            !signaler && initSignaler();
            signaler.broadcast({
                roomid: roomid
            });
        });
    };

    // join pre-created data connection
    this.join = function(room) {
        // if room is shared oneway; don't capture self-media
        if (this.session.oneway)
            join();
        else
            captureUserMedia(join);

        function join() {
            !signaler && initSignaler();
            signaler.join({
                to: room.userid,
                roomid: room.roomid
            });
        }
    };

    this.send = function(data, _channel) {
        if (!data)
            throw 'No file, data or text message to share.';
        if (data.size)
            FileSender.send({
                file: data,
                root: self,
                channel: _channel,
                userid: self.userid,
                extra: self.extra
            });
        else
            TextSender.send({
                text: data,
                root: self,
                channel: _channel,
                userid: self.userid,
                extra: self.extra
            });
    };

    this.connect = function(roomid) {
        if (roomid)
            self._roomid = roomid;
        initSignaler();
    };

    this.session = {
        audio: true,
        video: true,
        data: true
    };

    this.maxParticipantsAllowed = 10;
};
