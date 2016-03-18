'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*',
        config: 'package.json',
        scope: 'devDependencies'
    });

    var banner = '// Last time updated: <%= grunt.template.today("UTC:yyyy-mm-dd h:MM:ss TT Z") %>\n\n';

    // configure project
    grunt.initConfig({
        // make node configurations available
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                stripBanners: true,
                separator: '\n',
                banner: banner
            },
            dist: {
                src: [
                    'dev/head.js',
                    'dev/RTCMultiConnection.js',
                    'dev/SocketConnection.js', // You can replace it with: FirebaseConnection.js || PubNubConnection.js
                    'dev/MultiPeersHandler.js',

                    'dev/globals.js',
                    // 'dev/Plugin.EveryWhere.js',
                    'dev/DetectRTC.js',

                    'dev/ios-hacks.js', // to support ios
                    'dev/RTCPeerConnection.js',
                    'dev/CodecsHandler.js', // to force H264 or codecs other than opus

                    'dev/OnIceCandidateHandler.js',
                    'dev/IceServersHandler.js',

                    'dev/gumadapter.js',
                    'dev/getUserMedia.js',
                    'dev/StreamsHandler.js',

                    'dev/getScreenId.js', // or getScreenId.js or Screen-Capturing.js

                    'dev/TextSenderReceiver.js',
                    'dev/FileProgressBarHandler.js',

                    'dev/TranslationHandler.js',
                    'dev/tail.js'
                ],
                dest: './temp/RTCMultiConnection.js',
            },
        },
        replace: {
            dist: {
                options: {
                    patterns: [{
                        json: grunt.file.readJSON('config.json')
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['./temp/RTCMultiConnection.js'],
                    dest: './'
                }]
            }
        },
        clean: ['./temp'],
        uglify: {
            options: {
                mangle: false,
                banner: banner
            },
            my_target: {
                files: {
                    'RTCMultiConnection.min.js': ['RTCMultiConnection.js'],
                    'dist/rmc3.min.js': ['RTCMultiConnection.js'],
                    'dist/rmc3.fbr.min.js': ['dev/FileBufferReader.js'],
                }
            }
        },
        copy: {
            main: {
                options: {
                    flatten: true
                },
                files: {
                    'dist/rmc3.js': ['RTCMultiConnection.js'],
                    'dist/rmc3.fbr.js': ['dev/FileBufferReader.js'],
                },
            },
        },
        jsbeautifier: {
            files: ['RTCMultiConnection.js', 'dev/*.js', 'Gruntfile.js', 'Signaling-Server.js', 'server.js'],
            options: {
                js: {
                    braceStyle: "collapse",
                    breakChainedMethods: false,
                    e4x: false,
                    evalCode: false,
                    indentChar: " ",
                    indentLevel: 0,
                    indentSize: 4,
                    indentWithTabs: false,
                    jslintHappy: false,
                    keepArrayIndentation: false,
                    keepFunctionIndentation: false,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    spaceBeforeConditional: true,
                    spaceInParen: false,
                    unescapeStrings: false,
                    wrapLineLength: 0
                },
                html: {
                    braceStyle: "collapse",
                    indentChar: " ",
                    indentScripts: "keep",
                    indentSize: 4,
                    maxPreserveNewlines: 10,
                    preserveNewlines: true,
                    unformatted: ["a", "sub", "sup", "b", "i", "u"],
                    wrapLineLength: 0
                },
                css: {
                    indentChar: " ",
                    indentSize: 4
                }
            }
        },
        bump: {
            options: {
                files: ['package.json', 'bower.json'],
                updateConfigs: [],
                commit: true,
                commitMessage: 'v%VERSION%',
                commitFiles: ['package.json', 'bower.json'],
                createTag: true,
                tagName: '%VERSION%',
                tagMessage: '%VERSION%',
                push: false,
                pushTo: 'upstream',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d'
            }
        }
    });

    // enable plugins

    // set default tasks to run when grunt is called without parameters
    // http://gruntjs.com/api/grunt.task
    grunt.registerTask('default', ['concat', 'replace', 'jsbeautifier', 'uglify', 'clean', 'copy']);
};
