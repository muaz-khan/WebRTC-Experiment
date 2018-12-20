'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*',
        config: 'package.json',
        scope: 'devDependencies'
    });

    var versionNumber = grunt.file.readJSON('package.json').version;

    var banner = '// Last time updated: <%= grunt.template.today("UTC:yyyy-mm-dd h:MM:ss TT Z") %>\n\n';

    banner += '// ________________________\n';
    banner += '// MultiStreamsMixer v' + versionNumber + '\n\n';

    banner += '// Open-Sourced: https://github.com/muaz-khan/MultiStreamsMixer\n\n';

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
                    'dev/init.js',
                    'dev/cross-browser-declarations.js',
                    'dev/start-drawing-frames.js',
                    'dev/draw-videos-on-canvas.js',
                    'dev/get-mixed-stream.js',
                    'dev/get-mixed-video-stream.js',
                    'dev/get-mixed-audio-stream.js',
                    'dev/get-video-element.js',
                    'dev/append-streams.js',
                    'dev/release-streams.js',
                    'dev/replace-streams.js',
                    'dev/tail.js'
                ],
                dest: 'MultiStreamsMixer.js',
            },
        },
        uglify: {
            options: {
                mangle: false,
                banner: banner
            },
            my_target: {
                files: {
                    'MultiStreamsMixer.min.js': ['MultiStreamsMixer.js']
                }
            }
        },
        jsbeautifier: {
            files: ['MultiStreamsMixer.js', 'dev/*.js', 'server.js', 'Gruntfile.js'],
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
                tasks: ['concat', 'jsbeautifier', 'uglify'],
                options: {
                    spawn: false,
                },
            }
        }
    });

    // enable plugins

    // set default tasks to run when grunt is called without parameters
    // http://gruntjs.com/api/grunt.task
    grunt.registerTask('default', ['concat', 'jsbeautifier', 'uglify']);
    grunt.loadNpmTasks('grunt-contrib-watch');
};
