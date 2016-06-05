// Muaz Khan     - https://github.com/muaz-khan 
// neizerth      - https://github.com/neizerth
// MIT License   - https://www.webrtc-experiment.com/licence/
// Documentation - https://github.com/streamproc/MediaStreamRecorder
// ==========================================================
// gif-encoder.js

// ==========================================================

// Note:
// ==========================================================
// All libraries listed in this file are "external libraries" 
// and has their own copyrights. Taken from "jsGif" project.

/**
 * This class handles LZW encoding
 * Adapted from Jef Poskanzer's Java port by way of J. M. G. Elliott.
 * @author Kevin Weiner (original Java version - kweiner@fmsware.com)
 * @author Thibault Imbert (AS3 version - bytearray.org)
 * @author Kevin Kwok (JavaScript version - https://github.com/antimatter15/jsgif)
 * @version 0.1 AS3 implementation
 */

LZWEncoder = function() {

	var exports = {};
	var EOF = -1;
	var imgW;
	var imgH;
	var pixAry;
	var initCodeSize;
	var remaining;
	var curPixel;

	// GIFCOMPR.C - GIF Image compression routines
	// Lempel-Ziv compression based on 'compress'. GIF modifications by
	// David Rowley (mgardi@watdcsu.waterloo.edu)
	// General DEFINEs

	var BITS = 12;
	var HSIZE = 5003; // 80% occupancy

	// GIF Image compression - modified 'compress'
	// Based on: compress.c - File compression ala IEEE Computer, June 1984.
	// By Authors: Spencer W. Thomas (decvax!harpo!utah-cs!utah-gr!thomas)
	// Jim McKie (decvax!mcvax!jim)
	// Steve Davies (decvax!vax135!petsd!peora!srd)
	// Ken Turkowski (decvax!decwrl!turtlevax!ken)
	// James A. Woods (decvax!ihnp4!ames!jaw)
	// Joe Orost (decvax!vax135!petsd!joe)

	var n_bits; // number of bits/code
	var maxbits = BITS; // user settable max # bits/code
	var maxcode; // maximum code, given n_bits
	var maxmaxcode = 1 << BITS; // should NEVER generate this code
	var htab = [];
	var codetab = [];
	var hsize = HSIZE; // for dynamic table sizing
	var free_ent = 0; // first unused entry

	// block compression parameters -- after all codes are used up,
	// and compression rate changes, start over.

	var clear_flg = false;

	// Algorithm: use open addressing double hashing (no chaining) on the
	// prefix code / next character combination. We do a variant of Knuth's
	// algorithm D (vol. 3, sec. 6.4) along with G. Knott's relatively-prime
	// secondary probe. Here, the modular division first probe is gives way
	// to a faster exclusive-or manipulation. Also do block compression with
	// an adaptive reset, whereby the code table is cleared when the compression
	// ratio decreases, but after the table fills. The variable-length output
	// codes are re-sized at this point, and a special CLEAR code is generated
	// for the decompressor. Late addition: construct the table according to
	// file size for noticeable speed improvement on small files. Please direct
	// questions about this implementation to ames!jaw.

	var g_init_bits;
	var ClearCode;
	var EOFCode;

	// output
	// Output the given code.
	// Inputs:
	// code: A n_bits-bit integer. If == -1, then EOF. This assumes
	// that n_bits =< wordsize - 1.
	// Outputs:
	// Outputs code to the file.
	// Assumptions:
	// Chars are 8 bits long.
	// Algorithm:
	// Maintain a BITS character long buffer (so that 8 codes will
	// fit in it exactly). Use the VAX insv instruction to insert each
	// code in turn. When the buffer fills up empty it and start over.

	var cur_accum = 0;
	var cur_bits = 0;
	var masks = [0x0000, 0x0001, 0x0003, 0x0007, 0x000F, 0x001F, 0x003F, 0x007F, 0x00FF, 0x01FF, 0x03FF, 0x07FF, 0x0FFF, 0x1FFF, 0x3FFF, 0x7FFF, 0xFFFF];

	// Number of characters so far in this 'packet'
	var a_count;

	// Define the storage for the packet accumulator
	var accum = [];

	var LZWEncoder = exports.LZWEncoder = function LZWEncoder(width, height, pixels, color_depth) {
		imgW = width;
		imgH = height;
		pixAry = pixels;
		initCodeSize = Math.max(2, color_depth);
	};

	// Add a character to the end of the current packet, and if it is 254
	// characters, flush the packet to disk.
	var char_out = function char_out(c, outs) {
		accum[a_count++] = c;
		if (a_count >= 254) flush_char(outs);
	};

	// Clear out the hash table
	// table clear for block compress

	var cl_block = function cl_block(outs) {
		cl_hash(hsize);
		free_ent = ClearCode + 2;
		clear_flg = true;
		output(ClearCode, outs);
	};

	// reset code table
	var cl_hash = function cl_hash(hsize) {
		for (var i = 0; i < hsize; ++i) htab[i] = -1;
	};

	var compress = exports.compress = function compress(init_bits, outs) {

		var fcode;
		var i; /* = 0 */
		var c;
		var ent;
		var disp;
		var hsize_reg;
		var hshift;

		// Set up the globals: g_init_bits - initial number of bits
		g_init_bits = init_bits;

		// Set up the necessary values
		clear_flg = false;
		n_bits = g_init_bits;
		maxcode = MAXCODE(n_bits);

		ClearCode = 1 << (init_bits - 1);
		EOFCode = ClearCode + 1;
		free_ent = ClearCode + 2;

		a_count = 0; // clear packet

		ent = nextPixel();

		hshift = 0;
		for (fcode = hsize; fcode < 65536; fcode *= 2)
			++hshift;
		hshift = 8 - hshift; // set hash code range bound

		hsize_reg = hsize;
		cl_hash(hsize_reg); // clear hash table

		output(ClearCode, outs);

		outer_loop: while ((c = nextPixel()) != EOF) {
			fcode = (c << maxbits) + ent;
			i = (c << hshift) ^ ent; // xor hashing

			if (htab[i] == fcode) {
				ent = codetab[i];
				continue;
			}

			else if (htab[i] >= 0) { // non-empty slot

				disp = hsize_reg - i; // secondary hash (after G. Knott)
				if (i === 0) disp = 1;

				do {
					if ((i -= disp) < 0)
						i += hsize_reg;

					if (htab[i] == fcode) {
						ent = codetab[i];
						continue outer_loop;
					}
				} while (htab[i] >= 0);
			}

			output(ent, outs);
			ent = c;
			if (free_ent < maxmaxcode) {
				codetab[i] = free_ent++; // code -> hashtable
				htab[i] = fcode;
			}
			else cl_block(outs);
		}

		// Put out the final code.
		output(ent, outs);
		output(EOFCode, outs);
	};

	// ----------------------------------------------------------------------------
	var encode = exports.encode = function encode(os) {
		os.writeByte(initCodeSize); // write "initial code size" byte
		remaining = imgW * imgH; // reset navigation variables
		curPixel = 0;
		compress(initCodeSize + 1, os); // compress and write the pixel data
		os.writeByte(0); // write block terminator
	};

	// Flush the packet to disk, and reset the accumulator
	var flush_char = function flush_char(outs) {
		if (a_count > 0) {
			outs.writeByte(a_count);
			outs.writeBytes(accum, 0, a_count);
			a_count = 0;
		}
	};

	var MAXCODE = function MAXCODE(n_bits) {
		return (1 << n_bits) - 1;
	};

	// ----------------------------------------------------------------------------
	// Return the next pixel from the image
	// ----------------------------------------------------------------------------

	var nextPixel = function nextPixel() {
		if (remaining === 0) return EOF;
		--remaining;
		var pix = pixAry[curPixel++];
		return pix & 0xff;
	};

	var output = function output(code, outs) {

		cur_accum &= masks[cur_bits];

		if (cur_bits > 0) cur_accum |= (code << cur_bits);
		else cur_accum = code;

		cur_bits += n_bits;

		while (cur_bits >= 8) {
			char_out((cur_accum & 0xff), outs);
			cur_accum >>= 8;
			cur_bits -= 8;
		}

		// If the next entry is going to be too big for the code size,
		// then increase it, if possible.

		if (free_ent > maxcode || clear_flg) {

			if (clear_flg) {

				maxcode = MAXCODE(n_bits = g_init_bits);
				clear_flg = false;

			} else {

				++n_bits;
				if (n_bits == maxbits) maxcode = maxmaxcode;
				else maxcode = MAXCODE(n_bits);
			}
		}

		if (code == EOFCode) {

			// At EOF, write the rest of the buffer.
			while (cur_bits > 0) {
				char_out((cur_accum & 0xff), outs);
				cur_accum >>= 8;
				cur_bits -= 8;
			}

			flush_char(outs);
		}
	};

	LZWEncoder.apply(this, arguments);
	return exports;
};

