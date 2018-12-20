#!/usr/bin/env node

'use strict';

// This hook automates this:
// https://github.com/BasqueVoIPMafia/cordova-plugin-iosrtc/blob/master/docs/Building.md

var
	fs = require("fs"),
	path = require("path"),
	xcode = require('xcode'),

	BUILD_VERSION = '9.0',
	BUILD_VERSION_XCODE = '"' + BUILD_VERSION + '"',
	SWIFT_VERSION = '3.0',
	SWIFT_VERSION_XCODE = '"' + SWIFT_VERSION + '"',
	RUNPATH_SEARCH_PATHS = '@executable_path/Frameworks',
	RUNPATH_SEARCH_PATHS_XCODE = '"' + RUNPATH_SEARCH_PATHS + '"',
	ENABLE_BITCODE = 'NO',
	ENABLE_BITCODE_XCODE = '"' + ENABLE_BITCODE + '"',
	BRIDGING_HEADER_END = '/Plugins/cordova-plugin-iosrtc/cordova-plugin-iosrtc-Bridging-Header.h',
	COMMENT_KEY = /_comment$/;


// Helpers

// Returns the project name
function getProjectName(protoPath) {
	var
		cordovaConfigPath = path.join(protoPath, 'config.xml'),
		content = fs.readFileSync(cordovaConfigPath, 'utf-8');

	return /<name>([\s\S]*)<\/name>/mi.exec(content)[1].trim();
}

// Drops the comments
function nonComments(obj) {
	var
		keys = Object.keys(obj),
		newObj = {},
		i = 0;

	for (i; i < keys.length; i += 1) {
		if (!COMMENT_KEY.test(keys[i])) {
			newObj[keys[i]] = obj[keys[i]];
		}
	}

	return newObj;
}


// Starting here

module.exports = function (context) {
	var
		projectRoot = context.opts.projectRoot,
		projectName = getProjectName(projectRoot),
		xcconfigPath = path.join(projectRoot, '/platforms/ios/cordova/build.xcconfig'),
		xcodeProjectName = projectName + '.xcodeproj',
		xcodeProjectPath = path.join(projectRoot, 'platforms', 'ios', xcodeProjectName, 'project.pbxproj'),
		swiftBridgingHead = projectName + BRIDGING_HEADER_END,
		swiftBridgingHeadXcode = '"' + swiftBridgingHead + '"',
		swiftOptions = [''], // <-- begin to file appending AFTER initial newline
		xcodeProject;

	// Checking if the project files are in the right place
	if (!fs.existsSync(xcodeProjectPath)) {
		debugerror('an error occurred searching the project file at: "' + xcodeProjectPath + '"');

		return;
	}
	debug('".pbxproj" project file found: ' + xcodeProjectPath);

	if (!fs.existsSync(xcconfigPath)) {
		debugerror('an error occurred searching the project file at: "' + xcconfigPath + '"');

		return;
	}
	debug('".xcconfig" project file found: ' + xcconfigPath);

	xcodeProject = xcode.project(xcodeProjectPath);

	// Showing info about the tasks to do
	debug('fixing issues in the generated project files:');
	debug('- "iOS Deployment Target" and "Deployment Target" to: ' + BUILD_VERSION_XCODE);
	debug('- "Runpath Search Paths" to: ' + RUNPATH_SEARCH_PATHS_XCODE);
	debug('- "Objective-C Bridging Header" to: ' + swiftBridgingHeadXcode);
	debug('- "ENABLE_BITCODE" set to: ' + ENABLE_BITCODE_XCODE);
	debug('- "SWIFT_VERSION" set to: ' + SWIFT_VERSION_XCODE);


	// Massaging the files

	// "build.xcconfig"
	swiftOptions.push('LD_RUNPATH_SEARCH_PATHS = ' + RUNPATH_SEARCH_PATHS);
	swiftOptions.push('SWIFT_OBJC_BRIDGING_HEADER = ' + swiftBridgingHead);
	swiftOptions.push('IPHONEOS_DEPLOYMENT_TARGET = ' + BUILD_VERSION);
	swiftOptions.push('ENABLE_BITCODE = ' + ENABLE_BITCODE);
	swiftOptions.push('SWIFT_VERSION = ' + SWIFT_VERSION);
	// NOTE: Not needed
	// swiftOptions.push('EMBEDDED_CONTENT_CONTAINS_SWIFT = YES');
	fs.appendFileSync(xcconfigPath, swiftOptions.join('\n'));
	debug('file correctly fixed: ' + xcconfigPath);

	// "project.pbxproj"
	// Parsing it
	xcodeProject.parse(function (error) {
		var configurations, buildSettings;

		if (error) {
			debugerror('an error occurred during the parsing of the project file');

			return;
		}


		configurations = nonComments(xcodeProject.pbxXCBuildConfigurationSection());
		// Adding or changing the parameters we need
		Object.keys(configurations).forEach(function (config) {
			buildSettings = configurations[config].buildSettings;
			buildSettings.LD_RUNPATH_SEARCH_PATHS = RUNPATH_SEARCH_PATHS_XCODE;
			buildSettings.SWIFT_OBJC_BRIDGING_HEADER = swiftBridgingHeadXcode;
			buildSettings.IPHONEOS_DEPLOYMENT_TARGET = BUILD_VERSION_XCODE;
			buildSettings.ENABLE_BITCODE = ENABLE_BITCODE_XCODE;
			buildSettings.SWIFT_VERSION = SWIFT_VERSION_XCODE;
		});

		// Writing the file again
		fs.writeFileSync(xcodeProjectPath, xcodeProject.writeSync(), 'utf-8');
		debug('file correctly fixed: ' + xcodeProjectPath);
	});
};


function debug(msg) {
	console.log('iosrtc-swift-support.js [INFO] ' + msg);
}


function debugerror(msg) {
	console.error('iosrtc-swift-support.js [ERROR] ' + msg);
}
