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
                    'common/head.js',
                    'common/MediaStreamRecorder.js',
                    'common/MultiStreamRecorder.js',
                    'common/Cross-Browser-Declarations.js',
                    'common/ObjectStore.js',
                    'AudioStreamRecorder/MediaRecorderWrapper.js',
                    'AudioStreamRecorder/StereoAudioRecorder.js',
                    'AudioStreamRecorder/StereoAudioRecorderHelper.js',
                    'VideoStreamRecorder/WhammyRecorder.js',
                    'VideoStreamRecorder/WhammyRecorderHelper.js',
                    'VideoStreamRecorder/GifRecorder.js',
                    'VideoStreamRecorder/lib/whammy.js',
                    'common/ConcatenateBlobs.js',
                    'common/amd.js'
                ],
                dest: 'MediaStreamRecorder.js'
            },
        },
        htmlhint: {
            html1: {
                src: [
                    './demos/*.html'
                ],
                options: {
                    'tag-pair': true
                }
            }
        },
        uglify: {
            options: {
                mangle: false,
                banner: banner
            },
            my_target: {
                files: {
                    'MediaStreamRecorder.min.js': ['MediaStreamRecorder.js']
                }
            }
        },
        jsbeautifier: {
            files: [
                './AudioStreamRecorder/*.js',
                './VideoStreamRecorder/*.js',
                './VideoStreamRecorder/lib/whammy.js',
                './common/*.js',
                'Gruntfile.js',
                'MediaStreamRecorder.js'
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
    grunt.registerTask('default', ['concat', 'jsbeautifier', 'htmlhint', 'uglify']);
};