/*
 * NeuQuant Neural-Net Quantization Algorithm
 * ------------------------------------------
 *
 * Copyright (c) 1994 Anthony Dekker
 *
 * NEUQUANT Neural-Net quantization algorithm by Anthony Dekker, 1994. See
 * "Kohonen neural networks for optimal colour quantization" in "Network:
 * Computation in Neural Systems" Vol. 5 (1994) pp 351-367. for a discussion of
 * the algorithm.
 *
 * Any party obtaining a copy of these files from the author, directly or
 * indirectly, is granted, free of charge, a full and unrestricted irrevocable,
 * world-wide, paid up, royalty-free, nonexclusive right and license to deal in
 * this software and documentation files (the "Software"), including without
 * limitation the rights to use, copy, modify, merge, publish, distribute,
 * sublicense, and/or sell copies of the Software, and to permit persons who
 * receive copies from any such party to do so, with the only requirement being
 * that this copyright notice remain intact.
 */

/*
 * This class handles Neural-Net quantization algorithm
 * @author Kevin Weiner (original Java version - kweiner@fmsware.com)
 * @author Thibault Imbert (AS3 version - bytearray.org)
 * @author Kevin Kwok (JavaScript version - https://github.com/antimatter15/jsgif)
 * @version 0.1 AS3 implementation
 */

