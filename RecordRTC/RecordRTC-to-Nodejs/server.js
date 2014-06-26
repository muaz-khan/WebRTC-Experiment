var config = require('./config'),
    url = require('url');

function start(route, handle) {
    var fs = require('fs');
    var express = require('express');

    var app = express();

    app.use(function (request, response, next) {
        if(req.url.lastIndexOf('/')+1 == req.url.length) {
            req.url = req.url + 'index.html';
            express.static(__dirname  + '/public')(req, res, next);
        }
        else if(req.url.match(/JS|CSS|HTML|PNG|JPEG|JPG|GIF/gi)) {
            express.static(__dirname  + '/public')(req, res, next);
        } else {
            var pathname = url.parse(request.url).pathname,
                postData = '';

            request.setEncoding('utf8');

            request.addListener('data', function (postDataChunk) {
                postData += postDataChunk;
            });

            request.addListener('end', function () {
                route(handle, pathname, response, postData);
            });
        }
    });

    var server = require('http').createServer(app);

    var io = require('socket.io').listen(server);

    console.log('listening on port 8080');

    io.set('transports', [
        // 'websocket',
        'xhr-polling',
        'jsonp-polling'
    ]);

    var channels = {}, performers = {};
    var users = {};

    io.sockets.on('connection', function (socket) {
        var sessionDescription, userid = socket.handshake.query.userid;
        
        users[userid] = socket;
        
        socket.on('message', function(data) {
            socket.broadcast.emit('message', data);
        });
        
        socket.on('message-00', function(data) {
            socket.broadcast.emit('message-00', data);
        });
        
        socket.on('disconnect', function () {
            if(performers[userid]) {
                delete performers[userid];
                socket.broadcast.emit('performers', performers);
            }
            
            if (io.sockets && io.sockets[socket.id]) {
                delete io.sockets[socket.id];
            }

            if (io.sockets && io.sockets.clients && io.sockets.clients(socket.id)) {
                delete io.sockets.clients(socket.id);
            }
            
            socket.broadcast.emit('user-left', {
                userid: userid,
                isInitiator: !!sessionDescription,
                session: sessionDescription ? sessionDescription : '',
                extra: {}
            });
        });
        
        socket.on('new-performer', function(performerid) {
            performers[performerid] = performerid;
            
            socket.broadcast.emit('performers', performers);
        });
        
        socket.on('remove-performer', function(performerid) {
            if(performers[performerid]) {
                delete performers[performerid];
                
                socket.broadcast.emit('performers', performers);
            }
        });
        
        socket.on('get-performers', function() {
            socket.emit('performers', performers);
        });
        
        socket.on('check-for-performer', function(performerid) {
            socket.emit('performer-available', !!performers[performerid]);
        });
        
        socket.on('session-description', function(_sessionDescription) {
            sessionDescription = _sessionDescription;
        });
        
        socketon('start-recording', function(performerid) {
            if(performers[performerid]) {
                performers[performerid].socket.emit('start-recording', userid);
            }
        });
        
        socketon('start-recording', function(performerid) {
            if(performers[performerid]) {
                performers[performerid].socket.emit('stop-recording', userid);
            }
        });
        
        socket.on('recording-started', function(_userid) {
            if(users[_userid]) {
                users[_userid].socket.emit('recording-started', userid);
            }
        });
        
        socket.on('recording-stopped', function(_userid) {
            if(users[_userid]) {
                users[_userid].socket.emit('recording-stopped', userid);
            }
        });
    });

    function swap(arr) {
        var swapped = [], length = arr.length;
        for (var i = 0; i < length; i++)
            if (arr[i] && arr[i] !== true)
                swapped.push(arr[i]);
        return swapped;
    }
    
    server.listen(config.port);
}

exports.start = start;
