'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*',
        config: 'package.json',
        scope: 'gruntDependencies'
    });

    var versionNumber = grunt.file.readJSON('package.json').version;

    var banner = '\'use strict\';\n\n';

    banner += '// Last time updated: <%= grunt.template.today("UTC:yyyy-mm-dd h:MM:ss TT Z") %>\n\n';

    banner += '// _________________________\n';
    banner += '// RTCMultiConnection v' + versionNumber + '\n\n';

    banner += '// Open-Sourced: https://github.com/muaz-khan/RTCMultiConnection\n\n';

    banner += '// --------------------------------------------------\n';
    banner += '// Muaz Khan     - www.MuazKhan.com\n';
    banner += '// MIT License   - www.WebRTC-Experiment.com/licence\n';
    banner += '// --------------------------------------------------\n\n';

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
                    'dev/amd.js',

                    'dev/SocketConnection.js', // You can replace it with: FirebaseConnection.js || PubNubConnection.js
                    'dev/MultiPeersHandler.js',

                    // 'dev/adapter.js', ---- optional
                    'node_modules/detectrtc/DetectRTC.js', // npm install detectrtc
                    'dev/globals.js',

                    'dev/ios-hacks.js', // to support ios
                    'dev/RTCPeerConnection.js',
                    'dev/CodecsHandler.js', // to force H264 or codecs other than opus

                    'dev/OnIceCandidateHandler.js',
                    'dev/IceServersHandler.js',

                    'dev/getUserMedia.js',
                    'dev/StreamsHandler.js',

                    'node_modules/webrtc-screen-capturing/Screen-Capturing.js', // npm install webrtc-screen-capturing

                    'dev/TextSenderReceiver.js',
                    'dev/FileProgressBarHandler.js',

                    'dev/TranslationHandler.js',

                    'dev/RTCMultiConnection.js',
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
                    }, {
                        match: 'version',
                        replacement: versionNumber
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
        clean: ['./temp', 'RTCMultiConnection.js'],
        uglify: {
            options: {
                mangle: false,
                banner: banner
            },
            my_target: {
                files: {
                    'dist/RTCMultiConnection.min.js': ['RTCMultiConnection.js']
                }
            }
        },
        copy: {
            main: {
                options: {
                    flatten: true
                },
                files: {
                    'dist/RTCMultiConnection.js': ['RTCMultiConnection.js']
                },
            },
        },
        jsbeautifier: {
            files: ['RTCMultiConnection.js', 'dev/*.js', 'Gruntfile.js', 'node_scripts/*.js', 'admin/js/admin-ui.js'],
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
        },
        watch: {
            scripts: {
                files: ['dev/*.js'],
                tasks: ['concat', 'replace', 'jsbeautifier', 'uglify', 'copy', 'clean'],
                options: {
                    spawn: false,
                },
            }
        }
    });

    // enable plugins

    // set default tasks to run when grunt is called without parameters
    // http://gruntjs.com/api/grunt.task
    grunt.registerTask('default', ['concat', 'replace', 'jsbeautifier', 'uglify', 'copy', 'clean']);
    grunt.loadNpmTasks('grunt-contrib-watch');
};
