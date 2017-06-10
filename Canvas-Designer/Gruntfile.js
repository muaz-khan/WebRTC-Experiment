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
                    'dev/common.js',

                    'dev/draw-helper.js',
                    'dev/drag-helper.js',
                    'dev/pencil-handler.js',
                    'dev/marker-handler.js',
                    'dev/eraser-handler.js',
                    'dev/text-handler.js',
                    'dev/arc-handler.js',
                    'dev/line-handler.js',
                    'dev/arrow-handler.js',
                    'dev/rect-handler.js',
                    'dev/quadratic-handler.js',
                    'dev/bezier-handler.js',
                    'dev/zoom-handler.js',
                    'dev/file-selector.js',
                    'dev/image-handler.js',

                    'dev/decorator.js',
                    'dev/events-handler.js',

                    'dev/share-drawings.js',
                    'dev/webrtc-handler.js',
                    'dev/canvas-designer-widget.js',

                    'dev/tail.js'
                ],
                dest: 'widget.js',
            },
        },
        uglify: {
            options: {
                mangle: false,
                banner: banner
            },
            my_target: {
                files: {
                    'widget.min.js': ['widget.js']
                }
            }
        },
        jsbeautifier: {
            files: ['widget.js', 'dev/*.js'],
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
    grunt.registerTask('default', ['concat', 'jsbeautifier', 'uglify']);
};
