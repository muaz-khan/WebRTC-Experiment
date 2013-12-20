/*!
 * UTF-8 Validation Code originally from:
 * ws: a node.js websocket client
 * Copyright(c) 2011 Einar Otto Stangvik <einaros@gmail.com>
 * MIT Licensed
 */
 
try {
    module.exports = require('../build/Release/validation');
} catch (e) { try {
    module.exports = require('../build/default/validation');
} catch (e) { try {
    module.exports = require('./Validation.fallback');
    console.warn("Warning: Native modules not compiled.  UTF-8 validation disabled.")
} catch (e) {
    console.error("validation.node seems not to have been built. Run npm install.")
    throw e;
}}}