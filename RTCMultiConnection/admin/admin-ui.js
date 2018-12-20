var socket;

$('#adminPasswordModel').modal({
    backdrop: 'static',
    keyboard: false
});

$('.close-admin-credentials-box').click(function() {
    location.reload();
});

$('#btn-validate-admin').click(function() {
    var adminUserName = $('#txt-admin-username').val();
    var adminPassword = $('#txt-admin-password').val();

    if(!adminUserName || !adminPassword || !adminUserName.replace(/ /g, '').length || !adminPassword.replace(/ /g, '').length) {
        alertBox('Admin username and password is required.', 'Invalid Credentials', null, function() {
            location.reload();
        });
        return;
    }

    $('#btn-validate-admin').html('Please wait...').prop('disabled', 'disabled').addClass('disabled');

    connectSocket(adminUserName, adminPassword);
});

setTimeout(function() {
    $('#txt-admin-username').focus();
}, 500);

function connectSocket(username, password) {
    socket = io.connect('/?userid=admin&adminUserName=' + username + '&adminPassword=' + password);
    socket.on('admin', function(message) {
        if(message.error) {
            alertBox(message.error, 'Invalid Credentials', null, function() {
                location.reload();
            });
            return;
        }

        if(message.connected === true) {
            $('#adminPasswordModel').modal('hide');
            return;
        }

        socket.isAdminConnected = true;

        if (message.newUpdates === true) {
            if (socket.auto_update === true) {
                socket.emit('admin', {
                    all: true
                });
                return;
            }
            $('.new-updates-notifier').show();
        } else {
            updateListOfRooms(message.listOfRooms || []);
            // updateListOfUsers(message.listOfUsers || []);
        }

        $('#active-users').html(message.listOfUsers || 0);
        $('#scalable-users').html(message.scalableBroadcastUsers || 0);
        // $('#all-sockts').html(message.allSockets || 0);
    });
    $('.new-updates-notifier a').click(function(e) {
        e.preventDefault();
        $('.new-updates-notifier').hide();
        socket.emit('admin', {
            all: true
        });
    });
    $('.new-updates-notifier input').click(function() {
        socket.auto_update = true;
        $('.new-updates-notifier a').click();
    });
    socket.on('connect', function() {
        socket.emit('admin', {
            all: true
        });
    });
    socket.on('disconnect', function() {
        if(socket.isAdminConnected === true) {
            location.reload();
        }
    });
}

