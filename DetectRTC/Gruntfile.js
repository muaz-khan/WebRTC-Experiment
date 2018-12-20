'use strict';

module.exports = function(grunt) {
    require('load-grunt-tasks')(grunt, {
        pattern: 'grunt-*',
        config: 'package.json',
        scope: 'devDependencies'
    });

    var versionNumber = grunt.file.readJSON('package.json').version;

    var banner = '\'use strict\';\n\n';
    banner += '// Last Updated On: <%= grunt.template.today("UTC:yyyy-mm-dd h:MM:ss TT Z") %>\n\n';

    banner += '// ________________\n';
    banner += '// DetectRTC v' + versionNumber + '\n\n';

    banner += '// Open-Sourced: https://github.com/muaz-khan/DetectRTC\n\n';

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
                    'dev/common.js',
                    'dev/getBrowserInfo.js',
                    'dev/detectPrivateBrowsing.js',
                    'dev/isMobile.js',
                    'dev/detectDesktopOS.js',
                    'dev/detectOSName.js',
                    'dev/detectCaptureStream.js',
                    'dev/DetectLocalIPAddress.js',
                    'dev/checkDeviceSupport.js',
                    'dev/DetectRTC.js',
                    'dev/Objects.js',
                    'dev/tail.js'
                ],
                dest: './temp/DetectRTC.js',
            },
        },
        replace: {
            dist: {
                options: {
                    patterns: [{
                        match: 'version',
                        replacement: versionNumber
                    }]
                },
                files: [{
                    expand: true,
                    flatten: true,
                    src: ['./temp/DetectRTC.js'],
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
                    'DetectRTC.min.js': ['DetectRTC.js']
                }
            }
        },
        jsbeautifier: {
            files: [
                'dev/*.js',
                'test/*.js',
                'DetectRTC.js',
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
        },
        watch: {
            scripts: {
                files: ['dev/*.js'],
                tasks: ['concat', 'replace', 'jsbeautifier', 'uglify', 'clean'],
                options: {
                    spawn: false,
                },
            }
        }
    });

    // enable plugins

    // set default tasks to run when grunt is called without parameters
    // http://gruntjs.com/api/grunt.task
    grunt.registerTask('default', ['concat', 'replace', 'jsbeautifier', 'uglify', 'clean']);
    grunt.loadNpmTasks('grunt-contrib-watch');
};
