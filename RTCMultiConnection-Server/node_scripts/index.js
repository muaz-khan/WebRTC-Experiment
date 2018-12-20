// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection

module.exports = exports = function(root, callback) {
    var fs = require('fs');
    var path = require('path');
    var url = require('url');

    root = root || {};
    root.config = root.config || 'config.json';
    root.logs = root.logs || 'logs.json';

    var resolveURL = require('./resolveURL.js');
    var BASH_COLORS_HELPER = require('./BASH_COLORS_HELPER.js');

    var getValuesFromConfigJson = require('./get-values-from-config-json.js');
    var config = getValuesFromConfigJson(root);

    var getBashParameters = require('./get-bash-parameters.js');

    config = getBashParameters(config, BASH_COLORS_HELPER);
    root.enableLogs = config.enableLogs; // used by "pushLogs"

    var getJsonFile = require('./getJsonFile.js');

    // pushLogs is used to write error logs into logs.json
    var pushLogs = require('./pushLogs.js');
    var server = require(config.isUseHTTPs ? 'https' : 'http');

    function serverHandler(request, response) {
        try {
            // to make sure we always get valid info from json file
            // even if nested codes are overriding it
            config = getValuesFromConfigJson(root);
            config = getBashParameters(config, BASH_COLORS_HELPER);

            app.config = config;
        } catch (e) {
            pushLogs('serverHandler', e);
        }

        if (typeof callback === 'function') {
            callback(request, response, config, root, BASH_COLORS_HELPER, pushLogs, resolveURL, getJsonFile);
        } else {
            response.writeHead(200, {
                'Content-Type': 'text/plain'
            });
            response.write('RTCMultiConnection Socket.io Server.\n\n' + 'https://github.com/muaz-khan/RTCMultiConnection-Server\n\n' + 'npm install RTCMultiConnection-Server');
            response.end();
        }
    }

    var app;

    try {
        if (config.isUseHTTPs) {
            // See how to use a valid certificate:
            // https://github.com/muaz-khan/WebRTC-Experiment/issues/62
            var options = {
                key: null,
                cert: null,
                ca: null
            };

            var pfx = false;

            if (!fs.existsSync(config.sslKey)) {
                console.log(BASH_COLORS_HELPER.getRedFG(), 'sslKey:\t ' + config.sslKey + ' does not exist.');
            } else {
                pfx = config.sslKey.indexOf('.pfx') !== -1;
                options.key = fs.readFileSync(config.sslKey);
            }

            if (!fs.existsSync(config.sslCert)) {
                console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCert:\t ' + config.sslCert + ' does not exist.');
            } else {
                options.cert = fs.readFileSync(config.sslCert);
            }

            if (config.sslCabundle) {
                if (!fs.existsSync(config.sslCabundle)) {
                    console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCabundle:\t ' + config.sslCabundle + ' does not exist.');
                }

                options.ca = fs.readFileSync(config.sslCabundle);
            }

            if (pfx === true) {
                options = {
                    pfx: sslKey
                };
            }

            app = server.createServer(options, serverHandler);
        } else {
            app = server.createServer(serverHandler);
        }
    } catch (e) {
        pushLogs(root, 'createServer', e);
    }

    function runServer() {
        try {
            app.on('error', function(e) {
                pushLogs(root, 'app.onerror', e);

                if (e.code != 'EADDRINUSE') return;

                try {
                    function cmd_exec(cmd, args, cb_stdout, cb_end) {
                        try {
                            var spawn = require('child_process').spawn;
                            var child = spawn(cmd, args);
                            var me = this;
                            me.exit = 0;
                            me.stdout = "";
                            child.stdout.on('data', function(data) {
                                try {
                                    cb_stdout(me, data);
                                } catch (e) {
                                    pushLogs(root, 'stdout.data', e);
                                }
                            });
                            child.stdout.on('end', function() {
                                try {
                                    cb_end(me);
                                } catch (e) {
                                    pushLogs(root, 'stdout.end', e);
                                }
                            });
                        } catch (e) {
                            pushLogs(root, 'cmd_exec', e);
                        }
                    }

                    function log_console() {
                        try {
                            console.log(foo.stdout);

                            var pidToBeKilled = foo.stdout.split('\nnode    ')[1].split(' ')[0];
                            console.log('------------------------------');
                            console.log('Please execute below command:');
                            console.log('\x1b[31m%s\x1b[0m ', 'kill ' + pidToBeKilled);
                            console.log('Then try to run "server.js" again.');
                            console.log('------------------------------');

                        } catch (e) {
                            pushLogs(root, 'log_console', e);
                        }
                    }

                    if (e.address === '0.0.0.0') {
                        e.address = 'localhost';
                    }

                    var socketURL = (config.isUseHTTPs ? 'https' : 'http') + '://' + e.address + ':' + e.port + '/';

                    console.log('------------------------------');
                    console.log('\x1b[31m%s\x1b[0m ', 'Unable to listen on port: ' + e.port);
                    console.log('\x1b[31m%s\x1b[0m ', socketURL + ' is already in use. Please kill below processes using "kill PID".');
                    console.log('------------------------------');

                    foo = new cmd_exec('lsof', ['-n', '-i4TCP:9001'],
                        function(me, data) {
                            try {
                                me.stdout += data.toString();
                            } catch (e) {
                                pushLogs(root, 'lsof', e);
                            }
                        },
                        function(me) {
                            try {
                                me.exit = 1;
                            } catch (e) {
                                pushLogs(root, 'lsof.exit', e);
                            }
                        }
                    );

                    setTimeout(log_console, 250);
                } catch (e) {
                    pushLogs(root, 'app.onerror.EADDRINUSE', e);
                }
            });

            app = app.listen(config.port, process.env.IP || '0.0.0.0', function(error) {
                try {
                    var addr = app.address();

                    if (addr.address === '0.0.0.0') {
                        addr.address = 'localhost';
                    }

                    var domainURL = (config.isUseHTTPs ? 'https' : 'http') + '://' + addr.address + ':' + addr.port + '/';

                    console.log('\n');

                    console.log('Socket.io is listening at:');
                    console.log(BASH_COLORS_HELPER.getGreenFG(), '\t' + domainURL);

                    if (!config.isUseHTTPs) {
                        console.log('You can use --ssl to enable HTTPs:');
                        console.log(BASH_COLORS_HELPER.getYellowFG(), '\t' + 'node server --ssl');
                    }

                    console.log('Your web-browser (HTML file) MUST set this line:');
                    console.log(BASH_COLORS_HELPER.getGreenFG(), '\tconnection.socketURL = "' + domainURL + '";');

                    if (addr.address != 'localhost' && !config.isUseHTTPs) {
                        console.log(BASH_COLORS_HELPER.getRedBG(), 'Warning:');
                        console.log(BASH_COLORS_HELPER.getRedBG(), 'Please run on HTTPs to make sure audio,video and screen demos can work on Google Chrome as well.');
                    }

                    if (config.enableAdmin === true) {
                        console.log('Admin page is enabled and running on: ' + domainURL + 'admin/');
                        console.log('\tAdmin page username: ' + config.adminUserName);
                        console.log('\tAdmin page password: ' + config.adminPassword);
                    }

                    console.log('For more help: ', BASH_COLORS_HELPER.getYellowFG('node server.js --help'));
                    console.log('\n');
                } catch (e) {
                    pushLogs(root, 'app.listen.callback', e);
                }
            });
        } catch (e) {
            pushLogs(root, 'app.listen', e);
        }

        try {
            require('./Signaling-Server.js')(root, app, function(socket) {
                try {
                    var params = socket.handshake.query;

                    // "socket" object is totally in your own hands!
                    // do whatever you want!

                    // in your HTML page, you can access socket as following:
                    // connection.socketCustomEvent = 'custom-message';
                    // var socket = connection.getSocket();
                    // socket.emit(connection.socketCustomEvent, { test: true });

                    if (!params.socketCustomEvent) {
                        params.socketCustomEvent = 'custom-message';
                    }

                    socket.on(params.socketCustomEvent, function(message) {
                        try {
                            socket.broadcast.emit(params.socketCustomEvent, message);
                        } catch (e) {
                            pushLogs(root, 'socket.broadcast.socketCustomEvent');
                        }
                    });
                } catch (e) {
                    pushLogs(root, 'Signaling-Server.callback', e);
                }
            });
        } catch (e) {
            pushLogs(root, 'require.Signaling-Server', e);
        }
    }

    if (config.autoRebootServerOnFailure) {
        try {
            // auto restart app on failure
            var cluster = require('cluster');
            if (cluster.isMaster) {
                cluster.fork();

                cluster.on('exit', function(worker, code, signal) {
                    try {
                        cluster.fork();
                    } catch (e) {
                        pushLogs(root, 'cluster.exit.fork', e);
                    }
                });
            }

            if (cluster.isWorker) {
                runServer();
            }
        } catch (e) {
            pushLogs(root, 'cluster.require.fork', e);
        }
    } else {
        runServer();
    }
};
