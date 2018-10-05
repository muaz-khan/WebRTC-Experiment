// Muaz Khan      - www.MuazKhan.com
// MIT License    - www.WebRTC-Experiment.com/licence
// Documentation  - github.com/muaz-khan/RTCMultiConnection
var fs = require('fs');
var path = require('path');

var resolveURL = require('./node_scripts/resolveURL.js');
var BASH_COLORS_HELPER = require('./node_scripts/BASH_COLORS_HELPER.js');
var config = require('./node_scripts/get-values-from-config-json.js');

require('./node_scripts/get-bash-parameters.js')(config, BASH_COLORS_HELPER);

var isAdminAuthorized = require('./node_scripts/verify-admin.js');

// pushLogs is used to write error logs into logs.json
var pushLogs = function(name, error) {
    console.log(name, error);
};
try {
    pushLogs = require('./node_scripts/pushLogs.js');
} catch (e) {
    console.log('Unable to read pushLogs.js', e);
}

var server = require(config.isUseHTTPs ? 'https' : 'http');
var url = require('url');

function serverHandler(request, response) {
    try {
        var uri, filename;

        try {
            uri = url.parse(request.url).pathname;
            filename = path.join(process.cwd(), uri);
        }
        catch(e) {
            pushLogs('url.parse', e);
        }

        if (request.method !== 'GET' || uri.indexOf('..') !== -1) {
            try {
                response.writeHead(401, {
                    'Content-Type': 'text/plain'
                });
                response.write('401 Unauthorized: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            }
            catch(e) {
                pushLogs('!GET or ..', e);
            }
        }

        var matched = false;
        filename && ['/demos/', '/dev/', '/dist/', '/socket.io/', '/admin/'].forEach(function(item) {
            if (filename.indexOf(resolveURL(item)) !== -1) {
                matched = true;
            }
        });

        if(filename.indexOf(resolveURL('/logs.json')) !== -1 && isAdminAuthorized(request, config)) {
            try {
                // uncache to fetch recent (up-to-dated)
                var uncache = require('./node_scripts/uncache.js');
                uncache('../logs.json');

                var logs = require('./logs.json');
                response.writeHead(200, {
                    'Content-Type': 'text/plain'
                });
                response.write(JSON.stringify(logs));
                response.end();
                return;
            }
            catch(e) {
                pushLogs('/logs.json', e);
            }
        }

        // handling /admin/ page
        if (filename && (filename.indexOf('/admin/') !== -1 || filename.indexOf('\\admin\\') !== -1)) {
            if (!isAdminAuthorized(request, config)) {
                try {
                    response.writeHead(401, {
                        'WWW-Authenticate': 'Basic realm="Node"'
                    });
                    response.write('401 Unauthorized\n');
                    response.end();
                    return;
                }
                catch(e) {
                    pushLogs('/admin/ auth issues', e);
                }
            }

            // these three values are used inside Signaling-Server.js
            app.request = request;
            app.isAdminAuthorized = isAdminAuthorized;
            app.config = config;

            fs.readFile('admin/index.html', 'binary', function(err, file) {
                try {
                    if (err) {
                        response.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        response.write('404 Not Found: admin/index.html\n');
                        response.end();
                        return;
                    }

                    response.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    response.write(file, 'binary');
                    response.end();
                }
                catch(e) {
                    pushLogs('admin/index.html', e);
                }
            });
            return;
        }

        if (filename && filename.search(/.js|.json/g) !== -1 && !matched) {
            try {
                response.writeHead(404, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            }
            catch(e) {
                pushLogs('404 Not Found', e);
            }
        }

        ['Video-Broadcasting', 'Screen-Sharing', 'Switch-Cameras'].forEach(function(fname) {
            try {
                if (filename && filename.indexOf(fname + '.html') !== -1) {
                    filename = filename.replace(fname + '.html', fname.toLowerCase() + '.html');
                }
            }
            catch(e) {
                pushLogs('forEach', e);
            }
        });

        var stats;

        try {
            stats = fs.lstatSync(filename);

            if (filename && filename.search(/demos/g) === -1 && stats.isDirectory() && config.defaultDemo === '/demos/index.html') {
                if (response.redirect) {
                    response.redirect('/demos/');
                } else {
                    response.writeHead(301, {
                        'Location': '/demos/'
                    });
                }
                response.end();
                return;
            }
        } catch (e) {
            response.writeHead(404, {
                'Content-Type': 'text/plain'
            });
            response.write('404 Not Found: ' + path.join('/', uri) + '\n');
            response.end();
            return;
        }

        try {
            if (fs.statSync(filename).isDirectory()) {
                response.writeHead(404, {
                    'Content-Type': 'text/html'
                });

                if (filename.indexOf(resolveURL('/demos/MultiRTC/')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/MultiRTC/'), '');
                    filename += resolveURL('/demos/MultiRTC/index.html');
                } else if (filename.indexOf(resolveURL('/demos')) !== -1) {
                    filename = filename.replace(resolveURL('/demos/'), '');
                    filename = filename.replace(resolveURL('/demos'), '');
                    filename += resolveURL('/demos/index.html');
                } else {
                    filename += resolveURL(config.defaultDemo);
                }
            }
        }
        catch(e) {
            pushLogs('statSync.isDirectory', e);
        }

        var contentType = 'text/plain';
        if (filename.toLowerCase().indexOf('.html') !== -1) {
            contentType = 'text/html';
        }
        if (filename.toLowerCase().indexOf('.css') !== -1) {
            contentType = 'text/css';
        }
        if (filename.toLowerCase().indexOf('.png') !== -1) {
            contentType = 'image/png';
        }

        fs.readFile(filename, 'binary', function(err, file) {
            if (err) {
                response.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                response.write('404 Not Found: ' + path.join('/', uri) + '\n');
                response.end();
                return;
            }

            try {
                file = file.replace('connection.socketURL = \'/\';', 'connection.socketURL = \'' + config.socketURL + '\';');
            } catch (e) {}

            response.writeHead(200, {
                'Content-Type': contentType
            });
            response.write(file, 'binary');
            response.end();
        });
    } catch (e) {
        pushLogs('Unexpected', e);

        response.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        response.write('404 Not Found: Unexpected error.\n');
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

        if (!fs.existsSync(config.sslKey)) {
            console.log(BASH_COLORS_HELPER.getRedFG(), 'sslKey:\t ' + config.sslKey + ' does not exist.');
        }

        if (!fs.existsSync(config.sslCert)) {
            console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCert:\t ' + config.sslCert + ' does not exist.');
        }

        options.key = fs.readFileSync(config.sslKey);
        options.cert = fs.readFileSync(config.sslCert);

        if (config.sslCabundle) {
            if (!fs.existsSync(config.sslCabundle)) {
                console.log(BASH_COLORS_HELPER.getRedFG(), 'sslCabundle:\t ' + config.sslCabundle + ' does not exist.');
            }

            options.ca = fs.readFileSync(config.sslCabundle);
        }

        app = server.createServer(options, serverHandler);
    } else {
        app = server.createServer(serverHandler);
    }
}
catch(e) {
    pushLogs('createServer', e);
}

function runServer() {
    try {
        app.on('error', function(e) {
            pushLogs('app.onerror', e);

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
                            }
                            catch(e) {
                                pushLogs('stdout.data', e);
                            }
                        });
                        child.stdout.on('end', function() {
                            try {
                                cb_end(me);
                            }
                            catch(e) {
                                pushLogs('stdout.end', e);
                            }
                        });
                    }
                    catch(e) {
                        pushLogs('cmd_exec', e);
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
                        pushLogs('log_console', e);
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
                        }
                        catch(e) {
                            pushLogs('lsof', e);
                        }
                    },
                    function(me) {
                        try {
                            me.exit = 1;
                        }
                        catch(e) {
                            pushLogs('lsof.exit', e);
                        }
                    }
                );

                setTimeout(log_console, 250);
            }
            catch(e) {
                pushLogs('app.onerror.EADDRINUSE', e);
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

                console.log('For more help: ', BASH_COLORS_HELPER.getYellowFG('node server.js --help'));
                console.log('\n');
            }
            catch(e) {
                pushLogs('app.listen.callback', e);
            }
        });
    }
    catch(e) {
        pushLogs('app.listen', e);
    }

    try {
        require('./node_scripts/Signaling-Server.js')(app, function(socket) {
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
                        pushLogs('socket.broadcast.socketCustomEvent');
                    }
                });
            } catch (e) {
                pushLogs('Signaling-Server.callback', e);
            }
        });
    }
    catch(e) {
        pushLogs('require.Signaling-Server', e);
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
                }
                catch(e) {
                    pushLogs('cluster.exit.fork', e);
                }
            });
        }

        if (cluster.isWorker) {
            runServer();
        }
    }
    catch(e) {
        pushLogs('cluster.require.fork', e);
    }
} else {
    runServer();
}
