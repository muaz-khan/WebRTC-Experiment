'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*',
        config: 'package.json',
        scope: 'devDependencies'
    });

    var banner = '\'use strict\';\n\n// Last time updated: <%= grunt.template.today("UTC:yyyy-mm-dd h:MM:ss TT Z") %>\n\n';

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
                    'dev/RecordRTC.js',
                    'dev/RecordRTC-Configuration.js',
                    'dev/GetRecorderType.js',
                    'dev/MRecordRTC.js',
                    'dev/Cross-Browser-Declarations.js',
                    'dev/Storage.js',
                    'dev/isMediaRecorderCompatible.js',
                    'dev/MediaStreamRecorder.js',
                    'dev/StereoAudioRecorder.js',
                    'dev/CanvasRecorder.js',
                    'dev/WhammyRecorder.js',
                    'dev/Whammy.js',
                    'dev/DiskStorage.js',
                    'dev/GifRecorder.js'
                ],
                dest: 'RecordRTC.js',
            },
        },
        jshint: {
            options: {
                globals: {
                    webkitIndexedDB: true,
                    mozIndexedDB: true,
                    OIndexedDB: true,
                    msIndexedDB: true,
                    indexedDB: true,
                    FileReaderSync: true,
                    postMessage: true,
                    Whammy: true,
                    WhammyRecorder: true,
                    MediaStreamRecorder: true,
                    StereoAudioRecorder: true,
                    RecordRTC: true,
                    MRecordRTC: true,
                    URL: true,
                    webkitURL: true,
                    DiskStorage: true,
                    requestAnimationFrame: true,
                    cancelAnimationFrame: true,
                    webkitRequestAnimationFrame: true,
                    webkitCancelAnimationFrame: true,
                    mozRequestAnimationFrame: true,
                    mozCancelAnimationFrame: true,
                    MediaStream: true,
                    webkitMediaStream: true,
                    html2canvas: true,
                    GifRecorder: true,
                    GIFEncoder: true,
                    MediaRecorder: true,
                    webkitAudioContext: true,
                    mozAudioContext: true,
                    AudioContext: true,
                    JSON: true,
                    typeof: true,
                    define: true
                },
                browser: true,
                browserify: true,
                node: true,
                camelcase: true,
                curly: true,
                devel: true,
                eqeqeq: true,
                forin: false,
                globalstrict: true,
                quotmark: true,
                undef: true,
                //es5: true,
                funcscope: true,
                shadow: true, //----should be false?
                typed: true,
                worker: true
            },
            files: ['RecordRTC.js']
        },
        uglify: {
            options: {
                mangle: false,
                banner: banner
            },
            my_target: {
                files: {
                    'RecordRTC.min.js': ['RecordRTC.js']
                }
            }
        },
        jsbeautifier: {
            files: [
                // 'RecordRTC.js',
                'dev/*.js',
                'Gruntfile.js'
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
    grunt.registerTask('default', ['concat', 'jsbeautifier', 'jshint', 'uglify']);
};
