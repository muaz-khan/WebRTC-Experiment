var spawn = require('child_process').spawn
  , exec = require('child_process').exec
  , fs = require('fs')
  , version = JSON.parse(fs.readFileSync(__dirname + '/package.json', 'utf8')).version
  , verbose = process.env['npm_package_config_verbose'] != null ? process.env['npm_package_config_verbose'] === 'true' : false;

console.log('[websocket v%s] Attempting to compile native extensions.', version);

var gyp = exec('node-gyp rebuild', {cwd: __dirname});
gyp.stdout.on('data', function(data) {
  if (verbose) process.stdout.write(data);
});
gyp.stderr.on('data', function(data) {
  if (verbose) process.stdout.write(data);
});
gyp.on('exit', function(code) {
    if (code !== 0) {
        console.log("[websocket v%s]", version);
        console.log('    Native code compile failed!!');
        console.log('    Please note that this module DOES NOT REQUIRE the native components');
        console.log('    and will still work without them, though not quite as efficiently.');
        console.log('');
        console.log('    On Windows, native extensions require Visual Studio and Python.');
        console.log('    On Unix, native extensions require Python, make and a C++ compiler.');
        console.log('    Start npm with --websocket:verbose to show compilation output (if any).');
    }
    else {
        console.log('[websocket v%s] Native extension compilation successful!', version);
    }
    process.exit();
});