function updateListOfUsers(listOfUsers) {
    $('#active-users').html(listOfUsers.length);

    $('#users-list').html('');

    if (!listOfUsers.length) {
        $('#users-list').html('<tr><td colspan=8>No active user found on this server.</td></tr>');
        return;
    }

    listOfUsers.forEach(function(user, idx) {
        var tr = document.createElement('tr');
        var html = '';

        html += '<td><span>' + (idx + 1) + '</span></td>';
        html += '<td><span class="clickable max-width" data-userid="' + user.userid + '" title="' + user.userid + '">' + user.userid + '</span></td>';
        html += '<td><span class="max-width" title="' + user.admininfo.sessionid + '">' + user.admininfo.sessionid + '</span></td>';
        html += '<td><span class="max-width" title="' + JSON.stringify(user.admininfo.session || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.admininfo.session) + '</span></td>';
        html += '<td><span class="max-width" title="' + JSON.stringify(user.admininfo.extra || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.admininfo.extra) + '</span></td>';

        if (true) {
            // stream-ids
            html += '<td>';
            html += '<table>';
            html += '<thead>';
            html += '<th>streamid</th>';
            html += '<th>tracks</th>';
            html += '</thead>';
            html += '<tbody>';

            (user.admininfo.streams || []).forEach(function(stream) {
                html += '<tr>';
                html += '<td class="max-width" title="' + stream.streamid + '">' + stream.streamid + '</td>';
                html += '<td>' + stream.tracks + '</td>';
                html += '</tr>';
            });
            html += '</tbody>';
            html += '</table>';
            html += '</td>';
        }

        html += '<td><span class="max-width" title="' + JSON.stringify(user.admininfo.mediaConstraints || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.admininfo.mediaConstraints) + '</span></td>';
        html += '<td><span class="max-width" title="' + JSON.stringify(user.admininfo.sdpConstraints || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.admininfo.sdpConstraints) + '</span></td>';
        html += '<td><span class="max-width" title="' + JSON.stringify(user.connectedWith || {}).replace(/"/g, '`') + '">' + JSON.stringify(user.connectedWith) + '</span></td>';

        html += '<td><button class="btn delete-user" data-userid="' + user.userid + '">Delete</button></td>';
        $(tr).html(html);
        $('#users-list').append(tr);

        $(tr).find('.clickable').click(function() {
            $('#txt-userid').val($(this).attr('data-userid'));
            $('#view-userinfo').click();
        });

        $(tr).find('.delete-user').click(function() {
            var userid = $(this).attr('data-userid');
            confirmBox('User "<b>' + userid + '</b>" will be deleted from server.', function(isConfirmed) {
                if (!isConfirmed) return;

                socket.emit('admin', {
                    deleteUser: true,
                    userid: userid
                }, function(isDeleted) {
                    if (isDeleted) {
                        $('.bd-example-modal-lg').modal('hide');

                        socket.emit('admin', {
                            all: true
                        });
                    } else {
                        alertBox('Unable to delete this user.', 'Can Not Delete');
                    }
                });
            });
        });
    });
}

function updateListOfRooms(rooms) {
    var keys = Object.keys(rooms);
    $('#active-rooms').html(keys.length);

    $('#rooms-list').html('');

    if (!keys.length) {
        $('#rooms-list').html('<tr><td colspan=9>No active room found on this server.</td></tr>');
        return;
    }

    keys.forEach(function(roomid, idx) {
        var room = rooms[roomid];
        var tr = document.createElement('tr');
        var html = '';
        html += '<td>' + (idx + 1) + '</td>';
        html += '<td><span class="max-width" title="' + roomid + '">' + roomid + '</span></td>';
        html += '<td><span class="max-width" title="' + room.owner + '">' + room.owner + '</span></td>';
        html += '<td><span class="max-width" title="' + room.identifier + '">' + (room.identifier || 'None') + '</span></td>';
        html += '<td><span class="max-width" title="' + room.socketMessageEvent + '">' + room.socketMessageEvent + '</span></td>';

        html += '<td>';
        Object.keys(room.session || {}).forEach(function(key) {
            html += '<pre><b>' + key + ':</b> ' + room.session[key] + '</pre>';
        });
        html += '</td>';

        html += '<td><span class="max-width" title="' + JSON.stringify(room.extra || {}).replace(/"/g, '`') + '">' + JSON.stringify(room.extra || {}) + '</span></td>';

        html += '<td>';
        room.participants.forEach(function(pid) {
            html += '<span class="clickable userinfo" data-userid="' + pid + '"><span class="max-width" title="' + pid + '">' + pid + '</span></span><br>';
        });
        html += '</td>';

        html += '<td><button class="btn delete-room" data-roomid="' + roomid + '">Delete</button></td>';
        $(tr).html(html);
        $('#rooms-list').append(tr);

        $(tr).find('.clickable').click(function() {
            $('#txt-userid').val($(this).attr('data-userid'));
            $('#view-userinfo').click();
        });

        $(tr).find('.delete-room').click(function() {
            var roomid = $(this).attr('data-roomid');
            confirmBox('Room "<b>' + roomid + '</b>" will be deleted from server. It will disconnect and remove its participants as well.', function(isConfirmed) {
                if (!isConfirmed) return;

                socket.emit('admin', {
                    deleteRoom: true,
                    roomid: roomid
                }, function(isDeleted) {
                    if (isDeleted) {
                        socket.emit('admin', {
                            all: true
                        });
                    } else {
                        alertBox('Unable to delete this room.', 'Can Not Delete');
                    }
                });
            })
        });
    });
}

function updateViewLogsButton() {
    return;

    var req = new XMLHttpRequest();
    req.open('GET', 'logs.json');
    req.onload = function() {
        var json = JSON.parse(req.responseText);
        var length = Object.keys(json).length;
        if (length) {
            $('#view-logs').html('Error Logs (' + length + ')');
        } else {
            $('#view-logs').html('Error Logs');
        }
    };
    req.send();
}
// updateViewLogsButton();

$('#view-logs').click(function() {
    return alertBox('This feature is temporarily disabled.');

    $('#view-logs').html('Loading...');
    $('#logs-viewer').html('Loading...');

    var req = new XMLHttpRequest();
    req.open('GET', 'logs.json');
    req.onload = function() {
        var json = JSON.parse(req.responseText);
        $('#view-logs').html('Error Logs');
        updateViewLogsButton();

        var table = document.createElement('table');
        table.className = 'table';
        var html = '';
        html += '<thead>';
        html += '<th>Event/Method</th>';
        html += '<th>Error Message</th>';
        html += '<th>Error Stack</th>';
        html += '<th>Date/Time</th>';
        html += '</thead>';
        html += '<tbody>';

        var keys = Object.keys(json);
        keys.forEach(function(key) {
            var item = json[key];

            html += '<tr>';
            html += '<td>' + item.name + '</td>';
            html += '<td>' + item.message + '</td>';
            html += '<td><pre>' + item.stack + '</pre></td>';
            html += '<td>' + item.date + '</td>';
            html += '</tr>';
        });

        if (!keys.length) {
            html += '<tr><td>Error logs file is empty.</td></tr>';
        }
        html += '</tbody>';
        $(table).html(html);

        if (keys.length) {
            $('#logs-viewer').html('<div style="text-align: center; margin-bottom: 10px;"><button id="clear-logs" class="btn btn-primary" style="padding: 4px 8px;font-size: 13px;line-height: 1;">Clear Error Logs</button> (permanently delete from logs.json)</div>');
            $('#logs-viewer').append(table);
        } else {
            $('#logs-viewer').html('<div style="text-align: center; margin-bottom: 10px;">Error logs file is empty.</div>');
        }

        if (keys.length) {
            $('#clear-logs').click(function() {
                $('#logs-viewer').html('<div style="text-align: center; margin-bottom: 10px;">Deleting...</div>');
                socket.emit('admin', {
                    clearLogs: true
                }, function(isCleared) {
                    if (isCleared) {
                        $('#logs-viewer').html('<div style="text-align: center; margin-bottom: 10px;">Error logs are cleared from logs.json.</div>');
                        updateViewLogsButton();
                    } else {
                        $('#logs-viewer').html(isCleared);
                    }
                });
            });
        }
    };
    req.send();
});

function getUserInfo(userid, callback) {
    socket.emit('admin', {
        userid: userid,
        userinfo: true
    }, function(userinfo) {
        if (userinfo.error) {
            var div = document.createElement('div');
            $(div).css({
                textAlign: 'center',
                marginBottom: 10
            });
            $(div).html(userinfo.error);
            callback(div);
            return;
        }

        var table = document.createElement('table');
        table.className = 'table';
        var html = '';
        html += '<tr><td>userid</td><td><button data-userid="' + userid + '" class="btn delete-user" style="float: right;margin-top: -5px;">Delete</button>' + userid + '</td></tr>';
        ['sessionid', 'session', 'extra', 'mediaConstraints', 'sdpConstraints', 'streams'].forEach(function(item) {
            html += '<tr>';
            html += '<td>' + (item === 'sessionid' ? 'roomid' : item) + '</td>';
            if (typeof userinfo[item] === 'string') {
                html += '<td>' + userinfo[item] + '</td>';
            } else {
                if (item === 'streams' && userinfo[item]) {
                    html += '<td>';
                    html += '<table>';
                    html += '<thead>';
                    html += '<th>streamid</th>';
                    html += '<th>tracks</th>';
                    html += '</thead>';
                    html += '<tbody>';

                    userinfo[item].forEach(function(stream) {
                        html += '<tr>';
                        html += '<td>' + stream.streamid + '</td>';
                        html += '<td>' + stream.tracks + '</td>';
                        html += '</tr>';
                    });
                    html += '</tbody>';
                    html += '</table>';
                    html += '</td>';
                } else {
                    html += '<td>' + JSON.stringify(userinfo[item] || '') + '</td>';
                }
            }
            html += '</tr>';
        });
        $(table).html(html);
        $(table).find('.delete-user').click(function() {
            var that = this;

            var userid = $(this).attr('data-userid');
            confirmBox('User "<b>' + userid + '</b>" will be deleted from server.', function(isConfirmed) {
                if (!isConfirmed) return;

                $(that).prop('disabled', true).html('Deleting...');

                socket.emit('admin', {
                    deleteUser: true,
                    userid: userid
                }, function(isDeleted) {
                    if (isDeleted) {
                        $('.bd-example-modal-lg').modal('hide');

                        socket.emit('admin', {
                            all: true
                        });
                    } else {
                        alertBox('Unable to delete this user.', 'Can Not Delete');
                    }
                });
            });
        });
        callback(table);
    });
}

function alertBox(message, title, specialMessage, callback) {
    callback = callback || function() {};

    $('.btn-alert-close').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#alert-box').modal('hide');
        $('#confirm-box-topper').hide();

        callback();
    });

    $('#alert-title').html(title || 'Alert');
    $('#alert-special').html(specialMessage || '');
    $('#alert-message').html(message);
    $('#confirm-box-topper').show();

    $('#alert-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}

function confirmBox(message, callback) {
    $('#btn-confirm-action').html('Confirm').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(true);
    });

    $('#btn-confirm-close').html('Cancel');

    $('.btn-confirm-close').unbind('click').bind('click', function(e) {
        e.preventDefault();
        $('#confirm-box').modal('hide');
        $('#confirm-box-topper').hide();
        callback(false);
    });

    $('#confirm-message').html(message);
    $('#confirm-title').html('Please Confirm');
    $('#confirm-box-topper').show();

    $('#confirm-box').modal({
        backdrop: 'static',
        keyboard: false
    });
}

$('#view-userinfo').click(function() {
    var userid = $('#txt-userid').val();
    if (!userid || !userid.replace(/ /g, '').length) return;

    $('#view-userinfo').prop('disabled', true);
    $('#logs-viewer').html('Loading...');
    getUserInfo(userid, function(table) {
        $('#logs-viewer').html('').append(table);
        $('#view-userinfo').prop('disabled', false);
    });

    $('#exampleModal').modal('hide');
    $('.bd-example-modal-lg').modal('show');
});
