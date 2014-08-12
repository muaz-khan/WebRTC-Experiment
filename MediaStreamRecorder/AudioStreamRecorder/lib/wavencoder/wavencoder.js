/**
 * WaveEncoder
 * Converts [0,1]-valued array --> base64-encoded data uri.
 * The optimized base64 encoding is implemented using 16-bit words.
 *
 * Since this encoder does not rely on window.btoa for encoding,
 * it can be used also in Web Worker threads.
 *
 * Copyright (c) 2012, Fritz Obermeyer
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/MIT
 * http://www.opensource.org/licenses/GPL-2.0
 */

var WavEncoder = (function(){

  /** @constructor */
  WavEncoderException = function (message) {
    this.message = message || '(unspecified)';
  };
  WavEncoderException.prototype.toString = function () {
    return 'WavEncoder Error: ' + this.message;
  };
  var assert = function (condition, message) {
    if (!condition) {
      throw new WavEncoderException(message);
    }
  };
  var assertEqual = function (actual, expected, message) {
    if (!(actual instanceof String) || !(expected instanceof String)) {
      actual = JSON.stringify(actual);
      expected = JSON.stringify(expected);
    }
    assert(actual === expected,
      (message || '') +
      '\n    actual = ' + actual +
      '\n    expected = ' + expected);
  };

  /** @constructor */
  var WavEncoder = function (numSamples, options) {

    this.numSamples = numSamples;

    options = options || {};
    var defaults = WavEncoder.defaults;
    var bytesPerSample = options.bytesPerSample || defaults.bytesPerSample;
    var numChannels    = options.numChannels    || defaults.numChannels;
    var sampleRateHz   = options.sampleRateHz   || defaults.sampleRateHz;
    this.clip          = 'clip' in options ? !!options.clip : defaults.clip;

    var PCM_FORMAT = 1;
    var bitsPerSample = bytesPerSample * 8;
    var byteRateHz = sampleRateHz * bytesPerSample * numChannels;
    var byteAlignment = numChannels * bytesPerSample;

    var formatBytes = 16;
    var dataBytes = numSamples * bytesPerSample * numChannels;
    var chunkBytes = 4 + (8 + formatBytes) + (8 + dataBytes);

    var getString = this._getString;
    var getUint16 = this._getUint16;
    var getUint32 = this._getUint32;

    switch (bytesPerSample) {
      case 1:
        this.encode = this._encode8;
        break;

      case 2:
        this.encode = this._encode16;
        break;

      default: throw new WavEncoderException(
            'unsupported bytesPerSample: ' + bytesPerSample);
    }

    // we encode using 16-bit words
    var words = this.words = [].concat(
        getString('RIFF'),

        // only one chunk
        getUint32(chunkBytes),
        getString('WAVE'),

        // format subchunk
        getString('fmt '),
        getUint32(formatBytes),
        getUint16(PCM_FORMAT),
        getUint16(numChannels),
        getUint32(sampleRateHz),
        getUint32(byteRateHz),
        getUint16(byteAlignment),
        getUint16(bitsPerSample),

        // data subchunk
        getString('data'),
        getUint32(dataBytes),
        []);

    var bytesPerWord = 2;
    var dataWords = dataBytes / bytesPerWord;
    words.length = this._headerWords + dataWords;
    while (words.length % 3) words.push(0);
  };

  WavEncoder.prototype = {

    _headerBytes: 44,
    _headerWords: 22, // for 16-bit words

    /**
     * @param {string}
     * @returns {number[]}
     */
    _getString: function (s) {
      assert(s.length % 2 === 0, 'expected a string length to be even');
      var result = [];
      for (var i = 0, I = s.length; i < I; i += 2) {
        var c1 = s.charCodeAt(i + 0);
        var c2 = s.charCodeAt(i + 1);
        assert(c1 < 256, 'bad character: ' + c1);
        assert(c2 < 256, 'bad character: ' + c2);
        result.push((c1 << 8) | c2);
      }
      return result;
    },
    /**
     * @param {number}
     * @returns {number[]}
     */
    _getUint16: function (i) {
      var swapBytes = function (j) { return ((j >> 8) | (j << 8)) & 65535; };
      return [i & 65535].map(swapBytes);
    },
    /**
     * @param {number}
     * @returns {number[]}
     */
    _getUint32: function (i) {
      var swapBytes = function (j) { return ((j >> 8) | (j << 8)) & 65535; };
      return [i & 65535, (i >> 16) & 65535].map(swapBytes);
    },

    /**
     * @param {number[]}
     * @returns {string}
     */
    _encode8: function (samples) {
      // this is hard-coded for 8-bit mono

      assertEqual(samples.length, this.numSamples, 'Wrong number of samples');

      var floor = Math.floor;
      var sqrt = Math.sqrt;
      var clip = this.clip;

      var words = this.words;
      var h = this._headerWords;
      for (var t = 0, T = this.numSamples - 1; t < T; t += 2) {
        var x1 = samples[t + 0];
        var x2 = samples[t + 1];
        if (clip) {
          x1 /= sqrt(1 + x1 * x1);
          x2 /= sqrt(1 + x2 * x2);
        }
        // 8-bit samples are unsigned
        var sample1 = floor(128 * (x1 + 1));
        var sample2 = floor(128 * (x2 + 1));
        words[h++] = (sample1 << 8) | sample2;
      }
      if (this.numSamples % 2) {
        var x1 = samples[t + 0];
        if (clip) x1 /= sqrt(1 + x1 * x1);
        var sample1 = floor(128 * (x1 + 1));
        words[h++] = sample1 << 8;
      }

      return this._encodeWords();
    },

    /**
     * @param {number[]}
     * @returns {string}
     */
    _encode16: function (samples) {
      // this is hard-coded for 16-bit mono

      assertEqual(samples.length, this.numSamples, 'Wrong number of samples');

      var floor = Math.floor;
      var sqrt = Math.sqrt;
      var clip = this.clip;

      var words = this.words;
      var h = this._headerWords;
      for (var t = 0, T = this.numSamples; t < T; ++t) {
        var x = samples[t];
        if (clip) x /= sqrt(1 + x * x);
        // 16-bit samples are signed
        var sample = floor(32768 * x);
        if (sample < 0) sample += 65536; // 2's compliment
        words[h++] = ((sample >> 8) | (sample << 8)) & 65535;
      }

      return this._encodeWords();
    },

    /**
     * @returns {string}
     */
    _encodeWords: function () {
      var words = this.words;
      var pairTable = WavEncoder._pairTable;

      var result = new Array(1 + words.length * 4/3);
      var r = 0;
      result[r++] = 'data:audio/wav;base64,';
      for (var r = 1, t = 0, T = words.length; t < T;) {
        var a16 = words[t++];
        var b16 = words[t++];
        var c16 = words[t++];

        // with 4 bits per letter:
        // A A A A B B B B C C C C 
        // A A A B B B C C C D D D 

        var a12 = (a16 >> 4) & 4095;
        var b12 = ((a16 << 8) | (b16 >> 8)) & 4095;
        var c12 = ((b16 << 4) | (c16 >> 12)) & 4095;
        var d12 = c16 & 4095;

        result[r++] = pairTable[a12];
        result[r++] = pairTable[b12];
        result[r++] = pairTable[c12];
        result[r++] = pairTable[d12];
      }
      return result.join('');
    }
  };

  WavEncoder.defaults = {
    numChannels: 1,      // mono
    sampleRateHz: 22050, // 22050 Hz
    bytesPerSample: 2,   // 16 bit
    clip: true
  };

  (function(){

    var charTable =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

    var pairTable = [];
    for (var ij = 0, IJ = 64*64; ij < IJ; ++ij) {
      pairTable[ij] = charTable[ij >> 6] + charTable[ij & 63];
    }

    WavEncoder._pairTable = pairTable;
  })();

  WavEncoder.Exception = WavEncoderException;

  /**
   * WavEncoder is optimized to encode many data sequences of the same length,
   * but we provide this one-off function for convenience.
   *
   * @param {number[]}
   * @param {object?}
   * @returns {string}
   */
  WavEncoder.encode = function (data, options) {
    var encoder = new WavEncoder(data.length, options);
    return encoder.encode(data);
  };

  return WavEncoder;

}());