NeuQuant = function() {

	var exports = {};
	var netsize = 256; /* number of colours used */

	/* four primes near 500 - assume no image has a length so large */
	/* that it is divisible by all four primes */

	var prime1 = 499;
	var prime2 = 491;
	var prime3 = 487;
	var prime4 = 503;
	var minpicturebytes = (3 * prime4); /* minimum size for input image */

	/*
	 * Program Skeleton ---------------- [select samplefac in range 1..30] [read
	 * image from input file] pic = (unsigned char*) malloc(3*width*height);
	 * initnet(pic,3*width*height,samplefac); learn(); unbiasnet(); [write output
	 * image header, using writecolourmap(f)] inxbuild(); write output image using
	 * inxsearch(b,g,r)
	 */

	/*
	 * Network Definitions -------------------
	 */

	var maxnetpos = (netsize - 1);
	var netbiasshift = 4; /* bias for colour values */
	var ncycles = 100; /* no. of learning cycles */

	/* defs for freq and bias */
	var intbiasshift = 16; /* bias for fractions */
	var intbias = (1 << intbiasshift);
	var gammashift = 10; /* gamma = 1024 */
	var gamma = (1 << gammashift);
	var betashift = 10;
	var beta = (intbias >> betashift); /* beta = 1/1024 */
	var betagamma = (intbias << (gammashift - betashift));

	/* defs for decreasing radius factor */
	var initrad = (netsize >> 3); /* for 256 cols, radius starts */
	var radiusbiasshift = 6; /* at 32.0 biased by 6 bits */
	var radiusbias = (1 << radiusbiasshift);
	var initradius = (initrad * radiusbias); /* and decreases by a */
	var radiusdec = 30; /* factor of 1/30 each cycle */

	/* defs for decreasing alpha factor */
	var alphabiasshift = 10; /* alpha starts at 1.0 */
	var initalpha = (1 << alphabiasshift);
	var alphadec; /* biased by 10 bits */

	/* radbias and alpharadbias used for radpower calculation */
	var radbiasshift = 8;
	var radbias = (1 << radbiasshift);
	var alpharadbshift = (alphabiasshift + radbiasshift);
	var alpharadbias = (1 << alpharadbshift);

	/*
	 * Types and Global Variables --------------------------
	 */

	var thepicture; /* the input image itself */
	var lengthcount; /* lengthcount = H*W*3 */
	var samplefac; /* sampling factor 1..30 */

	// typedef int pixel[4]; /* BGRc */
	var network; /* the network itself - [netsize][4] */
	var netindex = [];

	/* for network lookup - really 256 */
	var bias = [];

	/* bias and freq arrays for learning */
	var freq = [];
	var radpower = [];

	var NeuQuant = exports.NeuQuant = function NeuQuant(thepic, len, sample) {

		var i;
		var p;

		thepicture = thepic;
		lengthcount = len;
		samplefac = sample;

		network = new Array(netsize);

		for (i = 0; i < netsize; i++) {

			network[i] = new Array(4);
			p = network[i];
			p[0] = p[1] = p[2] = (i << (netbiasshift + 8)) / netsize;
			freq[i] = intbias / netsize; /* 1/netsize */
			bias[i] = 0;
		}
	};

	var colorMap = function colorMap() {

		var map = [];
		var index = new Array(netsize);

		for (var i = 0; i < netsize; i++)
			index[network[i][3]] = i;

		var k = 0;
		for (var l = 0; l < netsize; l++) {
			var j = index[l];
			map[k++] = (network[j][0]);
			map[k++] = (network[j][1]);
			map[k++] = (network[j][2]);
		}

		return map;
	};

	/*
	 * Insertion sort of network and building of netindex[0..255] (to do after
	 * unbias)
	 * -------------------------------------------------------------------------------
	 */

	var inxbuild = function inxbuild() {

		var i;
		var j;
		var smallpos;
		var smallval;
		var p;
		var q;
		var previouscol;
		var startpos;

		previouscol = 0;
		startpos = 0;
		for (i = 0; i < netsize; i++) {

			p = network[i];
			smallpos = i;
			smallval = p[1]; /* index on g */

			/* find smallest in i..netsize-1 */
			for (j = i + 1; j < netsize; j++) {

				q = network[j];
				if (q[1] < smallval) { /* index on g */
					smallpos = j;
					smallval = q[1]; /* index on g */
				}
			}
			q = network[smallpos];

			/* swap p (i) and q (smallpos) entries */
			if (i != smallpos) {
				j = q[0];
				q[0] = p[0];
				p[0] = j;
				j = q[1];
				q[1] = p[1];
				p[1] = j;
				j = q[2];
				q[2] = p[2];
				p[2] = j;
				j = q[3];
				q[3] = p[3];
				p[3] = j;
			}

			/* smallval entry is now in position i */

			if (smallval != previouscol) {

				netindex[previouscol] = (startpos + i) >> 1;

				for (j = previouscol + 1; j < smallval; j++) netindex[j] = i;

				previouscol = smallval;
				startpos = i;
			}
		}

		netindex[previouscol] = (startpos + maxnetpos) >> 1;
		for (j = previouscol + 1; j < 256; j++) netindex[j] = maxnetpos; /* really 256 */
	};

	/*
	 * Main Learning Loop ------------------
	 */

	var learn = function learn() {

		var i;
		var j;
		var b;
		var g;
		var r;
		var radius;
		var rad;
		var alpha;
		var step;
		var delta;
		var samplepixels;
		var p;
		var pix;
		var lim;

		if (lengthcount < minpicturebytes) samplefac = 1;

		alphadec = 30 + ((samplefac - 1) / 3);
		p = thepicture;
		pix = 0;
		lim = lengthcount;
		samplepixels = lengthcount / (3 * samplefac);
		delta = (samplepixels / ncycles) | 0;
		alpha = initalpha;
		radius = initradius;

		rad = radius >> radiusbiasshift;
		if (rad <= 1) rad = 0;

		for (i = 0; i < rad; i++) radpower[i] = alpha * (((rad * rad - i * i) * radbias) / (rad * rad));

		if (lengthcount < minpicturebytes) step = 3;

		else if ((lengthcount % prime1) !== 0) step = 3 * prime1;

		else {

			if ((lengthcount % prime2) !== 0) step = 3 * prime2;
			else {
				if ((lengthcount % prime3) !== 0) step = 3 * prime3;
				else step = 3 * prime4;
			}
		}

		i = 0;
		while (i < samplepixels) {

			b = (p[pix + 0] & 0xff) << netbiasshift;
			g = (p[pix + 1] & 0xff) << netbiasshift;
			r = (p[pix + 2] & 0xff) << netbiasshift;
			j = contest(b, g, r);

			altersingle(alpha, j, b, g, r);
			if (rad !== 0) alterneigh(rad, j, b, g, r); /* alter neighbours */

			pix += step;
			if (pix >= lim) pix -= lengthcount;

			i++;

			if (delta === 0) delta = 1;

			if (i % delta === 0) {
				alpha -= alpha / alphadec;
				radius -= radius / radiusdec;
				rad = radius >> radiusbiasshift;

				if (rad <= 1) rad = 0;

				for (j = 0; j < rad; j++) radpower[j] = alpha * (((rad * rad - j * j) * radbias) / (rad * rad));
			}
		}
	};

	/*
	 ** Search for BGR values 0..255 (after net is unbiased) and return colour
	 * index
	 * ----------------------------------------------------------------------------
	 */

	var map = exports.map = function map(b, g, r) {

		var i;
		var j;
		var dist;
		var a;
		var bestd;
		var p;
		var best;

		bestd = 1000; /* biggest possible dist is 256*3 */
		best = -1;
		i = netindex[g]; /* index on g */
		j = i - 1; /* start at netindex[g] and work outwards */

		while ((i < netsize) || (j >= 0)) {

			if (i < netsize) {
				p = network[i];
				dist = p[1] - g; /* inx key */

				if (dist >= bestd) i = netsize; /* stop iter */

				else {

					i++;
					if (dist < 0) dist = -dist;
					a = p[0] - b;
					if (a < 0) a = -a;
					dist += a;

					if (dist < bestd) {
						a = p[2] - r;
						if (a < 0) a = -a;
						dist += a;

						if (dist < bestd) {
							bestd = dist;
							best = p[3];
						}
					}
				}
			}

			if (j >= 0) {

				p = network[j];
				dist = g - p[1]; /* inx key - reverse dif */

				if (dist >= bestd) j = -1; /* stop iter */

				else {

					j--;
					if (dist < 0) dist = -dist;
					a = p[0] - b;
					if (a < 0) a = -a;
					dist += a;

					if (dist < bestd) {
						a = p[2] - r;
						if (a < 0) a = -a;
						dist += a;
						if (dist < bestd) {
							bestd = dist;
							best = p[3];
						}
					}
				}
			}
		}

		return (best);
	};

	var process = exports.process = function process() {
		learn();
		unbiasnet();
		inxbuild();
		return colorMap();
	};

	/*
	 * Unbias network to give byte values 0..255 and record position i to prepare
	 * for sort
	 * -----------------------------------------------------------------------------------
	 */

	var unbiasnet = function unbiasnet() {

		var i;
		var j;

		for (i = 0; i < netsize; i++) {
			network[i][0] >>= netbiasshift;
			network[i][1] >>= netbiasshift;
			network[i][2] >>= netbiasshift;
			network[i][3] = i; /* record colour no */
		}
	};

	/*
	 * Move adjacent neurons by precomputed alpha*(1-((i-j)^2/[r]^2)) in
	 * radpower[|i-j|]
	 * ---------------------------------------------------------------------------------
	 */

	var alterneigh = function alterneigh(rad, i, b, g, r) {

		var j;
		var k;
		var lo;
		var hi;
		var a;
		var m;
		var p;

		lo = i - rad;
		if (lo < -1) lo = -1;

		hi = i + rad;
		if (hi > netsize) hi = netsize;

		j = i + 1;
		k = i - 1;
		m = 1;

		while ((j < hi) || (k > lo)) {
			a = radpower[m++];

			if (j < hi) {
				p = network[j++];

				try {
					p[0] -= (a * (p[0] - b)) / alpharadbias;
					p[1] -= (a * (p[1] - g)) / alpharadbias;
					p[2] -= (a * (p[2] - r)) / alpharadbias;
				} catch (e) {} // prevents 1.3 miscompilation
			}

			if (k > lo) {
				p = network[k--];

				try {
					p[0] -= (a * (p[0] - b)) / alpharadbias;
					p[1] -= (a * (p[1] - g)) / alpharadbias;
					p[2] -= (a * (p[2] - r)) / alpharadbias;
				} catch (e) {}
			}
		}
	};

	/*
	 * Move neuron i towards biased (b,g,r) by factor alpha
	 * ----------------------------------------------------
	 */

	var altersingle = function altersingle(alpha, i, b, g, r) {

		/* alter hit neuron */
		var n = network[i];
		n[0] -= (alpha * (n[0] - b)) / initalpha;
		n[1] -= (alpha * (n[1] - g)) / initalpha;
		n[2] -= (alpha * (n[2] - r)) / initalpha;
	};

	/*
	 * Search for biased BGR values ----------------------------
	 */

	var contest = function contest(b, g, r) {

		/* finds closest neuron (min dist) and updates freq */
		/* finds best neuron (min dist-bias) and returns position */
		/* for frequently chosen neurons, freq[i] is high and bias[i] is negative */
		/* bias[i] = gamma*((1/netsize)-freq[i]) */

		var i;
		var dist;
		var a;
		var biasdist;
		var betafreq;
		var bestpos;
		var bestbiaspos;
		var bestd;
		var bestbiasd;
		var n;

		bestd = ~ (1 << 31);
		bestbiasd = bestd;
		bestpos = -1;
		bestbiaspos = bestpos;

		for (i = 0; i < netsize; i++) {
			n = network[i];
			dist = n[0] - b;
			if (dist < 0) dist = -dist;
			a = n[1] - g;
			if (a < 0) a = -a;
			dist += a;
			a = n[2] - r;
			if (a < 0) a = -a;
			dist += a;

			if (dist < bestd) {
				bestd = dist;
				bestpos = i;
			}

			biasdist = dist - ((bias[i]) >> (intbiasshift - netbiasshift));

			if (biasdist < bestbiasd) {
				bestbiasd = biasdist;
				bestbiaspos = i;
			}

			betafreq = (freq[i] >> betashift);
			freq[i] -= betafreq;
			bias[i] += (betafreq << gammashift);
		}

		freq[bestpos] += beta;
		bias[bestpos] -= betagamma;
		return (bestbiaspos);
	};

	NeuQuant.apply(this, arguments);
	return exports;
};

