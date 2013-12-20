/*
 * Buffer xor module
 * Copyright (c) Agora S.A.
 * Licensed under the MIT License.
 * Version: 1.0
 */

try {
    module.exports = require('../build/Release/xor');
} catch (e) { try {
    module.exports = require('../build/default/xor');
} catch(e) { try {
    module.exports = require('./xor.fallback');
    console.warn("Warning: Native modules not compiled.  XOR performance will be degraded.")
} catch (e) {
    console.error("xor.node seems not to have been built. Run npm install.")
    throw e;
}}}
