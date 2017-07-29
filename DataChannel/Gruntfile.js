'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*',
        config: 'package.json',
        scope: 'devDependencies'
    });

    var versionNumber = grunt.file.readJSON('package.json').version;

    var banner = '\'use strict\';\n\n';

    banner += '// Last time updated: <%= grunt.template.today("UTC:yyyy-mm-dd h:MM:ss TT Z") %>\n\n';

    banner += '// __________________\n';
    banner += '// DataChannel v' + versionNumber + '\n\n';

    banner += '// Open-Sourced: https://github.com/muaz-khan/DataChannel\n\n';

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
                    'dev/DataChannel.js',
                    'dev/DataConnector.js',
                    'dev/globals.js',
                    // 'dev/externalIceServers.js',
                    'dev/IceServersHandler.js',
                    'dev/RTCPeerConnection.js',
                    'dev/FileConverter.js',
                    'dev/FileReceiver.js',
                    'dev/FileSaver.js',
                    'dev/FileSender.js',
                    'dev/SocketConnector.js',
                    'dev/TextReceiver.js',
                    'dev/TextSender.js',
                    'dev/tail.js'
                ],
                dest: 'DataChannel.js',
            },
        },
        htmlhint: {
            html1: {
                src: [
                    './*.html'
                ],
                options: {
                    'tag-pair': true
                }
            }
        },
        jshint: {
            options: {
                ignores: [],
                // use default .jshintrc files
                jshintrc: true
            },
            files: ['DataChannel.js']
        },
        uglify: {
            options: {
                mangle: false,
                banner: banner
            },
            my_target: {
                files: {
                    'DataChannel.min.js': ['DataChannel.js']
                }
            }
        },
        jsbeautifier: {
            files: [
                'dev/*.js',
                'Gruntfile.js',
                'DataChannel.js'
            ],
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
    grunt.registerTask('default', ['concat', 'jsbeautifier', 'htmlhint', 'jshint', 'uglify']);
};