/**
 * This class lets you encode animated GIF files
 * Base class :  http://www.java2s.com/Code/Java/2D-Graphics-GUI/AnimatedGifEncoder.htm
 * @author Kevin Weiner (original Java version - kweiner@fmsware.com)
 * @author Thibault Imbert (AS3 version - bytearray.org)
 * @author Kevin Kwok (JavaScript version - https://github.com/antimatter15/jsgif)
 * @version 0.1 AS3 implementation
 */

GIFEncoder = function() {

	for (var i = 0, chr = {}; i < 256; i++)
		chr[i] = String.fromCharCode(i);

	function ByteArray() {
		this.bin = [];
	}

	ByteArray.prototype.getData = function() {
		for (var v = '', l = this.bin.length, i = 0; i < l; i++)
			v += chr[this.bin[i]];
		return v;
	};

	ByteArray.prototype.writeByte = function(val) {
		this.bin.push(val);
	};

	ByteArray.prototype.writeUTFBytes = function(string) {
		for (var l = string.length, i = 0; i < l; i++)
			this.writeByte(string.charCodeAt(i));
	};

	ByteArray.prototype.writeBytes = function(array, offset, length) {
		for (var l = length || array.length, i = offset || 0; i < l; i++)
			this.writeByte(array[i]);
	};

	var exports = {};
	var width; // image size
	var height;
	var transparent = null; // transparent color if given
	var transIndex; // transparent index in color table
	var repeat = -1; // no repeat
	var delay = 0; // frame delay (hundredths)
	var started = false; // ready to output frames
	var out;
	var image; // current frame
	var pixels; // BGR byte array from frame
	var indexedPixels; // converted frame indexed to palette
	var colorDepth; // number of bit planes
	var colorTab; // RGB palette
	var usedEntry = []; // active palette entries
	var palSize = 7; // color table size (bits-1)
	var dispose = -1; // disposal code (-1 = use default)
	var closeStream = false; // close stream when finished
	var firstFrame = true;
	var sizeSet = false; // if false, get size from first frame
	var sample = 10; // default sample interval for quantizer
	var comment = "Generated by jsgif (https://github.com/antimatter15/jsgif/)"; // default comment for generated gif

	/**
	 * Sets the delay time between each frame, or changes it for subsequent frames
	 * (applies to last frame added)
	 * int delay time in milliseconds
	 * @param ms
	 */

	var setDelay = exports.setDelay = function setDelay(ms) {
		delay = Math.round(ms / 10);
	};

	/**
	 * Sets the GIF frame disposal code for the last added frame and any
	 *
	 * subsequent frames. Default is 0 if no transparent color has been set,
	 * otherwise 2.
	 * @param code
	 * int disposal code.
	 */

	var setDispose = exports.setDispose = function setDispose(code) {
		if (code >= 0) dispose = code;
	};

	/**
	 * Sets the number of times the set of GIF frames should be played. Default is
	 * 1; 0 means play indefinitely. Must be invoked before the first image is
	 * added.
	 *
	 * @param iter
	 * int number of iterations.
	 * @return
	 */

	var setRepeat = exports.setRepeat = function setRepeat(iter) {
		if (iter >= 0) repeat = iter;
	};

	/**
	 * Sets the transparent color for the last added frame and any subsequent
	 * frames. Since all colors are subject to modification in the quantization
	 * process, the color in the final palette for each frame closest to the given
	 * color becomes the transparent color for that frame. May be set to null to
	 * indicate no transparent color.
	 * @param
	 * Color to be treated as transparent on display.
	 */

	var setTransparent = exports.setTransparent = function setTransparent(c) {
		transparent = c;
	};


	/**
	 * Sets the comment for the block comment
	 * @param
	 * string to be insterted as comment
	 */

	var setComment = exports.setComment = function setComment(c) {
		comment = c;
	};



	/**
	 * The addFrame method takes an incoming BitmapData object to create each frames
	 * @param
	 * BitmapData object to be treated as a GIF's frame
	 */

	var addFrame = exports.addFrame = function addFrame(im, is_imageData) {

		if ((im === null) || !started || out === null) {
			throw new Error("Please call start method before calling addFrame");
		}

		var ok = true;

		try {
			if (!is_imageData) {
				image = im.getImageData(0, 0, im.canvas.width, im.canvas.height).data;
				if (!sizeSet) setSize(im.canvas.width, im.canvas.height);
			} else {
				image = im;
			}
			getImagePixels(); // convert to correct format if necessary
			analyzePixels(); // build color table & map pixels

			if (firstFrame) {
				writeLSD(); // logical screen descriptior
				writePalette(); // global color table
				if (repeat >= 0) {
					// use NS app extension to indicate reps
					writeNetscapeExt();
				}
			}

			writeGraphicCtrlExt(); // write graphic control extension
			if (comment !== '') {
				writeCommentExt(); // write comment extension
			}
			writeImageDesc(); // image descriptor
			if (!firstFrame) writePalette(); // local color table
			writePixels(); // encode and write pixel data
			firstFrame = false;
		} catch (e) {
			ok = false;
		}

		return ok;
	};

	/**
	 * Adds final trailer to the GIF stream, if you don't call the finish method
	 * the GIF stream will not be valid.
	 */

	var finish = exports.finish = function finish() {

		if (!started) return false;

		var ok = true;
		started = false;

		try {
			out.writeByte(0x3b); // gif trailer
		} catch (e) {
			ok = false;
		}

		return ok;
	};

	/**
	 * Resets some members so that a new stream can be started.
	 * This method is actually called by the start method
	 */

	var reset = function reset() {

		// reset for subsequent use
		transIndex = 0;
		image = null;
		pixels = null;
		indexedPixels = null;
		colorTab = null;
		closeStream = false;
		firstFrame = true;
	};

	/**
	 * * Sets frame rate in frames per second. Equivalent to
	 * <code>setDelay(1000/fps)</code>.
	 * @param fps
	 * float frame rate (frames per second)
	 */

	var setFrameRate = exports.setFrameRate = function setFrameRate(fps) {
		if (fps != 0xf) delay = Math.round(100 / fps);
	};

	/**
	 * Sets quality of color quantization (conversion of images to the maximum 256
	 * colors allowed by the GIF specification). Lower values (minimum = 1)
	 * produce better colors, but slow processing significantly. 10 is the
	 * default, and produces good color mapping at reasonable speeds. Values
	 * greater than 20 do not yield significant improvements in speed.
	 * @param quality
	 * int greater than 0.
	 * @return
	 */

	var setQuality = exports.setQuality = function setQuality(quality) {
		if (quality < 1) quality = 1;
		sample = quality;
	};

	/**
	 * Sets the GIF frame size. The default size is the size of the first frame
	 * added if this method is not invoked.
	 * @param w
	 * int frame width.
	 * @param h
	 * int frame width.
	 */

	var setSize = exports.setSize = function setSize(w, h) {

		if (started && !firstFrame) return;
		width = w;
		height = h;
		if (width < 1) width = 320;
		if (height < 1) height = 240;
		sizeSet = true;
	};

	/**
	 * Initiates GIF file creation on the given stream.
	 * @param os
	 * OutputStream on which GIF images are written.
	 * @return false if initial write failed.
	 */

	var start = exports.start = function start() {

		reset();
		var ok = true;
		closeStream = false;
		out = new ByteArray();
		try {
			out.writeUTFBytes("GIF89a"); // header
		} catch (e) {
			ok = false;
		}

		return started = ok;
	};

	var cont = exports.cont = function cont() {

		reset();
		var ok = true;
		closeStream = false;
		out = new ByteArray();

		return started = ok;
	};

	/**
	 * Analyzes image colors and creates color map.
	 */

	var analyzePixels = function analyzePixels() {

		var len = pixels.length;
		var nPix = len / 3;
		indexedPixels = [];
		var nq = new NeuQuant(pixels, len, sample);

		// initialize quantizer
		colorTab = nq.process(); // create reduced palette

		// map image pixels to new palette
		var k = 0;
		for (var j = 0; j < nPix; j++) {
			var index = nq.map(pixels[k++] & 0xff, pixels[k++] & 0xff, pixels[k++] & 0xff);
			usedEntry[index] = true;
			indexedPixels[j] = index;
		}

		pixels = null;
		colorDepth = 8;
		palSize = 7;

		// get closest match to transparent color if specified
		if (transparent !== null) {
			transIndex = findClosest(transparent);
		}
	};

	/**
	 * Returns index of palette color closest to c
	 */

	var findClosest = function findClosest(c) {

		if (colorTab === null) return -1;
		var r = (c & 0xFF0000) >> 16;
		var g = (c & 0x00FF00) >> 8;
		var b = (c & 0x0000FF);
		var minpos = 0;
		var dmin = 256 * 256 * 256;
		var len = colorTab.length;

		for (var i = 0; i < len;) {
			var dr = r - (colorTab[i++] & 0xff);
			var dg = g - (colorTab[i++] & 0xff);
			var db = b - (colorTab[i] & 0xff);
			var d = dr * dr + dg * dg + db * db;
			var index = i / 3;
			if (usedEntry[index] && (d < dmin)) {
				dmin = d;
				minpos = index;
			}
			i++;
		}
		return minpos;
	};

	/**
	 * Extracts image pixels into byte array "pixels
	 */

	var getImagePixels = function getImagePixels() {
		var w = width;
		var h = height;
		pixels = [];
		var data = image;
		var count = 0;

		for (var i = 0; i < h; i++) {

			for (var j = 0; j < w; j++) {

				var b = (i * w * 4) + j * 4;
				pixels[count++] = data[b];
				pixels[count++] = data[b + 1];
				pixels[count++] = data[b + 2];

			}

		}
	};

	/**
	 * Writes Graphic Control Extension
	 */

	var writeGraphicCtrlExt = function writeGraphicCtrlExt() {
		out.writeByte(0x21); // extension introducer
		out.writeByte(0xf9); // GCE label
		out.writeByte(4); // data block size
		var transp;
		var disp;
		if (transparent === null) {
			transp = 0;
			disp = 0; // dispose = no action
		} else {
			transp = 1;
			disp = 2; // force clear if using transparent color
		}
		if (dispose >= 0) {
			disp = dispose & 7; // user override
		}
		disp <<= 2;
		// packed fields
		out.writeByte(0 | // 1:3 reserved
			disp | // 4:6 disposal
			0 | // 7 user input - 0 = none
			transp); // 8 transparency flag

		WriteShort(delay); // delay x 1/100 sec
		out.writeByte(transIndex); // transparent color index
		out.writeByte(0); // block terminator
	};

	/**
	 * Writes Comment Extention
	 */

	var writeCommentExt = function writeCommentExt() {
		out.writeByte(0x21); // extension introducer
		out.writeByte(0xfe); // comment label
		out.writeByte(comment.length); // Block Size (s)
		out.writeUTFBytes(comment);
		out.writeByte(0); // block terminator
	};


	/**
	 * Writes Image Descriptor
	 */

	var writeImageDesc = function writeImageDesc() {

		out.writeByte(0x2c); // image separator
		WriteShort(0); // image position x,y = 0,0
		WriteShort(0);
		WriteShort(width); // image size
		WriteShort(height);

		// packed fields
		if (firstFrame) {
			// no LCT - GCT is used for first (or only) frame
			out.writeByte(0);
		} else {
			// specify normal LCT
			out.writeByte(0x80 | // 1 local color table 1=yes
				0 | // 2 interlace - 0=no
				0 | // 3 sorted - 0=no
				0 | // 4-5 reserved
				palSize); // 6-8 size of color table
		}
	};

	/**
	 * Writes Logical Screen Descriptor
	 */

	var writeLSD = function writeLSD() {

		// logical screen size
		WriteShort(width);
		WriteShort(height);
		// packed fields
		out.writeByte((0x80 | // 1 : global color table flag = 1 (gct used)
			0x70 | // 2-4 : color resolution = 7
			0x00 | // 5 : gct sort flag = 0
			palSize)); // 6-8 : gct size

		out.writeByte(0); // background color index
		out.writeByte(0); // pixel aspect ratio - assume 1:1
	};

	/**
	 * Writes Netscape application extension to define repeat count.
	 */

	var writeNetscapeExt = function writeNetscapeExt() {
		out.writeByte(0x21); // extension introducer
		out.writeByte(0xff); // app extension label
		out.writeByte(11); // block size
		out.writeUTFBytes("NETSCAPE" + "2.0"); // app id + auth code
		out.writeByte(3); // sub-block size
		out.writeByte(1); // loop sub-block id
		WriteShort(repeat); // loop count (extra iterations, 0=repeat forever)
		out.writeByte(0); // block terminator
	};

	/**
	 * Writes color table
	 */

	var writePalette = function writePalette() {
		out.writeBytes(colorTab);
		var n = (3 * 256) - colorTab.length;
		for (var i = 0; i < n; i++) out.writeByte(0);
	};

	var WriteShort = function WriteShort(pValue) {
		out.writeByte(pValue & 0xFF);
		out.writeByte((pValue >> 8) & 0xFF);
	};

	/**
	 * Encodes and writes pixel data
	 */

	var writePixels = function writePixels() {
		var myencoder = new LZWEncoder(width, height, indexedPixels, colorDepth);
		myencoder.encode(out);
	};

	/**
	 * Retrieves the GIF stream
	 */

	var stream = exports.stream = function stream() {
		return out;
	};

	var setProperties = exports.setProperties = function setProperties(has_start, is_first) {
		started = has_start;
		firstFrame = is_first;
	};

	return exports;

};

if(typeof MediaStreamRecorder !== 'undefined') {
    MediaStreamRecorder.GIFEncoder = GIFEncoder;
}
