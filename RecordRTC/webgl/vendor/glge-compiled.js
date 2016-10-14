/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name GLGE_math.js
 */

 if(typeof(GLGE) == "undefined"){
	/**
	* @namespace Holds the functionality of the library
	*/
	GLGE = {};
}

(function(GLGE){


var matrixCache=[];

//matrix reuse prevent so much GC
GLGE.reuseMatrix4=function(mat4){
	//if(mat4 && mat4.length==16 && matrixCache<10000) matrixCache.push(mat4);
}

GLGE.matrix4=function(a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16){
	if(matrixCache.length==0){
		var mat=[a1,a2,a3,a4,a5,a6,a7,a8,a9,a10,a11,a12,a13,a14,a15,a16];
	}else{
		var mat=matrixCache.shift();
		mat[0]=a1;
		mat[1]=a2;
		mat[2]=a3;
		mat[3]=a4;
		mat[4]=a5;
		mat[5]=a6;
		mat[6]=a7;
		mat[7]=a8;
		mat[8]=a9;
		mat[9]=a10;
		mat[10]=a11;
		mat[11]=a12;
		mat[12]=a13;
		mat[13]=a14;
		mat[14]=a15;
		mat[15]=a16;
	}
	return mat;	
}


GLGE.Vec=function(array) {
    return array.slice(0);
}

/**
* The Vec3 Class creates a vector 
* @param {Array} array An array of 3 floats
*/
GLGE.Vec3=function(x,y,z){
    return [x,y,z];
}

/**
* The Vec4 Class creates a vector 
* @param {Array} array An array of 4 floats
*/
GLGE.Vec4=function(x,y,z,w){
    return [x,y,z,w];
}

/**
* Gets the nth element (1 indexed) from the array
* @param {Array} v A vector with 4 elements
* @param {number} i The index from one 
*/
GLGE.get1basedVec4=function(v,i){
	return v[i-1];
};
/**
* Gets the nth element (1 indexed) from the array
* @param {Array} v A vector with 3 elements
* @param {number} i The index from one 
*/
GLGE.get1basedVec3=function(v,i){
	return v[i-1];
};

/**
* Gets the nth element (1 indexed) from the array
* @param {Array} v A vector with 4 elements
* @param {number} i The index from one 
*/
GLGE.getVec4=function(v,i){
	return v[i];
};
/**
* Gets the nth element (1 indexed) from the array
* @param {Array} v A vector with 3 elements
* @param {number} i The index from one 
*/
GLGE.getVec3=function(v,i){
	return v[i];
};



/**
* Adds a GLGE.Vec4 to this Vec4
* @param {Array} a The first value to add
* * @param {Array} b The second value to add
*/
GLGE.addVec4=function(a,b) {
    return [a[0]+b[0],a[1]+b[1],a[2]+b[2],a[3]+b[3]];
}
/**
* Adds a GLGE.Vec3 to this GLGE.Vec3
* @param {Array} a The first value to add
* @param {Array} b The second value to add
*/
GLGE.addVec3=function(a,b) {
    return [a[0]+b[0],a[1]+b[1],a[2]+b[2]];
}


/**
* Adds a GLGE.Vec4 to this Vec4
* @param {Array} a The first value
* * @param {Array} b The second value to subtract from the first
*/
GLGE.subVec4=function(a,b) {
    return [a[0]-b[0],a[1]-b[1],a[2]-b[2],a[3]-b[3]];
}
/**
* Adds a GLGE.Vec3 to this GLGE.Vec3
* @param {Array} a The first value
* @param {Array} b The second value to subtract from the first
*/
GLGE.subVec3=function(a,b) {
    return [a[0]-b[0],a[1]-b[1],a[2]-b[2]];
}

/**
* Negates a GLGE.Vec4
*/
GLGE.negVec4=function(a) {
    return [-a[0], -a[1], -a[2], -a[3]];
}
GLGE.negVec3=function(a) {
    return [-a[0], -a[1], -a[2]];
}


/**
* Gets the dot product between this and the input vector
* @param {Array} a the first value to dot
* @param {Array} b the second value to dot
*/
GLGE.dotVec3=function(a,b) {
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2];
}


/**
* Gets the dot product between this and the input vector
* @param {Array} a the first value to dot
* @param {Array} b the second value to dot
*/
GLGE.dotVec4=function(a,b) {
    return a[0]*b[0]+a[1]*b[1]+a[2]*b[2]+a[3]*b[3];
}

/**
* Gets the dot product between this and the input vector
* @param {Array} a the vector to scale
* @param {Number} b the scalar
*/
GLGE.scaleVec4=function(a,b) {
    return [a[0]*b,a[1]*b,a[2]*b,a[3]*b];
}

/**
* Gets the dot product between this and the input vector
* @param {Array} a the vector to scale
* @param {Number} b the scalar
*/
GLGE.scaleVec3=function(a,b) {
    return [a[0]*b,a[1]*b,a[2]*b];
}


/**
* Gets the cross product between this and the input vector
* @param {Array} a the first value to dot
* @param {Array} b the second value to dot
*/
GLGE.crossVec3=function(a,b) {
  return [a[1]*b[2]-a[2]*b[1],
          a[2]*b[0]-a[0]*b[2],
          a[0]*b[1]-a[1]*b[0]];
}

/**
* Returns a unitized version of the input vector3
* @param {Array} a the vector3 to be unitized
*/
GLGE.toUnitVec3=function(a) {
    var sq=a[0]*a[0]+a[1]*a[1]+a[2]*a[2];
    var f=1.0;
    if (sq>0) {
        f=Math.pow(sq,0.5);
    }
    return [a[0]/f,a[1]/f,a[2]/f];
};

/**
* Returns a unitized version of the input vector4
* @param {Array} a the vector4 to be unitized
*/
GLGE.toUnitVec4=function(a) {
    var sq=a[0]*a[0]+a[1]*a[1]+a[2]*a[2]+a[3]*a[3];
    var f=1.0;
    if (sq>0) {
        f=Math.pow(sq,0.5);
    }
    return [a[0]/f,a[1]/f,a[2]/f,a[3]/f];
};


/**
* Returns the length of a vector3
* @param {Array} a the vector to be measured
*/
GLGE.lengthVec3=function(a) {
    return Math.pow(a[0]*a[0]+a[1]*a[1]+a[2]*a[2],0.5);
};

/**
* Returns the distance between 2 vector3s
* @param {Array} a the first vector
* @param {Array} b the second vector
*/
GLGE.distanceVec3=function(a,b){
    return GLGE.lengthVec3(GLGE.subVec3(a,b));
};

/**
* Returns the length of a vector3
* @param {Array} a the vector to be measured
*/
GLGE.lengthVec4=function(a,b) {
    return Math.pow(a[0]*a[0]+a[1]*a[1]+a[2]*a[2]+a[3]*a[3],0.5);
};

/**
* Returns the distance between 2 vector4s
* @param {Array} a the first vector
* @param {Array} b the second vector
*/
GLGE.distanceVec4=function(a,b){
    return GLGE.lengthVec4(GLGE.subVec4(a,b));
};


/**
* Returns the angle between 2 vector3s in radians
* @param {Array} a the first vector
* @param {Array} b the second vector
*/
GLGE.angleVec3=function(a,b){
    a=GLGE.toUnitVec3(a);
    b=GLGE.toUnitVec3(b);
    d=GLGE.dotVec3(a,b);
    if (d<-1)
        d=-1;
    if (d>1)
        d=1;
    return Math.acos(d);
};

/**
* Returns the angle between 2 vector4s in radians
* @param {Array} a the first vector
* @param {Array} b the second vector
*/
GLGE.angleVec4=function(a,b){
    a=GLGE.toUnitVec4(a);
    b=GLGE.toUnitVec4(b);
    d=GLGE.dotVec4(a,b);
    if (d<-1)
        d=-1;
    if (d>1)
        d=1;
    return Math.acos(d);
};

GLGE_math_use_webgl_float=false;

/**
* The Mat class creates a matrix from an array
* @param {Array} array An array of 9 or 16 floats
*/
GLGE.Mat3=GLGE_math_use_webgl_float?function(array) {
    if (array.length==9) {
        return new Float32Array(array);
    }else if (array.length==16) {
        return new Float32Array([array[0],array[1],array[2],array[4],array[5],array[6],array[8],array[9],array[10]]);        
    }else {
		throw "invalid matrix length";
    }
}:function(array) {
    var retval;
    if (array.length==9) {
        retval=array.slice(0);
    }else if (array.length==16) {
        retval=[array[0],array[1],array[2],array[4],array[5],array[6],array[8],array[9],array[10]];
    }else {
		throw "invalid matrix length";
    }    
    retval.get=function(i){return this[i];};
    return retval;
};
GLGE.Mat=GLGE_math_use_webgl_float?function(array) {
    return new Float32Array(array);
}:function(array){
    var retval=array.slice(0);
    retval.get=function(i){return this[i];};
    return retval;
};
GLGE.Mat4=function(array) {
    var retval;
    if (array.length==9) {
        retval=[array[0],array[1],array[2],0,array[3],array[4],array[5],0,array[6],array[7],array[8],0,0,0,0,1];
    }else if (array.length==16) {
        if(array.slice) retval=array.slice(0);
		else retval=array.subarray(0);
    }else {
        throw "invalid matrix length";
    }
    retval.get=function(i){return this[i];};
    return retval;
};
/**
* Finds the determinate of the matrix
* @returns {number} the determinate
*/
GLGE.determinantMat4=function(m) {
    return m[12] * m[9] * m[6] * m[3] - m[8] * m[13] * m[6] * m[3] - m[12] * m[5] * m[10] * m[3] + m[4] * m[13] * m[10] * m[3] + m[8] * m[5] * m[14] * m[3] - m[4] * m[9] * m[14] * m[3] - m[12] * m[9] * m[2] * m[7] + m[8] * m[13] * m[2] * m[7] + m[12] * m[1] * m[10] * m[7] - m[0] * m[13] * m[10] * m[7] - m[8] * m[1] * m[14] * m[7] + m[0] * m[9] * m[14] * m[7] + m[12] * m[5] * m[2] * m[11] - m[4] * m[13] * m[2] * m[11] - m[12] * m[1] * m[6] * m[11] + m[0] * m[13] * m[6] * m[11] + m[4] * m[1] * m[14] * m[11] - m[0] * m[5] * m[14] * m[11] - m[8] * m[5] * m[2] * m[15] + m[4] * m[9] * m[2] * m[15] + m[8] * m[1] * m[6] * m[15] - m[0] * m[9] * m[6] * m[15] - m[4] * m[1] * m[10] * m[15] + m[0] * m[5] * m[10] * m[15];
};

/**
* Finds the inverse of the matrix
* @returns {GLGE.Mat} the inverse
*/
GLGE.inverseMat4=function(mat){
	// Cache the matrix values (makes for huge speed increases!)
	var a00 = mat[0], a01 = mat[1], a02 = mat[2], a03 = mat[3];
	var a10 = mat[4], a11 = mat[5], a12 = mat[6], a13 = mat[7];
	var a20 = mat[8], a21 = mat[9], a22 = mat[10], a23 = mat[11];
	var a30 = mat[12], a31 = mat[13], a32 = mat[14], a33 = mat[15];
	
	var d = a30*a21*a12*a03 - a20*a31*a12*a03 - a30*a11*a22*a03 + a10*a31*a22*a03 +
			a20*a11*a32*a03 - a10*a21*a32*a03 - a30*a21*a02*a13 + a20*a31*a02*a13 +
			a30*a01*a22*a13 - a00*a31*a22*a13 - a20*a01*a32*a13 + a00*a21*a32*a13 +
			a30*a11*a02*a23 - a10*a31*a02*a23 - a30*a01*a12*a23 + a00*a31*a12*a23 +
			a10*a01*a32*a23 - a00*a11*a32*a23 - a20*a11*a02*a33 + a10*a21*a02*a33 +
			a20*a01*a12*a33 - a00*a21*a12*a33 - a10*a01*a22*a33 + a00*a11*a22*a33;
	
	return GLGE.matrix4((a21*a32*a13 - a31*a22*a13 + a31*a12*a23 - a11*a32*a23 - a21*a12*a33 + a11*a22*a33)/d,
	(a31*a22*a03 - a21*a32*a03 - a31*a02*a23 + a01*a32*a23 + a21*a02*a33 - a01*a22*a33)/d,
	(a11*a32*a03 - a31*a12*a03 + a31*a02*a13 - a01*a32*a13 - a11*a02*a33 + a01*a12*a33)/d,
	(a21*a12*a03 - a11*a22*a03 - a21*a02*a13 + a01*a22*a13 + a11*a02*a23 - a01*a12*a23)/d,
	(a30*a22*a13 - a20*a32*a13 - a30*a12*a23 + a10*a32*a23 + a20*a12*a33 - a10*a22*a33)/d,
	(a20*a32*a03 - a30*a22*a03 + a30*a02*a23 - a00*a32*a23 - a20*a02*a33 + a00*a22*a33)/d,
	(a30*a12*a03 - a10*a32*a03 - a30*a02*a13 + a00*a32*a13 + a10*a02*a33 - a00*a12*a33)/d,
	(a10*a22*a03 - a20*a12*a03 + a20*a02*a13 - a00*a22*a13 - a10*a02*a23 + a00*a12*a23)/d,
	(a20*a31*a13 - a30*a21*a13 + a30*a11*a23 - a10*a31*a23 - a20*a11*a33 + a10*a21*a33)/d,
	(a30*a21*a03 - a20*a31*a03 - a30*a01*a23 + a00*a31*a23 + a20*a01*a33 - a00*a21*a33)/d,
	(a10*a31*a03 - a30*a11*a03 + a30*a01*a13 - a00*a31*a13 - a10*a01*a33 + a00*a11*a33)/d,
	(a20*a11*a03 - a10*a21*a03 - a20*a01*a13 + a00*a21*a13 + a10*a01*a23 - a00*a11*a23)/d,
	(a30*a21*a12 - a20*a31*a12 - a30*a11*a22 + a10*a31*a22 + a20*a11*a32 - a10*a21*a32)/d,
	(a20*a31*a02 - a30*a21*a02 + a30*a01*a22 - a00*a31*a22 - a20*a01*a32 + a00*a21*a32)/d,
	(a30*a11*a02 - a10*a31*a02 - a30*a01*a12 + a00*a31*a12 + a10*a01*a32 - a00*a11*a32)/d,
	(a10*a21*a02 - a20*a11*a02 + a20*a01*a12 - a00*a21*a12 - a10*a01*a22 + a00*a11*a22)/d)
};

/**
* multiplies two mat4's
* @returns {GLGE.Mat} the matrix multiplication of the matrices
*/
GLGE.mulMat4Vec3=function(mat1,vec2){
	return GLGE.Vec3(mat1[0]*vec2[0]+mat1[1]*vec2[1]+mat1[2]*vec2[2]+mat1[3],
			          mat1[4]*vec2[0]+mat1[5]*vec2[1]+mat1[6]*vec2[2]+mat1[7],
			          mat1[8]*vec2[0]+mat1[9]*vec2[1]+mat1[10]*vec2[2]+mat1[11]);
};

/**
* multiplies two mat4's
* @returns {GLGE.Mat} the matrix multiplication of the matrices
*/
GLGE.mulMat4Vec4=function(mat1,vec2){
	return GLGE.Vec4(mat1[0]*vec2[0]+mat1[1]*vec2[1]+mat1[2]*vec2[2]+mat1[3]*vec2[3],
			          mat1[4]*vec2[0]+mat1[5]*vec2[1]+mat1[6]*vec2[2]+mat1[7]*vec2[3],
			          mat1[8]*vec2[0]+mat1[9]*vec2[1]+mat1[10]*vec2[2]+mat1[11]*vec2[3],
			          mat1[12]*vec2[0]+mat1[13]*vec2[1]+mat1[14]*vec2[2]+mat1[15]*vec2[3]);
};
     
/**
* multiplies a Mat4 by a scalar value
* @returns {GLGE.Mat} the matrix multiplication of the matrices
*/
GLGE.scaleMat4=function(m,value) {
    return GLGE.matrix4([m[0]*value,m[1]*value,m[2]*value,m[3]*value,
                                m[4]*value,m[5]*value,m[6]*value,m[7]*value,
                                m[8]*value,m[9]*value,m[10]*value,m[11]*value,
                                m[12]*value,m[13]*value,m[14]*value,m[15]*value]);
};
/**
* multiplies a Mat4 by a scalar value in place without allocation
* @returns {GLGE.Mat} the input matrix, modified
*/
GLGE.scaleInPlaceMat4=function(m,value) {
    m.set(0,m[0]*value);
    m.set(1,m[1]*value);
    m.set(2,m[2]*value);
    m.set(3,m[3]*value);
    m.set(4,m[4]*value);
    m.set(5,m[5]*value);
    m.set(6,m[6]*value);
    m.set(7,m[7]*value);
    m.set(8,m[8]*value);
    m.set(9,m[9]*value);
    m.set(10,m[10]*value);
    m.set(11,m[11]*value);
    m.set(12,m[12]*value);
    m.set(13,m[13]*value);
    m.set(14,m[14]*value);
    m.set(15,m[15]*value);
    return m;
};

/**
* adds a Mat4 to another Mat4 in place without allocation
* @returns {GLGE.Mat} the first input matrix, modified to be added
*/
GLGE.addInPlaceMat4=function(m,value) {
    m.set(0,m[0]+value[0]);
    m.set(1,m[1]+value[1]);
    m.set(2,m[2]+value[2]);
    m.set(3,m[3]+value[3]);
    m.set(4,m[4]+value[4]);
    m.set(5,m[5]+value[5]);
    m.set(6,m[6]+value[6]);
    m.set(7,m[7]+value[7]);
    m.set(8,m[8]+value[8]);
    m.set(9,m[9]+value[9]);
    m.set(10,m[10]+value[10]);
    m.set(11,m[11]+value[11]);
    m.set(12,m[12]+value[12]);
    m.set(13,m[13]+value[13]);
    m.set(14,m[14]+value[14]);
    m.set(15,m[15]+value[15]);
    return m;
};



/**
* adds two Mat4 together
* @returns {GLGE.Mat} a new, added Mat4
*/
GLGE.addMat4=function(m,value) {
return GLGE.Mat([m[0]+value[0],
                 m[1]+value[1],
                 m[2]+value[2],
                 m[3]+value[3],
                 m[4]+value[4],
                 m[5]+value[5],
                 m[6]+value[6],
                 m[7]+value[7],
                 m[8]+value[8],
                 m[9]+value[9],
                 m[10]+value[10],
                 m[11]+value[11],
                 m[12]+value[12],
                 m[13]+value[13],
                 m[14]+value[14],
                 m[15]+value[15]]);
    return m;
};



/**
* subs a Mat4 from another Mat4 in place without allocation
* @returns {GLGE.Mat} the first input matrix, modified to have the second subtacted
*/
GLGE.subInPlaceMat4=function(m,value) {
    m.set(0,m[0]-value[0]);
    m.set(1,m[1]-value[1]);
    m.set(2,m[2]-value[2]);
    m.set(3,m[3]-value[3]);
    m.set(4,m[4]-value[4]);
    m.set(5,m[5]-value[5]);
    m.set(6,m[6]-value[6]);
    m.set(7,m[7]-value[7]);
    m.set(8,m[8]-value[8]);
    m.set(9,m[9]-value[9]);
    m.set(10,m[10]-value[10]);
    m.set(11,m[11]-value[11]);
    m.set(12,m[12]-value[12]);
    m.set(13,m[13]-value[13]);
    m.set(14,m[14]-value[14]);
    m.set(15,m[15]-value[15]);
    return m;
};



/**
* subtracts the second matrix from the first
* @returns {GLGE.Mat} a new, subed Mat4
*/
GLGE.subMat4=function(m,value) {
return GLGE.Mat([m[0]-value[0],
                 m[1]-value[1],
                 m[2]-value[2],
                 m[3]-value[3],
                 m[4]-value[4],
                 m[5]-value[5],
                 m[6]-value[6],
                 m[7]-value[7],
                 m[8]-value[8],
                 m[9]-value[9],
                 m[10]-value[10],
                 m[11]-value[11],
                 m[12]-value[12],
                 m[13]-value[13],
                 m[14]-value[14],
                 m[15]-value[15]]);
    return m;
};


/**
* Finds the matrix multiplication with another GLGE.Mat or GLGE.vec or an Array of length 3-4
* @param {object} value An GLGE.Mat, GLGE.vec or Array
* @returns {GLGE.Mat|GLGE.Vec}
*/
GLGE.mulMat4=function(mat2,mat1){

	var a00 = mat1[0], a01 = mat1[1], a02 = mat1[2], a03 = mat1[3];
	var a10 = mat1[4], a11 = mat1[5], a12 = mat1[6], a13 = mat1[7];
	var a20 = mat1[8], a21 = mat1[9], a22 = mat1[10], a23 = mat1[11];
	var a30 = mat1[12], a31 = mat1[13], a32 = mat1[14], a33 = mat1[15];
	
	var b00 = mat2[0], b01 = mat2[1], b02 = mat2[2], b03 = mat2[3];
	var b10 = mat2[4], b11 = mat2[5], b12 = mat2[6], b13 = mat2[7];
	var b20 = mat2[8], b21 = mat2[9], b22 = mat2[10], b23 = mat2[11];
	var b30 = mat2[12], b31 = mat2[13], b32 = mat2[14], b33 = mat2[15];
	return GLGE.matrix4(b00 * a00 + b01 * a10 + b02 * a20 + b03 * a30,
		b00 * a01 + b01 * a11 + b02 * a21 + b03 * a31,
		b00 * a02 + b01 * a12 + b02 * a22 + b03 * a32,
		b00 * a03 + b01 * a13 + b02 * a23 + b03 * a33,
		
		b10 * a00 + b11 * a10 + b12 * a20 + b13 * a30,
		b10 * a01 + b11 * a11 + b12 * a21 + b13 * a31,
		b10 * a02 + b11 * a12 + b12 * a22 + b13 * a32,
		b10 * a03 + b11 * a13 + b12 * a23 + b13 * a33,
		
		b20 * a00 + b21 * a10 + b22 * a20 + b23 * a30,
		b20 * a01 + b21 * a11 + b22 * a21 + b23 * a31,
		b20 * a02 + b21 * a12 + b22 * a22 + b23 * a32,
		b20 * a03 + b21 * a13 + b22 * a23 + b23 * a33,
		
		b30 * a00 + b31 * a10 + b32 * a20 + b33 * a30,
		b30 * a01 + b31 * a11 + b32 * a21 + b33 * a31,
		b30 * a02 + b31 * a12 + b32 * a22 + b33 * a32,
		b30 * a03 + b31 * a13 + b32 * a23 + b33 * a33);
};

GLGE.transposeInPlaceMat4=function(m) {
    var v=m[1];
    m.set(1,m[4]);
    m.set(4,v);


    v=m[8];
    m.set(8,m[2]);
    m.set(2,v);
    

    v=m[3];
    m.set(3,m[12]);
    m.set(12,v);

    v=m[9];
    m.set(9,m[6]);
    m.set(6,v);

    v=m[13];
    m.set(13,m[7]);
    m.set(7,v);

    v=m[14];
    m.set(14,m[11]);
    m.set(11,v);
    
};

/**
* Builds the transpose of the matrix
* @returns {GLGE.Mat} the transposed matrix
*/
GLGE.transposeMat4=function(m) {
    return GLGE.matrix4(m[0],m[4],m[8],m[12],
		              m[1],m[5],m[9],m[13],
		              m[2],m[6],m[10],m[14],
		              m[3],m[7],m[11],m[15]);
};

/**
* copys a js array into a webglarray
* @param {array} mat the source array
* @param {webglarray} glarray the destination array
*/
GLGE.mat4gl=function(mat,glarray){
	glarray[0]=mat[0];
	glarray[1]=mat[1];
	glarray[2]=mat[2];
	glarray[3]=mat[3];
	glarray[4]=mat[4];
	glarray[5]=mat[5];
	glarray[6]=mat[6];
	glarray[7]=mat[7];
	glarray[8]=mat[8];
	glarray[9]=mat[9];
	glarray[10]=mat[10];
	glarray[11]=mat[11];
	glarray[12]=mat[12];
	glarray[13]=mat[13];
	glarray[14]=mat[14];
	glarray[15]=mat[15];
};

/**
* Sets the value at the specified index
* @param {number} i the first index 1 offset
* @param {number} j the second index 1 offset
* @param {number} value the value to set
*/
GLGE.set1basedMat4=function(m,i,j,value){
	m[(i-1)*4+(j-1)]=value;
    if(m.glData!==undefined){
        delete m.glData;
    }
};

/**
* Sets the value at the specified index
* @param {number} i the first index from zero
* @param {number} j the second index from zero
* @param {number} value the value to set
*/
GLGE.setMat4=function(m,i,j,value){
	m[i*4+j]=value;
    if(m.glData!==undefined){
        delete m.glData;
    }
};

/**
* Gets the value at the specified index
* @param {number} i the first index from one
* @param {number} j the second index from one
* @returns {number} the value at the given index
*/
GLGE.get1basedMat4=function(m,i,j){
	return m.get((i-1)*4+(j-1));
};

/**
* Gets the value at the specified index
* @param {number} i the first index from zero
* @param {number} j the second index from zero
* @returns {number} the value at the given index
*/
GLGE.getMat4=function(m,i,j){
	return m[i*4+j];
};
/**
* gets the a webgl float array for this Matrix, once generated it will cache it so it doesn't need to recreate everytime
* @returns {Float32Array} the webgl array for this Matrix
* @private
*/
GLGE.glDataMat4=function(m) {
    m.glArray=new Float32Array(m);
    return m.glArray;
};
/**
 * Creates an identity matrix
 * @returns {GLGE.Mat} the identity matrix
 */
GLGE.identMatrix=function(){
	return GLGE.matrix4(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1);
};
/**
 * Creates a translation matrix
 * @returns {Array} value an array GLGE.Vec or 3 paramters
 * @returns {GLGE.Mat} the translation matrix
 */
GLGE.translateMatrix=function(value){
	var x;
	var y;
	var z;
	if(arguments.length==3){
		x=arguments[0];
		y=arguments[1];
		z=arguments[2];
	}
	else if(value.data){
		x=value.data[0];
		y=value.data[1];
		z=value.data[2];
	}
	else if(value instanceof Array){
		x=value[0];
		y=value[1];
		z=value[2];
	}
	return GLGE.matrix4(
		1,0,0,x,
		0,1,0,y,
		0,0,1,z,
		0,0,0,1
		);
};
/**
 * Creates a scale matrix
 * @returns {Array} value an array GLGE.Vec or 3 paramters
 * @returns {GLGE.Mat} the scale matrix
 */
GLGE.scaleMatrix=function(value){
    var x;
    var y;
    var z;
	if(arguments.length==3){
		x=arguments[0];
		y=arguments[1];
		z=arguments[2];
	}
	else if(value.data){
		x=value.data[0];
		y=value.data[1];
		z=value.data[2];
	}
	else if(value instanceof Array){
		x=value[0];
		y=value[1];
		z=value[2];
	}
	return GLGE.matrix4(
		x,0,0,0,
		0,y,0,0,
		0,0,z,0,
		0,0,0,1
		);
}
/**
* @constant 
* @description Enum for XYZ rotation order
*/
GLGE.ROT_XYZ=1;
/**
* @constant 
* @description Enum for XZY rotation order
*/
GLGE.ROT_XZY=2;
/**
* @constant 
* @description Enum for YXZ rotation order
*/
GLGE.ROT_YXZ=3;
/**
* @constant 
* @description Enum for YZX rotation order
*/
GLGE.ROT_YZX=4;
/**
* @constant 
* @description Enum for ZXY rotation order
*/
GLGE.ROT_ZXY=5;
/**
* @constant 
* @description Enum for ZYX rotation order
*/
GLGE.ROT_ZYX=6;
/**
 * Creates a rotation matrix
 * @returns {Array} value an array GLGE.Vec or 3 paramters
 * @returns {GLGE.Mat} the rotation matrix
 */
GLGE.rotateMatrix=function(value,type) {
    var x;
    var y;
    var z;
	if(arguments.length>2){
		x=arguments[0];
		y=arguments[1];
		z=arguments[2];
		type=arguments[3];
	}
	else if(value.data){
		x=value.data[0];
		y=value.data[1];
		z=value.data[2];
	}
	else if(value instanceof Array){
		x=value[0];
		y=value[1];
		z=value[2];
	}
	if(!type) type=GLGE.ROT_XYZ;
	var cosx=Math.cos(x);
	var sinx=Math.sin(x);
	var cosy=Math.cos(y);
	var siny=Math.sin(y);
	var cosz=Math.cos(z);
	var sinz=Math.sin(z);
	var rotx=GLGE.matrix4(1,0,0,0,0,cosx,-sinx,0,0,sinx,cosx,0,0,0,0,1);
	var roty=GLGE.matrix4(cosy,0,siny,0,0,1,0,0,-siny,0,cosy,0,0,0,0,1);
	var rotz=GLGE.matrix4(cosz,-sinz,0,0,sinz,cosz,0,0,0,0,1,0,0,0,0,1);
	switch(type){
		case GLGE.ROT_XYZ:
			return GLGE.mulMat4(rotx,GLGE.mulMat4(roty,rotz));
			break;
		case GLGE.ROT_XZY:
			return GLGE.mulMat4(rotx,GLGE.mulMat4(rotz,roty));
			break;
		case GLGE.ROT_YXZ:
			return GLGE.mulMat4(roty,GLGE.mulMat4(rotx,rotz));
			break;
		case GLGE.ROT_YZX:
			return GLGE.mulMat4(roty,GLGE.mulMat4(rotz,rotx));
			break;
		case GLGE.ROT_ZXY:
			return GLGE.mulMat4(rotz,GLGE.mulMat4(rotx,roty));
			break;
		case GLGE.ROT_ZYX:
			return GLGE.mulMat4(rotz,GLGE.mulMat4(roty,rotx));
			break;
	}
}


GLGE.angleAxis=function(angle, axis) {
    var xmx,ymy,zmz,xmy,ymz,zmx,xms,yms,zms;
	axis=[axis[0],axis[1],axis[2],0];

        var x = axis[0];
        var y = axis[1];
        var z = axis[2];
	
	        
        var cos = Math.cos(angle);
        var cosi = 1.0 - cos;
	var sin = Math.sin(angle);
 
	xms = x * sin;yms = y * sin;zms = z * sin;
        xmx = x * x;ymy = y * y;zmz = z * z;
        xmy = x * y;ymz = y * z;zmx = z * x;
	
	var matrix = GLGE.matrix4((cosi * xmx) + cos,(cosi * xmy) - zms,(cosi * zmx) + yms,0,
			(cosi * xmy) + zms,(cosi * ymy) + cos,(cosi * ymz) - xms,0,
			(cosi * zmx) - yms,(cosi * ymz) + xms,(cosi * zmz) + cos,0,
			0,0,0,1);

        return GLGE.Mat(matrix);
};


// JHD
GLGE.quatFromAxisAngle = function(axis, angle) {
	var quaternion = [];
	var halfAngle = angle * 0.5;
	var sinus = Math.sin(halfAngle);
	var cosinus = Math.cos(halfAngle);
	quaternion[0] = axis[0] * sinus;
	quaternion[1] = axis[1] * sinus;
	quaternion[2] = axis[2] * sinus;
	quaternion[3] = cosinus;
	return quaternion;
};

GLGE.mulQuat = function(quaternion1, quaternion2) {
	var quaternion = [];
	var x = quaternion1[0];
	var y = quaternion1[1];
	var z = quaternion1[2];
	var w = quaternion1[3];
	var x2 = quaternion2[0];
	var y2 = quaternion2[1];
	var z2 = quaternion2[2];
	var w2 = quaternion2[3];
	var a = (y * z2) - (z * y2);
	var b = (z * x2) - (x * z2);
	var c = (x * y2) - (y * x2);
	var d = ((x * x2) + (y * y2)) + (z * z2);
	quaternion[0] = ((x * w2) + (x2 * w)) + a;
	quaternion[1] = ((y * w2) + (y2 * w)) + b;
	quaternion[2] = ((z * w2) + (z2 * w)) + c;
	quaternion[3] = (w * w2) - d;
	return quaternion;
};

GLGE.mat4FromQuat = function(quaternion) {
	// TODO: Optimize with storing the array-wise indexed values
	// in direct acessible variables?
	var x2 = quaternion[0] * quaternion[0];
	var y2 = quaternion[1] * quaternion[1];
	var z2 = quaternion[2] * quaternion[2];
	var xy = quaternion[0] * quaternion[1];
	var zw = quaternion[2] * quaternion[3];
	var zx = quaternion[2] * quaternion[0];
	var yw = quaternion[1] * quaternion[3];
	var yz = quaternion[1] * quaternion[2];
	var xw = quaternion[0] * quaternion[3];
	var result = [];
	result[0] = 1 - (2 * (y2 + z2));
	result[1] = 2 * (xy + zw);
	result[2] = 2 * (zx - yw);
	result[3] = 0;
	result[4] = 2 * (xy - zw);
	result[5] = 1 - (2 * (z2 + x2));
	result[6] = 2 * (yz + xw);
	result[7] = 0;
	result[8] = 2 * (zx + yw);
	result[9] = 2 * (yz - xw);
	result[10] = 1 - (2 * (y2 + x2));
	result[11] = 0;
	result[12] = 0;
	result[13] = 0;
	result[14] = 0;
	result[15] = 1;
	return result;
};
// JHD - end


GLGE.quatRotation=function(qx,qy,qz,qw){
	return GLGE.matrix4(
	                    1 - 2*qy*qy - 2*qz*qz,2*qx*qy - 2*qz*qw,2*qx*qz + 2*qy*qw,0,
	                    2*qx*qy + 2*qz*qw,1 - 2*qx*qx - 2*qz*qz,2*qy*qz - 2*qx*qw,0,
	                    2*qx*qz - 2*qy*qw,2*qy*qz + 2*qx*qw,1 - 2*qx*qx - 2*qy*qy,0,
	                    0,0,0,1
	                );
};


GLGE.makeOrtho=function(left,right,bottom,top,near,far){
	var x = -(right+left)/(right-left);
	var y = -(top+bottom)/(top-bottom);
	var z = -(far+near)/(far-near);

        return GLGE.matrix4(2/(right-left), 0, 0, x,
               0, 2/(top-bottom), 0, y,
               0, 0, -2/(far-near), z,
               0, 0, 0, 1);
};


GLGE.makeFrustum=function(left,right,bottom,top,near,far){
	var x = 2*near/(right-left);
	var y = 2*near/(top-bottom);
	var a = (right+left)/(right-left);
	var b = (top+bottom)/(top-bottom);
	var c = -(far+near)/(far-near);
	var d = -2*far*near/(far-near);
	return GLGE.matrix4(x, 0, a, 0,
		       0, y, b, 0,
		       0, 0, c, d,
		       0, 0, -1, 0);
};

GLGE.makePerspective=function(fovy, aspect, near, far){
	var ymax = near * Math.tan(fovy * 0.00872664625972);
	var ymin = -ymax;
	var xmin = ymin * aspect;
	var xmax = ymax * aspect;
	return GLGE.makeFrustum(xmin, xmax, ymin, ymax, near, far);
};

GLGE.makePerspectiveX=function(fovx, aspect, near, far){
	var xmax = near * Math.tan(fovx * 0.00872664625972);
	var xmin = -xmax;
	var ymin = xmin / aspect;
	var ymax = xmax / aspect;
	return GLGE.makeFrustum(xmin, xmax, ymin, ymax, near, far);
};

GLGE.matrix2Scale=function(m){
	var m1=m[0];
	var m2=m[1];
	var m3=m[2];
	var m4=m[4];
	var m5=m[5];
	var m6=m[6];
	var m7=m[8];
	var m8=m[9];
	var m9=m[10];
	var scaleX=Math.sqrt(m1*m1+m2*m2+m3*m3);
	var scaleY=Math.sqrt(m4*m4+m5*m5+m6*m6);
	var scaleZ=Math.sqrt(m7*m7+m8*m8+m9*m9);
	return [scaleX,scaleY,scaleZ]
}


GLGE.rotationMatrix2Quat=function(m){
	var tr = m[0] + m[5] + m[10]+1.0;
	var S,x,y,z,w;

	if (tr > 0) { 
		S = 0.5/Math.sqrt(tr); 
		w = 0.25 / S;
		x = (m[9] - m[6]) * S;
		y = (m[2] - m[8]) * S; 
		z = (m[4] - m[1]) * S; 
	} else if ((m[0] > m[5])&&(m[0] > m[10])) { 
		S = Math.sqrt(1.0 + m[0] - m[5] - m[10]) * 2; 
		w = (m[9] - m[6]) / S;
		x = 0.25 / S;
		y = (m[1] + m[4]) / S; 
		z = (m[2] + m[8]) / S; 
	} else if (m[5] > m[10]) { 
		S = Math.sqrt(1.0 + m[5] - m[0] - m[10]) * 2;
		w = (m[2] - m[8]) / S;
		x = (m[1] + m[4]) / S; 
		y = 0.25 / S;
		z = (m[6] + m[9]) / S; 
	} else { 
		S = Math.sqrt(1.0 + m[10] - m[0] - m[5]) * 2; 
		w = (m[4] - m[1]) / S;
		x = (m[2] + m[8]) / S;
		y = (m[6] + m[9]) / S;
		z = 0.25 / S;
	}
	var N=Math.sqrt(x*x+y*y+z*z+w*w)
	
	return [x/N,y/N,z/N,w/N];
}



//returns plane as array [X,Y,Z,D]
GLGE.rayToPlane=function(origin,dir){
	var dirnorm=GLGE.toUnitVec3(dir);
	return [dirnorm[0],dirnorm[1],dirnorm[2],GLGE.dotVec3(origin,dirnorm)];
}

GLGE.rayIntersectPlane=function(origin,dir,plane){
	var planeN=[plane[0],plane[1],plane[2]];
	var planeD=plane[3];
	var vdir=GLGE.dotVec3(planeN,dir);
	if(vdir<=0){
		//ray in wrong direction
		return false;
	}
	var vo=-(GLGE.dotVec3(planeN,origin)+planeD);
	var t=vo/vdir;
	if(t<=0){
		return false;
	}
	return GLGE.addVec3(origin,GLGE.scaleVec3(dir,t));
}
//assumes perspective projection
GLGE.screenToDirection=function(x,y,width,height,proj){
	xcoord =  -( ( ( 2 * x ) / width ) - 1 ) / proj[0];
	ycoord =( ( ( 2 * y ) / height ) - 1 ) / proj[5];
	zcoord =  1;
	return GLGE.toUnitVec3([xcoord,ycoord,zcoord]);
}

GLGE.BoundingVolume=function(minX,maxX,minY,maxY,minZ,maxZ){
	this.limits=[minX,maxX,minY,maxY,minZ,maxZ];
	
	this.calcProps();
}


GLGE.BoundingVolume.prototype.getCornerPoints=function(){
	return this.points;
}

//returns the radius of a bounding sphere
GLGE.BoundingVolume.prototype.getSphereRadius=function(){
	return this.radius;
}

//returns the center of a bounding volume
GLGE.BoundingVolume.prototype.getCenter=function(){
	return this.center;
}
GLGE.BoundingVolume.prototype.isNull=function(){
	return this.limits[0]==0&&this.limits[1]==0&&this.limits[2]==0&&this.limits[3]==0&&this.limits[4]==0&&this.limits[5]==0;
}
//adds an additional bounding volume to resize the current and returns the result
GLGE.BoundingVolume.prototype.addBoundingVolume=function(vol){
	if (this.isNull()) {
		this.limits[0]=vol.limits[0];
		this.limits[1]=vol.limits[1];
		this.limits[2]=vol.limits[2];
		this.limits[3]=vol.limits[3];
		this.limits[4]=vol.limits[4];
		this.limits[5]=vol.limits[5];
	}
	else if (!vol.isNull()) {
		this.limits[0]=Math.min(vol.limits[0],this.limits[0]);
		this.limits[2]=Math.min(vol.limits[2],this.limits[2]);
		this.limits[4]=Math.min(vol.limits[4],this.limits[4]);
		this.limits[1]=Math.max(vol.limits[1],this.limits[1]);
		this.limits[3]=Math.max(vol.limits[3],this.limits[3]);
		this.limits[5]=Math.max(vol.limits[5],this.limits[5]);
    }
	
	this.calcProps();
}

//scales a volume based on a transform matrix
GLGE.BoundingVolume.prototype.applyMatrix=function(matrix){
	var coord0=GLGE.mulMat4Vec4(matrix,[this.limits[0],this.limits[2],this.limits[4],1]);
	var coord1=GLGE.mulMat4Vec4(matrix,[this.limits[1],this.limits[2],this.limits[4],1]);
	var coord2=GLGE.mulMat4Vec4(matrix,[this.limits[0],this.limits[3],this.limits[4],1]);
	var coord3=GLGE.mulMat4Vec4(matrix,[this.limits[1],this.limits[3],this.limits[4],1]);
	var coord4=GLGE.mulMat4Vec4(matrix,[this.limits[0],this.limits[2],this.limits[5],1]);
	var coord5=GLGE.mulMat4Vec4(matrix,[this.limits[1],this.limits[2],this.limits[5],1]);
	var coord6=GLGE.mulMat4Vec4(matrix,[this.limits[0],this.limits[3],this.limits[5],1]);
	var coord7=GLGE.mulMat4Vec4(matrix,[this.limits[1],this.limits[3],this.limits[5],1]);
	this.limits[0]=Math.min(coord0[0],coord1[0],coord2[0],coord3[0],coord4[0],coord5[0],coord6[0],coord7[0]);
	this.limits[1]=Math.max(coord0[0],coord1[0],coord2[0],coord3[0],coord4[0],coord5[0],coord6[0],coord7[0]);
	this.limits[2]=Math.min(coord0[1],coord1[1],coord2[1],coord3[1],coord4[1],coord5[1],coord6[1],coord7[1]);
	this.limits[3]=Math.max(coord0[1],coord1[1],coord2[1],coord3[1],coord4[1],coord5[1],coord6[1],coord7[1]);
	this.limits[4]=Math.min(coord0[2],coord1[2],coord2[2],coord3[2],coord4[2],coord5[2],coord6[2],coord7[2]);
	this.limits[5]=Math.max(coord0[2],coord1[2],coord2[2],coord3[2],coord4[2],coord5[2],coord6[2],coord7[2]);
	this.calcProps();
}

GLGE.BoundingVolume.prototype.calcProps=function(){
	var minX=this.limits[0];
	var maxX=this.limits[1];
	var minY=this.limits[2];
	var maxY=this.limits[3];
	var minZ=this.limits[4];
	var maxZ=this.limits[5];
	this.points=[
		[minX,minY,minZ],
		[maxX,minY,minZ],
		[minX,maxY,minZ],
		[maxX,maxY,minZ],
		[minX,minY,maxZ],
		[maxX,minY,maxZ],
		[minX,maxY,maxZ],
		[maxX,maxY,maxZ]
	];
	this.center=[(this.limits[1]-this.limits[0])/2+this.limits[0],(this.limits[3]-this.limits[2])/2+this.limits[2],(this.limits[5]-this.limits[4])/2+this.limits[4]];
	var dx=this.limits[0]-this.center[0];
	var dy=this.limits[2]-this.center[1];
	var dz=this.limits[4]-this.center[2];
	this.radius=Math.sqrt(dx*dx+dy*dy+dz*dz);
}

GLGE.BoundingVolume.prototype.clone=function(){
	return new GLGE.BoundingVolume(this.limits[0],this.limits[1],this.limits[2],this.limits[3],this.limits[4],this.limits[5]);
}

GLGE.BoundingVolume.prototype.toString=function(){
	return this.limits.toString();
}


//creates the bounding planes for the cameraViewProjectionMatrix
GLGE.cameraViewProjectionToPlanes=function(cvp){
	var cvpinv=GLGE.inverseMat4(cvp);
	var mulMat4Vec4=GLGE.mulMat4Vec4;
	var subVec3=GLGE.subVec3;
	var crossVec3=GLGE.crossVec3;
	var toUnitVec3=GLGE.toUnitVec3;
	var dotVec3=GLGE.dotVec3
	
	var nbl=mulMat4Vec4(cvpinv,[-1,-1,-1,1]);
	var nbr=mulMat4Vec4(cvpinv,[1,-1,-1,1]);
	var fbl=mulMat4Vec4(cvpinv,[-1,-1,1,1]);
	var ntr=mulMat4Vec4(cvpinv,[1,1,-1,1]);
	var ftr=mulMat4Vec4(cvpinv,[1,1,1,1]);
	var ftl=mulMat4Vec4(cvpinv,[-1,1,1,1]);
	
	nbl=[nbl[0]/nbl[3],nbl[1]/nbl[3],nbl[2]/nbl[3]];
	nbr=[nbr[0]/nbr[3],nbr[1]/nbr[3],nbr[2]/nbr[3]];
	fbl=[fbl[0]/fbl[3],fbl[1]/fbl[3],fbl[2]/fbl[3]];
	ntr=[ntr[0]/ntr[3],ntr[1]/ntr[3],ntr[2]/ntr[3]];
	ftr=[ftr[0]/ftr[3],ftr[1]/ftr[3],ftr[2]/ftr[3]];
	ftl=[ftl[0]/ftl[3],ftl[1]/ftl[3],ftl[2]/ftl[3]];

	var nearnorm=toUnitVec3(crossVec3(subVec3(ntr,nbr),subVec3(nbl,nbr)));
	var farnorm=toUnitVec3(crossVec3(subVec3(ftl,fbl),subVec3(ftr,fbl)));
	var leftnorm=toUnitVec3(crossVec3(subVec3(nbl,fbl),subVec3(ftl,fbl)));
	var rightnorm=toUnitVec3(crossVec3(subVec3(ftr,ntr),subVec3(ntr,nbr)));
	var topnorm=toUnitVec3(crossVec3(subVec3(ftl,ntr),subVec3(ntr,ftr)));
	var bottomnorm=toUnitVec3(crossVec3(subVec3(nbl,nbr),subVec3(fbl,nbl)));

	nearnorm.push(dotVec3(nearnorm,nbl));
	farnorm.push(dotVec3(farnorm,fbl));
	leftnorm.push(dotVec3(leftnorm,nbl));
	rightnorm.push(dotVec3(rightnorm,nbr));
	topnorm.push(dotVec3(topnorm,ftr));
	bottomnorm.push(dotVec3(bottomnorm,nbl));
	//might be worth calulating the frustum sphere for optimization at this point!
	
	return [nearnorm,farnorm,leftnorm,rightnorm,topnorm,bottomnorm];
}


//Checks if sphere is within frustum planes
//sphere passed as [center.x,center.y,center.z,radius]
GLGE.sphereInFrustumPlanes=function(sphere,planes){
	var sphere0=sphere[0];var sphere1=sphere[1];
	var sphere2=sphere[2];var sphere3=sphere[3];
	var plane0=planes[0];var plane1=planes[1];
	var plane2=planes[2];var plane3=planes[3];
	var plane4=planes[4];var plane5=planes[5];
	if(sphere0*plane0[0] + sphere1*plane0[1] + sphere2*plane0[2] - plane0[3] - sphere3 > 0
	|| sphere0*plane1[0] + sphere1*plane1[1] + sphere2*plane1[2] - plane1[3]  - sphere3 > 0
	|| sphere0*plane2[0] + sphere1*plane2[1] + sphere2*plane2[2] - plane2[3]  - sphere3 > 0
	|| sphere0*plane3[0] + sphere1*plane3[1] + sphere2*plane3[2] - plane3[3]  - sphere3 > 0
	|| sphere0*plane4[0] + sphere1*plane4[1] + sphere2*plane4[2] - plane4[3]  - sphere3 > 0
	|| sphere0*plane5[0] + sphere1*plane5[1] + sphere2*plane5[2] - plane5[3]  - sphere3 > 0){
		return false;
	}else{
		return true;
	}
}

//checks if cube points are within the frustum planes
GLGE.pointsInFrustumPlanes=function(points,planes){
	var plane0=planes[0];var plane1=planes[1];
	var plane2=planes[2];var plane3=planes[3];
	var plane4=planes[4];var plane5=planes[5];
	var x, y, z;
	
	for(var i=0; i<points.length;i++){
		x=points[i][0];
		y=points[i][1];
		z=points[i][2];
	
		if(x*plane0[0] + y*plane0[1] + z*plane0[2] - plane0[3] > 0
		&& x*plane1[0] + y*plane1[1] + z*plane1[2] - plane1[3]  > 0
		&& x*plane2[0] + y*plane2[1] + z*plane2[2] - plane3[3]  > 0
		&& x*plane3[0] + y*plane3[1] + z*plane3[2] - plane4[3]  > 0
		&& x*plane4[0] + y*plane4[1] + z*plane4[2] - plane4[3]  > 0
		&& x*plane5[0] + y*plane5[1] + z*plane5[2] - plane5[3]  > 0){
			return false;
		}
	}
	return true;
}

//get projection matrix for a directional light
GLGE.getDirLightProjection=function(cvp,light,projectedDistance,distance){
	var pointTransform=GLGE.mulMat4(light,GLGE.inverseMat4(cvp));
	var min=[0,0,0];
	var max=[0,0,0];
	for(var x=0;x<2;x++){
		for(var y=0;y<2;y++){
			for(var z=0;z<2;z++){
				//var vec=GLGE.mulMat4Vec4(pointTransform,[x*2-1,y*2-1,z*projectedDistance,1]);
				var vec=GLGE.mulMat4Vec4(pointTransform,[x*2-1,y*2-1,(z*2-1),1]);
				//console.log(vec[0]/vec[3],vec[1]/vec[3],vec[2]/vec[3],vec[3]/vec[3]);
				vec[0]=vec[0]/vec[3];vec[1]=vec[1]/vec[3];vec[2]=vec[2]/vec[3];
				min[0]=min[0] > vec[0] ? vec[0] : min[0];
				min[1]=min[1] > vec[1] ? vec[1] : min[1];
				max[0]=max[0] < vec[0] ? vec[0] : max[0];
				max[1]=max[1] < vec[1] ? vec[1] : max[1];
				max[2]=max[2] < vec[2] ? vec[2] : max[2];
			}
		}
	}
	var mat=GLGE.makeOrtho(min[0],max[0],min[1],max[1],0.01,+distance);
	//mat[0]*=8;
	//mat[5]*=8;
	//var mat=GLGE.makeFrustum(min[0],max[0],min[1],max[1],500,0.01);
	//var mat=GLGE.makeOrtho(-30,30,-30,30,0.01,500);
	//alert(mat);
	return mat
};


function GLGE_mathUnitTest() {
    var a=GLGE.Vec([1,2,3,4]);
    var b=GLGE.Vec4(GLGE.getVec4(a,3),
                    GLGE.get1basedVec4(a,3),
                    GLGE.getVec4(a,1),
                    GLGE.getVec4(a,0));
    var c=GLGE.identMatrix();
    var d=GLGE.mulMat4Vec4(c,b);
    if (GLGE.getVec4(d,0)!=4||
        GLGE.getVec4(d,1)!=3||
        GLGE.getVec4(d,2)!=2||
        GLGE.getVec4(d,3)!=1) {
        throw "Unit Test 1 failed MatVecMul "+d;
    }
    var m=GLGE.Mat4([3,4,5,0,.5,.75,0,0,.75,.5,0,0,.25,.25,1,1]);
    var m1=GLGE.Mat4([2,1,8,2,1,4,3,2,1,.5,6.5,2,8,3,1,.25]);
    var mm1=GLGE.mulMat4(m,m1);
    var am1=GLGE.Mat4([15,21.5,68.5,24,
                       1.75,3.5,6.25,2.5,
                       2,2.75,7.5,2.5,
                       9.75,4.75,10.25,3.25]);
    for (var i=0;i<4;++i) {
        for (var j=0;j<4;++j) {      
            var diff=GLGE.getMat4(mm1,i,j)-GLGE.getMat4(am1,i,j);
            if (diff<.000001&&diff>-.000001) {                

            }else {
                throw "Unit Test 1 failed Multiplication "+GLGE.getMat4(mm1,i,j)+" != "+GLGE.getMat4(am1,i,j);      
            }
        }
    }
    var inv = GLGE.inverseMat4(m);
    var k = GLGE.mulMat4(m,inv);
    var l = GLGE.mulMat4(inv,m);
    for (var i=0;i<4;++i) {
        for (var j=0;j<4;++j) {      
            var diff=GLGE.getMat4(k,i,j)-GLGE.getMat4(c,i,j);
            if (diff<.0001&&diff>-.0001) {                
            }else {
                throw "Unit Test 1 failed Inverse "+GLGE.getMat4(k,i,j)+" != "+GLGE.getMat4(c,i,j);   
            }
        }
    }
}
GLGE_mathUnitTest() ;



})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge.js
 * @author me@paulbrunt.co.uk
 */



 if(typeof(GLGE) == "undefined"){
	/**
	* @namespace Holds the functionality of the library
	*/
	GLGE = {};
}

(function(GLGE){

//speed ups parsing a float that is already a float is expensive!
var parseFloat2=function(val){
	if(typeof val!="number") return parseFloat(val);
		else return val;
}


/**
* Function to augment one object with another
* @param {object} obj1 Source Object
* @param {object} obj2 Destination Object
*/
GLGE.augment=function(obj1,obj2){
	obj2.prototype.baseclass = obj1;
	for(var proto in obj1.prototype){
		if(!obj2.prototype[proto]) // do not overwrite functions of the derived objects
			obj2.prototype[proto]=obj1.prototype[proto];
		else // Attach those to the baseclass instead. Use 'call(this)' to call baseclass methods
			obj2.prototype.baseclass[proto]=obj1.prototype[proto];
	}
}


/**
* Moves all GLGE function to global
**/
GLGE.makeGlobal=function(){
	for(var key in GLGE){
		window[key]=GLGE[key];
	}
}

GLGE.New=function(createclass){
	if(GLGE[createclass].prototype.className!=""){
		return new GLGE[createclass]();
	}else{
		return false;
	}
}

/**
* @constant 
* @description Enumeration for TRUE
*/
GLGE.TRUE=1;
/**
* @constant 
* @description Enumeration for FALSE
*/
GLGE.FALSE=0;

/**
* @constant 
* @description Enumeration for global refrance frame
*/
GLGE.GLOBAL=0;
/**
* @constant 
* @description Enumeration for local refrance frame
*/
GLGE.LOCAL=1;


/**
* @constant 
* @description Enumeration for tri rendering
*/
GLGE.DRAW_TRIS=1;
/**
* @constant 
* @description Enumeration for line rendering
*/
GLGE.DRAW_LINES=2;

/**
* @constant 
* @description Enumeration for line loop rendering
*/
GLGE.DRAW_LINELOOPS=3;
/**
* @constant 
* @description Enumeration for line loop rendering
*/
GLGE.DRAW_LINESTRIPS=4;
/**
* @constant 
* @description Enumeration for point rendering
*/
GLGE.DRAW_POINTS=5;

/**
* @constant 
* @description Enumeration for point rendering
*/
GLGE.DRAW_TRIANGLESTRIP=6;




/**
* @constant 
* @description Enumeration for rendering using default shader
*/
GLGE.RENDER_DEFAULT=0;

/**
* @constant 
* @description Enumeration for rendering using shadow shader
*/
GLGE.RENDER_SHADOW=1;

/**
* @constant 
* @description Enumeration for rendering using pick shader
*/
GLGE.RENDER_PICK=2;

/**
* @constant 
* @description Enumeration for rendering using normal shader
*/
GLGE.RENDER_NORMAL=3;

/**
* @constant 
* @description Enumeration for emit rendering
*/
GLGE.RENDER_EMIT=4;

/**
* @constant 
* @description Enumeration for depth rendering
*/
GLGE.RENDER_DEPTH=5;

/**
* @constant 
* @description Enumeration for no rendering
*/
GLGE.RENDER_NULL=6;

/**
* @constant 
* @description Enumeration for box bound text picking
*/
GLGE.TEXT_BOXPICK=1;
/**
* @constant 
* @description Enumeration for text bound text picking
*/
GLGE.TEXT_TEXTPICK=2;

/**
* @constant 
* @description Enumeration for euler rotaions mode
*/
GLGE.P_EULER=1;

/**
* @constant 
* @description Enumeration for quaternions mode
*/
GLGE.P_QUAT=2;

/**
* @constant 
* @description Enumeration for matrix rotation mode
*/
GLGE.P_MATRIX=3;

/**
* @constant 
* @description Enumeration for no value
*/
GLGE.NONE=0;

/**
* @constant 
* @description Enumeration for X-Axis
*/
GLGE.XAXIS=1;
/**
* @constant 
* @description Enumeration for Y-Axis
*/
GLGE.YAXIS=2;
/**
* @constant 
* @description Enumeration for Z-Axis
*/
GLGE.ZAXIS=3;

/**
* @constant 
* @description Enumeration for +X-Axis
*/
GLGE.POS_XAXIS=1;
/**
* @constant 
* @description Enumeration for -X-Axis
*/
GLGE.NEG_XAXIS=2;
/**
* @constant 
* @description Enumeration for +Y-Axis
*/
GLGE.POS_YAXIS=3;
/**
* @constant 
* @description Enumeration for -Y-Axis
*/
GLGE.NEG_YAXIS=4;
/**
* @constant 
* @description Enumeration for +Z-Axis
*/
GLGE.POS_ZAXIS=5;
/**
* @constant 
* @description Enumeration for -Z-Axis
*/
GLGE.NEG_ZAXIS=6;


GLGE.ZERO="ZERO";
GLGE.ONE="ONE";
GLGE.SRC_COLOR="SRC_COLOR";
GLGE.ONE_MINUS_SRC_COLOR="ONE_MINUS_SRC_COLOR";
GLGE.SRC_ALPHA="SRC_ALPHA";
GLGE.ONE_MINUS_SRC_ALPHA="ONE_MINUS_SRC_ALPHA";
GLGE.DST_ALPHA="DST_ALPHA";
GLGE.ONE_MINUS_DST_ALPHA="ONE_MINUS_DST_ALPHA";


/**
* @constant 
* @description Linear blending function
*/
GLGE.LINEAR_BLEND=function(value){
	return value;
}
/**
* @constant 
* @description Quadratic blending function
*/
GLGE.QUAD_BLEND=function(value){
	return value*value;
}
/**
* @constant 
* @description Special blending function
*/
GLGE.SPECIAL_BLEND=function(value){
	value=value*(2-value);
	return value*value;
}


GLGE.error=function(error){
    if (console&&console.log)
        console.log("GLGE error: "+error);
    //do not use a modal dialog to indicate this users can override GLGE.error if they desire
};

GLGE.warning=function(warning){
    if (console&&console.log)
        console.log("GLGE warning: "+warning);
    //do not use a modal dialog to indicate this users can override GLGE.warning if they desire
};

/**
* @namespace Holds the global asset store
*/
GLGE.Assets={};
GLGE.Assets.assets={};
//don't need to register assets unless we are using network or webworkers
GLGE.REGISTER_ASSETS=false;
 
GLGE.Assets.createUUID=function(){
	var data=["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
	var data2=["8","9","A","B"];
	uuid="";
	for(var i=0;i<38;i++){
		switch(i){
			case 8:uuid=uuid+"-";break;
			case 13:uuid=uuid+"-";break;
			case 18:uuid=uuid+"-";break;
			case 14:uuid=uuid+"4";break;
			case 19:uuid=uuid+data2[Math.round(Math.random()*3)];break;
			default:uuid=uuid+data[Math.round(Math.random()*15)];break;
		}
	}
	return uuid;
}
/**
* @function registers a new asset
*/
GLGE.Assets.registerAsset=function(obj,uid){
	if(typeof uid=="object"){
		if(obj._) obj._(uid);
		uid=uid.uid;
	}
	if(!uid){
		uid=GLGE.Assets.createUUID();
	};
	obj.uid=uid;
	if(GLGE.REGISTER_ASSETS){
		GLGE.Assets.assets[uid]=obj;
	}
}
/**
* @function removes an asset
*/
GLGE.Assets.unregisterAsset=function(uid){
	delete GLGE.Assets.assets[uid];
}
/**
* @function finds an asset by uid
*/
GLGE.Assets.get=function(uid){
	var value=GLGE.Assets.assets[uid];
	if(value){
		return value;
	}else{
		return false;
	}
}

/**
* @function hashing function
* @private
*/
GLGE.DJBHash=function(str){
      var hash = 5381;

      for(var i = 0; i < str.length; i++){
		hash = ((hash << 5) + hash) + str.charCodeAt(i);
      }

      return hash;
}

/**
* @function check if shader is already created if not then create it
* @private
*/
GLGE.getGLShader=function(gl,type,str){
	var hash=GLGE.DJBHash(str);
	if(!gl.shaderCache) gl.shaderCache={};
	if(!gl.shaderCache[hash]){
		var shader=gl.createShader(type);
		gl.shaderSource(shader, str);
		gl.compileShader(shader);
		if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
			try {
				GLGE.error(gl.getShaderInfoLog(shader));
				return;
			} catch (e) {
				/* Firefox hack: Assume no error if there was no shader log. */
			}
		}
		gl.shaderCache[hash]=shader;
	}
	return gl.shaderCache[hash];
}

var progIdx=0;
/**
* @function tries to re use programs
* @private
*/
GLGE.getGLProgram=function(gl,vShader,fShader){
	if(!gl.programCache) gl.programCache=[];
	var programCache=gl.programCache;
	for(var i=0; i<programCache.length;i++){
		if(programCache[i].fShader==fShader && programCache[i].vShader==vShader){
			return programCache[i].program;
		}
	}
	var program=gl.createProgram();
	program.progIdx=progIdx++;
	gl.attachShader(program, vShader);
	gl.attachShader(program, fShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		GLGE.error("Couldn't link shader: " + gl.getProgramInfoLog(program));
	}
	programCache.push({vShader:vShader,fShader:fShader,program:program});
	if(!program.uniformDetails){
		program.uniformDetails={};
		var uniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
		for (var i=0;i<uniforms;++i) {
			var info=gl.getActiveUniform(program, i);
			program.uniformDetails[info.name]={loc:GLGE.getUniformLocation(gl,program,info.name),info:info};
		}
	}
	return program;
}


/**
* function to cache the uniform locations
* @param {glcontext} the gl context of the program
* @param {program} the shader program
* @param {string} the uniform name
* @private
*/
GLGE.getUniformLocation=function(gl,program, uniform){
	/*if(program.uniformDetails[uniform]){
		return program.uniformDetails[uniform].loc;
	}else{
		return gl.getUniformLocation(program, uniform);
	}*/
	if(!program.uniformCache) program.uniformCache={};
	if(!program.uniformChecked) program.uniformChecked={};
	if(!program.uniformChecked[uniform]){
		program.uniformCache[uniform]=gl.getUniformLocation(program, uniform);
		program.uniformChecked[uniform]=true;
	}
	return program.uniformCache[uniform];
};
/**
* functions to set uniforms with location check.
*/
GLGE.setUniform=function(gl,type,location,value){
	if(typeof value=="string") value=+value;
	if(location!=null)
		gl["uniform"+type](location,value);

};

GLGE.setUniform3=function(gl,type,location,value1,value2,value3){
	if(typeof value1=="string") value1=+value1;
	if(typeof value2=="string") value2=+value2;
	if(typeof value3=="string") value3=+value3;
	if(location!=null)
		gl["uniform"+type](location,value1,value2,value3);

};

GLGE.setUniform2=function(gl,type,location,value1,value2){
	if(typeof value1=="string") value1=+value1;
	if(typeof value2=="string") value2=+value2;
	if(location!=null)
		gl["uniform"+type](location,value1,value2);

};
GLGE.setUniform4=function(gl,type,location,value1,value2,value3,value4){
	if(location!=null)
		gl["uniform"+type](location,value1,value2,value3,value4);

};

GLGE.setUniformMatrix=function(gl,type,location,transpose,value){
	if(location!=null)
		gl["uniform"+type](location,transpose,value);
};

/**
* function to cache the attribute locations
* @param {glcontext} the gl context of the program
* @param {program} the shader program
* @param {string} the attribe name
* @private
*/
GLGE.getAttribLocation=function(gl,program, attrib){
	if(!program.attribCache) program.attribCache={};
	if(program.attribCache[attrib]==undefined){
		program.attribCache[attrib]=gl.getAttribLocation(program, attrib);
	}
	return program.attribCache[attrib];
}




/**
* function to parse a colour input into RGB eg #ff00ff, red, rgb(100,100,100)
* @param {string} color the color to parse
*/
GLGE.colorParse=function(color){
	var red,green,blue,alpha;
	//defines the color names
	var color_names = {
		aliceblue: 'f0f8ff',		antiquewhite: 'faebd7',	aqua: '00ffff',
		aquamarine: '7fffd4',	azure: 'f0ffff',		beige: 'f5f5dc',
		bisque: 'ffe4c4',		black: '000000',		blanchedalmond: 'ffebcd',
		blue: '0000ff',			blueviolet: '8a2be2',	brown: 'a52a2a',
		burlywood: 'deb887',	cadetblue: '5f9ea0',		chartreuse: '7fff00',
		chocolate: 'd2691e',		coral: 'ff7f50',		cornflowerblue: '6495ed',
		cornsilk: 'fff8dc',		crimson: 'dc143c',		cyan: '00ffff',
		darkblue: '00008b',		darkcyan: '008b8b',		darkgoldenrod: 'b8860b',
		darkgray: 'a9a9a9',		darkgreen: '006400',	darkkhaki: 'bdb76b',
		darkmagenta: '8b008b',	darkolivegreen: '556b2f',	darkorange: 'ff8c00',
		darkorchid: '9932cc',	darkred: '8b0000',		darksalmon: 'e9967a',
		darkseagreen: '8fbc8f',	darkslateblue: '483d8b',	darkslategray: '2f4f4f',
		darkturquoise: '00ced1',	darkviolet: '9400d3',	deeppink: 'ff1493',
		deepskyblue: '00bfff',	dimgray: '696969',		dodgerblue: '1e90ff',
		feldspar: 'd19275',		firebrick: 'b22222',		floralwhite: 'fffaf0',
		forestgreen: '228b22',	fuchsia: 'ff00ff',		gainsboro: 'dcdcdc',
		ghostwhite: 'f8f8ff',		gold: 'ffd700',			goldenrod: 'daa520',
		gray: '808080',		green: '008000',		greenyellow: 'adff2f',
		honeydew: 'f0fff0',		hotpink: 'ff69b4',		indianred : 'cd5c5c',
		indigo : '4b0082',		ivory: 'fffff0',		khaki: 'f0e68c',
		lavender: 'e6e6fa',		lavenderblush: 'fff0f5',	lawngreen: '7cfc00',
		lemonchiffon: 'fffacd',	lightblue: 'add8e6',		lightcoral: 'f08080',
		lightcyan: 'e0ffff',		lightgoldenrodyellow: 'fafad2',	lightgrey: 'd3d3d3',
		lightgreen: '90ee90',	lightpink: 'ffb6c1',		lightsalmon: 'ffa07a',
		lightseagreen: '20b2aa',	lightskyblue: '87cefa',	lightslateblue: '8470ff',
		lightslategray: '778899',	lightsteelblue: 'b0c4de',	lightyellow: 'ffffe0',
		lime: '00ff00',			limegreen: '32cd32',	linen: 'faf0e6',
		magenta: 'ff00ff',		maroon: '800000',		mediumaquamarine: '66cdaa',
		mediumblue: '0000cd',	mediumorchid: 'ba55d3',	mediumpurple: '9370d8',
		mediumseagreen: '3cb371',	mediumslateblue: '7b68ee',	mediumspringgreen: '00fa9a',
		mediumturquoise: '48d1cc',	mediumvioletred: 'c71585',	midnightblue: '191970',
		mintcream: 'f5fffa',	mistyrose: 'ffe4e1',		moccasin: 'ffe4b5',
		navajowhite: 'ffdead',	navy: '000080',		oldlace: 'fdf5e6',
		olive: '808000',		olivedrab: '6b8e23',		orange: 'ffa500',
		orangered: 'ff4500',	orchid: 'da70d6',		palegoldenrod: 'eee8aa',
		palegreen: '98fb98',		paleturquoise: 'afeeee',	palevioletred: 'd87093',
		papayawhip: 'ffefd5',	peachpuff: 'ffdab9',		peru: 'cd853f',
		pink: 'ffc0cb',		plum: 'dda0dd',		powderblue: 'b0e0e6',
		purple: '800080',		red: 'ff0000',		rosybrown: 'bc8f8f',
		royalblue: '4169e1',		saddlebrown: '8b4513',	salmon: 'fa8072',
		sandybrown: 'f4a460',	seagreen: '2e8b57',		seashell: 'fff5ee',
		sienna: 'a0522d',		silver: 'c0c0c0',		skyblue: '87ceeb',
		slateblue: '6a5acd',		slategray: '708090',	snow: 'fffafa',
		springgreen: '00ff7f',	steelblue: '4682b4',		tan: 'd2b48c',
		teal: '008080',		thistle: 'd8bfd8',		tomato: 'ff6347',
		turquoise: '40e0d0',		violet: 'ee82ee',		violetred: 'd02090',
		wheat: 'f5deb3',		white: 'ffffff',		whitesmoke: 'f5f5f5',
		yellow: 'ffff00',		yellowgreen: '9acd32'
	};
	if(color_names[color]) color="#"+color_names[color];
	if(color.substr && color.substr(0,1)=="#"){
		color=color.substr(1);
		if(color.length==8){
			red=parseInt("0x"+color.substr(0,2))/255;
			green=parseInt("0x"+color.substr(2,2))/255;
			blue=parseInt("0x"+color.substr(4,2))/255;
			alpha=parseInt("0x"+color.substr(6,2))/255;
		}else if(color.length==4){
			red=parseInt("0x"+color.substr(0,1))/15;
			green=parseInt("0x"+color.substr(1,1))/15;
			blue=parseInt("0x"+color.substr(2,1))/15;
			alpha=parseInt("0x"+color.substr(3,1))/15;
		}else if(color.length==6){
			red=parseInt("0x"+color.substr(0,2))/255;
			green=parseInt("0x"+color.substr(2,2))/255;
			blue=parseInt("0x"+color.substr(4,2))/255;
			alpha=1;
		}else if(color.length==3){
			red=parseInt("0x"+color.substr(0,1))/15;
			green=parseInt("0x"+color.substr(1,1))/15;
			blue=parseInt("0x"+color.substr(2,1))/15;
			alpha=1;
		}
	}else if(color.substr && color.substr(0,4)=="rgb("){
		var colors=color.substr(4).split(",");
		red=parseInt(colors[0])/255;
		green=parseInt(colors[1])/255;
		blue=parseInt(colors[2])/255;
		alpha=1;
	}else if(color.substr && color.substr(0,5)=="rgba("){
		var colors=color.substr(4).split(",");
		red=parseInt(colors[0])/255;
		green=parseInt(colors[1])/255;
		blue=parseInt(colors[2])/255;
		alpha=parseInt(colors[3])/255;
	}else{
		red=0;
		green=0;
		blue=0;
		alpha=0;
	}
	return {r:red,g:green,b:blue,a:alpha};
}



})(GLGE);


/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_event.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){




/**
* @class A events class
**/
GLGE.Events=function(){
}
/**
* Fires an event
* @param {string} event The name of the event to fire
* @param {object} data the events data
**/
GLGE.Events.prototype.fireEvent=function(event,data){
	if(this.events && this.events[event]){
		var events=this.events[event];
		for(var i=0;i<events.length;i++){
			if(events[i] && events[i].call) events[i].call(this,data);
		}
	}
}
/**
* Adds an event listener
* @param {string} event The name of the event to listen for
* @param {function} fn the event callback
**/
GLGE.Events.prototype.addEventListener=function(event,fn){
	if(!this.events) this.events={};
	if(!this.events[event]) this.events[event]=[];
	this.events[event].push(fn);
}
/**
* Removes an event listener
* @param {function} fn the event callback to remove
**/
GLGE.Events.prototype.removeEventListener=function(event,fn){
    if(!this.events[event]) return;
	var idx=this.events[event].indexOf(fn);
	if(idx!=-1) this.events[event].splice(idx,1);
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_quicknote.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){
	
/**
* @class class to implelemnt quick notation
*/
GLGE.QuickNotation=function(){
}
/**
* Call to set properties and add children to an object
* @example myObject._({LocX:10,LocY:20},child1,child2,.....);
*/
GLGE.QuickNotation.prototype._=function(){
	var argument;
	for(var i=0; i<arguments.length;i++){
		argument=arguments[i];
		if(typeof argument=="object"){
			if(argument.className && this["add"+argument.className]){
				this["add"+argument.className](argument);
			}else{
				for(var key in argument){
					if(this["set"+key]){
						this["set"+key](argument[key]);
					}
				}
			}
		}
	}
	return this;
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_animatable.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){



/**
* @class Animation class to agument animatiable objects 
* @augments GLGE.Events
*/
GLGE.Animatable=function(){
}
/**
 * @name GLGE.Animatable#animFinished
 * @event
 * @param {object} data
 */
GLGE.augment(GLGE.Events,GLGE.Animatable);

GLGE.Animatable.prototype.animationStart=null;
GLGE.Animatable.prototype.animation=null;
GLGE.Animatable.prototype.blendStart=0;
GLGE.Animatable.prototype.blendTime=0;
GLGE.Animatable.prototype.lastFrame=null;
GLGE.Animatable.prototype.frameRate=30;
GLGE.Animatable.prototype.loop=GLGE.TRUE;
GLGE.Animatable.prototype.paused=GLGE.FALSE;
GLGE.Animatable.prototype.pausedTime=null;
GLGE.Animatable.prototype.blendFunction=GLGE.LINEAR_BLEND;

/**
* Creates and sets an animation to blend to the properties. Useful for blending to a specific location for example:
* blendto({LocX:10,LocY:5,LocZ:10},2000);
* @param {object} properties The properties to blend
* @param {number} duration the duration of the blend
* @param {function} blendFunction[optional] the function used for blending defaults to GLGE.LINEAR_BLEND
*/
GLGE.Animatable.prototype.blendTo=function(properties,duration,blendFunction){
	if(!blendFunction) blendFunction=GLGE.LINEAR_BLEND;
	var animation=new GLGE.AnimationVector();
	var curve;
	var point;
	for(var prop in properties){
		curve=new GLGE.AnimationCurve();
		curve.setChannel(prop);
		point=new GLGE.LinearPoint();
		point.setX(1);
		point.setY(properties[prop]);
		curve.addPoint(point);
		animation.addAnimationCurve(curve);
	}
	this.setBlendFunction(blendFunction);
	this.setAnimation(animation,duration);
	return this;
}
/**
* Sets the animation blending function
* @param {function} value The blending function
*/
GLGE.Animatable.prototype.setBlendFunction=function(value){
	this.blendFunction=value;
	return this;
}
/**
* Gets the animation blending function
* @returns {function} the blending function
*/
GLGE.Animatable.prototype.getBlendFunction=function(){
	return this.blendFunction;
}

/**
* Sets the name of this object used for skinning
* @param {String} value The name to set
*/
GLGE.Animatable.prototype.setName=function(value){
	this.name=value;
	return this;
}
/**
* Gets the name of this object used for skinning
* @returns {String} the name
*/
GLGE.Animatable.prototype.getName=function(){
	return this.name;
}
/**
* gets the frame at the specified time
* @param {number} now the current time
*/
 GLGE.Animatable.prototype.getFrameNumber=function(now){
	if(!this.startFrame) this.startFrame=this.animation.startFrame;
	if(!this.animFrames) this.animFrames=this.animation.frames;
	var frame;
	if(!now) now=parseInt(new Date().getTime());
	if(this.animFrames>1){
		if(this.loop){
			frame=((parseFloat(now)-parseFloat(this.animationStart))/1000*this.frameRate)%(this.animFrames-1)+1+this.startFrame; 
		}else{
			frame=((parseFloat(now)-parseFloat(this.animationStart))/1000*this.frameRate)+1+this.startFrame; 
			if(frame>=(this.animFrames+this.startFrame)){
				frame=this.animFrames;
			}
		}
	}else{
		frame=1;
	}

	return Math.round(frame);
}
 
/**
* Sets the start frame for the animation overriding the animation default
* @param {number} startFrame the start frame
*/
 GLGE.Animatable.prototype.setStartFrame=function(startFrame,blendTime,loop){
	this.loop=loop;
	var starttime=parseInt(new Date().getTime());
	if(!blendTime) blendTime=0;
	if(blendTime>0){
		if(this.animation){
			this.blendInitValues=this.getInitialValues(this.animation,starttime);
			this.blendTime=blendTime;
		}
	}
	this.animationStart=starttime;
	this.lastFrame=null;
	this.animFinished=false;
	this.startFrame=startFrame;
	if(this.children){
		for(var i=0;i<this.children.length;i++){
			if(this.children[i].setStartFrame){
				this.children[i].setStartFrame(startFrame,blendTime,loop);
			}
		}
	}
	return this;
 }
 /**
* Sets the number of frames to play overriding the animation default
* @param {number} frames the number of frames
* @private
*/
 GLGE.Animatable.prototype.setFrames=function(frames){
	this.animFrames=frames;
	if(this.children){
		for(var i=0;i<this.children.length;i++){
			if(this.children[i].setFrames){
				this.children[i].setFrames(frames);
			}
		}
	}
	return this;l
 }
 
 /**
* gets the initial values for the animation vector for blending
* @param {GLGE.AnimationVector} animation The animation
* @private
*/
 GLGE.Animatable.prototype.getInitialValues=function(animation,time){
	var initValues={};
	
	if(this.animation){
		this.lastFrame=null;
		this.animate(time,true);
	}
	
	for(var property in animation.curves){
		if(this["get"+property]){
			initValues[property]=this["get"+property]();
		}
	}
	
	return initValues;
}
 
/**
* update animated properties on this object
*/
GLGE.Animatable.prototype.animate=function(now,nocache){
	if(!this.paused && this.animation){
		if(!now) now=parseInt(new Date().getTime());
		var frame=this.getFrameNumber(now);
		
		if(!this.animation.animationCache) this.animation.animationCache={};
		if(frame!=this.lastFrame || this.blendTime!=0){
			this.lastFrame=frame;
			if(this.blendTime==0){
				if(!this.animation.animationCache[frame] || nocache){
					this.animation.animationCache[frame]=[];
					if(this.animation.curves["LocX"] && this.animation.curves["LocY"] && this.animation.curves["LocZ"]
						&& this.animation.curves["ScaleX"] && this.animation.curves["ScaleY"] && this.animation.curves["ScaleZ"]
						&& this.animation.curves["QuatX"] && this.animation.curves["QuatY"] && this.animation.curves["QuatZ"] && this.animation.curves["QuatW"]){
						//just set matrix
						for(var property in this.animation.curves){
							if(this["set"+property]){
								var value=this.animation.curves[property].getValue(parseFloat(frame));
								switch(property){
									case "QuatX":
									case "QuatY":
									case "QuatZ":
									case "QuatW":
									case "LocX":
									case "LocY":
									case "LocZ":
									case "ScaleX":
									case "ScaleY":
									case "ScaleZ":
										break;
									default:
										this.animation.animationCache[frame].push({property:property,value:value});
										break;
								}
								this["set"+property](value);
							}	
						}
						this.animation.animationCache[frame].push({property:"StaticMatrix",value:this.getLocalMatrix()});
					}else{
						for(property in this.animation.curves){
							if(this["set"+property]){
								var value=this.animation.curves[property].getValue(parseFloat(frame));
								switch(property){
									case "QuatX":
									case "QuatY":
									case "QuatZ":
									case "QuatW":
									case "RotX":
									case "RotY":
									case "RotZ":
											var rot=true;
										break;
									default:
										this.animation.animationCache[frame].push({property:property,value:value});
										break;
								}
								this["set"+property](value);
							}	
						}
						if(rot){
							value=this.getRotMatrix();
							this.animation.animationCache[frame].push({property:"RotMatrix",value:value});
						}
					}
				}else{
					var cache=this.animation.animationCache[frame];
					for(var i=0;i<cache.length;i++){
						if(this["set"+cache[i].property]) this["set"+cache[i].property](cache[i].value);
					}
				}
			}else{
				var time=now-this.animationStart;
				if(time<this.blendTime){
					var blendfactor=time/this.blendTime;
					blendfactor=this.blendFunction(blendfactor);
					for(property in this.animation.curves){
						if(this["set"+property]){
							var value=this.animation.curves[property].getValue(parseFloat(frame));
							value=value*blendfactor+this.blendInitValues[property]*(1-blendfactor);
							this["set"+property](value);
						}	
					}
				}else{
					this.blendTime=0;
				}
			}
		}
	}
	if(this.children){
		for(var i=0; i<this.children.length;i++){
			if(this.children[i].animate){
				this.children[i].animate(now,nocache);
			}
		}
	}
	if(this.animation && !this.animFinished && this.blendTime==0 && this.animation.frames==frame && !nocache){
		this.animFinished=true;
		this.fireEvent("animFinished",{});
	}
}
/**
* Sets the animation vector of this object
* @param {GLGE.AnimationVector} animationVector the animation to apply to this object
* @param {number} blendDuration [Optional] the time in milliseconds to blend into this animation
* @param {number} starttime [Optional] the starting time of the animation
*/
GLGE.Animatable.prototype.setAnimation=function(animationVector,blendDuration,starttime){
	if(starttime==null) starttime=parseInt(new Date().getTime());
	if(!blendDuration) blendDuration=0;
	if(blendDuration>0){
		this.blendInitValues=this.getInitialValues(animationVector,starttime);
		this.blendTime=blendDuration;
	}
	this.animFrames=null;
	this.startFrame=null;
	this.animationStart=starttime;
	this.lastFrame=null;
	this.animation=animationVector;
	this.animFinished=false;
	return this;
}
/**
* Gets the animation vector of this object
* @returns {AnimationVector}
*/
GLGE.Animatable.prototype.getAnimation=function(){
	return this.animation;
}
/**
* Sets the frame rate of the animation
* @param  {number} value the frame rate to set
*/
GLGE.Animatable.prototype.setFrameRate=function(value){
	this.frameRate=value;
	if (this.children) {
		for (var i = 0; i < this.children.length; i++) {
			if (this.children[i].setFrameRate) {
				this.children[i].setFrameRate(value);
			}
		}
	}
	return this;
}
/**
* Gets the frame rate of the animation
* @return {number} the current frame rate
*/
GLGE.Animatable.prototype.getFrameRate=function(){
	return this.frameRate;
}
/**
* Sets the loop flag to GLGE.TRUE or GLGE.FALSE
* @param  {boolean} value 
*/
GLGE.Animatable.prototype.setLoop=function(value){
	this.loop=value;
	return this;
}
/**
* Gets the loop flag
* @return {boolean}
*/
GLGE.Animatable.prototype.getLoop=function(){
	return this.loop;
}
/**
* @function is looping? @see GLGE.Animatable#getLoop
*/
GLGE.Animatable.prototype.isLooping=GLGE.Animatable.prototype.getLoop;
 
/**
* Sets the paused flag to GLGE.TRUE or GLGE.FALSE
* @param  {boolean} value 
*/
GLGE.Animatable.prototype.setPaused=function(value){
	if(value) this.pauseTime=parseInt(new Date().getTime());
		else this.animationStart=this.animationStart+(parseInt(new Date().getTime())-this.pauseTime);
	this.paused=value;
	return this;
}
/**
* Gets the paused flag
* @return {boolean}
*/
GLGE.Animatable.prototype.getPaused=function(){
	return this.paused;
}
/**
* Toggles the paused flag
* @return {boolean} returns the resulting flag state
*/
GLGE.Animatable.prototype.togglePaused=function(){
	this.setPaused(!this.getPaused());
	return this.paused;
}

})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_document.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){




/**
* @class Document class to load scene, object, mesh etc from an external XML file 
* @param {string} url URL of the resource to load
*/
GLGE.Document=function(){
	this.listeners=[];
	this.documents=[];
}
GLGE.Document.prototype.listeners=null;
GLGE.Document.prototype.documents=null;
GLGE.Document.prototype.rootURL=null;
GLGE.Document.prototype.loadCount=0;
GLGE.Document.prototype.version=0;
GLGE.Document.prototype.preloader=null;
/**
* This is just a fix for a bug in webkit
* @param {string} id the id name to get
* @returns {object} node with teh specified id
* @private
*/
GLGE.Document.prototype.getElementById=function(id){
	var tags=this.getElementsByTagName("*");
	for(var i=0; i<tags.length;i++){
		if(tags[i].getAttribute("id")==id){
			return tags[i];
			break;
		}
	}
	return null;
}
/**
* Gets the absolute path given an import path and the path it's relative to
* @param {string} path the path to get the absolute path for
* @param {string} relativeto the path the supplied path is relativeto
* @returns {string} absolute path
* @private
*/
GLGE.Document.prototype.getAbsolutePath=function(path,relativeto){
	if(path.substr(0,7)=="http://" || path.substr(0,7)=="file://"  || path.substr(0,8)=="https://"){
		return path;
	}
	else
	{
		if(!relativeto){
			relativeto=window.location.href;
		}
		//find the path compoents
		var bits=relativeto.split("/");
		var domain=bits[2];
		var proto=bits[0];
		var initpath=[];
		for(var i=3;i<bits.length-1;i++){
			initpath.push(bits[i]);
		}
		//relative to domain
		if(path.substr(0,1)=="/"){
			initpath=[];
		}
		var locpath=path.split("/");
		for(var i=0;i<locpath.length;i++){
			if(locpath[i]=="..") initpath.pop();
				else if(locpath[i]!="") initpath.push(locpath[i]);
		}
		return proto+"//"+domain+"/"+initpath.join("/");
	}
}
/**
* Loads the root document
* @param {string} url URL of the resource to load
* @param {object} preload Decides if a preloader is used. true: default preloader, object: specialized preloader
*/
GLGE.Document.prototype.load=function(url, preload){
	
	if(preload)
		this.usePreloader(preload);
	
	this.documents=[];
	this.rootURL=url;
	this.loadDocument(url,null);
}
/**
* Loads an additional documents into the collection
* @param {string} url URL of the resource to load
* @param {string} relativeto the path the URL is relative to, null for default
*/
GLGE.Document.prototype.loadDocument=function(url,relativeto){
	this.loadCount++;
	url=this.getAbsolutePath(url,relativeto);
	
	if(this.preloader)
	{
		this.preloader.loadXMLFile(url);
	}
	else
	{
		var req = new XMLHttpRequest();
		if(req) {
			req.docurl=url;
			req.docObj=this;
			req.overrideMimeType("text/xml");
			req.onreadystatechange = function() {
				if(this.readyState  == 4)
				{
					if(this.status  == 200 || this.status==0){
						this.responseXML.getElementById=this.docObj.getElementById;
						this.docObj.loaded(this.docurl,this.responseXML);
					}else{ 
						GLGE.error("Error loading Document: "+this.docurl+" status "+this.status);
					}
				}
			};
			req.open("GET", url, true);
			req.send("");
		}
	}	
}
/**
* Trigered when a document has finished loading
* @param {string} url the absolute url of the document that has loaded
* @param {XMLDoc} responceXML the xml document that has finished loading
* @private
*/
GLGE.Document.prototype.loaded=function(url,responceXML){
	this.loadCount--;
	this.documents[url]={'xml':responceXML, 'url':url};
	var root=responceXML.getElementsByTagName("glge");
	if(root[0] && root[0].hasAttribute("version")) this.version=parseFloat(root[0].getAttribute("version"));
	var imports=responceXML.getElementsByTagName("import");
	for(var i=0; i<imports.length;i++){
		if(!this.documents[this.getAbsolutePath(imports[i].getAttribute("url"),url)]){
			this.documents[this.getAbsolutePath(imports[i].getAttribute("url"),url)]={};
			this.loadDocument(imports[i].getAttribute("url"),url);
		}
	}
	if(this.loadCount==0){
		this.finishedLoading();
	}
}
/**
* Called when all documents have finished loading
* @private
*/
GLGE.Document.prototype.finishedLoading=function(){
	for(var i=0; i<this.listeners.length;i++){
		this.listeners[i](this.rootURL);
	}
	this["onLoad"]();
}
/**
* Called when all documents have finished loading
* @event
*/
GLGE.Document.prototype["onLoad"]=function(){};
/**
* Use a preloader
* @param {object} [object]	This object contains optional parameters. Example1: {XMLQuota: 0.30, XMLBytes: 852605}, Example2: {XMLQuota: 0.13, numXMLFiles: 1}, Example3: true
*/
GLGE.Document.prototype.usePreloader = function(args){
	this.preloader = new GLGE.DocumentPreloader(this, args);
	var that = this;
	this.addLoadListener(function(url){that.preloadImages.call(that);});	
}
/**
* Start preloading images. This function should be called when the document (xml) is loaded.
* @private
*/
GLGE.Document.prototype.preloadImages = function(){
	var imageArrays = []; // 2 dimensional
	var docUrls = [];
	
	// create an array of all images
	for(var doc in this.documents){
		if(this.documents[doc].xml){
			imageArrays.push(this.documents[doc].xml.getElementsByTagName("texture"));
			docUrls.push(this.documents[doc].url);
		}
	}
	
	// add images to the preloader
	for(var a in imageArrays){
		for(var i=0; i<imageArrays[a].length; i++){
			var src = imageArrays[a][i].getAttribute("src");
			if(src)
				this.preloader.addImage(this.getAbsolutePath(src, docUrls[a]));
		}
	}
	this.preloader.loadImages();
}
/**
* Converts and attribute name into a class name
* @param {string} name attribute name to convert
* @private
*/
GLGE.Document.prototype.classString=function(name){
	if(!name) return false;
	var names=name.split("_");
	var converted="";
	for(var i=0;i<names.length;i++){
		converted=converted+names[i][0].toUpperCase()+names[i].substr(1);
	}
	return converted;
}
/**
* Sets the properties of an object based on the attributes of the corresponding dom element
* @param {object} Obj the DOM element to apply the attributes of
* @private
*/
GLGE.Document.prototype.setProperties=function(Obj){
	var set_method;
	var attribute_name;
	var value;
	for(var i=0; i<Obj.attributes.length; i++){
		value=false;
		set_method="set"+this.classString(Obj.attributes[i].nodeName);

		if(Obj.attributes[i].value[0]=="#"){
			value=this.getElement(Obj.attributes[i].value.substr(1),true);
		}
		if(!value){
			//if this is a GLGE contsant then set the constant value otherwise just literal
			if(typeof(GLGE[Obj.attributes[i].value]) != "undefined"){
				value=GLGE[Obj.attributes[i].value];
			}
			else
			{
				value=Obj.attributes[i].value;
			}
		}
		
		if(Obj.object[set_method]) Obj.object[set_method]((value == parseFloat(value)) ? (parseFloat(value)) : (value));
		//if a uid is set in the xml doc then make sure it's registered correctly in the assets
		if(Obj.attributes[i].nodeName=="uid"){
			GLGE.Assets.unregisterAsset(Obj.object.uid);
			Obj.object.uid=Obj.attributes[i].value;
			GLGE.Assets.registerAsset(Obj.object,Obj.attributes[i].value);
		}
	}
}
/**
* Adds child objects 
* @param {object} Obj the DOM element to apply the children of
* @private
*/
GLGE.Document.prototype.addChildren=function(Obj){
	//loop though and add the children
	var add_method;
	var child=Obj.firstChild;
	while(child){
		add_method="add"+this.classString(child.tagName);
		if(Obj.object[add_method]) Obj.object[add_method](this.getElement(child));
		child=child.nextSibling;
	}
}
/**
* Gets an object from the XML document based on the dom element 
* @param {string|domelement} ele the id of the element to get or the dom node
*/
GLGE.Document.prototype.getElement=function(ele,noerrors){
	var docele,doc;
	if(typeof(ele)=="string"){
		for(var doc in this.documents){
			if(this.documents[doc].xml){
				docele=this.documents[doc].xml.getElementById(ele);
				if(docele){
					ele=docele;
					break;
				}
			}
		}
	}
	if(typeof(ele)=="string"){
		//if element is still a string at this point there there is an issue
		if(!noerrors) GLGE.error("Element "+ele+" not found in document");
		return false;
	}
	else
	{
		if(this["get"+this.classString(ele.tagName)]){
			return this["get"+this.classString(ele.tagName)](ele);
		}
		else
		{
			return this.getDefault(ele);
		}
	}
}
/**
* Parses the a data array
* @param {domelement} ele the element to create the objects from
* @private
*/
GLGE.Document.prototype.getData=function(ele){
	if(!ele.object){
		ele.object=this.parseArray(ele);
		if(ele.hasAttribute("type")){
			var type=ele.getAttribute("type");
			switch(type){
				case "matrix":
					for(var i=0;i<ele.object.length;i++){
						ele.object[i]=GLGE.Mat4(ele.object[i].split(" "));
					}
					break;
				case "links":
					for(var i=0;i<ele.object.length;i++){
						ele.object[i]=this.getElement(ele.object[i].substr(1));
					}
					break;
			}
		}
	}
	return ele.object;
}
/**
* Parses the dom element and creates any objects that are required
* @param {domelement} ele the element to create the objects from
* @private
*/
GLGE.Document.prototype.getDefault=function(ele){
	if(!ele.object){
		if(GLGE[this.classString(ele.tagName)]){
			ele.object=new GLGE[this.classString(ele.tagName)]();
			this.setProperties(ele);
			this.addChildren(ele);
		}
		else
		{
			GLGE.error("XML Parse Error: GLGE Object not found"); 
		}
	}
	return ele.object;
}
/**
* Parses the dom element and creates a texture
* @param {domelement} ele the element to create the objects from
* @private
*/
GLGE.Document.prototype.getTexture=function(ele){
	if(!ele.object){
		var rel=this.getAbsolutePath(this.rootURL,null);
		ele.object=new GLGE[this.classString(ele.tagName)];
		ele.object.setSrc(this.getAbsolutePath(ele.getAttribute("src"),rel));
		ele.removeAttribute("src");
		this.setProperties(ele);
	}
	return ele.object;
}
GLGE.Document.prototype.getTextureVideo=GLGE.Document.prototype.getTexture;

/**
* Parses a document node into an array
* @param {node} the node to parse
* @private
*/
GLGE.Document.prototype.parseArray=function(node){
	var child=node.firstChild;
	var prev="";
	var output=[];
	var currentArray;
	var i;
	while(child){
		currentArray=(prev+child.nodeValue).split(",");
		child=child.nextSibling;
		if(currentArray[0]=="") currentArray.unshift();
		if(child) prev=currentArray.pop();
		for(var i=0;i<currentArray.length;i++) output.push(currentArray[i]);
	}
	return output;
}

/**
* Parses the mesh dom to create the mesh object
* @param {domelement} ele the element to create the mesh from
* @private
*/
GLGE.Document.prototype.getMesh=function(ele){
	if(this.version>0) return this.getDefault(ele); //as of GLGE XML 1.0 the mesh is nothing special!
	
	if(!ele.object){
		ele.object=new GLGE.Mesh();
		this.setProperties(ele);
		var child=ele.firstChild;
		while(child){
			switch(child.tagName){
				case "positions":
					ele.object.setPositions(this.parseArray(child));
					break;
				case "normals":
					ele.object.setNormals(this.parseArray(child));
					break;				
				case "uv1":
					ele.object.setUV(this.parseArray(child));
					break;				
				case "uv2":
					ele.object.setUV2(this.parseArray(child));
					break;
				case "faces":
					ele.object.setFaces(this.parseArray(child));
					break;
				case "color":
					ele.object.setVertexColors(this.parseArray(child));
					break;
				case "joint_names":
					var names=this.parseArray(child);
					var jointObjects=[];
					for(var i=0;i<names.length;i++){
						if(names[i].substr(0,1)=="#"){
							jointObjects.push(this.getElement(names[i].substr(1)));
						}else{
							jointObjects.push(names[i]);
						}
					}
					ele.object.setJoints(jointObjects);
					break;
				case "bind_matrix":
					var mats=this.parseArray(child);
					var invBind=[];
					for(var i=0;i<mats.length;i++){
						invBind.push(GLGE.Mat4(mats[i].split(" ")));
					}
					ele.object.setInvBindMatrix(invBind);
					break;
				case "joints":
					ele.object.setVertexJoints(this.parseArray(child),child.getAttribute("count"));
					break;
				case "weights":
					ele.object.setVertexWeights(this.parseArray(child),child.getAttribute("count"));
					break;
			}
			child=child.nextSibling;
		}
	}
	return ele.object;
}

/**
* Adds a listener to be called when all documents have finished loading
* @param {function} listener the function to call when all loading in complete
*/
GLGE.Document.prototype.addLoadListener=function(listener){
	this.listeners.push(listener);
}
/**
* Removes a load listener
* @param {function} listener Listener to remove
*/
GLGE.Document.prototype.removeLoadListener=function(listener){
	for(var i=0; i<this.listeners.length; i++){
		if(this.listeners[i]===listener) this.listeners.splice(i,1);
	}
}

/**
* loads xml from a script tag
* @param {string} id the id of the element to load
*/
GLGE.Document.prototype.parseScript=function(id){
	this.rootURL=window.location.toString();
	var xmlScript = document.getElementById(id);
	if (!xmlScript) {
		return null;
	}
 
	var str = "";
	var k = xmlScript.firstChild;
	while (k) {
		if (k.nodeType == 3) {
			str += k.textContent;
		}
		k = k.nextSibling;
	}
	
	var parser=new DOMParser();
	var xmlDoc=parser.parseFromString(str,"text/xml");
	xmlDoc.getElementById=this.getElementById;
	
	this.documents["#"+id]={xml:xmlDoc};

	var imports=xmlDoc.getElementsByTagName("import");
	for(var i=0; i<imports.length;i++){
		if(!this.documents[this.getAbsolutePath(imports[i].getAttribute("url"),url)]){
			this.documents[this.getAbsolutePath(imports[i].getAttribute("url"),url)]={};
			this.loadDocument(imports[i].getAttribute("url"));
		}
	}
	if(this.loadCount==0){
		this.finishedLoading();
	}
}


})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_placeable.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){


GLGE.ZUP=[0,0,1];
GLGE.YUP=[0,1,0];
GLGE.XUP=[1,0,0];


/**
* @class Abstract class to agument objects that requires position, rotation and scale.
*/
GLGE.Placeable=function(){
}
GLGE.Placeable.prototype.locX=0;
GLGE.Placeable.prototype.locY=0;
GLGE.Placeable.prototype.locZ=0;
GLGE.Placeable.prototype.dLocX=0;
GLGE.Placeable.prototype.dLocY=0;
GLGE.Placeable.prototype.dLocZ=0;
GLGE.Placeable.prototype.quatX=0;
GLGE.Placeable.prototype.quatY=0;
GLGE.Placeable.prototype.quatZ=0;
GLGE.Placeable.prototype.quatW=0;
GLGE.Placeable.prototype.rotX=0;
GLGE.Placeable.prototype.rotY=0;
GLGE.Placeable.prototype.rotZ=0;
GLGE.Placeable.prototype.dRotX=0;
GLGE.Placeable.prototype.dRotY=0;
GLGE.Placeable.prototype.dRotZ=0;
GLGE.Placeable.prototype.scaleX=1;
GLGE.Placeable.prototype.scaleY=1;
GLGE.Placeable.prototype.scaleZ=1;
GLGE.Placeable.prototype.dScaleX=0;
GLGE.Placeable.prototype.dScaleY=0;
GLGE.Placeable.prototype.dScaleZ=0;
GLGE.Placeable.prototype.matrix=null;
GLGE.Placeable.prototype.rotOrder=GLGE.ROT_XYZ;
GLGE.Placeable.prototype.lookAt=null;
GLGE.Placeable.prototype.mode=GLGE.P_EULER;
GLGE.Placeable.prototype.upAxis=GLGE.ZUP;

/**
* @name GLGE.Placeable#appened
* @event fires when all the object is appened as a child to another
* @param {object} event
*/
	
/**
* @name GLGE.Placeable#removed
* @event fires when all the object is removed as a child to another
* @param {object} event
*/

/**
* @name GLGE.Placeable#matrixUpdate
* @event fires when this object has its transform changed supplies the target object as event.obj
* @param {object} event
*/


/**
* @name GLGE.Placeable#childMatrixUpdate
* @event fires when any child objects have there transform changed supplies the target object as event.obj
* @param {object} event
*/

/**
* Gets the root node object
* @returns {object}
*/
GLGE.Placeable.prototype.getRoot=function(){
	if(this.type==GLGE.G_ROOT){
		return this;
	}else if(this.parent){
		var value=this.parent.getRoot();
		if(!value) return this;
			else return value;
	}else{
		return this;
	}
}
/**
* Gets the id string of this text
* @returns {string}
*/
GLGE.Placeable.prototype.getRef=function(){
	if(this.id){
		return this.id;
	}else if(this.parent){
		return this.parent.getRef();
	}else{
		return null;
	}
}
/**
* Sets the id string
* @param {string} id The id string 
*/
GLGE.Placeable.prototype.setId=function(id){
    this.id=id;
    return this;
}
/**
* Gets the id string of this text
* @returns {string}
*/
GLGE.Placeable.prototype.getId=function(){
	return this.id
}
/**
* gets the object or poisition being looking at
* @param {array|object} value the location/object
*/
GLGE.Placeable.prototype.getLookat=function(){
	return this.lookAt;
}
/**
* sets the look at for this object, will be updated every frame
* @param {array|object} value the location/objec to look at
*/
GLGE.Placeable.prototype.setLookat=function(value){
	this.lookAt=value;
	return this;
}

/**
* gets the up axis of the object
*/
GLGE.Placeable.prototype.getUpAxis=function(){
	return this.upAxis;
}
/**
* sets the upAxis for this object
* @param {array} value the up axis for the object
*/
GLGE.Placeable.prototype.setUpAxis=function(value){
	this.upAxis=value;
	return this;
}

/**
* Points the object in the direction of the coords or placeable value
* @param {array|object} value the location/objec to look at
*/
GLGE.Placeable.prototype.Lookat=function(value){
	var objpos;
	var pos=this.getPosition();
	if(value.getPosition){
		objpos=value.getPosition();
	}else{
		objpos={x:value[0],y:value[1],z:value[2]};
	}
	var coord=[pos.x-objpos.x,pos.y-objpos.y,pos.z-objpos.z];
	var zvec=GLGE.toUnitVec3(coord);
	var xvec=GLGE.toUnitVec3(GLGE.crossVec3(this.upAxis,zvec));
	
	if(xvec[0]==0 && xvec[1]==0 && xvec[2]==0) xvec[1]=1;
	
	var yvec=GLGE.toUnitVec3(GLGE.crossVec3(zvec,xvec));		
	this.setRotMatrix(GLGE.Mat4([xvec[0], yvec[0], zvec[0], 0,
					xvec[1], yvec[1], zvec[1], 0,
					xvec[2], yvec[2], zvec[2], 0,
					0, 0, 0, 1]));
}
/**
* Sets the transform mode
* @param {mode} value the transform mode
*/
GLGE.Placeable.prototype.setTransformMode=function(value){
	this.mode=value;
	this.matrix=null;
	return this;
}
/**
* Gets the euler rotation order
* @returns {number} the objects rotation matrix
*/
GLGE.Placeable.prototype.getRotOrder=function(){
	return this.rotOrder;
}
/**
* Sets the euler rotation order
* @param {number} value the order to rotate GLGE.ROT_XYZ,GLGE.ROT_XZY,etc..
*/
GLGE.Placeable.prototype.setRotOrder=function(value){
	this.rotOrder=value;
	this.matrix=null;
	this.rotmatrix=null;
	return this;
}
/**
* Gets the rotaion matrix 
* @returns {matrix} the objects rotation matrix
*/
GLGE.Placeable.prototype.getRotMatrix=function(){
	if(!this.rotmatrix){
		var rotation=this.getRotation();
		if(this.mode==GLGE.P_EULER) this.rotmatrix=GLGE.rotateMatrix(rotation.x,rotation.y,rotation.z,this.rotOrder);
		if(this.mode==GLGE.P_QUAT)	this.rotmatrix=GLGE.quatRotation(rotation.x,rotation.y,rotation.z,rotation.w);
	}
	return this.rotmatrix;
}
/**
* Sets the rotation matrix 
* @param {matrix} the objects rotation matrix
*/
GLGE.Placeable.prototype.setRotMatrix=function(matrix){
	this.mode=GLGE.P_MATRIX;
	this.rotmatrix=matrix;
	this.updateMatrix();
	return this;
}
/**
* Sets the x location of the object
* @param {number} value The value to assign to the x position
*/
GLGE.Placeable.prototype.setLocX=function(value){this.locX=value; this.translateMatrix=null;this.staticMatrix=null;this.updateMatrix();return this;}
/**
* Sets the y location of the object
* @param {number} value The value to assign to the y position
*/
GLGE.Placeable.prototype.setLocY=function(value){this.locY=value; this.translateMatrix=null;this.staticMatrix=null;this.updateMatrix();return this;}
/**
* Sets the z location of the object
* @param {number} value The value to assign to the z position
*/
GLGE.Placeable.prototype.setLocZ=function(value){this.locZ=value; this.translateMatrix=null;this.staticMatrix=null;this.updateMatrix();return this;}
/**
* Sets the location of the object
* @param {number} x The value to assign to the x position
* @param {number} y The value to assign to the y position
* @param {number} z The value to assign to the z position
*/
GLGE.Placeable.prototype.setLoc=function(x,y,z){this.locX=x;this.locY=y;this.locZ=z; this.translateMatrix=null;this.staticMatrix=null;this.updateMatrix();return this;}
/**
* Sets the x location displacement of the object, usefull for animation
* @param {number} value The value to assign to the x displacement
*/
GLGE.Placeable.prototype.setDLocX=function(value){this.dLocX=value;this.translateMatrix=null;this.staticMatrix=null;this.updateMatrix();return this;}
/**
* Sets the y location displacement of the object, usefull for animation
* @param {number} value The value to assign to the y displacement
*/
GLGE.Placeable.prototype.setDLocY=function(value){this.dLocY=value; this.translateMatrix=null;this.staticMatrix=null;this.updateMatrix();return this;}
/**
* Sets the z location displacement of the object, usefull for animation
* @param {number} value The value to assign to the z displacement
*/
GLGE.Placeable.prototype.setDLocZ=function(value){this.dLocZ=value;this.translateMatrix=null;this.staticMatrix=null;this.updateMatrix();return this;}
/**
* Sets the location displacement of the object, useful for animation
* @param {number} x The value to assign to the x position
* @param {number} y The value to assign to the y position
* @param {number} z The value to assign to the z position
*/
GLGE.Placeable.prototype.setDLoc=function(x,y,z){this.dLocX=x;this.dLocY=y;this.dLocZ=z; this.translateMatrix=null;this.staticMatrix=null;this.updateMatrix();return this;}
/**
* Sets the x quat value
* @param {number} value the x quat value
*/
GLGE.Placeable.prototype.setQuatX=function(value){this.mode=GLGE.P_QUAT;this.quatX=parseFloat(value);this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the y quat value
* @param {number} value the y quat value
*/
GLGE.Placeable.prototype.setQuatY=function(value){this.mode=GLGE.P_QUAT;this.quatY=parseFloat(value);this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the z quat value
* @param {number} value the z quat value
*/
GLGE.Placeable.prototype.setQuatZ=function(value){this.mode=GLGE.P_QUAT;this.quatZ=parseFloat(value);this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the w quat value
* @param {number} value the w quat value
*/
GLGE.Placeable.prototype.setQuatW=function(value){this.mode=GLGE.P_QUAT;this.quatW=parseFloat(value);this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the quaternions
* @param {number} x The value to assign to the x 
* @param {number} y The value to assign to the y 
* @param {number} z The value to assign to the z 
* @param {number} w The value to assign to the w
*/
GLGE.Placeable.prototype.setQuat=function(x,y,z,w){this.mode=GLGE.P_QUAT;this.quatX=x;this.quatY=y;this.quatZ=z;this.quatW=w;this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}

/**
* Sets the x rotation of the object
* @param {number} value The value to assign to the x rotation
*/
GLGE.Placeable.prototype.setRotX=function(value){this.mode=GLGE.P_EULER;this.rotX=value;this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the y rotation of the object
* @param {number} value The value to assign to the y rotation
*/
GLGE.Placeable.prototype.setRotY=function(value){this.mode=GLGE.P_EULER;this.rotY=value;this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the z rotation of the object
* @param {number} value The value to assign to the z rotation
*/
GLGE.Placeable.prototype.setRotZ=function(value){this.mode=GLGE.P_EULER;this.rotZ=value;this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the rotation of the object
* @param {number} x The value to assign to the x rotation
* @param {number} y The value to assign to the y rotation
* @param {number} z The value to assign to the z rotation
*/
GLGE.Placeable.prototype.setRot=function(x,y,z){this.mode=GLGE.P_EULER;this.rotX=x;this.rotY=y;this.rotZ=z;this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the x rotation displacement of the object, usefull for animation
* @param {number} value The value to assign to the x displacement
*/
GLGE.Placeable.prototype.setDRotX=function(value){this.mode=GLGE.P_EULER;this.dRotX=value;this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the y rotation displacement of the object, usefull for animation
* @param {number} value The value to assign to the y displacement
*/
GLGE.Placeable.prototype.setDRotY=function(value){this.mode=GLGE.P_EULER;this.dRotY=value;this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the z rotation displacement of the object, usefull for animation
* @param {number} value The value to assign to the z displacement
*/
GLGE.Placeable.prototype.setDRotZ=function(value){this.mode=GLGE.P_EULER;this.dRotZ=value;this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the rotation displacement of the object, useful for animation
* @param {number} x The value to assign to the x rotation
* @param {number} y The value to assign to the y rotation
* @param {number} z The value to assign to the z rotation
*/
GLGE.Placeable.prototype.setDRot=function(x,y,z){this.mode=GLGE.P_EULER;this.dRotX=x;this.dRotY=y;this.dRotZ=z;this.staticMatrix=null;this.rotmatrix=null;this.updateMatrix();return this;}
/**
* Sets the x scale of the object
* @param {number} value The value to assign to the x scale
*/
GLGE.Placeable.prototype.setScaleX=function(value){if(this.ScaleX==value) return this;this.scaleX=value;this.staticMatrix=null;this.scaleMatrix=null;this.updateMatrix();return this;}
/**
* Sets the y scale of the object
* @param {number} value The value to assign to the y scale
*/
GLGE.Placeable.prototype.setScaleY=function(value){if(this.ScaleY==value) return this;this.scaleY=value;this.staticMatrix=null;this.scaleMatrix=null;this.updateMatrix();return this;}
/**
* Sets the z scale of the object
* @param {number} value The value to assign to the z scale
*/
GLGE.Placeable.prototype.setScaleZ=function(value){if(this.ScaleZ==value) return this;this.scaleZ=value;this.staticMatrix=null;this.scaleMatrix=null;this.updateMatrix();return this;}
/**
* Sets the scale of the object
* @param {number} x The value to assign to the x scale
* @param {number} y The value to assign to the y scale
* @param {number} z The value to assign to the z scale
*/
GLGE.Placeable.prototype.setScale=function(x,y,z){if(!y){y=x;z=x}; this.scaleX=x;this.scaleY=y;this.scaleZ=z;this.staticMatrix=null;this.scaleMatrix=null;this.updateMatrix();return this;}
/**
* Sets the x scale displacement of the object, usefull for animation
* @param {number} value The value to assign to the x displacement
*/
GLGE.Placeable.prototype.setDScaleX=function(value){if(this.dScaleX==value) return this;this.dScaleX=value;this.staticMatrix=null;this.scaleMatrix=null;this.updateMatrix();return this;}
/**
* Sets the y scale displacement of the object, usefull for animation
* @param {number} value The value to assign to the y displacement
*/
GLGE.Placeable.prototype.setDScaleY=function(value){if(this.dScaleY==value) return this;this.dScaleY=value;this.staticMatrix=null;this.scaleMatrix=null;this.updateMatrix();return this;}
/**
* Sets the z scale displacement of the object, usefull for animation
* @param {number} value The value to assign to the z displacement
*/
GLGE.Placeable.prototype.setDScaleZ=function(value){if(this.dScaleZ==value) return this;this.dScaleZ=value;this.staticMatrix=null;this.scaleMatrix=null;this.updateMatrix();return this;}
/**
* Sets the scale displacement of the object, useful for animation
* @param {number} x The value to assign to the x scale
* @param {number} y The value to assign to the y scale
* @param {number} z The value to assign to the z scale
*/
GLGE.Placeable.prototype.setDScale=function(x,y,z){this.dScaleX=x;this.dScaleY=y;this.dScaleZ=z;this.staticMatrix==null;this.scaleMatrix=null;this.updateMatrix();return this;}
/**
* Gets the x location of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getLocX=function(){return parseFloat(this.locX);}
/**
* Gets the y location of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getLocY=function(){return parseFloat(this.locY);}
/**
* Gets the z location of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getLocZ=function(){return parseFloat(this.locZ);}
/**
* Gets the location of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getLoc=function(){return new GLGE.Vec3(parseFloat(this.locX), parseFloat(this.locY), parseFloat(this.locZ));}
/**
* Gets the x location displacement of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getDLocX=function(){return this.dLocX;}
/**
* Gets the y location displacement of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getDLocY=function(){return this.dLocY;}
/**
* Gets the z location displacement of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getDLocZ=function(){return this.dLocZ;}
/**
* Gets the x quat of the rotation
* @returns {number}
*/
GLGE.Placeable.prototype.getQuatX=function(){return this.quatX;}
/**
* Gets the y quat of the rotation
* @returns {number}
*/
GLGE.Placeable.prototype.getQuatY=function(){return this.quatY;}
/**
* Gets the z quat of the rotation
* @returns {number}
*/
GLGE.Placeable.prototype.getQuatZ=function(){return this.quatZ;}
/**
* Gets the w quat of the rotation
* @returns {number}
*/
GLGE.Placeable.prototype.getQuatW=function(){return this.quatW;}
/**
* Gets the x rotation of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getRotX=function(){return this.rotX;}
/**
* Gets the y rotation of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getRotY=function(){return this.rotY;}
/**
* Gets the z rotation of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getRotZ=function(){return this.rotZ;}
/**
* Gets the x rotaional displacement of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getDRotX=function(){return this.dRotX;}
/**
* Gets the y rotaional displacement of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getDRotY=function(){return this.dRotY;}
/**
* Gets the z rotaional displacement of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getDRotZ=function(){return this.dRotZ;}
/**
* Gets the x scale of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getScaleX=function(){return this.scaleX;}
/**
* Gets the y scale of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getScaleY=function(){return this.scaleY;}
/**
* Gets the z scale of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getScaleZ=function(){return this.scaleZ;}
/**
* Gets the x scale displacement of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getDScaleX=function(){return this.dScaleX;}
/**
* Gets the y scale displacement of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getDScaleY=function(){return this.dScaleY;}
/**
* Gets the z scale displacement of the object
* @returns {number}
*/
GLGE.Placeable.prototype.getDScaleZ=function(){return this.dScaleZ;}
/**
* Gets the position of the object
* @returns {array}
*/
GLGE.Placeable.prototype.getPosition=function(){
	var position={};
	position.x=parseFloat(this.locX)+parseFloat(this.dLocX);
	position.y=parseFloat(this.locY)+parseFloat(this.dLocY);
	position.z=parseFloat(this.locZ)+parseFloat(this.dLocZ);
	return position;
}
/**
* Gets the rotation of the object
* @returns {object}
*/
GLGE.Placeable.prototype.getRotation=function(){
	var rotation={};
	if(this.mode==GLGE.P_EULER){
		rotation.x=parseFloat(this.rotX)+parseFloat(this.dRotX);
		rotation.y=parseFloat(this.rotY)+parseFloat(this.dRotY);
		rotation.z=parseFloat(this.rotZ)+parseFloat(this.dRotZ);
	}
	if(this.mode==GLGE.P_QUAT){
		rotation.x=parseFloat(this.quatX);
		rotation.y=parseFloat(this.quatY);
		rotation.z=parseFloat(this.quatZ);
		rotation.w=parseFloat(this.quatW);
	}
	return rotation;
}
/**
* Gets the scale of the object
* @returns {object}
*/
GLGE.Placeable.prototype.getScale=function(){
	var scale={};
	scale.x=parseFloat(this.scaleX)+parseFloat(this.dScaleX);
	scale.y=parseFloat(this.scaleY)+parseFloat(this.dScaleY);
	scale.z=parseFloat(this.scaleZ)+parseFloat(this.dScaleZ);
	return scale;
}
/**
* Gets the scale matrix
* @returns {object}
*/
GLGE.Placeable.prototype.getScaleMatrix=function(){
	if(!this.scaleMatrix){
		this.scaleMatrix=GLGE.scaleMatrix(parseFloat(this.scaleX)+parseFloat(this.dScaleX),parseFloat(this.scaleY)+parseFloat(this.dScaleY),parseFloat(this.scaleZ)+parseFloat(this.dScaleZ));
	}
	return this.scaleMatrix;
}
/**
* Gets the translate matrix
* @returns {object}
*/
GLGE.Placeable.prototype.getTranslateMatrix=function(){
	if(!this.tmatrix) this.tmatrix=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
	if(!this.translateMatrix){
		this.tmatrix[3]=+this.locX+this.dLocX;
		this.tmatrix[7]=+this.locY+this.dLocY;
		this.tmatrix[11]=+this.locZ+this.dLocZ;
		this.translateMatrix=this.tmatrix;
	}
	return this.translateMatrix;
}

/**
* Gets the local transform matrix
* @returns {object}
*/
GLGE.Placeable.prototype.getLocalMatrix=function(){
	this.getModelMatrix();
	return this.localMatrix;
}

/**
* Sets a static transfrom matrix, overrides any rotations and translation that may be set
* @returns {object}
*/
GLGE.Placeable.prototype.setStaticMatrix=function(matrix){
	this.staticMatrix=matrix;
	this.updateMatrix();
	return this;
}

/**
* Clears the static matrix if one is set
* @returns {object}
*/
GLGE.Placeable.prototype.clearStaticMatrix=function(){
	this.staticMatrix=null;
	this.updateMatrix();
	return this;
}

/**
* Updates the model matrix
* @private
*/
GLGE.Placeable.prototype.updateMatrix=function(){
	this.matrix=null;
	if(this.children){
		for(var i=0;i<this.children.length;i++){
			this.children[i].updateMatrix();
		}
	}
	var o=obj=this;
	obj.fireEvent("matrixUpdate",{obj:o});
	if(obj=obj.parent) obj.fireEvent("childMatrixUpdate",{obj:o});
}
/**
* Gets the model matrix to transform the model within the world
*/
GLGE.Placeable.prototype.getModelMatrix=function(){
	if(!this.matrix){
		GLGE.reuseMatrix4(this.invmatrix);
		GLGE.reuseMatrix4(this.transmatrix);
		GLGE.reuseMatrix4(this.transinvmatrix);
		this.invmatrix=null;
		this.transmatrix=null;
		this.transinvmatrix=null;
		if(this.staticMatrix){
			var matrix=this.staticMatrix;
			this.localMatrix=this.staticMatrix;
			if(this.parent) matrix=GLGE.mulMat4(this.parent.getModelMatrix(),matrix);
			this.matrix=matrix;
		}else{
			var translate=this.getTranslateMatrix();
			var scale=this.getScaleMatrix();
			var M1=GLGE.mulMat4(this.getRotMatrix(),scale);
			var matrix=GLGE.mulMat4(translate,M1);
			//GLGE.reuseMatrix4(M1);
			this.localMatrix=matrix;
			if(this.parent) matrix=GLGE.mulMat4(this.parent.getModelMatrix(),matrix);
			this.matrix=matrix;
		}
	}
	return this.matrix;
}
/**
* Gets the model inverse matrix to transform the model within the world
*/
GLGE.Placeable.prototype.getInverseModelMatrix=function(){
	if(!this.matrix){
		this.getModelMatrix();
	}
	if(!this.invmatrix){
		this.invmatrix=GLGE.transposeMat4(this.matrix);
	}
	return this.invmatrix;
}
/**
* Gets the model transposed matrix to transform the model within the world
*/
GLGE.Placeable.prototype.getTransposeModelMatrix=function(){
	if(!this.matrix){
		this.getModelMatrix();
	}
	if(!this.transmatrix){
		this.transmatrix=GLGE.transposeMat4(this.matrix);
	}
	return this.transmatrix;
}
/**
* Gets the model inverse transposed matrix to transform the model within the world
*/
GLGE.Placeable.prototype.getTransposeInverseModelMatrix=function(){
	if(!this.matrix){
		this.getModelMatrix();
	}
	if(!this.transinvmatrix){
		this.invtransmatrix=GLGE.transposeMat4(this.getInverseModelMatrix());
	}
	return this.transinvmatrix;
}
/**
* Moves the object
* @returns {array} amount array [x,y,z] to move
* @returns {number} reference move with respecct to GLGE.GLOBAL or GLGE.LOCAL
*/
GLGE.Placeable.prototype.move=function(amount,reference){
	if(!reference) reference=GLGE.GLOBAL;
	switch(reference){
		case GLGE.GLOBAL:
			this.setLocX(+this.locX+amount[0]);
			this.setLocY(+this.locY+amount[1]);
			this.setLocZ(+this.locZ+amount[2]);
			break;
		case GLGE.LOCAL:
			var matrix=this.getModelMatrix();
			var xAxis=GLGE.toUnitVec3([matrix[0],matrix[1],matrix[2]]);
			var yAxis=GLGE.toUnitVec3([matrix[4],matrix[5],matrix[6]]);
			var zAxis=GLGE.toUnitVec3([matrix[8],matrix[9],matrix[10]]);
			var x=xAxis[0]*amount[0]+xAxis[1]*amount[1]+xAxis[2]*amount[2];
			var y=yAxis[0]*amount[0]+yAxis[1]*amount[1]+yAxis[2]*amount[2];
			var z=zAxis[0]*amount[0]+zAxis[1]*amount[1]+zAxis[2]*amount[2];
			this.setLocX(+this.locX+x);
			this.setLocY(+this.locY+y);
			this.setLocZ(+this.locZ+z);
			break;
	}
	return this;
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_jsonloader.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){

/**
* @class A class to load json fragments from remote location or string
**/
GLGE.JSONLoader=function(){
}
GLGE.JSONLoader.prototype.downloadPriority=0;
/**
* Loads a json fragment from a url
* @param {string} url The URL to load
**/
GLGE.JSONLoader.prototype.setJSONSrc=function(url){
	var GLGEObj=this;
	GLGE.Message.messageLoader(url,function(text){
		GLGEObj.setJSONString(text);
	},this.downloadPriority);
}
/**
* Loads a json fragment from a string
* @param {string} string The URL to load
**/
GLGE.JSONLoader.prototype.setJSONString=function(string){
	var message = JSON.parse(string);
	//check to make sure this is the correct class type
	if(message.type==this.className){
		message.uid=this.uid;
		//we don't want to create a new one we want to update this one
		message.command="update";
		GLGE.Message.parseMessage(message);
	}
}
/**
* Sets the download priority
* @param {number} value The download priority
**/
GLGE.JSONLoader.prototype.setDownloadPriority=function(value){
	this.downloadPriority=value;
}
/**
* Gets the download priority
* @returns {number} The download priority
**/
GLGE.JSONLoader.prototype.getDownloadPriority=function(){
	return this.downloadPriority;
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_group.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){

/**
* @name GLGE.Group#downloadComplete
* @event fires when all the assets for this class have finished loading
* @param {object} data
*/

/**
* @name GLGE.Group#childAdded
* @event fires when and object is added as a child
* @param {object} event
*/

/**
* @name GLGE.Group#childRemoved
* @event fires when and object is removed
* @param {object} event
*/

/**
* @constant
* @description Enumeration for node group type
*/
GLGE.G_NODE=1;
/**
* @constant
* @description Enumeration for root group type
*/
GLGE.G_ROOT=2;
/**
* @class Group class to allow object transform hierarchies
* @augments GLGE.Animatable
* @augments GLGE.Placeable
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.Group=function(uid){
	this.children=[];
    var that=this;
    this.downloadComplete=function(){
        if(that.isComplete()) that.fireEvent("downloadComplete");
    }
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.Placeable,GLGE.Group);
GLGE.augment(GLGE.Animatable,GLGE.Group);
GLGE.augment(GLGE.QuickNotation,GLGE.Group);
GLGE.augment(GLGE.JSONLoader,GLGE.Group);
GLGE.Group.prototype.children=null;
GLGE.Group.prototype.className="Group";
GLGE.Group.prototype.type=GLGE.G_NODE;
GLGE.Group.prototype.visible=true;
GLGE.Group.prototype.pickable=true;


/**
* Sets the groups visibility
* @param {boolean} visable flag to indicate the objects visibility
*/
GLGE.Group.prototype.setVisible=function(visible){
	this.visible=visible;
	return this;
}

/**
* Gets the groups visibility
* @returns  flag to indicate the objects visibility
*/
GLGE.Group.prototype.getVisible=function(){
	return this.visible;
}

/**
* Checks  if resources have finished downloading
* @returns {boolean}
*/
GLGE.Group.prototype.isComplete=function(){
    for(var i=0;i<this.children.length;i++){
        if(this.children[i].isComplete && !this.children[i].isComplete()){
            return false;
        }
    }
    return true;
}


/**
* Sets the action for this Group
* @param {GLGE.Action} action the action to apply
*/
GLGE.Group.prototype.setAction=function(action,blendTime,loop){
	action.start(blendTime,loop,this.getNames());
	return this;
}
/**
* Gets the name of the object and names of any sub objects
* @returns an object of name
*/
GLGE.Group.prototype.getNames=function(names){
	if(!names) names={};
	var thisname=this.getName();
	if(thisname!="") names[thisname]=this;
	for(var i=0;i<this.children.length;i++){
		if(this.children[i].getNames){
			this.children[i].getNames(names);
		}
	}
	return names;
}
/**
* Gets the bounding volume for this group
* @returns {GLGE.BoundingVolume}
*/
GLGE.Group.prototype.getBoundingVolume=function(local){
	this.boundingVolume=null;
	for(var i=0; i<this.children.length;i++){
		if(this.children[i].getBoundingVolume){
			if(!this.boundingVolume) {
				this.boundingVolume=this.children[i].getBoundingVolume(true).clone();
			}else{
				this.boundingVolume.addBoundingVolume(this.children[i].getBoundingVolume(true));
			}
		}
	}
	if(!this.boundingVolume) this.boundingVolume=new GLGE.BoundingVolume(0,0,0,0,0,0);
	if(local){
		this.boundingVolume.applyMatrix(this.getLocalMatrix());
	}else{
		this.boundingVolume.applyMatrix(this.getModelMatrix());
	}

	return this.boundingVolume;
}
/**
* Gets a list of all objects in this group
* @param {array} pointer to an array [optional]
* @returns {GLGE.Object[]} an array of GLGE.Objects
*/
GLGE.Group.prototype.getObjects=function(objects){
	if(this.lookAt) this.Lookat(this.lookAt);
	if(this.animation) this.animate();

	if(!objects) objects=[];
	for(var i=0; i<this.children.length;i++){
		if(this.children[i].className=="Object" || this.children[i].className=="Text" || this.children[i].toRender){
			if(this.children[i].visible || this.children[i].visible==undefined){
				if(this.children[i].renderFirst) objects.unshift(this.children[i]);
					else	objects.push(this.children[i]);
			}
		}else if(this.children[i].getObjects){
			if(this.children[i].visible || this.children[i].visible==undefined){
				this.children[i].getObjects(objects);
			}
		}
	}
	return objects;
}
/**
* Gets a list of all lights in this group
* @param {array} pointer to an array [optional]
* @returns {GLGE.Lights[]} an array of GLGE.Lights
*/
GLGE.Group.prototype.getLights=function(lights){
	if(!lights) lights=[];
	for(var i=0; i<this.children.length;i++){
		if(this.children[i].className=="Light"){
			lights.push(this.children[i]);
		}else if(this.children[i].getLights){
			this.children[i].getLights(lights);
		}
	}
	return lights;
}

/**
* Forces an update of all shaders and programs in this group
*/
GLGE.Group.prototype.updateAllPrograms=function(){
	var objects=this.getObjects();
	for(var i=0;i<objects.length;i++){
		if(objects[i].updateProgram) objects[i].updateProgram();
	}
}

/**
* Adds a new object to this group
* @param {object} object the object to add to this group
*/
GLGE.Group.prototype.addChild=function(object){
	if(object.parent) object.parent.removeChild(object);
	if(this.noCastShadows!=null && object.noCastShadows==null && object.setCastShadows) object.setCastShadows(!this.noCastShadows);

	GLGE.reuseMatrix4(object.matrix);
	object.matrix=null; //clear any cache
	object.parent=this;
	this.children.push(object);
	//if the child added contains lights or is a light then we'll need to update shader programs
	if((object.getLights && object.getLights().length>0) || object.className=="Light"){
		var root=object;
		while(root.parent) root=root.parent;
		root.updateAllPrograms();
	}
	if(object.addEventListener){
		object.addEventListener("shaderupdate",function(){
			var root=this;
			while(root.parent) root=root.parent;
			root.updateAllPrograms();
		});
		object.addEventListener("downloadComplete",this.downloadComplete);
	}
	this.fireEvent("childAdded",{obj:object});
	if(object.fireEvent) object.fireEvent("appened",{obj:this});
	this.fireEvent("childAdded",{obj:object});
	//fire child added event for all parents as well
	var o=this;
	while(o=o.parent) o.fireEvent("childAdded",{obj:object,target:this});
	return this;
}
GLGE.Group.prototype.addObject=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addObjectInstance=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addGroup=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addLight=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addText=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addSkeleton=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addCamera=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addWavefront=GLGE.Group.prototype.addChild;


/**
* Removes an object or sub group from this group
* @param {child} object or index the item to remove
*/
GLGE.Group.prototype.removeChild=function(child){
	var object;
	if (typeof child == 'object') {
		for(var i=0;i<this.children.length;i++){
			if(this.children[i]==child) {
				child = i;
				object = child;
				break;
			}
		}
		if (!object)
			return;
	} else {
		if (this.children.length <= child)
			return;

		object = this.children[child];
	}

	if(this.children[child].removeEventListener){
		this.children[child].removeEventListener("downloadComplete",this.downloadComplete);
	}
	this.children.splice(child, 1);
	if(this.scene && this.scene["remove"+object.className]){
		this.scene["remove"+object.className](object);
	}
	if(object.fireEvent) object.fireEvent("removed",{obj:this});
	this.fireEvent("childRemoved",{obj:object});
	//fire child removed event for all parents as well
	var o=this;
	while(o=o.parent) o.fireEvent("childRemoved",{obj:object,target:this});
}



/**
* Gets an array of all children in this group
*/
GLGE.Group.prototype.getChildren=function(){
	return this.children;
}
/**
* Initiallize all the GL stuff needed to render to screen
* @private
*/
GLGE.Group.prototype.GLInit=function(gl){
	this.gl=gl;
	for(var i=0;i<this.children.length;i++){
		if(this.children[i].GLInit){
			this.children[i].GLInit(gl);
		}
	}
}
/**
* Gets the pickable flag for the object
*/
GLGE.Group.prototype.getPickable=function(){
	return this.pickable;
}
/**
* Sets the pickable flag for the object
* @param {boolean} value the picking flag
*/
GLGE.Group.prototype.setPickable=function(pickable){
	for(var i=0;i<this.children.length;i++){
		if(this.children[i].setPickable){
			this.children[i].setPickable(pickable);
		}
	}
	this.pickable=pickable;
	return this;
}


})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_messages.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){

/**
* @namespace GLGE Messaging System
*/
GLGE.Message={};
/**
* @function parses messages and updates the scene graph
*/
GLGE.Message.parseMessage=function(msg){
	switch(msg.command){
		case "create":
			var obj=new GLGE[msg.type](msg.uid);
			this.setAttributes(obj,msg.attributes);
			if(msg.children) GLGE.Message.addChildren(obj,msg.children);
			return obj;
			break;
		case "update":
			var obj=GLGE.Assets.get(msg.uid);
			this.setAttributes(obj,msg.attributes);
			if(msg.add) GLGE.Message.addChildren(obj,msg.add);
			if(msg.remove) GLGE.Message.removeChildren(obj,msg.remove);
			return obj;
			break;
	}
	return null;
}
/**
* @function parses the attributes from a message
* @private
*/
GLGE.Message.setAttributes=function(obj,attribs){
	if(attribs){
		for(var attrib in attribs){
			if(obj["set"+attrib]){
				//check to see if the attribute has to be parsed as a message
				if(attribs[attrib].command){
					attribs[attrib]=GLGE.Message.parseMessage(attribs[attrib]);
				}
				obj["set"+attrib](attribs[attrib]);
			}
		}
	}
	return this;
}
/**
* @function parses the children to add
* @private
*/
GLGE.Message.addChildren=function(obj,children){
	if(!(children instanceof Array)) children=[children];
	for(var i=0;i<children.length;i++){
		if(children[i].command){
			var asset=GLGE.Message.parseMessage(children[i]);
		}else{
			var asset=GLGE.Assets.get(children[i]);
		}
		obj["add"+asset.className](asset);
	}
}
/**
* @function parses the children to remove
* @private
*/
GLGE.Message.removeChildren=function(obj,children){
	if(!(children instanceof Array)) children=[children];
	for(var i=0;i<children.length;i++){
		var asset=GLGE.Assets.get(children[i]);
		obj["add"+asset.className](asset);
	}
}

GLGE.Message.toLoad=[];
GLGE.Message.messageLoader=function(url,callback,priority){
	GLGE.Message.toLoad.push([url,callback,priority]);
	if(GLGE.Message.toLoad.length==1) GLGE.Message.loadMessages();
}
GLGE.Message.loadMessages=function(){
	//TODO: use priority
	var nextDoc=GLGE.Message.toLoad.pop();
	var req=new XMLHttpRequest();
	req.onreadystatechange = function() {
		if(this.readyState  == 4){
			if(this.status  == 200 || this.status==0){
				nextDoc[1](this.responseText);
			}else{ 
				GLGE.error("Error loading Document: "+nextDoc[0]+" status "+this.status);
			}
		}
	}
	req.open("GET", nextDoc[0], true);
	req.send("");
	if(GLGE.Message.toLoad.length>0) GLGE.Message.loadMessages();
}


})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_action.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){



/**
* @class Class to describe and action on a skeleton
* @param {string} uid a unique reference string for this object
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.Action=function(uid){
	this.channels=[];
	GLGE.Assets.registerAsset(this,uid);
};
GLGE.augment(GLGE.QuickNotation,GLGE.Action);
GLGE.augment(GLGE.JSONLoader,GLGE.Action);
/**
 * @name Action#animFinished
 * @event
 * @param {object} data
 */
GLGE.augment(GLGE.Events,GLGE.Action);

/**
* Starts playing the action
*/
GLGE.Action.prototype.start=function(blendTime,loop,names){
	if(!loop) loop=false;
	if(!blendTime) blendTime=0;
	var channels=this.channels;
	var start=(new Date()).getTime();
	this.animFinished=false;
	
	for(var i=0;i<channels.length;i++){
		var animation=channels[i].getAnimation();
		var action=this;
		var channel=channels[i];
		var target=channel.getTarget();
		if(typeof target=="string"){
			if(names && names[target]){
				target=names[target];
			}
		}
		var closure={};
		closure.finishEvent=function(data){
			target.removeEventListener("animFinished",closure.finishEvent);
			if(!action.animFinished && target.animation==animation){
				action.fireEvent("animFinished",{});
				action.animFinished=true;
			}
		}
		target.addEventListener("animFinished",closure.finishEvent);
		
		target.setAnimation(animation,blendTime,start);
		target.setLoop(loop);

	}
};
/**
* Sets the start frame for all animations
* @param {number} startFrame the starting frame for the animation
*/
GLGE.Action.prototype.setStartFrame=function(startFrame){
	for(var i=0;i<this.channels.length;i++){
		this.channels[i].getAnimation().setStartFrame(startFrame);
	}
	return this;
};
/**
* Sets the number of frames to play
* @param {number} frame the number of frames to play
*/
GLGE.Action.prototype.setFrames=function(frames){
	for(var i=0;i<this.channels.length;i++){
		this.channels[i].getAnimation().setFrames(frames);
	}
	return this;
};


/**
* Adds and action channel to this action
* @param {GLGE.ActionChannel} channel the channel to be added
*/
GLGE.Action.prototype.addActionChannel=function(channel){
	this.channels.push(channel);
	return this;
};
/**
* Removes and action channel to this action
* @param {GLGE.ActionChannel} channel the channel to be removed
*/
GLGE.Action.prototype.removeActionChannel=function(channel){
	for(var i=0;i<this.channels.length;i++){
		if(this.channels[i]==channels){
			this.channels.splice(i,1);
			break;
		}
	}
};


})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_actionchannel.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){


/**
* @class Class defining a channel of animation for an action
* @param {string} uid a unique reference string for this object
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.ActionChannel=function(uid){
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.QuickNotation,GLGE.ActionChannel);
GLGE.augment(GLGE.JSONLoader,GLGE.ActionChannel);
/**
* Sets the name/object of the bone channel
* @param {string} name the name of the bone channel
*/
GLGE.ActionChannel.prototype.setTarget=function(object){
	this.target=object;
};
/**
* Sets the animation for this channel
* @param {GLGE.AnimationVector} animation the animation vector for this channel
*/
GLGE.ActionChannel.prototype.setAnimation=function(animation){
	this.animation=animation;
};
/**
* Gets the name/object of the bone channel
* @returns {string} the name of the bone channel
*/
GLGE.ActionChannel.prototype.getTarget=function(){
	return this.target;
};
/**
* Gets the animation vector for this channel
* @returns {GLGE.AnimationVector} the animation vector for this channel
*/
GLGE.ActionChannel.prototype.getAnimation=function(){
	return this.animation;
};

})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_animationcurve.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){





/**
* @class A curve which interpolates between control points
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.AnimationCurve=function(uid){
	this.keyFrames=[];
	this.solutions={};
	this.caches={};
	GLGE.Assets.registerAsset(this,uid);
};
GLGE.augment(GLGE.QuickNotation,GLGE.AnimationCurve);
GLGE.augment(GLGE.JSONLoader,GLGE.AnimationCurve);
GLGE.AnimationCurve.prototype.className="AnimationCurve";
GLGE.AnimationCurve.prototype.keyFrames=null;
/**
* Adds a point to the curve
* @param {object} point The point to add
* @returns {Number} Index of the newly added point
*/
GLGE.AnimationCurve.prototype.addPoint=function(point){
	this.keyFrames.push(point);
	return this.keyFrames.length-1;
};
GLGE.AnimationCurve.prototype.addStepPoint=GLGE.AnimationCurve.prototype.addPoint;
GLGE.AnimationCurve.prototype.addLinearPoint=GLGE.AnimationCurve.prototype.addPoint;
GLGE.AnimationCurve.prototype.addBezTriple=GLGE.AnimationCurve.prototype.addPoint;
/**
* Get the value of the curve at any point
* @param {Number} frame The frame(x-coord) to return the value for
* @returns {Number} The value of the curve at the given point
*/
GLGE.AnimationCurve.prototype.coord=function(x,y){
	return {x:x,y:y}
}
/**
* Sets the animation channel this curve animates
* @param {string} channel The property to animate
*/
GLGE.AnimationCurve.prototype.setChannel=function(channel){
	this.channel=channel
}
GLGE.AnimationCurve.prototype.getValue=function(frame){
	if(this.keyFrames.length==0) return 0;
	
	if(this.caches[frame]) return this.caches[frame];
	var startKey;
	var endKey;
	var preStartKey;
	var preEndKey;
	if(frame<this.keyFrames[0].x) return this.keyFrames[0].y;
	for(var i=0; i<this.keyFrames.length;i++){
		if(this.keyFrames[i].x==frame){
			return this.keyFrames[i].y;
		}
		if(this.keyFrames[i].x<=frame && (startKey==undefined || this.keyFrames[i].x>this.keyFrames[startKey].x)){
			preStartKey=startKey;
			startKey=i;
		}else if(this.keyFrames[i].x<=frame && (preStartKey==undefined || this.keyFrames[i].x>this.keyFrames[preStartKey].x)){
			preStartKey=i;
		}
		if(this.keyFrames[i].x>frame && (endKey==undefined || this.keyFrames[i].x<=this.keyFrames[endKey].x)){
			preEndKey=endKey;
			endKey=i;
		}else if(this.keyFrames[i].x>frame && (preEndKey==undefined || this.keyFrames[i].x<=this.keyFrames[preEndKey].x)){
			preEndKey=i;
		}
	}
	if(startKey==undefined){
		startKey=endKey;
		endKey=preEndKey;
	}
	if(endKey==undefined){
		endKey=startKey;
		startKey=preStartKey;
	}
	if(this.keyFrames[startKey] instanceof GLGE.BezTriple && this.keyFrames[endKey] instanceof GLGE.BezTriple){
		var C1=this.coord(this.keyFrames[startKey].x,this.keyFrames[startKey].y);
		var C2=this.coord(this.keyFrames[startKey].x3,this.keyFrames[startKey].y3);
		var C3=this.coord(this.keyFrames[endKey].x1,this.keyFrames[endKey].y1);
		var C4=this.coord(this.keyFrames[endKey].x,this.keyFrames[endKey].y);
		return this.atX(frame,C1,C2,C3,C4).y;
	}
	if(this.keyFrames[startKey] instanceof GLGE.LinearPoint && this.keyFrames[endKey] instanceof GLGE.BezTriple){
		var C1=this.coord(this.keyFrames[startKey].x,this.keyFrames[startKey].y);
		var C2=this.coord(this.keyFrames[endKey].x1,this.keyFrames[endKey].y1);
		var C3=this.coord(this.keyFrames[endKey].x1,this.keyFrames[endKey].y1);
		var C4=this.coord(this.keyFrames[endKey].x,this.keyFrames[endKey].y);
		return this.atX(frame,C1,C2,C3,C4).y;
	}
	if(this.keyFrames[startKey] instanceof GLGE.BezTriple && this.keyFrames[endKey] instanceof GLGE.LinearPoint){
		var C1=this.coord(this.keyFrames[startKey].x,this.keyFrames[startKey].y);
		var C2=this.coord(this.keyFrames[startKey].x3,this.keyFrames[startKey].y3);
		var C3=this.coord(this.keyFrames[startKey].x3,this.keyFrames[startKey].y3);
		var C4=this.coord(this.keyFrames[endKey].x,this.keyFrames[endKey].y);
		return this.atX(frame,C1,C2,C3,C4).y;
	}
	if(this.keyFrames[startKey] instanceof GLGE.LinearPoint && this.keyFrames[endKey] instanceof GLGE.LinearPoint){
		var value=(frame-this.keyFrames[startKey].x)*(this.keyFrames[endKey].y-this.keyFrames[startKey].y)/(this.keyFrames[endKey].x-this.keyFrames[startKey].x)+this.keyFrames[startKey].y;
		return value;
	}
	if(this.keyFrames[startKey] instanceof GLGE.StepPoint){
		return this.keyFrames[startKey].y
	}
	if(!this.keyFrames.preStartKey) this.keyFrames.preStartKey=this.keyFrames[0].y;
	
	this.caches[frame]=this.keyFrames.preStartKey;
	
	return this.caches[frame];
};
/**
* Function used to calculate bezier curve
* @private
*/
GLGE.AnimationCurve.prototype.B1=function(t) { return t*t*t };
/**
* Function used to calculate bezier curve
* @private
*/
GLGE.AnimationCurve.prototype.B2=function(t) { return 3*t*t*(1-t) };
/**
* Function used to calculate bezier curve
* @private
*/
GLGE.AnimationCurve.prototype.B3=function(t) { return 3*t*(1-t)*(1-t) };
/**
* Function used to calculate bezier curve
* @private
*/
GLGE.AnimationCurve.prototype.B4=function(t) { return (1-t)*(1-t)*(1-t) };
/**
* Gets the value of a bezier curve at a given point
* @private
*/
GLGE.AnimationCurve.prototype.getBezier=function(t,C1,C2,C3,C4) {
	var pos = {};
	pos.x = C1.x*this.B1(t) + C2.x*this.B2(t) + C3.x*this.B3(t) + C4.x*this.B4(t);
	pos.y = C1.y*this.B1(t) + C2.y*this.B2(t) + C3.y*this.B3(t) + C4.y*this.B4(t);
	return pos;
};
/**
* Solves cubic equation to get the parametic value of the curve at a specified point
* @private
*/
GLGE.AnimationCurve.prototype.Quad3Solve=function(a,b,c,d){
	ref=a+"-"+b+"-"+"-"+c+"-"+d;
	if(this.solutions[ref]){
		return this.solutions[ref];
	}
	else
	{
		b /= a;c /= a;d /= a;
		var q, r, d1, s, t, t1, r13;
		q = (3.0*c - (b*b))/9.0;
		r = -(27.0*d) + b*(9.0*c - 2.0*(b*b));
		r /= 54.0;
		t1 = (b/3.0);
		discrim = q*q*q + r*r;
		result=[];
				
		if (discrim > 0) { 
		// one real, two complex
		 s = r + Math.sqrt(discrim);
		 s = ((s < 0) ? -Math.pow(-s, (1.0/3.0)) : Math.pow(s, (1.0/3.0)));
		 t = r - Math.sqrt(discrim);
		 t = ((t < 0) ? -Math.pow(-t, (1.0/3.0)) : Math.pow(t, (1.0/3.0)));
		 result[0] = -t1 + s + t;
		 t1 = t1 + (s + t)/2.0;
		 result[1] = result[2] = -t1;
		 t1 = Math.sqrt(3.0)*(-t + s)/2;
		} 
		else if (discrim == 0){ 
		// All roots real
		 r13 = ((r < 0) ? -Math.pow(-r,(1.0/3.0)) : Math.pow(r,(1.0/3.0)));
		 result[1] = -t1 + 2.0*r13;
		 result[1] = result[2]  = -(r13 + t1);
		} 
		else
		{
			q = -q;
			d1 = q*q*q;
			d1 = Math.acos(r/Math.sqrt(1));
			r13 = 2.0*Math.sqrt(q);


			result[0] = -t1 + r13*Math.cos(d1/3.0);
			result[1] = -t1 + r13*Math.cos((d1 + 2.0*Math.PI)/3.0);
			result[2] = -t1 + r13*Math.cos((d1 + 4.0*Math.PI)/3.0);
		}
		var toreturn=false;
		//determine which is the correct result
		if(result[0]>=0 && result[0]<=1) toreturn=result[0];
		if(!toreturn && result[1]>=0 && result[1]<=1) toreturn=result[1];
		if(!toreturn && result[2]>=0 && result[2]<=1) toreturn=result[2];
		//cache result for next time
		this.solutions[ref]=toreturn;
		
		return toreturn;
	}
};
/**
* Get the value of the a single bezier curve 
* @param {Number} x xcoord of point to get
* @param {Number} C1 First bezier control point
* @param {Number} C2 Second bezier control point
* @param {Number} C3 Third bezier control point
* @param {Number} C4 Forth bezier control point
* @returns {Number} The value of the curve at the given x
*/
GLGE.AnimationCurve.prototype.atX=function(x,C1,C2,C3,C4){
	a=C1.x-C2.x*3+C3.x*3-C4.x;
	b=C2.x*3-C3.x*6+C4.x*3;
	c=C3.x*3-C4.x*3;
	d=C4.x-x;
	return this.getBezier(this.Quad3Solve(a,b,c,d),C1,C2,C3,C4);
};

})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_animationvector.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){



/**
* @class The AnimationVectors class allows you to specify the 2D Animation curves that define specific channels of animation within the engine. 
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.AnimationVector=function(uid){
    this.curves={};
    GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.QuickNotation,GLGE.AnimationVector);
GLGE.augment(GLGE.JSONLoader,GLGE.AnimationVector);
GLGE.AnimationVector.prototype.curves={};
GLGE.AnimationVector.prototype.frames=250;
GLGE.AnimationVector.prototype.startFrame=0;

/**
* Adds an Animation Curve to a channel 
* @param {String} channel The name of the curve to be added
* @param {GLGE.AnimationCurve} curve The animation curve to add
*/
GLGE.AnimationVector.prototype.addAnimationCurve=function(curve){
	this.curves[curve.channel]=curve;
	return this;
}
/**
* Removes an Animation Curve form a channel
* @param {String} channel The name of the curve to be removed
*/
GLGE.AnimationVector.prototype.removeAnimationCurve=function(name){
	delete(this.curves[name]);
}
/**
* Sets the number of frames in the animation
* @param {number} value The number of frames in the animation
*/
GLGE.AnimationVector.prototype.setFrames=function(value){
	this.frames=value;
	return this;
}
/**
* Sets the number of frames in the animation
* @returns {number} The number of frames in the animation
*/
GLGE.AnimationVector.prototype.getFrames=function(){
	return this.frames;
}

/**
* Sets the start frame
* @param {number} value The starting frame for the animation
*/
GLGE.AnimationVector.prototype.setStartFrame=function(value){
	this.startFrame=value;
	return this;
}
/**
* Gets the start fames
* @returns {number} The starting frame for the animation
*/
GLGE.AnimationVector.prototype.getStartFrame=function(){
	return this.startFrame;
}

})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_animationpoints.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){





/**
* @class A bezier class to add points to the Animation Curve 
* @param {string} uid a unique string to identify this object
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.BezTriple=function(uid){
	GLGE.Assets.registerAsset(this,uid);
};
GLGE.augment(GLGE.QuickNotation,GLGE.BezTriple);
GLGE.augment(GLGE.JSONLoader,GLGE.BezTriple);

GLGE.BezTriple.prototype.className="BezTriple";
/**
* set the x1-coord
* @param {number} x x1-coord control point
*/
GLGE.BezTriple.prototype.setX1=function(x){
	this.x1=parseFloat(x);
	return this;
};
/**
* set the y1-coord
* @param {number} y y1-coord control point
*/
GLGE.BezTriple.prototype.setY1=function(y){
	this.y1=parseFloat(y);
	return this;
};
/**
* set the x2-coord
* @param {number} x x2-coord control point
*/
GLGE.BezTriple.prototype.setX2=function(x){
	this.x=parseFloat(x);
	return this;
};
/**
* set the y2-coord
* @param {number} y y2-coord control point
*/
GLGE.BezTriple.prototype.setY2=function(y){
	this.y=parseFloat(y);
	return this;
};
/**
* set the x3-coord
* @param {number} x x3-coord control point
*/
GLGE.BezTriple.prototype.setX3=function(x){
	this.x3=parseFloat(x);
	return this;
};
/**
* set the y3-coord
* @param {number} y y3-coord control point
*/
GLGE.BezTriple.prototype.setY3=function(y){
	this.y3=parseFloat(y);
	return this;
};


/**
* @class A LinearPoint class to add points to the Animation Curve 
* @param {string} uid unique string for this class
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.LinearPoint=function(uid){
	//GLGE.Assets.registerAsset(this,uid);
};
GLGE.augment(GLGE.QuickNotation,GLGE.LinearPoint);
GLGE.augment(GLGE.JSONLoader,GLGE.LinearPoint);
GLGE.LinearPoint.prototype.className="LinearPoint";
GLGE.LinearPoint.prototype.x=0;
GLGE.LinearPoint.prototype.y=0;
/**
* set the x-coord
* @param {number} x x-coord control point
*/
GLGE.LinearPoint.prototype.setX=function(x){
	this.x=parseFloat(x);
	return this;
};
/**
* set the y-coord
* @param {number} y y-coord control point
*/
GLGE.LinearPoint.prototype.setY=function(y){
	this.y=parseFloat(y);
	return this;
};


/**
* @class A StepPoint class to add points to the Animation Curve 
* @param {number} x x-coord control point
* @param {object} value value of control point
*/
GLGE.StepPoint=function(x,value){
	this.x=parseFloat(x);
	this.y=value;
};

})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_mesh.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){





/**
* @class Creates a new mesh
* @see GLGE.Object
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
* @augments GLGE.Events
*/
GLGE.Mesh=function(uid,windingOrder){
	this.GLbuffers=[];
	this.buffers=[];
	this.framePositions=[];
	this.frameNormals=[];
	this.frameTangents=[];
	this.UV=[];
	this.boneWeights=[];
	this.setBuffers=[];
	this.faces={};
    if (windingOrder!==undefined)
        this.windingOrder=windingOrder;
    else
        this.windingOrder=GLGE.Mesh.WINDING_ORDER_UNKNOWN;

	GLGE.Assets.registerAsset(this,uid);
};

GLGE.Mesh.WINDING_ORDER_UNKNOWN=2;
GLGE.Mesh.WINDING_ORDER_CLOCKWISE=1;
GLGE.Mesh.WINDING_ORDER_COUNTER=0;

GLGE.augment(GLGE.QuickNotation,GLGE.Mesh);
GLGE.augment(GLGE.JSONLoader,GLGE.Mesh);
GLGE.augment(GLGE.Events,GLGE.Mesh);
GLGE.Mesh.prototype.gl=null;
GLGE.Mesh.prototype.className="Mesh";
GLGE.Mesh.prototype.GLbuffers=null;
GLGE.Mesh.prototype.buffers=null;
GLGE.Mesh.prototype.setBuffers=null;
GLGE.Mesh.prototype.GLfaces=null;
GLGE.Mesh.prototype.faces=null;
GLGE.Mesh.prototype.UV=null;
GLGE.Mesh.prototype.joints=null;
GLGE.Mesh.prototype.invBind=null;
GLGE.Mesh.prototype.loaded=false;
/**
 * @name GLGE.Mesh#shaderupdate
 * @event fired when the shader needs updating
 * @param {object} data
 */

/**
* Gets the bounding volume for the mesh
* @returns {GLGE.BoundingVolume} 
*/
GLGE.Mesh.prototype.getBoundingVolume=function(){
	if(!this.positions) return new GLGE.BoundingVolume(0,0,0,0,0,0);
	if(!this.boundingVolume){
		var minX,maxX,minY,maxY,minZ,maxZ;
		var positions=this.positions;
		for(var i=0;i<positions.length;i=i+3){
			if(i==0){
				minX=maxX=positions[i];
				minY=maxY=positions[i+1];
				minZ=maxZ=positions[i+2];
			}else{
				minX=Math.min(minX,positions[i]);
				maxX=Math.max(maxX,positions[i]);
				minY=Math.min(minY,positions[i+1]);
				maxY=Math.max(maxY,positions[i+1]);
				minZ=Math.min(minZ,positions[i+2]);
				maxZ=Math.max(maxZ,positions[i+2]);
			}
		}
		this.boundingVolume=new GLGE.BoundingVolume(minX,maxX,minY,maxY,minZ,maxZ);
	}
	return this.boundingVolume;
}
/**
* Sets the joints
* @param {string[]} jsArray set joint objects
*/
GLGE.Mesh.prototype.setJoints=function(jsArray){
	this.joints=jsArray;
	this.fireEvent("shaderupdate",{});
	return this;
}
/**
* Sets the inverse bind matrix for each joint
* @param {GLGE.Matrix[]} jsArray set joint names
*/
GLGE.Mesh.prototype.setInvBindMatrix=function(jsArray){
	this.invBind=jsArray;
	this.fireEvent("shaderupdate",{});
	return this;
}
/**
* Sets the joint channels for each vertex 
* @param {Number[]} jsArray The 1 dimentional array of bones
* @param {Number} num the number of chanels in this mesh
*/
GLGE.Mesh.prototype.setVertexJoints=function(jsArray,num){
	if(!num){
		num=jsArray.length*3/this.positions.length;
	}
	if(num<5){
		this.setBuffer("joints1",jsArray,num);
	}else{
		var jsArray1=[];
		var jsArray2=[];
		for(var i=0;i<jsArray.length;i++){
			if(i%num<4){
				jsArray1.push(jsArray[i]);
			}else{
				jsArray2.push(jsArray[i]);
			}
		}
		this.setBuffer("joints1",jsArray1,4);
		this.setBuffer("joints2",jsArray2,num-4);
	}
	this.fireEvent("shaderupdate",{});
	return this;
}
/**
* Sets the joint weights on each vertex
* @param {Number[]} jsArray The 1 dimentional array of weights
* @param {Number} num the number of chanels in this mesh
*/
GLGE.Mesh.prototype.setVertexWeights=function(jsArray,num){
	if(!num){
		num=jsArray.length*3/this.positions.length;
	}
	//normalize the weights!
	for(var i=0;i<jsArray.length;i=i+parseInt(num)){
		var total=0;
		for(var n=0;n<num;n++){
			total+=parseFloat(jsArray[i+n]);
		}
		if(total==0) total=1;
		for(var n=0;n<num;n++){
			jsArray[i+n]=jsArray[i+n]/total;
		}
	}


	if(num<4){
		this.setBuffer("weights1",jsArray,num);
	}else{
		var jsArray1=[];
		var jsArray2=[];
		for(var i=0;i<jsArray.length;i++){
			if(i%num<4){
				jsArray1.push(jsArray[i]);
			}else{
				jsArray2.push(jsArray[i]);
			}
		}
		this.setBuffer("weights1",jsArray1,4);
		this.setBuffer("weights2",jsArray2,num-4);
	}
	this.fireEvent("shaderupdate",{});
	return this;
}
/**
* clears any buffers currently set
* @param {Number[]} jsArray the UV coords in a 1 dimentional array
*/
GLGE.Mesh.prototype.clearBuffers=function(){
	//if(this.GLfaces) this.gl.deleteBuffer(this.GLfaces);
	this.GLFaces=null;
	delete(this.GLFaces);
	for(var i in this.buffers){
		//if(this.buffers[i].GL) this.gl.deleteBuffer(this.buffers[i].GL);
		this.buffers[i]=null;
		delete(this.buffers[i]);
	}
	this.buffers=[];
	this.loaded=false;
}
/**
* Set the UV coord for the first UV layer
* @param {Number[]} jsArray the UV coords in a 1 dimentional array
*/
GLGE.Mesh.prototype.setUV=function(jsArray){
	this.uv1set=jsArray;
	var idx=0;
	for(var i=0; i<jsArray.length;i=i+2){
		this.UV[idx]=jsArray[i];
		this.UV[idx+1]=jsArray[i+1];
		if(!this.UV[idx+2]) this.UV[idx+2]=jsArray[i];//<-- hack in case the collada file only specified UV1 but accesses UV2 and expects the UV1 coordinates to be properly reflected there
		if(!this.UV[idx+3]) this.UV[idx+3]=jsArray[i+1];
		idx=idx+4;
	}
	this.setBuffer("UV",this.UV,4);
	return this;
}
/**
* Set the UV coord for the second UV layer
* @param {Number[]} jsArray the UV coords in a 1 dimentional array
*/
GLGE.Mesh.prototype.setUV2=function(jsArray){
	this.uv2set=jsArray;
	var idx=0;
	for(var i=0; i<jsArray.length;i=i+2){
		if(!this.UV[idx]) this.UV[idx]=jsArray[i];
		if(!this.UV[idx+1]) this.UV[idx+1]=jsArray[i+1];
		this.UV[idx+2]=jsArray[i];
		this.UV[idx+3]=jsArray[i+1];
		idx=idx+4;
	}
	this.setBuffer("UV",this.UV,4);
	return this;
}
/**
* Sets the positions of the verticies
* @param {Number[]} jsArray The 1 dimentional array of positions
* @param {number} frame optional mesh frame number
*/
GLGE.Mesh.prototype.setPositions=function(jsArray,frame){
	if(!frame) frame=0;
	this.loaded=true;
	if(frame==0) this.positions=jsArray;
	this.framePositions[frame]=jsArray;
	this.setBuffer("position"+frame,jsArray,3,true);
	this.boundingVolume=null;
	this.fireEvent("updatebound");
	return this;
}
/**
* Sets the colors of the verticies
* @param {Number[]} jsArray The vertex colors
*/
GLGE.Mesh.prototype.setVertexColors=function(jsArray){
	this.colors=jsArray;
	this.setBuffer("color",jsArray,4);
	return this;
}
/**
* Sets the normals of the verticies
* @param {Number[]} jsArray The 1 dimentional array of normals
* @param {number} frame optional mesh frame number
*/
GLGE.Mesh.prototype.setNormals=function(jsArray,frame){
	if(!frame) frame=0;
	if(frame==0) this.normals=jsArray;
	this.frameNormals[frame]=jsArray;
	this.setBuffer("normal"+frame,jsArray,3,true);
	return this;
}
/**
* Sets the tangents of the verticies
* @param {Number[]} jsArray The 1 dimentional array of tangents
* @param {number} frame optional mesh frame number
*/
GLGE.Mesh.prototype.setTangents=function(jsArray,frame){
	if(!frame) frame=0;
	if(frame==0) this.tangents=jsArray;
	this.frameTangents[frame]=jsArray;
	this.setBuffer("tangent"+frame,jsArray,3,true);
	return this;
}


/**
* Sets a buffer for the
* @param {String} boneName The name of the bone
* @param {Number[]} jsArray The 1 dimentional array of weights
* @private
*/
GLGE.Mesh.prototype.setBuffer=function(bufferName,jsArray,size,exclude){
	//make sure all jsarray items are floats
	if(typeof jsArray[0] !="number") for(var i=0;i<jsArray.length;i++) jsArray[i]=parseFloat(jsArray[i]);
	
	var buffer;
	for(var i=0;i<this.buffers.length;i++){
		if(this.buffers[i].name==bufferName) buffer=i;
	}
	if(!buffer){
		this.buffers.push({name:bufferName,data:jsArray,size:size,GL:false,exclude:exclude});
	}
        else 
	{
		this.buffers[buffer]={name:bufferName,data:jsArray,size:size,GL:false,exclude:exclude};
	}
	return this;
}

/**
* gets a vert tangent
* @private
*/
GLGE.Mesh.prototype.tangentFromUV=function(p1,p2,p3,uv1,uv2,uv3,n){
	var toUnitVec3=GLGE.toUnitVec3;
	var subVec3=GLGE.subVec3;
	var scaleVec3=GLGE.scaleVec3;
	var dotVec3=GLGE.dotVec3;
	var crossVec3=GLGE.crossVec3;
	
	uv21=[uv2[0]-uv1[0],uv2[1]-uv1[1]];
	uv31=[uv3[0]-uv1[0],uv3[1]-uv1[1]];
	
	p21=GLGE.subVec3(p2,p1);
	p31=GLGE.subVec3(p3,p1);
	var s=(uv21[0]*uv31[1]-uv31[0]*uv21[1]);

	if(s!=0){
		s=1/s;
		var t=subVec3(scaleVec3(p21,uv31[1]*s),scaleVec3(p31,uv21[1]*s));
		var b=subVec3(scaleVec3(p31,uv21[0]*s),scaleVec3(p21,uv31[0]*s));
	}else{
		t=[0,0,0];
		b=[0,0,0];
	}
	if(GLGE.dotVec3(GLGE.crossVec3(p21,p31),n)>0){
		t=scaleVec3(t,-1);
		b=scaleVec3(b,-1);
	}
	return [t,b];
}

/**
* Sets the faces for this mesh
* @param {Number[]} jsArray The 1 dimentional array of normals
*/
GLGE.Mesh.prototype.setFaces=function(jsArray){
	this.faces={data:jsArray,GL:false};	
	//if at this point calculate normals if we haven't got them yet
	if(!this.normals) this.calcNormals();
	if(!this.tangents && this.UV.length>0) this.calcTangents();
	
	return this;
}


/**
* Calculates the tangents for this mesh - this is messy FIX ME!
* @private
*/
GLGE.Mesh.prototype.calcTangents=function(){
	
	for(var j=0;j<this.framePositions.length;j++){
		var position=this.framePositions[j];
		var normal=this.frameNormals[j];
		var uv=this.UV;
		var tangentArray=[];
		var data={};
		var ref;
		for(var i=0;i<position.length;i++){
			tangentArray[i]=0;
		}
		for(var i=0;i<this.faces.data.length;i=i+3){
			var f1=parseInt(this.faces.data[i]);
			var f2=parseInt(this.faces.data[i+1]);
			var f3=parseInt(this.faces.data[i+2]);
		
			var p1=[position[f1*3],position[f1*3+1],position[f1*3+2]];
			var p2=[position[f2*3],position[f2*3+1],position[f2*3+2]];
			var p3=[position[f3*3],position[f3*3+1],position[f3*3+2]];
			
			var n1=[normal[f1*3],normal[f1*3+1],normal[f1*3+2]];
			var n2=[normal[f2*3],normal[f2*3+1],normal[f2*3+2]];
			var n3=[normal[f3*3],normal[f3*3+1],normal[f3*3+2]];
			
			var uv1=[uv[f1*4],uv[f1*4+1]];
			var uv2=[uv[f2*4],uv[f2*4+1]];
			var uv3=[uv[f3*4],uv[f3*4+1]];
			
			var tb=this.tangentFromUV(p2,p1,p3,uv2,uv1,uv3,n2);
			
			var d=[p1[0],p1[1],p1[2],uv1[0],uv1[1],n1[0],n1[1],n1[2]].join(",");
			if(!data[d]){
				data[d]=tb;
			}else{
				data[d][0][0]+=tb[0][0];
				data[d][0][1]+=tb[0][1];
				data[d][0][2]+=tb[0][2];
				data[d][1][0]+=tb[1][0];
				data[d][1][1]+=tb[1][1];
				data[d][1][2]+=tb[1][2];
			}
			
			d=[p2[0],p2[1],p2[2],uv2[0],uv2[1],n2[0],n2[1],n2[2]].join(",");
			if(!data[d]){
				data[d]=tb;
			}else{
				data[d][0][0]+=tb[0][0];
				data[d][0][1]+=tb[0][1];
				data[d][0][2]+=tb[0][2];
				data[d][1][0]+=tb[1][0];
				data[d][1][1]+=tb[1][1];
				data[d][1][2]+=tb[1][2];
			}
			
			d=[p3[0],p3[1],p3[2],uv3[0],uv3[1],n3[0],n3[1],n3[2]].join(",");
			if(!data[d]){
				data[d]=tb;
			}else{
				data[d][0][0]+=tb[0][0];
				data[d][0][1]+=tb[0][1];
				data[d][0][2]+=tb[0][2];
				data[d][1][0]+=tb[1][0];
				data[d][1][1]+=tb[1][1];
				data[d][1][2]+=tb[1][2];
			}

		}		
		for(var i=0;i<position.length/3;i++){
			var p1=[position[i*3],position[i*3+1],position[i*3+2]];
			var n1=[normal[i*3],normal[i*3+1],normal[i*3+2]];
			var uv1=[uv[i*4],uv[i*4+1]];
			try{
			var t=GLGE.toUnitVec3(data[[p1[0],p1[1],p1[2],uv1[0],uv1[1],n1[0],n1[1],n1[2]].join(",")][0]);
			var b=GLGE.toUnitVec3(data[[p1[0],p1[1],p1[2],uv1[0],uv1[1],n1[0],n1[1],n1[2]].join(",")][1]);
			}catch(e){
				//if we fail probably a exporter bug carry on anyway
			}
			if(t){
				tangentArray[i*3]=t[0];
				tangentArray[i*3+1]=t[1];
				tangentArray[i*3+2]=t[2];
			}
		}
		this.setTangents(tangentArray,j);
	}
	
}

/**
* Sets the faces for this mesh
* @param {Number[]} jsArray The 1 dimentional array of normals
* @private
*/
GLGE.Mesh.prototype.GLSetFaceBuffer=function(gl){
	if(!this.GLfaces) this.GLfaces = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.GLfaces);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces.data), gl.STATIC_DRAW);
	this.GLfaces.itemSize = 1;
	this.GLfaces.numItems = this.faces.data.length;
}
/**
* Sets up a GL Buffer
* @param {WebGLContext} gl The context being drawn on
* @param {String} bufferName The name of the buffer to create
* @param {Number[]}  jsArray The data to add to the buffer
* @param {Number}  size Size of a single element within the array
* @private
*/
GLGE.Mesh.prototype.GLSetBuffer=function(gl,bufferName,jsArray,size){
	if(!this.GLbuffers[bufferName]) this.GLbuffers[bufferName] = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.GLbuffers[bufferName]);
	if(!jsArray.byteLength) jsArray=new Float32Array(jsArray);
	gl.bufferData(gl.ARRAY_BUFFER, jsArray, gl.STATIC_DRAW);
	this.GLbuffers[bufferName].itemSize = size;
	this.GLbuffers[bufferName].numItems = jsArray.length/size;
};
/**
* Calculates the normals for this mesh
* @private
*/
GLGE.Mesh.prototype.calcNormals=function(){
	for(var n=0;n<this.framePositions.length;n++){
		var normals=[];
		var positions=this.framePositions[n];
		var faces=this.faces.data;
		if(!faces){
			faces=[];
			for(var i=0;i<positions.length/3;i++) faces[i]=i;
		}
		for(var i=0;i<faces.length;i=i+3){
			var v1=[positions[faces[i]*3],positions[faces[i]*3+1],positions[faces[i]*3+2]];
			var v2=[positions[faces[i+1]*3],positions[faces[i+1]*3+1],positions[faces[i+1]*3+2]];
			var v3=[positions[faces[i+2]*3],positions[faces[i+2]*3+1],positions[faces[i+2]*3+2]];
			var vec1=GLGE.subVec3(v2,v1);
			var vec2=GLGE.subVec3(v3,v1);
			var norm=GLGE.toUnitVec3(GLGE.crossVec3(vec1,vec2));
			if(normals[faces[i]]==undefined) normals[faces[i]]=[];
			normals[faces[i]].push(norm);
			if(normals[faces[i+1]]==undefined) normals[faces[i+1]]=[];
			normals[faces[i+1]].push(norm);
			if(normals[faces[i+2]]==undefined) normals[faces[i+2]]=[];
			normals[faces[i+2]].push(norm);
		}
		var norms=[];
		for(i=0;i<normals.length;i++){
			var x=0,y=0,z=0;
			if(normals[i]!=undefined){
				for(var j=0;j<normals[i].length;j++){
					x+=normals[i][j][0];
					y+=normals[i][j][1];
					z+=normals[i][j][2];
				}
				x/=normals[i].length;
				y/=normals[i].length;
				z/=normals[i].length;
				norms[i*3]=x;
				norms[i*3+1]=y;
				norms[i*3+2]=z;
			}
		}
		this.setNormals(norms,n);
	}
}
/**
* Calculates a ambient occlution effect and sets the vertex color with AO level
*/
GLGE.Mesh.prototype.calcFauxAO=function(){	
	this.optimize();
	
	//calculate ambient color based on vertex angles
	var verts=this.positions;
	var faces=this.faces.data;
	var normals=this.normals;
	
	var idx=[];
	var len=verts.length/3
	for(var i=0;i<len;i++){
		idx.push([]);
	}
	for(var i=0;i<faces.length;i=i+3){
		idx[faces[i]].push(faces[i+1]);
		idx[faces[i]].push(faces[i+2]);
		idx[faces[i+1]].push(faces[i]);
		idx[faces[i+1]].push(faces[i+2]);
		idx[faces[i+2]].push(faces[i]);
		idx[faces[i+2]].push(faces[i+1]);
	}
	var ao=[];
	for(var i=0;i<len;i++){
		var AOfactor=0;
		var normal=[normals[i*3],normals[i*3+1],normals[i*3+2]];
		for(var j=0;j<idx[i].length;j++){
			var f=idx[i][j];
			var v=[verts[f*3]-verts[i*3],verts[f*3+1]-verts[i*3+1],verts[f*3+2]-verts[i*3+2]];
			v=GLGE.toUnitVec3(v);
			AOfactor+=v[0]*normal[0]+v[1]*normal[1]+v[2]*normal[2];
		}
		AOfactor/=idx[i].length;
		AOfactor=1.0-(AOfactor+1)*0.5;
		ao.push(AOfactor);
		ao.push(AOfactor);
		ao.push(AOfactor);
		ao.push(1);
	}
	this.setVertexColors(ao);
}
/**
* optimize geometry
* @private
*/
GLGE.Mesh.prototype.optimize=function(){
	var verts=this.positions;
	var normals=this.normals;
	var faces=this.faces.data;
	var tangents=this.tangents;
	var uv1=this.uv1set;
	var uv2=this.uv2set;
	//expand out the faces
	var vertsTemp=[];
	var normalsTemp=[];
	var uv1Temp=[];
	var uv2Temp=[];
	var tangentsTemp=[];
	if(faces){
		for(var i=0;i<faces.length;i++){
			vertsTemp.push(verts[faces[i]*3]);
			vertsTemp.push(verts[faces[i]*3+1]);
			vertsTemp.push(verts[faces[i]*3+2]);
			normalsTemp.push(normals[faces[i]*3]);
			normalsTemp.push(normals[faces[i]*3+1]);
			normalsTemp.push(normals[faces[i]*3+2]);
			if(tangents && tangents.length>0){
				tangentsTemp.push(tangents[faces[i]*3]);
				tangentsTemp.push(tangents[faces[i]*3+1]);
				tangentsTemp.push(tangents[faces[i]*3+2]);
			}
			if(uv1){
				uv1Temp.push(uv1[faces[i]*2]);
				uv1Temp.push(uv1[faces[i]*2+1]);
			}
			if(uv2){
				uv2Temp.push(uv2[faces[i]*2]);
				uv2Temp.push(uv2[faces[i]*2+1]);
			}
		}
	}else{
		vertsTemp=verts;
		normalsTemp=normals;
		tangentsTemp=tangents;
		uv1Temp=uv1;
		uv2Temp=uv2;
	}

	var newVerts=[];
	var newNormals=[];
	var newFaces=[];
	var newUV1s=[];
	var newUV2s=[];
	var newTangents=[];
	var stack=[];
	
	for(var i=0;i<vertsTemp.length;i=i+3){
		if(uv1 && uv2){
			var idx=[vertsTemp[i],vertsTemp[i+1],vertsTemp[i+2],normalsTemp[i],normalsTemp[i+1],normalsTemp[i+2],uv1Temp[i/3*2],uv1Temp[i/3*2+1]].join(" ");
		}else if(uv1){
			var idx=[vertsTemp[i],vertsTemp[i+1],vertsTemp[i+2],normalsTemp[i],normalsTemp[i+1],normalsTemp[i+2],uv1Temp[i/3*2],uv1Temp[i/3*2+1]].join(" ");
		}else{
			var idx=[vertsTemp[i],vertsTemp[i+1],vertsTemp[i+2],normalsTemp[i],normalsTemp[i+1],normalsTemp[i+2]].join(" ");
		}
		var vertIdx=stack.indexOf(idx);
		if(vertIdx<0){
			stack.push(idx);
			vertIdx=stack.length-1;
			newVerts.push(vertsTemp[i]);
			newVerts.push(vertsTemp[i+1]);
			newVerts.push(vertsTemp[i+2]);
			newNormals.push(normalsTemp[i]);
			newNormals.push(normalsTemp[i+1]);
			newNormals.push(normalsTemp[i+2]);
			if(tangents && tangents.length>0){
				newTangents.push(tangentsTemp[i]);
				newTangents.push(tangentsTemp[i+1]);
				newTangents.push(tangentsTemp[i+2]);
			}
			if(uv1){
				newUV1s.push(uv1Temp[i/3*2]);
				newUV1s.push(uv1Temp[i/3*2+1]);
			}
			if(uv2){
				newUV2s.push(uv2Temp[i/3*2]);
				newUV2s.push(uv2Temp[i/3*2+1]);
			}
		}
		newFaces.push(vertIdx);
	}
	this.setPositions(newVerts).setNormals(newNormals).setFaces(newFaces).setUV(newUV1s).setUV2(newUV2s).setTangents(newTangents);
}



/**
* Sets the Attributes for this mesh
* @param {WebGLContext} gl The context being drawn on
* @private
*/
GLGE.Mesh.prototype.GLAttributes=function(gl,shaderProgram,frame1, frame2){
	this.gl=gl;
	if(!frame1) frame1=0;
	//if at this point we have no normals set then calculate them
	if(!this.normals) this.calcNormals();
	//disable all the attribute initially arrays - do I really need this?
	for(var i=0; i<8; i++) gl.disableVertexAttribArray(i);
	//check if the faces have been updated
	if(!this.faces.GL && this.faces.data && this.faces.data.length>0){
		this.GLSetFaceBuffer(gl);
		this.faces.GL=true;
	}
	//loop though the buffers
	for(i=0; i<this.buffers.length;i++){
		if(!this.buffers[i].GL){
			this.GLSetBuffer(gl,this.buffers[i].name,this.buffers[i].data,this.buffers[i].size);
			this.buffers[i].GL=true;
		}
		attribslot=GLGE.getAttribLocation(gl,shaderProgram, this.buffers[i].name);
		if(attribslot>-1){
			gl.bindBuffer(gl.ARRAY_BUFFER, this.GLbuffers[this.buffers[i].name]);
			gl.enableVertexAttribArray(attribslot);
			gl.vertexAttribPointer(attribslot, this.GLbuffers[this.buffers[i].name].itemSize, gl.FLOAT, false, 0, 0);
		}
	}

	//do the position normal and if we have tangent then tangent
	var positionSlot=GLGE.getAttribLocation(gl,shaderProgram, "position");
	if(positionSlot>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.GLbuffers["position"+frame1]);
		gl.enableVertexAttribArray(positionSlot);
		gl.vertexAttribPointer(positionSlot, this.GLbuffers["position"+frame1].itemSize, gl.FLOAT, false, 0, 0);
	}
	var normalSlot=GLGE.getAttribLocation(gl,shaderProgram, "normal");
	if(normalSlot>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.GLbuffers["normal"+frame1]);
		gl.enableVertexAttribArray(normalSlot);
		gl.vertexAttribPointer(normalSlot, this.GLbuffers["normal"+frame1].itemSize, gl.FLOAT, false, 0, 0);
	}
	var tangentSlot=GLGE.getAttribLocation(gl,shaderProgram, "tangent");
	if(tangentSlot>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.GLbuffers["tangent"+frame1]);
		gl.enableVertexAttribArray(tangentSlot);
		gl.vertexAttribPointer(tangentSlot, this.GLbuffers["tangent"+frame1].itemSize, gl.FLOAT, false, 0, 0);
	}
	if(frame2!=undefined){
		var positionSlot2=GLGE.getAttribLocation(gl,shaderProgram, "position2");
		if(positionSlot2>-1){
			gl.bindBuffer(gl.ARRAY_BUFFER, this.GLbuffers["position"+frame2]);
			gl.enableVertexAttribArray(positionSlot2);
			gl.vertexAttribPointer(positionSlot2, this.GLbuffers["position"+frame2].itemSize, gl.FLOAT, false, 0, 0);
		}
		var normalSlot2=GLGE.getAttribLocation(gl,shaderProgram, "normal2");
		if(normalSlot2>-1){
			gl.bindBuffer(gl.ARRAY_BUFFER, this.GLbuffers["normal"+frame2]);
			gl.enableVertexAttribArray(normalSlot2);
			gl.vertexAttribPointer(normalSlot2, this.GLbuffers["normal"+frame2].itemSize, gl.FLOAT, false, 0, 0);
		}
		var tangentSlot2=GLGE.getAttribLocation(gl,shaderProgram, "tangent2");
		if(tangentSlot2>-1){
			gl.bindBuffer(gl.ARRAY_BUFFER, this.GLbuffers["tangent"+frame2]);
			gl.enableVertexAttribArray(tangentSlot2);
			gl.vertexAttribPointer(tangentSlot2, this.GLbuffers["tangent"+frame2].itemSize, gl.FLOAT, false, 0, 0);
		}	
	}
}


})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2011, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_sphere.js
 * @author me@paulbrunt.co.uk
 */
 
(function(GLGE){
/**
* @class Used to generate a basic sphere mesh
* @augments GLGE.Mesh
*/
GLGE.Sphere=function(uid){
	this.vertical=10;
	this.horizontal=10;
	this.radius=1;
	this.dirtySphere=false;
	GLGE.Mesh.apply(this,arguments);
	this.generateMeshData();
}
GLGE.augment(GLGE.Mesh,GLGE.Sphere);
/**
* @private
*/
GLGE.Sphere.prototype.generateMeshData=function(){
	var vertical=this.vertical;
	var horizontal=this.horizontal;
	var radius=this.radius;
	var t1,y,r1,i,j,x,y,t2;
	var verts=[];
	var normals=[];
	var faces=[];
	for(i=0;i<=vertical;i++){
		t1=i/vertical*Math.PI;
		y=Math.cos(t1)*radius;
		r1=Math.sin(t1)*radius;
		for(j=0;j<horizontal;j++){
			t2=j/horizontal*2*Math.PI;
			x=Math.sin(t2)*r1;
			z=Math.cos(t2)*r1;
			verts.push(x,y,z);
			var n=GLGE.toUnitVec3([x,y,z]);
			if(this.insideNormals){
				normals.push(-n[0],-n[1],-n[2]);
			}else{
				normals.push(n[0],n[1],n[2]);
			}
		}
		if(i>0){
			for(j=0;j<horizontal;j++){
				var v1=i*horizontal+j;
				var v2=(i-1)*horizontal+j;
				var v3=i*horizontal+(j+1)%horizontal;
				var v4=(i-1)*horizontal+(j+1)%horizontal;
				faces.push(v1,v3,v4,v1,v4,v2)
			}
		}
	}
	this.setPositions(verts);
	this.setNormals(normals);
	this.setFaces(faces);
	this.dirtySphere=false;
}

/**
* Sets the normals inside of the sphere
* @param {number} insideNormals 
*/
GLGE.Sphere.prototype.setInsideNormals=function(insideNormals){
	this.insideNormals=insideNormals;
	this.dirtySphere=true;
	return this;
}
/**
* Gets the insideNormals flag
* @returns tinsideNormals flag
*/
GLGE.Sphere.prototype.getInsideNormals=function(){
	return this.insideNormals;
}

/**
* Sets the sphere radius
* @param {number} radius the sphere radius
*/
GLGE.Sphere.prototype.setRadius=function(radius){
	this.radius=radius;
	this.dirtySphere=true;
	return this;
}
/**
* Gets the sphere radius
* @returns the radius
*/
GLGE.Sphere.prototype.getRadius=function(){
	return this.radius;
}

/**
* Sets the sphere vertical divisions
* @param {number} radius the sphere radius
*/
GLGE.Sphere.prototype.setVertical=function(vertical){
	this.vertical=vertical;
	this.dirtySphere=true;
	return this;
}
/**
* Gets the sphere vertical divisions
* @returns the radius
*/
GLGE.Sphere.prototype.getRadius=function(){
	return this.vertical;
}

/**
* Sets the sphere horizontal divisions
* @param {number} radius the sphere radius
*/
GLGE.Sphere.prototype.setHorizontal=function(horizontal){
	this.horizontal=horizontal;
	this.dirtySphere=true;
	return this;
}
/**
* Gets the sphere horizontal divisions
* @returns the radius
*/
GLGE.Sphere.prototype.getRadius=function(){
	return this.horizontal;
}

/**
* @private
*/
GLGE.Sphere.prototype.GLAttributes=function(){
	if(this.dirtySphere) this.generateMeshData();
	GLGE.Mesh.prototype.GLAttributes.apply(this,arguments);
};

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_material.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){




var materialIdx=0;

/**
* @class The Material class creates materials to be applied to objects in the graphics engine
* @see GLGE.Object
* @augments GLGE.Animatable
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
* @augments GLGE.Events
*/
GLGE.Material=function(uid){
  this.layers=[];
  this.layerlisteners=[];
  this.textures=[];
  this.lights=[];
  this.color={r:1,g:1,b:1,a:1};
  this.specColor={r:1,g:1,b:1};
  this.reflect=0.8;
  this.shine=10;
  this.specular=1;
  this.emit={r:0,g:0,b:0};
  this.alpha=1;
  this.translucency=0;
  this.materialIdx=materialIdx++;
  GLGE.Assets.registerAsset(this,uid);
};
GLGE.augment(GLGE.Animatable,GLGE.Material);
GLGE.augment(GLGE.QuickNotation,GLGE.Material);
GLGE.augment(GLGE.JSONLoader,GLGE.Material);
GLGE.augment(GLGE.Events,GLGE.Material);


/**
 * @name GLGE.Material#shaderupdate
 * @event fires when the shader for this material needs updating
 * @param {object} data
 */

 /**
 * @name GLGE.Material#downloadComplete
 * @event fires when all the assets for this material have finished loading
 * @param {object} data
 */

/**
* @constant
* @description Flag for material colour
*/
GLGE.M_COLOR=1;
/**
* @constant
* @description Flag for material normal
*/
GLGE.M_NOR=2;
/**
* @constant
* @description Flag for material alpha
*/
GLGE.M_ALPHA=4;
/**
* @constant
* @description Flag for material specular color
*/
GLGE.M_SPECCOLOR=8;
/**
* @constant
* @description Flag for material specular cvalue
*/
GLGE.M_SPECULAR=16;
/**
* @constant
* @description Flag for material shineiness
*/
GLGE.M_SHINE=32;
/**
* @constant
* @description Flag for material reflectivity
*/
GLGE.M_REFLECT=64;
/**
* @constant
* @description Flag for material emision
*/
GLGE.M_EMIT=128;
/**
* @constant
* @description Flag for material alpha
*/
GLGE.M_ALPHA=256;
/**
* @constant
* @description Flag for masking with textures red value
*/
GLGE.M_MSKR=512;
/**
* @constant
* @description Flag for masking with textures green value
*/
GLGE.M_MSKG=1024;
/**
* @constant
* @description Flag for masking with textures blue value
*/
GLGE.M_MSKB=2048;
/**
* @constant
* @description Flag for masking with textures alpha value
*/
GLGE.M_MSKA=4096;
/**
* @constant
* @description Flag for mapping of the height in parallax mapping
*/
GLGE.M_HEIGHT=8192;

/**
* @constant
* @description Flag for ambient mapping
*/
GLGE.M_AMBIENT=16384;

/**
* @constant
* @description Flag for Steep parallax mapng
*/
GLGE.M_STEEP=32768;

/**
* @constant
* @description Enumeration for first UV layer
*/
GLGE.UV1=0;
/**
* @constant
* @description Enumeration for second UV layer
*/
GLGE.UV2=1;
/**
* @constant
* @description Enumeration for normal texture coords
*/
GLGE.MAP_NORM=3;

/**
* @constant
* @description Enumeration for object texture coords
*/
GLGE.MAP_OBJ=4;

/**
* @constant
* @description Enumeration for reflection coords
*/
GLGE.MAP_REF=5;

/**
* @constant
* @description Enumeration for environment coords
*/
GLGE.MAP_ENV=6;

/**
* @constant
* @description Enumeration for view coords
*/
GLGE.MAP_VIEW=7;

/**
* @constant
* @description Enumeration for point coords
*/
GLGE.MAP_POINT=8;

/**
* @constant
* @description Enumeration for view coords
*/
GLGE.MAP_GLOBAL=9;


/**
* @constant
* @description Enumeration for mix blending mode
*/
GLGE.BL_MIX=0;

/**
* @constant
* @description Enumeration for mix blending mode
*/
GLGE.BL_MUL=1;


/**
* @constant
* @description Enumeration for no use of vertex color
*/
GLGE.VC_NONE=0;

/**
* @constant
* @description Enumeration for base vertex color mode
*/
GLGE.VC_BASE=1;

/**
* @constant
* @description Enumeration for muliply vertex color mode
*/
GLGE.VC_MUL=2;

/**
* @constant
* @description Enumeration for vertex color sets ambient lighting
*/
GLGE.VC_AMB=3;

/**
* @constant
* @description Enumeration for vertex color multiplied by ambient lighting
*/
GLGE.VC_AMBMUL=4;



GLGE.Material.prototype.layers=null;
GLGE.Material.prototype.className="Material";
GLGE.Material.prototype.textures=null;
GLGE.Material.prototype.color=null;
GLGE.Material.prototype.specColor=null;
GLGE.Material.prototype.specular=null;
GLGE.Material.prototype.emit={r:0,g:0,b:0};
GLGE.Material.prototype.shine=null;
GLGE.Material.prototype.reflect=null;
GLGE.Material.prototype.lights=null;
GLGE.Material.prototype.alpha=null;
GLGE.Material.prototype.ambient={r:0,g:0,b:0};
GLGE.Material.prototype.shadow=true;
GLGE.Material.prototype.shadeless=false;
GLGE.Material.prototype.downloadComplete=false;
GLGE.Material.prototype.fadeDistance=0;
GLGE.Material.prototype.vertexColorMode=GLGE.VC_BASE;


/**
* Sets the fade distance, the distance object alpha is fade due to camera proximity
* @param {boolean} value The distance to fade over
*/
GLGE.Material.prototype.setFadeDistance=function(value){
  this.fadeDistance=parseFloat(value);
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Gets the material fade distance
* @returns {boolean} The distance to fadthe alpha fade effects
*/
GLGE.Material.prototype.getFadeDistance=function(value){
  return this.fadeDistance;
};

/**
* Sets the vertex color mode. Default is to override the base color VC_MUL will multiply the vertex color with the resulting color
* @param {boolean} value The vertex color mode
*/
GLGE.Material.prototype.setVertexColorMode=function(value){
  this.vertexColorMode=value;
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Gets the vertex color mode
* @returns {boolean} The vertex color mode
*/
GLGE.Material.prototype.getVertexColorMode=function(value){
  return this.vertexColorMode;
};

/**
* Sets the fall back material the material will be used if this one fails to produce a program
* @param {boolean} value The fallback material
*/
GLGE.Material.prototype.setFallback=function(value){
  this.fallback=value;
  return this;
};
/**
* Gets the fallback material, if program fails then the fallback will be used
* @returns {boolean} The fallback material
*/
GLGE.Material.prototype.getFallback=function(value){
  return this.fallback;
};

/**
* Sets the flag indicateing if the material is shadeless
* @param {boolean} value The shadeless flag
*/
GLGE.Material.prototype.setShadeless=function(value){
  this.shadeless=value;
  return this;
};
/**
* Gets the shadeless flag
* @returns {boolean} The shadeless flag
*/
GLGE.Material.prototype.getShadeless=function(value){
  return this.shadeless;
};
/**
* Sets the flag indicateing the material should or shouldn't recieve shadows
* @param {boolean} value The recieving shadow flag
*/
GLGE.Material.prototype.setShadow=function(value){
  this.shadow=value;
  return this;
};
/**
* gets the show flag
* @returns {boolean} The shadow flag
*/
GLGE.Material.prototype.getShadow=function(value){
  return this.shadow;
};
/**
* Sets the base colour of the material
* @param {string} color The colour of the material
*/
GLGE.Material.prototype.setColor=function(color){
  if(color.r==undefined){
    color=GLGE.colorParse(color);
  }
  this.color={r:color.r,g:color.g,b:color.b};
  //this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Sets the red base colour of the material
* @param {Number} r The new red level 0-1
*/
GLGE.Material.prototype.setColorR=function(value){
  this.color={r:value,g:this.color.g,b:this.color.b,a:this.color.a};
  return this;
};
/**
* Sets the green base colour of the material
* @param {Number} g The new green level 0-1
*/
GLGE.Material.prototype.setColorG=function(value){
  this.color={r:this.color.r,g:value,b:this.color.b,a:this.color.a};
  return this;
};
/**
* Sets the blue base colour of the material
* @param {Number} b The new blue level 0-1
*/
GLGE.Material.prototype.setColorB=function(value){
  this.color={r:this.color.r,g:this.color.g,b:value,a:this.color.a};
  return this;
};
/**
* Gets the red base colour of the material
* @returns The red level 0-1
*/
GLGE.Material.prototype.getColorR=function(value){
  return this.color.r;
};
/**
* Gets the green base colour of the material
* @returns The green level 0-1
*/
GLGE.Material.prototype.getColorG=function(value){
  return this.color.g;
};
/**
* Gets the blue base colour of the material
* @returns The blue level 0-1
*/
GLGE.Material.prototype.getColorB=function(value){
  return this.color.b;
};
/**
* Gets the current base color of the material
* @return {[r,g,b]} The current base color
*/
GLGE.Material.prototype.getColor=function(){
  return this.color;
};
/**
* Sets the base specular colour of the material
* @param {string} color The new specular colour
*/
GLGE.Material.prototype.setSpecularColor=function(color){
  if(color.r==undefined){
    color=GLGE.colorParse(color);
  }
  this.specColor={r:parseFloat(color.r),g:parseFloat(color.g),b:parseFloat(color.b)};
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Gets the ambient lighting of the material
* @return {[r,g,b]} The current ambient lighting
*/
GLGE.Material.prototype.getAmbient=function(){
  return this.ambient;
};


/**
* Sets the ambient lighting of the material
* @param {string} color The new specular colour
*/
GLGE.Material.prototype.setAmbient=function(color){
  if(!color.r){
    color=GLGE.colorParse(color);
  }
  this.ambient={r:parseFloat(color.r),g:parseFloat(color.g),b:parseFloat(color.b)};
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Gets the current base specular color of the material
* @return {[r,g,b]} The current base specular color
*/
GLGE.Material.prototype.getSpecularColor=function(){
  return this.specColor;
};


/**
* Sets the alpha of the material
* @param {Number} value how much alpha
*/
GLGE.Material.prototype.setTranslucency=function(value){
  this.translucency=parseFloat(value);
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Gets the alpha of the material
* @return {Number} The current alpha of the material
*/
GLGE.Material.prototype.getTranslucency=function(){
  return this.translucency;
};

/**
* Sets the alpha of the material
* @param {Number} value how much alpha
*/
GLGE.Material.prototype.setAlpha=function(value){
  this.alpha=value;
  return this;
};
/**
* Gets the alpha of the material
* @return {Number} The current alpha of the material
*/
GLGE.Material.prototype.getAlpha=function(){
  return this.alpha;
};
/**
* Sets the specular of the material
* @param {Number} value how much specular
*/
GLGE.Material.prototype.setSpecular=function(value){
  this.specular=value;
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Gets the specular of the material
* @return {Number} The current specular of the material
*/
GLGE.Material.prototype.getSpecular=function(){
  return this.specular;
};
/**
* Sets the shininess of the material
* @param {Number} value how much shine
*/
GLGE.Material.prototype.setShininess=function(value){
  if (value<=0) value=0.001;
  this.shine=value;
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Gets the shininess of the material
* @return {Number} The current shininess of the material
*/
GLGE.Material.prototype.getShininess=function(){
  return this.shine;
};
/**
* Sets how much the material should emit
* @param {Number} color what color to emit
*/
GLGE.Material.prototype.setEmit=function(color){
  if(color>0) color={r:color,g:color,b:color};
  if(!color.r){
    color=GLGE.colorParse(color);
  }
  this.emit={r:parseFloat(color.r),g:parseFloat(color.g),b:parseFloat(color.b)};
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Sets how much the Red material should emit
* @param {Number} value what Red to emit
*/
GLGE.Material.prototype.setEmitR=function(value){
  this.emit.r=parseFloat(value);
  return this;
};
/**
* Sets how much the green material should emit
* @param {Number} value what green to emit
*/
GLGE.Material.prototype.setEmitG=function(value){
  this.emit.g=parseFloat(value);
  return this;
};
/**
* Sets how much the blue material should emit
* @param {Number} value what blue to emit
*/
GLGE.Material.prototype.setEmitB=function(value){
  this.emit.b=parseFloat(value);
  return this;
};
/**
* Sets how much the Red material should emit
* @returns Red to emit
*/
GLGE.Material.prototype.getEmitR=function(value){
  return this.emit.r;
};
/**
* Sets how much the green material should emit
* @returns green to emit
*/
GLGE.Material.prototype.getEmitG=function(value){
  return this.emit.g;
};
/**
* Sets how much the blue material should emit
* @returns blue to emit
*/
GLGE.Material.prototype.getEmitB=function(value){
  return this.emit.b;
};

/**
* Gets the amount this material emits
* @return {Number} The emit value for the material
*/
GLGE.Material.prototype.getEmit=function(){
  return this.emit;
};
/**
* Sets reflectivity of the material
* @param {Number} value how much to reflect (0-1)
*/
GLGE.Material.prototype.setReflectivity=function(value){
  this.reflect=value;
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Gets the materials reflectivity
* @return {Number} The reflectivity of the material
*/
GLGE.Material.prototype.getReflectivity=function(){
  return this.reflect;
};

/**
* Sets the material to output with 0 alpha or 1 alpha
* @param {boolean} value binary alpha flag
*/
GLGE.Material.prototype.setBinaryAlpha=function(value){
  this.binaryAlpha=value;
  this.fireEvent("shaderupdate",{});
  return this;
};
/**
* Gets the binary alpha flag
* @return {boolean} The binary alpha flag
*/
GLGE.Material.prototype.getBinaryAlpha=function(){
  return this.binaryAlpha;
};

/**
* Add a new layer to the material
* @param {MaterialLayer} layer The material layer to add to the material
*/
GLGE.Material.prototype.addMaterialLayer=function(layer){
  if(typeof layer=="string")  layer=GLGE.Assets.get(layer);
  this.layers.push(layer);
  var material=this;
  var listener=function(event){
    material.fireEvent("shaderupdate",{});
  };
  this.layerlisteners.push(listener);
  layer.addEventListener("shaderupdate",listener);
  this.fireEvent("shaderupdate",{});
  return this;
};

/**
* Removes a layer from the material
* @param {MaterialLayer} layer The material layer to remove
*/
GLGE.Material.prototype.removeMaterialLayer=function(layer){
  var idx=this.layers.indexOf(layer);
  if(idx>=0){
    this.layers.splice(idx,1);
    layer.removeEventListener("shaderupdate",this.layerlisteners[idx]);
    this.layerlisteners.splice(idx,1);
    this.fireEvent("shaderupdate",{});
  }
  return this;
};

/**
* Gets all the materials layers
* @returns {GLGE.MaterialLayer[]} all of the layers contained within this material
*/
GLGE.Material.prototype.getLayers=function(){
  return this.layers;
};
/**
* Generate the code required to calculate the texture coords for each layer
* @private
*/
GLGE.Material.prototype.getLayerCoords=function(shaderInjection){
    var shader=[];
    shader.push("vec4 texturePos;\n");
    for(var i=0; i<this.layers.length;i++){
      shader.push("textureCoords"+i+"=vec3(0.0,0.0,0.0);\n");

      if(this.layers[i].mapinput==GLGE.UV1 || this.layers[i].mapinput==GLGE.UV2){
        shader.push("texturePos=vec4(vec2(UVCoord["+(this.layers[i].mapinput*2)+"],(1.0-UVCoord["+(this.layers[i].mapinput*2+1)+"])),1.0,1.0);\n");
      }

      if(this.layers[i].mapinput==GLGE.MAP_NORM){
        shader.push("texturePos=vec4(normalize(n.xyz),1.0);\n");
      }
      if(this.layers[i].mapinput==GLGE.MAP_OBJ){
        shader.push("texturePos=vec4(normalize(OBJCoord.xyz),1.0);\n");
      }
      if(this.layers[i].mapinput== GLGE.MAP_GLOBAL){
        shader.push("texturePos=vec4(OBJCoord.xyz,1.0);\n");
      }
      
     

      if(this.layers[i].mapinput==GLGE.MAP_REF){
        //will need to do in fragment to take the normal maps into account!
        shader.push("texturePos=vec4(reflect(normalize(eyevec.xyz),normalize(n.xyz)),1.0);\n");
      }



      if(this.layers[i].mapinput==GLGE.MAP_ENV){
        //will need to do in fragment to take the normal maps into account!
        shader.push("texturePos=envMat * vec4(reflect(normalize(eyevec.xyz),normalize(n.xyz)),1.0);\n");
      }

      shader.push("textureCoords"+i+"=(layer"+i+"Matrix * texturePos).xyz;\n");

      if(shaderInjection && ~shaderInjection.indexOf("GLGE_Texcoord")){
        shader.push("textureCoords"+i+"=GLGE_Texcoord("+i+",textureCoords"+i+");\n");
      }

    }

    return shader.join("");
}
/**
* Generate the fragment shader program for this material
* @private
*/
GLGE.Material.prototype.getVertexVarying=function(){
  var shader=[];
  for(var i=0; i<this.layers.length;i++){
    shader.push("uniform mat4 layer"+i+"Matrix;\n");
    shader.push("varying vec3 textureCoords"+i+";\n");
  }
  return shader.join("");
}

GLGE.Material.prototype.registerPasses=function(gl,object){
  for(var i=0; i<this.textures.length;i++){
    if(this.textures[i].registerPasses) this.textures[i].registerPasses(gl,object);
  }
}

/**
* Generate the fragment shader program for this material
* @private
*/
GLGE.Material.prototype.getFragmentShader=function(lights,colors,shaderInjection,shadow){
	var shader="#ifdef GL_ES\nprecision highp float;\n#endif\n#define GLGE_FRAGMENT\n";
	
	if(shadow){
		shader=shader+"uniform float distance;\n";
		shader=shader+"uniform bool shadowtype;\n";
	}
	
	if(shaderInjection) shader+=shaderInjection;
	var tangent=false;
	for(var i=0; i<lights.length;i++){
		if(lights[i].type==GLGE.L_POINT || lights[i].type==GLGE.L_SPOT || lights[i].type==GLGE.L_DIR){
			shader=shader+"varying vec3 lightvec"+i+";\n"; 
			shader=shader+"varying float lightdist"+i+";\n";  
		}
	}
	shader=shader+"varying vec3 n;\n";  
	shader=shader+"varying vec3 t;\n";  
	shader=shader+"varying vec4 UVCoord;\n";
	shader=shader+"varying vec3 eyevec;\n"; 
	shader=shader+"varying vec3 OBJCoord;\n";
	if(colors) shader=shader+"varying vec4 vcolor;\n";

	

	//texture uniforms
	for(var i=0; i<this.textures.length;i++){
		if(this.textures[i].className=="Texture") shader=shader+"uniform sampler2D TEXTURE"+i+";\n";
		if(this.textures[i].className=="TextureCanvas") shader=shader+"uniform sampler2D TEXTURE"+i+";\n";
		if(this.textures[i].className=="TextureCanvasCube") shader=shader+"uniform samplerCube TEXTURE"+i+";\n";
		if(this.textures[i].className=="TextureVideo") shader=shader+"uniform sampler2D TEXTURE"+i+";\n";
		if(this.textures[i].className=="TextureCube") shader=shader+"uniform samplerCube TEXTURE"+i+";\n";
	}
	
	
	var cnt=1;
	var shadowlights=[];
	var num;
	for(var i=0; i<lights.length;i++){
	    if(lights[i].type==GLGE.L_OFF) continue;
			shader=shader+"uniform vec3 lightcolor"+i+";\n";  
			shader=shader+"uniform vec3 lightAttenuation"+i+";\n";  
			shader=shader+"uniform float spotCosCutOff"+i+";\n";  
			shader=shader+"uniform float spotExp"+i+";\n";  
			shader=shader+"uniform vec3 lightdir"+i+";\n";  
			shader=shader+"uniform mat4 lightmat"+i+";\n";
			shader=shader+"uniform float shadowbias"+i+";\n"; 
			shader=shader+"uniform int shadowsamples"+i+";\n";  
			shader=shader+"uniform float shadowsoftness"+i+";\n";  
			shader=shader+"uniform bool castshadows"+i+";\n";  
			shader=shader+"uniform vec2 shadowoffset"+i+";\n";  
			if(lights[i].getCastShadows() && this.shadow){
				shader=shader+"varying vec4 spotcoord"+i+";\n";  
				num=this.textures.length+(cnt++);
				shader=shader+"uniform sampler2D TEXTURE"+num+";\n";
				shadowlights[i]=num;
			}
	}
	for(i=0; i<this.layers.length;i++){		
		shader=shader+"varying vec3 textureCoords"+i+";\n";
		shader=shader+"uniform float layeralpha"+i+";\n";
		if(this.layers[i].mapinput==GLGE.MAP_VIEW){
			shader=shader+"uniform mat4 layer"+i+"Matrix;\n";
		}
		if((this.layers[i].mapto & GLGE.M_HEIGHT) == GLGE.M_HEIGHT || (this.layers[i].mapto & GLGE.M_STEEP) == GLGE.M_STEEP){
			shader=shader+"uniform float layerheight"+i+";\n";
		}
	}
	
	shader=shader+"uniform sampler2D sky;\n";
	
	shader=shader+"uniform vec4 baseColor;\n";
	shader=shader+"uniform vec3 specColor;\n";
	shader=shader+"uniform float shine;\n";
	shader=shader+"uniform float specular;\n";
	shader=shader+"uniform float reflective;\n";
	shader=shader+"uniform vec3 emit;\n";
	shader=shader+"uniform float alpha;\n";
	shader=shader+"uniform vec3 amb;\n";
	shader=shader+"uniform float fognear;\n";
	shader=shader+"uniform float fogfar;\n";
	shader=shader+"uniform int fogtype;\n";
	shader=shader+"uniform vec3 fogcolor;\n";
	shader=shader+"uniform float far;\n";
	shader=shader+"uniform mat4 worldInverseTranspose;\n"; 
	shader=shader+"uniform mat4 projection;\n"; 
	shader=shader+"uniform bool emitpass;\n"; 
	shader=shader+"uniform bool shadeless;\n"; 
    
	shader=shader+"void main(void)\n";
	shader=shader+"{\n";
	shader=shader+"float att;\n"; 
	shader=shader+"int texture;\n"; 
	shader=shader+"float mask=1.0;\n";
	shader=shader+"float spec=specular;\n"; 
	shader=shader+"vec3 specC=specColor;\n"; 
	shader=shader+"vec4 view;\n"; 
	shader=shader+"vec3 textureCoords=vec3(0.0,0.0,0.0);\n"; 
	shader=shader+"float ref=reflective;\n";
	shader=shader+"float sh=shine;\n"; 
	shader=shader+"vec3 em=emit;\n"; 
	shader=shader+"float al=alpha;\n"; 
	shader=shader+"vec3 amblight=vec3(1.0,1.0,1.0);\n"; 
	shader=shader+"vec4 normalmap= vec4(n,0.0);\n"
	if(colors && this.vertexColorMode==GLGE.VC_BASE){
		shader=shader+"vec4 color= vcolor;";
		shader=shader+"al = vcolor.a;";
	}else{
		shader=shader+"vec4 color = baseColor;"; //set the initial color
	}
	shader=shader+"float pheight=0.0;\n"
	shader=shader+"vec3 textureHeight=vec3(0.0,0.0,0.0);\n";
	shader=shader+"vec3 normal = normalize(n);\n";
	shader=shader+"vec3 b = vec3(0.0,0.0,0.0);\n";
	var diffuseLayer=0;
	var anyAlpha=false;
	for(i=0; i<this.layers.length;i++){
		
		shader=shader+"textureCoords=textureCoords"+i+"+textureHeight;\n";
		shader=shader+"mask=layeralpha"+i+"*mask;\n";
		
		if(this.layers[i].mapinput==GLGE.MAP_VIEW){
			shader=shader+"view=projection * vec4(-eyevec,1.0);\n";
			shader=shader+"textureCoords=view.xyz/view.w*0.5+0.5;\n";
			shader=shader+"textureCoords=(layer"+i+"Matrix*vec4(textureCoords,1.0)).xyz+textureHeight;\n";
		}
    	
		if(this.layers[i].mapinput==GLGE.MAP_POINT){
			shader=shader+"textureCoords=vec3(gl_PointCoord,1.0);\n";
		}
    	
        
			
		if(this.layers[i].getTexture().className=="Texture" || this.layers[i].getTexture().className=="TextureCanvas"  || this.layers[i].getTexture().className=="TextureVideo" ){
			var txcoord="xy";
			var sampletype="2D";
		}else{
			var txcoord="xyz";
			var sampletype="Cube";
		}
		
		if((this.layers[i].mapto & GLGE.M_COLOR) == GLGE.M_COLOR){			
			diffuseLayer=i;
			
			if(this.layers[i].blendMode==GLGE.BL_MUL){
				shader=shader+"color = color*(1.0-mask) + color*texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+")*mask;\n";
			}
			else 
			{
				shader=shader+"color = color*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+")*mask;\n";
			}
		}        
		
		if((this.layers[i].mapto & GLGE.M_HEIGHT) == GLGE.M_HEIGHT){
			//do paralax stuff
			shader=shader+"pheight = texture2D(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").x;\n";
			shader=shader+"textureHeight =vec3((layerheight"+i+"* (pheight-0.5)  * normalize(eyevec).xy*vec2(1.0,-1.0)),0.0);\n";
		}
		if((this.layers[i].mapto & GLGE.M_STEEP) == GLGE.M_STEEP){
			shader=shader+"b=normalize(cross(t.xyz,n));\n";
			shader=shader+"vec3 neye=normalize(eyevec.xyz);"
			shader=shader+"neye = vec3(dot(neye,t),dot(neye,b),dot(neye,n));";
			shader=shader+"neye = normalize(neye);";
			shader=shader+"float stepheight"+i+"=layerheight"+i+";";
			
			shader=shader+"float steepstep"+i+"=(1.0/8.0)*stepheight"+i+"/neye.z;";
			shader=shader+"float steepdisplace"+i+"=0.0;";

			shader=shader+"for(int steepcount"+i+"=0;steepcount"+i+"<8;steepcount"+i+"++){";
			shader=shader+"pheight = texture2D(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+"+vec2(neye.x,neye.y)*steepdisplace"+i+").x;\n";
			shader=shader+"if(pheight*stepheight"+i+">neye.z*steepdisplace"+i+"){";
			shader=shader+"textureHeight=vec3(vec2(neye.x,neye.y)*steepdisplace"+i+",0.0);";
			shader=shader+"}else{";
			shader=shader+"steepdisplace"+i+"-=steepstep"+i+";";
			shader=shader+"steepstep"+i+"*=0.5;";
			shader=shader+"}";
			shader=shader+"steepdisplace"+i+"+=steepstep"+i+";";

			shader=shader+"}";
		}
		if((this.layers[i].mapto & GLGE.M_SPECCOLOR) == GLGE.M_SPECCOLOR){
			shader=shader+"specC = specC*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").rgb*mask;\n";
		}
		if((this.layers[i].mapto & GLGE.M_MSKR) == GLGE.M_MSKR){
			shader=shader+"mask = texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").r;\n";
		}
		if((this.layers[i].mapto & GLGE.M_MSKG) == GLGE.M_MSKG){
			shader=shader+"mask = texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").g;\n";
		}
		if((this.layers[i].mapto & GLGE.M_MSKB) == GLGE.M_MSKB){
			shader=shader+"mask = texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").b;\n";
		}
		if((this.layers[i].mapto & GLGE.M_MSKA) == GLGE.M_MSKA){
			shader=shader+"mask = texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").a;\n";
		}
		if((this.layers[i].mapto & GLGE.M_SPECULAR) == GLGE.M_SPECULAR){
			shader=shader+"spec = spec*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").r*mask;\n";
		}
		if((this.layers[i].mapto & GLGE.M_REFLECT) == GLGE.M_REFLECT){
			shader=shader+"ref = ref*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").g*mask;\n";
		}
		if((this.layers[i].mapto & GLGE.M_SHINE) == GLGE.M_SHINE){
			shader=shader+"sh = sh*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").b*mask*255.0;\n";
		}
		if((this.layers[i].mapto & GLGE.M_EMIT) == GLGE.M_EMIT){
			shader=shader+"em = em*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").rgb*mask;\n";
		}
		if((this.layers[i].mapto & GLGE.M_NOR) == GLGE.M_NOR){
			shader=shader+"normalmap = normalmap*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+")*mask;\n";
			shader=shader+"normal = normalmap.rgb;\n";
			shader=shader+"normal = 2.0*(vec3(normal.r, -normal.g, normal.b) - vec3(0.5, -0.5, 0.5));";
			shader=shader+"b=normalize(cross(t.xyz,n));\n";
			shader=shader+"normal = normal.x*t + normal.y*b + normal.z*n;";
			shader=shader+"normal = normalize(normal);";
			
		}
		if((this.layers[i].mapto & GLGE.M_ALPHA) == GLGE.M_ALPHA){
			anyAlpha=true;
			shader=shader+"al = al*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").a*mask;\n";
		}
		if((this.layers[i].mapto & GLGE.M_AMBIENT) == GLGE.M_AMBIENT){
			shader=shader+"amblight = amblight*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[i].texture.idx+", textureCoords."+txcoord+").rgb*mask;\n";
		}
	}		
	shader=shader+"amblight *= amb;\n";
	
	if (!anyAlpha && this.layers.length) {
		if(this.layers[diffuseLayer].getTexture().className=="Texture" || this.layers[diffuseLayer].getTexture().className=="TextureCanvas"  || this.layers[diffuseLayer].getTexture().className=="TextureVideo" ) {
			var txcoord="xy";
			var sampletype="2D";
		}else{
			var txcoord="xyz";
			var sampletype="Cube";
		}
		shader=shader+"al = al*(1.0-mask) + texture"+sampletype+"(TEXTURE"+this.layers[diffuseLayer].texture.idx+", textureCoords."+txcoord+").a*al*mask;\n";        
	}
	if(colors && this.vertexColorMode==GLGE.VC_MUL){
		shader=shader+"color *= vcolor;";
	}
	if(this.binaryAlpha) {
		shader=shader+"if(al<0.5) discard;\n";
		shader=shader+"al=1.0;\n";
	}else{
		shader=shader+"if(al==0.0) discard;\n";
	}
	shader=shader+"vec3 lightvalue=amblight;\n"; 
	if(colors && this.vertexColorMode==GLGE.VC_AMB){
		shader=shader+"lightvalue = vcolor.rgb;";
	}
	if(colors && this.vertexColorMode==GLGE.VC_AMBMUL){
		shader=shader+"lightvalue *= vcolor.rgb;";
	}
	
	shader=shader+"float dotN,spotEffect;";
	shader=shader+"vec3 lightvec=vec3(0.0,0.0,0.0);";
	shader=shader+"vec3 viewvec=vec3(0.0,0.0,0.0);";
	shader=shader+"vec3 specvalue=vec3(0.0,0.0,0.0);";
	shader=shader+"vec2 scoord=vec2(0.0,0.0);";
	shader=shader+"float sDepth=0.0;";
	shader=shader+"float d1=0.0;";
	shader=shader+"float d2=0.0;";
	shader=shader+"float spotmul=0.0;";
	shader=shader+"float rnd=0.0;";
	shader=shader+"float spotsampleX=0.0;";
	shader=shader+"float spotsampleY=0.0;";
	shader=shader+"float totalweight=0.0;";
	shader=shader+"int cnt=0;";
	shader=shader+"float specularSmoothStepValue=.125;\n";
	shader=shader+"vec2 spotoffset=vec2(0.0,0.0);";
	shader=shader+"float dp=0.0;";
	
	shader=shader+"vec4 dist;float depth,m1,m2,prob,variance;\n";
	shader=shader+"if (normal.z<0.0) {normal.z=0.0;}\n";
	
    
    shader=shader+"float fogfact=1.0;";
    shader=shader+"if(fogtype=="+GLGE.FOG_QUADRATIC+" || fogtype=="+GLGE.FOG_SKYQUADRATIC+") fogfact=clamp(pow(max((fogfar - length(eyevec)) / (fogfar - fognear),0.0),2.0),0.0,1.0);\n";
    shader=shader+"if(fogtype=="+GLGE.FOG_LINEAR+" || fogtype=="+GLGE.FOG_SKYLINEAR+") fogfact=clamp((fogfar - length(eyevec)) / (fogfar - fognear),0.0,1.0);\n";

  
	  if(!shadow){
    

    shader=shader+"if (emitpass) {gl_FragColor=vec4(em,1.0);} else if (shadeless) {\n";
     shader=shader+"gl_FragColor=vec4(color.rgb,al);\n";
     if(this.fadeDistance>0){
		shader=shader+"gl_FragColor.a=gl_FragColor.a*(1.0-min(1.0,"+this.fadeDistance.toFixed(5)+"/length(eyevec)));\n";
	}
    shader=shader+"} else {\n";

    
	for(var i=0; i<lights.length;i++){
	    if(lights[i].type==GLGE.L_OFF) continue;
		shader=shader+"lightvec=lightvec"+i+";\n";  
		shader=shader+"viewvec=eyevec;\n"; 
		
		
		if(lights[i].type==GLGE.L_POINT){ 
			if(this.translucency==0){
				shader=shader+"dotN=max(dot(normal,normalize(-lightvec)),0.0);\n";
			}else{
				shader=shader+"dotN=dot(normal,normalize(-lightvec));\n";
				shader=shader+"if (dotN<0.0) dotN*=-"+this.translucency.toFixed(2)+";\n";
			}
			shader=shader+"att = 1.0 / (lightAttenuation"+i+"[0] + lightAttenuation"+i+"[1] * lightdist"+i+" + lightAttenuation"+i+"[2] * lightdist"+i+" * lightdist"+i+");\n";
			shader=shader+"if(dotN>0.0){\n";
			if(lights[i].diffuse){
				shader=shader+"lightvalue += att * dotN * lightcolor"+i+";\n";
			}
			shader=shader+"}\n";
			if(lights[i].specular){
				shader=shader+"specvalue += smoothstep(-specularSmoothStepValue,specularSmoothStepValue,dotN)*att * specC * lightcolor"+i+" * spec  * pow(max(dot(reflect(normalize(lightvec), normal),normalize(viewvec)),0.0), 0.3*sh);\n";
			}
			
			
			
		}
		shader=shader+"spotEffect = 0.0;\n";
		if(lights[i].type==GLGE.L_SPOT){
			shader=shader+"spotEffect = dot(normalize(lightdir"+i+"), normalize(-lightvec"+i+"));";	
			shader=shader+"if (spotEffect > spotCosCutOff"+i+""+(!this.spotCutOff ? " || spotEffect>0.0" : "")+") {\n";		
			shader=shader+"spotEffect = pow(spotEffect, spotExp"+i+");";
			//spot shadow stuff
			if(lights[i].getCastShadows() && this.shadow){
				shader=shader+"scoord=(((spotcoord"+i+".xy)/spotcoord"+i+".w)+1.0)/2.0;\n";
				shader=shader+"if(scoord.x>0.0 && scoord.x<1.0 && scoord.y>0.0 && scoord.y<1.0){\n";
				shader=shader+"dist=texture2D(TEXTURE"+(shadowlights[i])+", scoord);\n";
				if(lights[i].spotSoftness==0){
					shader=shader+"depth = dot(dist, vec4(0.000000059604644775390625,0.0000152587890625,0.00390625,1.0))*"+lights[i].distance+".0;\n";
					shader=shader+"if(depth<length(lightvec"+i+")) spotmul=1.0; else spotmul=0.0;\n";
				}else{
					shader=shader+"m1 = pow(dot(dist, vec4(0.00390625,1.0,0.0,0.0)),2.0);\n";
					shader=shader+"m2 = dot(dist, vec4(0.0,0.0,0.00390625,1.0));\n";		
					shader=shader+"variance = min(max(m1-m2*m2, 0.0) + 0.000002, 1.0);;\n";
					shader=shader+"depth=length(lightvec"+i+")/"+lights[i].distance+".0-m2;\n";	
					shader=shader+"prob=variance /(  variance + depth*depth );\n";
					shader=shader+"prob=smoothstep("+lights[i].spotSoftnessDistance.toFixed(2)+",1.0,prob);\n";
					shader=shader+"if (depth<=0.0) prob=1.0;\n";
					shader=shader+"spotmul=1.0-prob;\n";
				}
				shader=shader+"spotEffect=spotEffect*(1.0-spotmul);\n";
				shader=shader+"spotEffect="+this.translucency.toFixed(2)+"+"+(1-this.translucency).toFixed(2)+"*spotEffect;\n";
				shader=shader+"}\n";
			}
			if(this.translucency==0){
				shader=shader+"dotN=max(dot(normal,normalize(-lightvec)),0.0);\n";
			}else{
				shader=shader+"dotN=dot(normal,normalize(-lightvec));\n";
				shader=shader+"if (dotN<0.0) dotN*=-"+this.translucency.toFixed(2)+";\n";
			}
			
			if(lights[i].negativeShadow){
				shader=shader+"if(dotN>0.0){\n";
				if(lights[i].diffuse){
					shader=shader+"lightvalue -= (1.0-spotEffect) / (lightAttenuation"+i+"[0] + lightAttenuation"+i+"[1] * lightdist"+i+" + lightAttenuation"+i+"[2] * lightdist"+i+" * lightdist"+i+");\n";
				}
				shader=shader+"}\n";
			}else{     
				shader=shader+"att = spotEffect / (lightAttenuation"+i+"[0] + lightdist"+i+"*(lightAttenuation"+i+"[1]  + lightAttenuation"+i+"[2] * lightdist"+i+"));\n";
			
				shader=shader+"if(dotN>0.0){\n";
				if(lights[i].diffuse){
					shader=shader+"lightvalue += att * dotN * lightcolor"+i+";\n";
				}
				shader=shader+"}\n";
				if(lights[i].specular){
				    shader=shader+"specvalue += smoothstep(-specularSmoothStepValue,specularSmoothStepValue,dotN) * att * specC * lightcolor"+i+" * spec  * pow(max(dot(reflect(normalize(lightvec), normal),normalize(viewvec)),0.0), 0.3 * sh);\n";
				}
			}
			
			
			shader=shader+"}\n";
		}
		if(lights[i].type==GLGE.L_DIR){
			if(this.translucency==0){
				shader=shader+"dotN=max(dot(normal,normalize(-lightvec)),0.0);\n";
			}else{
				shader=shader+"dotN=dot(normal,normalize(-lightvec));\n";
				shader=shader+"if (dotN<0.0) dotN*=-"+this.translucency.toFixed(2)+";\n";
			}

			if(lights[i].getCastShadows() && this.shadow){
				shader=shader+"float shadowfact"+i+" = 0.0;\n";
				shader=shader+"scoord=((spotcoord"+i+".xy)/spotcoord"+i+".w+1.0)/2.0;\n";
				var lightWidth=1/lights[i].bufferWidth;
				var lightHeight=1/lights[i].bufferHeight;				
				
				shader=shader+"dist=texture2D(TEXTURE"+shadowlights[i]+", scoord );\n";
				shader=shader+"depth = dot(dist, vec4(0.000000059604644775390625,0.0000152587890625,0.00390625,1.0));\n";
				shader=shader+"d1 = depth;\n";
				shader=shader+"d2 = depth*depth;\n";
				
				shader=shader+"dist=texture2D(TEXTURE"+shadowlights[i]+", scoord+vec2("+(lightWidth).toFixed(5)+","+(lightHeight).toFixed(5)+") );\n";
				shader=shader+"depth = dot(dist, vec4(0.000000059604644775390625,0.0000152587890625,0.00390625,1.0));\n";
				shader=shader+"d1 += depth;\n";
				shader=shader+"d2 += depth*depth;\n";

				shader=shader+"dist=texture2D(TEXTURE"+shadowlights[i]+", scoord+vec2(-"+lightWidth.toFixed(5)+","+lightHeight.toFixed(5)+"));\n";
				shader=shader+"depth = dot(dist, vec4(0.000000059604644775390625,0.0000152587890625,0.00390625,1.0));\n";
				shader=shader+"d1 += depth;\n";
				shader=shader+"d2 += depth*depth;\n";
					
				shader=shader+"dist=texture2D(TEXTURE"+shadowlights[i]+", scoord+vec2("+lightWidth.toFixed(5)+",-"+lightHeight.toFixed(5)+"));\n";
				shader=shader+"depth = dot(dist, vec4(0.000000059604644775390625,0.0000152587890625,0.00390625,1.0));\n";
				shader=shader+"d1 += depth;\n";
				shader=shader+"d2 += depth*depth;\n";
					
				shader=shader+"dist=texture2D(TEXTURE"+shadowlights[i]+", scoord+vec2(-"+lightWidth.toFixed(5)+",-"+lightHeight.toFixed(5)+"));\n";
				shader=shader+"depth = dot(dist, vec4(0.000000059604644775390625,0.0000152587890625,0.00390625,1.0));\n";
				shader=shader+"d1 += depth;\n";
				shader=shader+"d2 += depth*depth;\n";
				
				shader=shader+"d1 *= 0.2;\n";
				shader=shader+"d2 *= 0.2;\n";
					
				shader=shader+"sDepth = max(0.0, ((spotcoord"+i+".z/spotcoord"+i+".w)+1.0)/2.0-d1-"+lights[i].shadowBias+");\n";
				shader=shader+"variance = min(max(d2-d1*d1, 0.0)+"+lights[i].varianceMin+", 1.0);\n";					
				shader=shader+"prob=variance /(  variance + sDepth*sDepth );\n";
				shader=shader+"prob=smoothstep("+lights[i].bleedCutoff.toFixed(2)+",1.0,prob);\n";
				shader=shader+"shadowfact"+i+"=prob;\n";				
			}else{
				shader=shader+"float shadowfact"+i+" = 1.0;\n";
			}
			if(lights[i].diffuse){
				if(lights[i].negativeShadow){
					shader=shader+"lightvalue -= lightcolor"+i+"-(dotN * lightcolor"+i+" * shadowfact"+i+");\n";
				}else{
					shader=shader+"shadowfact"+i+"="+this.translucency.toFixed(2)+"+"+(1-this.translucency).toFixed(2)+"*shadowfact"+i+";\n";
					shader=shader+"lightvalue += dotN * lightcolor"+i+" * shadowfact"+i+";\n";
				}
			}
			if(lights[i].specular){
				shader=shader+"specvalue += smoothstep(-specularSmoothStepValue,specularSmoothStepValue,dotN) * specC * lightcolor"+i+" * spec  * pow(max(dot(reflect(normalize(lightvec), normal),normalize(viewvec)),0.0), 0.3 * sh);\n";
			}
		}
	}
		
	shader=shader+"lightvalue = (lightvalue)*ref;\n";
	
	shader=shader+"vec3 fc=fogcolor.rgb;\n";
	shader=shader+"if(fogtype=="+GLGE.FOG_SKYLINEAR+" || fogtype=="+GLGE.FOG_SKYQUADRATIC+"){";
	shader=shader+"vec4 view=projection * vec4(-eyevec,1.0);\n";
	shader=shader+"vec2 fogCoords=view.xy/view.w*0.5+0.5;\n";
	shader=shader+"fc=texture2D(sky,fogCoords.xy).rgb;\n";
	shader=shader+"}\n";
			
	shader=shader+"vec4 finalColor =vec4(specvalue.rgb+color.rgb*lightvalue.rgb+em.rgb,al)*fogfact+vec4(fc,al)*(1.0-fogfact);\n";
	if(shaderInjection && ~shaderInjection.indexOf("GLGE_FragColor")){
		shader=shader+"finalColor=GLGE_FragColor(finalColor);\n";
	}
	if(this.fadeDistance>0){
		shader=shader+"finalColor.a=finalColor.a*(1.0-min(1.0,"+this.fadeDistance.toFixed(5)+"/length(eyevec)));\n";
	}
	if(this.fadeDistance<0){
		shader=shader+"finalColor.a=finalColor.a*(min(1.0,"+(-this.fadeDistance).toFixed(5)+"/length(eyevec)));\n";
	}
	shader=shader+"gl_FragColor = finalColor;";
	//shader=shader+"gl_FragColor = vec4(color.rgb,1.0);";
	if(GLGE.DEBUGNORMALS) shader=shader+"gl_FragColor = vec4(normal.rgb,1.0);";
	if(GLGE.DEBUGCOORD0) shader=shader+"gl_FragColor = vec4(textureCoords0.rg,0.0,1.0);";


    shader=shader+"}\n"; //end emit pass test
}else{
	shader=shader+"float shadowdepth = gl_FragCoord.z;\n";
	shader=shader+"if(shadowtype) shadowdepth=length(eyevec)/distance;\n";
	shader=shader+"vec4 rgba=fract(shadowdepth * vec4(16777216.0, 65536.0, 256.0, 1.0));\n";
	shader=shader+"gl_FragColor=rgba-rgba.rrgb*vec4(0.0,0.00390625,0.00390625,0.00390625);\n";		
}

    shader=shader+"}\n";

  return shader;
};
/**
* Set the uniforms needed to render this material
* @private
*/
GLGE.Material.prototype.textureUniforms=function(gl,shaderProgram,lights,object){
		  if(this.animation) this.animate();
		  var pc=shaderProgram.caches;

		  if(!pc.baseColor || pc.baseColor.r!=this.color.r || pc.baseColor.g!=this.color.g || pc.baseColor.b!=this.color.b || pc.baseColor.a!=this.color.a){
		    if(!this.ccache || this.ccache.r!=this.color.r || this.ccache.g!=this.color.g || this.ccache.b!=this.color.b || this.ccache.a!=this.color.a){
		      this.ccache=this.color;
		      this.glColor=new Float32Array([this.color.r,this.color.g,this.color.b,this.color.a]);
		    }
		    gl.uniform4fv(GLGE.getUniformLocation(gl,shaderProgram, "baseColor"), this.glColor);
		    pc.baseColor=this.color;
		  }
		  if(pc.specColor!=this.specColor){
		    if(this.sccache!=this.specColor){
		      this.sccache=this.specColor;
		      this.glspecColor=new Float32Array([this.specColor.r,this.specColor.g,this.specColor.b]);
		    }
		    gl.uniform3fv(GLGE.getUniformLocation(gl,shaderProgram, "specColor"), this.glspecColor);
		    pc.specColor=this.specColor;
		  }
		  if(pc.emit!=this.emit){
		    gl.uniform3f(GLGE.getUniformLocation(gl,shaderProgram, "emit"), this.emit.r,this.emit.g,this.emit.b);
		    pc.emit=this.emit;
		  }
		  if(pc.specular!=this.specular){
		    GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "specular"), this.specular);
		    pc.specular=this.specular;
		  }
		  if(pc.shine!=this.shine){
		    GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "shine"), this.shine);
		    pc.shine=this.shine;
		  }
		  if(pc.reflect!=this.reflect){
		    GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "reflective"), this.reflect);
		    pc.reflect=this.reflect;
		  }
		  if(pc.alpha!=this.alpha){
		    GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "alpha"), this.alpha);
		    pc.alpha=this.alpha;
		  }
		  if(pc.shadeless==undefined || pc.shadeless!=this.shadeless){
		    GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,shaderProgram, "shadeless"), this.shadeless);
		    pc.shadeless=this.shadeless;
		  }



		  /*
		  if(this.ambient && pc.ambient!=this.ambient){
		    gl.uniform3fv(GLGE.getUniformLocation(gl,shaderProgram, "amb"), new Float32Array([this.ambient.r,this.ambient.g,this.ambient.b]));
		    pc.ambient=this.ambient;
		  }
		  */
		  var cnt=1;
		  var num=0;
		  if(!pc["lightcolor"]){
		    pc["lightcolor"]=[];
		    pc["lightAttenuation"]=[];
		    pc["spotCosCutOff"]=[];
		    pc["spotExponent"]=[];
		    pc["shadowbias"]=[];
		    pc["castshadows"]=[];
		    pc["shadowsamples"]=[];
		    pc["shadowsoftness"]=[];
		  }
		  if(lights){
			  for(var i=0; i<lights.length;i++){
			      if(lights[i].type==GLGE.L_OFF) continue;
			    if(pc["lightcolor"][i]!=lights[i].color){
			      GLGE.setUniform3(gl,"3f",GLGE.getUniformLocation(gl,shaderProgram, "lightcolor"+i), lights[i].color.r,lights[i].color.g,lights[i].color.b);
			      pc["lightcolor"][i]= { r: lights[i].color.r, g: lights[i].color.g, b: lights[i].color.b };
			    }
			    if(pc["lightAttenuation"][i]!=lights[i].constantAttenuation){
			      GLGE.setUniform3(gl,"3f",GLGE.getUniformLocation(gl,shaderProgram, "lightAttenuation"+i), lights[i].constantAttenuation,lights[i].linearAttenuation,lights[i].quadraticAttenuation);
			      pc["lightAttenuation"][i]=lights[i].constantAttenuation;
			    }
			    if(pc["spotCosCutOff"][i]!=lights[i].spotCosCutOff){
			      GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "spotCosCutOff"+i), lights[i].spotCosCutOff);
			      pc["spotCosCutOff"][i]=lights[i].spotCosCutOff;
			    }
			    if(pc["spotExponent"][i]!=lights[i].spotExponent){
			      GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "spotExp"+i), lights[i].spotExponent);
			      pc["spotExponent"][i]=lights[i].spotExponent;

			    }
			    if(pc["shadowbias"][i]!=lights[i].shadowBias){
			      GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "shadowbias"+i), lights[i].shadowBias);
			      pc["shadowbias"][i]=lights[i].shadowBias;
			    }
			    if(pc["shadowsoftness"][i]!=lights[i].softness){
			      GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "shadowsoftness"+i), lights[i].softness);
			      pc["shadowsoftness"][i]=lights[i].softness;
			    }

			    //shadow code
			    if(lights[i].getCastShadows() && this.shadow) {
			      num=this.textures.length+(cnt++);
			      gl.activeTexture(gl["TEXTURE"+num]);
			      gl.bindTexture(gl.TEXTURE_2D, lights[i].texture);
			      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			      GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,shaderProgram, "TEXTURE"+num), num);
			    }


			  }
		}
		  if(!shaderProgram.glarrays.layermat) shaderProgram.glarrays.layermat=[];



		  var scale,offset;
		  for(i=0; i<this.layers.length;i++){
		    if(this.layers[i].animation) this.layers[i].animate();
		    scale=this.layers[i].getScale();
		    offset=this.layers[i].getOffset();
		    if(!shaderProgram.glarrays.layermat[i]) shaderProgram.glarrays.layermat[i]=new Float32Array(this.layers[i].getMatrix());
		      else GLGE.mat4gl(this.layers[i].getMatrix(),shaderProgram.glarrays.layermat[i]);

		    try{GLGE.setUniformMatrix(gl,"Matrix4fv",GLGE.getUniformLocation(gl,shaderProgram, "layer"+i+"Matrix"), true, shaderProgram.glarrays.layermat[i]);}catch(e){}

		    GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "layeralpha"+i), this.layers[i].getAlpha());
		    GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,shaderProgram, "layerheight"+i), this.layers[i].getHeight());
		  }

		  for(var i=0; i<this.textures.length;i++){
		    gl.activeTexture(gl["TEXTURE"+(i+1)]);

		    if(this.textures[i].doTexture(gl,object)){
		    }

		    GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,shaderProgram, "TEXTURE"+i), i+1);
		  }

		  if(gl.scene.skyTexture){
		    gl.activeTexture(gl["TEXTURE0"]);

		    gl.bindTexture(gl.TEXTURE_2D, gl.scene.skyTexture);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

		    GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,shaderProgram, "sky"), 0);
		  }
};

/**
* Adds a new texture to this material
* @returns {boolean} true if all resources have loaded false otherwise
*/
GLGE.Material.prototype.isComplete=function(){
    for(var i=0;i<this.textures.length;i++){
        if(!this.textures[i].isComplete) continue;
        if(!this.textures[i].isComplete()) return false;
    }
    return true;
}

/**
* Adds a new texture to this material
* @param {String} image URL of the image to be used by the texture
* @return {Number} index of the new texture
*/
GLGE.Material.prototype.addTexture=function(texture){
  if(typeof texture=="string")  texture=GLGE.Assets.get(texture);
    var material=this;
    texture.addEventListener("downloadComplete",function(){
        if(material.isComplete()) material.fireEvent("downloadComplete");
    });
  this.textures.push(texture);

  texture.idx=this.textures.length-1;
  this.fireEvent("shaderupdate",{});
  return this;
};
GLGE.Material.prototype.addTextureCube=GLGE.Material.prototype.addTexture;
GLGE.Material.prototype.addTextureCamera=GLGE.Material.prototype.addTexture;
GLGE.Material.prototype.addTextureCameraCube=GLGE.Material.prototype.addTexture;
GLGE.Material.prototype.addTextureCanvas=GLGE.Material.prototype.addTexture;
GLGE.Material.prototype.addTextureVideo=GLGE.Material.prototype.addTexture;

GLGE.DEFAULT_MATERIAL=new GLGE.Material();


})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_materiallayer.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){




/**
* @class The material layer describes how to apply this layer to the material
* @see GLGE.Material
* @augments GLGE.Animatable
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
* @augments GLGE.Events
*/
GLGE.MaterialLayer=function(uid){
	this.blendMode=GLGE.BL_MIX;
	GLGE.Assets.registerAsset(this,uid);
};
GLGE.augment(GLGE.Animatable,GLGE.MaterialLayer);
GLGE.augment(GLGE.QuickNotation,GLGE.MaterialLayer);
GLGE.augment(GLGE.JSONLoader,GLGE.MaterialLayer);
GLGE.augment(GLGE.Events,GLGE.MaterialLayer);
/**
 * @name GLGE.MaterialLayer#shaderupdated
 * @event Fires when a change will result in a change to the GLSL shader
 * @param {object} data
 */
 
GLGE.MaterialLayer.prototype.className="MaterialLayer";
GLGE.MaterialLayer.prototype.texture=null;
GLGE.MaterialLayer.prototype.blendMode=null;
GLGE.MaterialLayer.prototype.mapto=GLGE.M_COLOR;
GLGE.MaterialLayer.prototype.mapinput=GLGE.UV1;
GLGE.MaterialLayer.prototype.scaleX=1;
GLGE.MaterialLayer.prototype.offsetX=0;
GLGE.MaterialLayer.prototype.rotX=0;
GLGE.MaterialLayer.prototype.scaleY=1;
GLGE.MaterialLayer.prototype.offsetY=0;
GLGE.MaterialLayer.prototype.rotY=0;
GLGE.MaterialLayer.prototype.scaleZ=1;
GLGE.MaterialLayer.prototype.offsetZ=0;
GLGE.MaterialLayer.prototype.rotZ=0;
GLGE.MaterialLayer.prototype.dScaleX=0;
GLGE.MaterialLayer.prototype.dOffsetX=0;
GLGE.MaterialLayer.prototype.dRotX=0;
GLGE.MaterialLayer.prototype.dScaleY=0;
GLGE.MaterialLayer.prototype.dOffsetY=0;
GLGE.MaterialLayer.prototype.dRotY=0;
GLGE.MaterialLayer.prototype.dScaleZ=0;
GLGE.MaterialLayer.prototype.dOffsetZ=0;
GLGE.MaterialLayer.prototype.dRotZ=0;
GLGE.MaterialLayer.prototype.alpha=1;
GLGE.MaterialLayer.prototype.height=0.05;
GLGE.MaterialLayer.prototype.matrix=null;

/**
* Gets the textures used by the layer
* @return {GLGE.Texture} The current shininess of the material
*/
GLGE.MaterialLayer.prototype.getMatrix=function(){
	if(!this.matrix){
		var offset=this.getOffset();
		var scale=this.getScale();
		var rotation=this.getRotation();
		this.matrix=GLGE.mulMat4(GLGE.mulMat4(GLGE.translateMatrix(offset.x,offset.y,offset.z),GLGE.scaleMatrix(scale.x,scale.y,scale.z)),GLGE.rotateMatrix(rotation.x,rotation.y,rotation.z));
	}
	return this.matrix;
};
/**
* Sets the height for this layer, currently only used for parallax mapping
* @param {number} the height of this layer
*/
GLGE.MaterialLayer.prototype.setHeight=function(value){
	this.height=value;
	return this;
};
/**
* Gets the height for this layer, currently only used for parallax mapping
* @return {number} the height of this layer
*/
GLGE.MaterialLayer.prototype.getHeight=function(){
	return this.height;
};

/**
* Sets the textures alpha blending value
* @param {number} the alpha for this layer
*/
GLGE.MaterialLayer.prototype.setAlpha=function(value){
	this.alpha=value;
	return this;
};
/**
* Gets the textures alpha blending value
* @return {number} the alpha for this layer
*/
GLGE.MaterialLayer.prototype.getAlpha=function(){
	return this.alpha;
};

/**
* Sets the textures used by the layer
* @param {GLGE.Texture} value the teture to associate with this layer
*/
GLGE.MaterialLayer.prototype.setTexture=function(value){
	if(typeof value=="string")  value=GLGE.Assets.get(value);
	this.texture=value;
	this.fireEvent("shaderupdate",{});
	return this;
};
/**
* Gets the textures used by the layer
* @return {GLGE.Texture} The current shininess of the material
*/
GLGE.MaterialLayer.prototype.getTexture=function(){
	return this.texture;
};
/**
* Sets the flag for how this layer maps to the material
* @param {Number} value the flags to set for this layer
*/
GLGE.MaterialLayer.prototype.setMapto=function(value){
	this.mapto=value;
	this.fireEvent("shaderupdate",{});
	return this;
};
/**
* Gets the flag representing the way the layer maps to the material
* @return {Number} The flags currently set for this layer
*/
GLGE.MaterialLayer.prototype.getMapto=function(){
	return this.mapto;
};
/**
* Sets the texture coordinate system
* @param {Number} value the mapping to use
*/
GLGE.MaterialLayer.prototype.setMapinput=function(value){
	this.mapinput=value;
	this.fireEvent("shaderupdate",{});
	return this;
};
/**
* Gets the texture coordinate system
* @return {Number} The current mapping
*/
GLGE.MaterialLayer.prototype.getMapinput=function(){
	return this.mapinput;
};

/**
* Gets the layers texture offset
* @return {object} the current offset
*/
GLGE.MaterialLayer.prototype.getOffset=function(){
	var offset={};
	offset.x=parseFloat(this.getOffsetX())+parseFloat(this.getDOffsetX());
	offset.y=parseFloat(this.getOffsetY())+parseFloat(this.getDOffsetY());
	offset.z=parseFloat(this.getOffsetZ())+parseFloat(this.getDOffsetZ());
	return offset;
};

/**
* Gets the layers texture rotation
* @return {object} the current rotation
*/
GLGE.MaterialLayer.prototype.getRotation=function(){
	var rotation={};
	rotation.x=parseFloat(this.getRotX())+parseFloat(this.getDRotX());
	rotation.y=parseFloat(this.getRotY())+parseFloat(this.getDRotY());
	rotation.z=parseFloat(this.getRotZ())+parseFloat(this.getDRotZ());
	return rotation;
};

/**
* Gets the layers texture scale
* @return {object} the current scale
*/
GLGE.MaterialLayer.prototype.getScale=function(){
	var scale={};
	scale.x=parseFloat(this.getScaleX())+parseFloat(this.getDScaleX());
	scale.y=parseFloat(this.getScaleY())+parseFloat(this.getDScaleY());
	scale.z=parseFloat(this.getScaleZ())+parseFloat(this.getDScaleZ());
	return scale;
};

/**
* Sets the layers texture X offset
* @param {Number} value the amount to offset the texture
*/
GLGE.MaterialLayer.prototype.setOffsetX=function(value){
	this.matrix=null;
	this.offsetX=value;
	return this;
};
/**
* Gets the layers texture X offset
* @return {Number} the current offset
*/
GLGE.MaterialLayer.prototype.getOffsetX=function(){
	return this.offsetX;
};
/**
* Sets the layers texture Y offset
* @param {Number} value the amount to offset the texture
*/
GLGE.MaterialLayer.prototype.setOffsetY=function(value){
	this.matrix=null;
	this.offsetY=value;
	return this;
};
/**
* Gets the layers texture Y offset
* @return {Number} the current offset
*/
GLGE.MaterialLayer.prototype.getOffsetY=function(){
	return this.offsetY;
};
/**
* Sets the layers texture Z offset
* @param {Number} value the amount to offset the texture
*/
GLGE.MaterialLayer.prototype.setOffsetZ=function(value){
	this.matrix=null;
	this.offsetZ=value;
	return this;
};
/**
* Gets the layers texture Z offset
* @return {Number} the current offset
*/
GLGE.MaterialLayer.prototype.getOffsetZ=function(){
	return this.offsetZ;
};
/**
* Sets the layers texture X displacment offset, useful for animation
* @param {Number} value the amount to offset the texture
*/
GLGE.MaterialLayer.prototype.setDOffsetX=function(value){
	this.matrix=null;
	this.dOffsetX=value;
	return this;
};
/**
* Gets the layers texture X displacment offset, useful for animation
* @return {Number} the current offset
*/
GLGE.MaterialLayer.prototype.getDOffsetX=function(){
	return this.dOffsetX;
};
/**
* Sets the layers texture Y displacment offset, useful for animation
* @param {Number} value the amount to offset the texture
*/
GLGE.MaterialLayer.prototype.setDOffsetY=function(value){
	this.matrix=null;
	this.dOffsetY=value;
	return this;
};
/**
* Gets the layers texture Y displacment offset, useful for animation
* @return {Number} the current offset
*/
GLGE.MaterialLayer.prototype.getDOffsetY=function(){
	return this.dOffsetY;
};
/**
* Sets the layers texture Z displacment offset, useful for animation
* @param {Number} value the amount to offset the texture
*/
GLGE.MaterialLayer.prototype.setDOffsetZ=function(value){
	this.matrix=null;
	this.dOffsetZ=value;
	return this;
};
/**
* Gets the layers texture X displacment offset, useful for animation
* @return {Number} the current offset
*/
GLGE.MaterialLayer.prototype.getDOffsetZ=function(){
	return this.dOffsetZ;
};
/**
* Sets the layers texture X scale
* @param {Number} value the amount to scale the texture
*/
GLGE.MaterialLayer.prototype.setScaleX=function(value){
	this.matrix=null;
	this.scaleX=value;
	return this;
};
/**
* Gets the layers texture X scale
* @return {Number} the current scale
*/
GLGE.MaterialLayer.prototype.getScaleX=function(){
	return this.scaleX;
};
/**
* Sets the layers texture Y scale
* @param {Number} value the amount to scale the texture
*/
GLGE.MaterialLayer.prototype.setScaleY=function(value){
	this.matrix=null;
	this.scaleY=value;
	return this;
};
/**
* Gets the layers texture Y scale
* @return {Number} the current scale
*/
GLGE.MaterialLayer.prototype.getScaleY=function(){
	return this.scaleY;
};
/**
* Sets the layers texture Z scale
* @param {Number} value the amount to scale the texture
*/
GLGE.MaterialLayer.prototype.setScaleZ=function(value){
	this.matrix=null;
	this.scaleZ=value;
	return this;
};
/**
* Gets the layers texture Z offset
* @return {Number} the current offset
*/
GLGE.MaterialLayer.prototype.getScaleZ=function(){
	return this.scaleZ;
};
/**
* Sets the layers texture X displacment scale, useful for animation
* @param {Number} value the amount to scale the texture
*/
GLGE.MaterialLayer.prototype.setDScaleX=function(value){
	this.matrix=null;
	this.dScaleX=value;
	return this;
};
/**
* Gets the layers texture X displacment scale, useful for animation
* @return {Number} the current scale
*/
GLGE.MaterialLayer.prototype.getDScaleX=function(){
	return this.dScaleX;
};
/**
* Sets the layers texture Y displacment scale, useful for animation
* @param {Number} value the amount to scale the texture
*/
GLGE.MaterialLayer.prototype.setDScaleY=function(value){
	this.matrix=null;
	this.dScaleY=value;
	return this;
};
/**
* Gets the layers texture Y displacment scale, useful for animation
* @return {Number} the current scale
*/
GLGE.MaterialLayer.prototype.getDScaleY=function(){
	return this.dScaleY;
};
/**
* Sets the layers texture Z displacment scale, useful for animation
* @param {Number} value the amount to scale the texture
*/
GLGE.MaterialLayer.prototype.setDScaleZ=function(value){
	this.matrix=null;
	this.dScaleZ=value;
	return this;
};
/**
* Gets the layers texture X displacment scale, useful for animation
* @return {Number} the current scale
*/
GLGE.MaterialLayer.prototype.getDScaleZ=function(){
	return this.dScaleZ;
};


/**
* Sets the layers texture X Rotation
* @param {Number} value the amount to roate the texture
*/
GLGE.MaterialLayer.prototype.setRotX=function(value){
	this.matrix=null;
	this.rotX=value;
	return this;
};
/**
* Gets the layers texture X rotate
* @return {Number} the current rotate
*/
GLGE.MaterialLayer.prototype.getRotX=function(){
	return this.rotX;
};
/**
* Sets the layers texture Y rotate
* @param {Number} value the amount to rotate the texture
*/
GLGE.MaterialLayer.prototype.setRotY=function(value){
	this.matrix=null;
	this.rotY=value;
	return this;
};
/**
* Gets the layers texture Y rotate
* @return {Number} the current rotate
*/
GLGE.MaterialLayer.prototype.getRotY=function(){
	return this.rotY;
};
/**
* Sets the layers texture Z rotate
* @param {Number} value the amount to rotate the texture
*/
GLGE.MaterialLayer.prototype.setRotZ=function(value){
	this.matrix=null;
	this.rotZ=value;
	return this;
};
/**
* Gets the layers texture Z rotate
* @return {Number} the current rotate
*/
GLGE.MaterialLayer.prototype.getRotZ=function(){
	return this.rotZ;
};
/**
* Sets the layers texture X displacment rotation, useful for animation
* @param {Number} value the amount to rotation the texture
*/
GLGE.MaterialLayer.prototype.setDRotX=function(value){
	this.matrix=null;
	this.dRotX=value;
	return this;
};
/**
* Gets the layers texture X displacment rotation, useful for animation
* @return {Number} the current rotation
*/
GLGE.MaterialLayer.prototype.getDRotX=function(){
	return this.dRotX;
};
/**
* Sets the layers texture Y displacment rotation, useful for animation
* @param {Number} value the amount to rotaion the texture
*/
GLGE.MaterialLayer.prototype.setDRotY=function(value){
	this.matrix=null;
	this.dRotY=value;
	return this;
};
/**
* Gets the layers texture Y displacment rotation, useful for animation
* @return {Number} the current rotation
*/
GLGE.MaterialLayer.prototype.getDRotY=function(){
	return this.dRotY;
};
/**
* Sets the layers texture Z displacment rotation, useful for animation
* @param {Number} value the amount to rotation the texture
*/
GLGE.MaterialLayer.prototype.setDRotZ=function(value){
	this.matrix=null;
	this.dRotZ=value;
	return this;
};
/**
* Gets the layers texture X displacment rotation, useful for animation
* @return {Number} the current rotation
*/
GLGE.MaterialLayer.prototype.getDRotZ=function(){
	return this.dRotZ;
};

/**
* Sets the layers blending mode
* @param {Number} value the blend mode for the layer
*/
GLGE.MaterialLayer.prototype.setBlendMode=function(value){
	this.blendMode=value;
	this.fireEvent("shaderupdate",{});
	return this;
};
/**
* Gets the layers tblending mode
* @return {Number} the blend mode for the layer
*/
GLGE.MaterialLayer.prototype.getBlendMode=function(){
	return this.blendMode;
};



})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_multimaterial.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){

/**
* @name GLGE.MultiMaterial#downloadComplete
* @event fires when all the assets for this class have finished loading
* @param {object} data
*/

/**
* @class Creates a new mesh/material to add to an object
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
* @augments GLGE.Events
*/
GLGE.MultiMaterial=function(uid){
    var multiMaterial=this;
    this.downloadComplete=function(){
        if(multiMaterial.isComplete()) multiMaterial.fireEvent("downloadComplete");
    }
    this.boundUpdate=function(){
        multiMaterial.fireEvent("boundupdate");
    }
	this.lods=[new GLGE.ObjectLod];
    this.lods[0].addEventListener("downloadComplete",this.downloadComplete);
    this.lods[0].addEventListener("boundupdate",this.boundUpdate);
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.QuickNotation,GLGE.MultiMaterial);
GLGE.augment(GLGE.JSONLoader,GLGE.MultiMaterial);
GLGE.augment(GLGE.Events,GLGE.MultiMaterial);
GLGE.MultiMaterial.prototype.className="MultiMaterial";
GLGE.MultiMaterial.prototype.oneLod=true;


/**
* Checks  if resources have finished downloading
* @returns {boolean}
*/
GLGE.MultiMaterial.prototype.isComplete=function(){
    for(var i=0;i<this.lods.length;i++){
        if(!this.lods[i].isComplete()) return false;
    }
    return true;
}

/**
* sets the mesh
* @param {GLGE.Mesh} mesh 
*/
GLGE.MultiMaterial.prototype.setMesh=function(mesh){
	this.lods[0].setMesh(mesh);
	return this;
}
/**
* gets the mesh
* @returns {GLGE.Mesh}
*/
GLGE.MultiMaterial.prototype.getMesh=function(){
	return this.lods[0].getMesh();
}
/**
* sets the material
* @param {GLGE.Material} material 
*/
GLGE.MultiMaterial.prototype.setMaterial=function(material){
	this.lods[0].setMaterial(material);
	return this;
}
/**
* gets the material
* @returns {GLGE.Material}
*/
GLGE.MultiMaterial.prototype.getMaterial=function(){
	return this.lods[0].getMaterial();
}

/**
* returns the load for a given pixel size
* @param {number} pixelsize the current pixel size of the object
* @returns {GLGE.ObjectLod}
*/
GLGE.MultiMaterial.prototype.getLOD=function(pixelsize){
	var currentSize=0;
	var currentLOD=this.lods[0];
	if(this.lods.length>1){
		for(var i=1; i<this.lods.length;i++){
			var size=this.lods[i].pixelSize;
			if(size>currentSize && size<pixelsize && this.lods[i].mesh && this.lods[i].mesh.loaded){
				currentSize=size;
				currentLOD=this.lods[i];
			}
		}
	}
	return currentLOD;
}

/**
* adds a lod to this multimaterial
* @param {GLGE.ObjectLod} lod the lod to add
*/
GLGE.MultiMaterial.prototype.addObjectLod=function(lod){
	if(this.oneLod){
		this.oneLod=false;
		this.lods=[];
	}
	this.lods.push(lod);
    lod.addEventListener("downloadComplete",this.downloadComplete);
	return this;
}

/**
* Updates the GL shader program for the object
* @private
*/
GLGE.MultiMaterial.prototype.updateProgram=function(){
	for(var i=0; i<this.lods.length;i++){
		this.lods[i].GLShaderProgram=null;
	}
	return this;
}


/**
* removes a lod to this multimaterial
* @param {GLGE.ObjectLod} lod the lod to remove
*/
GLGE.MultiMaterial.prototype.removeObjectLod=function(lod){
	var idx=this.lods.indexOf(lod);
    lods[idx].removeEventListener("downloadComplete",this.downloadComplete);
	if(idx) this.lods.splice(idx,1);
	return this;
}



})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_texture.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){



/**
* @name GLGE.Texture#downloadComplete
* @event fires when all the assets for this texture have finished loading
* @param {object} data
*/



/**
* @class A texture to be included in a material
* @param {string} uid the unique id for this texture
* @see GLGE.Material
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
* @augments GLGE.Events
*/
GLGE.Texture=function(uid){
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.QuickNotation,GLGE.Texture);
GLGE.augment(GLGE.JSONLoader,GLGE.Texture);
GLGE.augment(GLGE.Events,GLGE.Texture);
GLGE.Texture.prototype.className="Texture";
GLGE.Texture.prototype.image=null;
GLGE.Texture.prototype.glTexture=null;
GLGE.Texture.prototype.url=null;
GLGE.Texture.prototype.state=0;
GLGE.Texture.prototype.anisotropy=8;
GLGE.Texture.prototype.preAlpha=true;

/**
* Gets the pre multiply alpha flag
* @return {string}  the pre multiply alpha flag
*/
GLGE.Texture.prototype.getPreMuliplyAlpha=function(){
	return this.preAlpha;
};

/**
* Sets the pre multiply alpha flag
* @param {string} pre the pre multiply alpha flag
*/
GLGE.Texture.prototype.setPreMuliplyAlpha=function(pre){
	this.preAlpha=pre;
	return this;
};

/**
* Gets the textures used by the layer
* @return {string} The textures image url
*/
GLGE.Texture.prototype.getSrc=function(){
	return this.url;
};

/**
* Sets the textures image location
* @param {string} url the texture image url
*/
GLGE.Texture.prototype.setSrc=function(url){
	this.url=url;
	this.state=0;
	this.image=new Image();
	var texture=this;
	this.image.onload = function(){
		texture.state=1;
    	texture.fireEvent("downloadComplete");
	}	
	this.image.src=url;	
	if(this.glTexture && this.gl){
		this.glTexture=null;
	}
	return this;
};

/**
* Sets the textures image location
* @private
**/
GLGE.Texture.prototype.doTexture=function(gl){
	this.gl=gl;
	if(!gl.urlTextures) gl.urlTextures={};
	if(gl.urlTextures[this.url]){
		this.glTexture=gl.urlTextures[this.url];
		this.state=2;
	}
	//create the texture if it's not already created
	if(!this.image) this.setSrc(this.url);
	if(!this.glTexture) this.glTexture=gl.createTexture();
	//if the image is loaded then set in the texture data
	if(this.state==1){
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		//START... FRANCISCO REIS: to accept Non Power of Two Images
		var w = Math.pow( 2, Math.round( Math.log( this.image.width ) / Math.log( 2 ) ) );
		var h = Math.pow( 2, Math.round( Math.log( this.image.height ) / Math.log( 2 ) ) );

		var imageOrCanvas;
		if(w == this.image.width && h == this.image.height)
			imageOrCanvas = this.image;
		else
		{
			imageOrCanvas = document.createElement("canvas");
			imageOrCanvas.width=w;
			imageOrCanvas.height=h;
			var context = imageOrCanvas.getContext("2d");
			context.drawImage(this.image,0,0,w,h);
		}

		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,imageOrCanvas);//this line was replaced from ",this.image)" to ",imageOrCanvas)"
		//...END FRANCISCO REIS: to accept Non Power of Two Images
		gl.urlTextures[this.url]=this.glTexture;
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.state=2;
	}
	if(this.state==2){
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		if(this.preAlpha){
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 1);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		if(gl.af) gl.texParameterf(gl.TEXTURE_2D, gl.af.TEXTURE_MAX_ANISOTROPY_EXT, this.anisotropy);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
	}else{
		gl.bindTexture(gl.TEXTURE_2D, null);
	}
	if(this.state==2) return true;
		else return false;
}


/**
* Determin if the image resource has been downloaded
**/
GLGE.Texture.prototype.isComplete=function(){
    return this.state>0;
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_texturecamera.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){






/**
* @class A reflection texture will reflect in a plane for a specified transform
* @param {string} uid the unique id for this texture
* @see GLGE.Material
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.TextureCamera=function(uid){
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.QuickNotation,GLGE.TextureCamera);
GLGE.augment(GLGE.JSONLoader,GLGE.TextureCamera);
GLGE.augment(GLGE.Events,GLGE.TextureCamera);
GLGE.TextureCamera.prototype.className="Texture";
GLGE.TextureCamera.prototype.texture=null;
GLGE.TextureCamera.prototype.glTexture=null;
GLGE.TextureCamera.prototype.object=null;
GLGE.TextureCamera.prototype.camera=null;
GLGE.TextureCamera.prototype.bufferHeight=0;
GLGE.TextureCamera.prototype.bufferWidth=0;
GLGE.TextureCamera.prototype.planeOffset=0;
GLGE.TextureCamera.prototype.mirrorAxis=GLGE.NONE;
GLGE.TextureCamera.prototype.clipAxis=GLGE.NONE;
GLGE.TextureCamera.prototype.autoUpdate=true;
GLGE.TextureCamera.prototype.rendered=false;

/**
* Forces an update of the cube map texture
**/
GLGE.TextureCamera.prototype.render=function(){
	this.rendered=false;
	return this;
}

/**
* set the auto update flag
* @param {number} buffer width
**/
GLGE.TextureCamera.prototype.setAutoUpdate=function(auto){
	this.autoUpdate=auto;
	return this;
}
/**
* gets the auto update flag
* @returns the width
**/
GLGE.TextureCamera.prototype.getAutoUpdate=function(){
	return this.autoUpdate;
}


/**
* sets the RTT  render clipping plane offset
* @param {number} buffer width
**/
GLGE.TextureCamera.prototype.setPlaneOffset=function(planeoffset){
	this.planeOffset=planeoffset;
	return this;
}
/**
* gets the RTT  render clipping plane offset
* @returns the width
**/
GLGE.TextureCamera.prototype.getPlaneOffset=function(){
	return this.planeOffset;
}


/**
* sets the RTT  render buffer width
* @param {number} buffer width
**/
GLGE.TextureCamera.prototype.setBufferWidth=function(width){
	this.bufferWidth=width;
	this.update=true;
	return this;
}
/**
* gets the RTT  render buffer width
* @returns the width
**/
GLGE.TextureCamera.prototype.getBufferWidth=function(){
	return this.bufferWidth;
}

/**
* sets the RTT  render buffer height
* @param {number} buffer height
**/
GLGE.TextureCamera.prototype.setBufferHeight=function(height){
	this.bufferHeight=height;
	this.update=true;
	return this;
}
/**
* gets the RTT  render buffer height
* @returns the height
**/
GLGE.TextureCamera.prototype.getBufferHeight=function(){
	return this.bufferHeight;
}

/**
* sets the RTT  clip axis
* @param {number} the axis
**/
GLGE.TextureCamera.prototype.setClipAxis=function(camera){
	this.clipAxis=camera;
	return this;
}
/**
* gets the RTT clip axis
* @returns the axis
**/
GLGE.TextureCamera.prototype.getClipAxis=function(){
	return this.clipAxis;
}

/**
* sets the RTT  mirror axis
* @param {number} the axis
**/
GLGE.TextureCamera.prototype.setMirrorAxis=function(camera){
	this.mirrorAxis=camera;
	return this;
}
/**
* gets the RTT mirror axis
* @returns the axis
**/
GLGE.TextureCamera.prototype.getMirrorAxis=function(){
	return this.mirrorAxis;
}

/**
* sets the RTT camera to use
* @param {GLGE.Camera} the source camera
**/
GLGE.TextureCamera.prototype.setCamera=function(camera){
	this.camera=camera;
	return this;
}
/**
* gets the RTT source camera
* @returns {GLGE.Camera} the source camera
**/
GLGE.TextureCamera.prototype.getCamera=function(){
	return this.camera;
}

/**
* does what is needed to get the texture
* @private
**/
GLGE.TextureCamera.prototype.doTexture=function(gl,object){
	if(this.camera){
		if(this.autoRender || !this.rendered || true){
			this.rendered=true;
			this.gl=gl;
			var modelmatrix=object.getModelMatrix();
			var tpmat=this.camera.pMatrix;
			var tbmat=this.camera.matrix;
			this.camera.pMatrix=null;
			this.camera.matrix=null;
			var pmatrix=this.camera.getProjectionMatrix().slice(0);
			var cameramatrix=this.camera.getViewMatrix().slice(0);
			this.camera.pMatrix=tpmat;
			this.camera.matrix=tbmat;
			
			var matrix;
			
			if(this.mirrorAxis){
				switch(this.mirrorAxis){
					case GLGE.XAXIS:
						matrix=GLGE.mulMat4(GLGE.mulMat4(GLGE.mulMat4(cameramatrix,modelmatrix),GLGE.scaleMatrix(-1,1,1)),GLGE.inverseMat4(modelmatrix));
					break;
					case GLGE.YAXIS:
						matrix=GLGE.mulMat4(GLGE.mulMat4(GLGE.mulMat4(cameramatrix,modelmatrix),GLGE.scaleMatrix(1,-1,1)),GLGE.inverseMat4(modelmatrix));
					break;
					case GLGE.ZAXIS:
						matrix=GLGE.mulMat4(GLGE.mulMat4(GLGE.mulMat4(cameramatrix,modelmatrix),GLGE.scaleMatrix(1,1,-1)),GLGE.inverseMat4(modelmatrix));
					break;
				}
			}else{
				matrix=cameramatrix;
			}
			
			if(this.clipAxis){
				var clipplane
				switch(this.clipAxis){
					case GLGE.NEG_XAXIS:
						var dirnorm=GLGE.toUnitVec3([-modelmatrix[0],-modelmatrix[4],-modelmatrix[8]]);
						clipplane=[dirnorm[0],dirnorm[1],dirnorm[2],-GLGE.dotVec3([modelmatrix[3],modelmatrix[7],modelmatrix[11]],dirnorm)-this.planeOffset];
						break;
					case GLGE.POS_XAXIS:
						var dirnorm=GLGE.toUnitVec3([modelmatrix[0],modelmatrix[4],modelmatrix[8]]);
						clipplane=[dirnorm[0],dirnorm[1],dirnorm[2],-GLGE.dotVec3([modelmatrix[3],modelmatrix[7],modelmatrix[11]],dirnorm)-this.planeOffset];
						break;
					case GLGE.NEG_YAXIS:
						var dirnorm=GLGE.toUnitVec3([-modelmatrix[1],-modelmatrix[5],-modelmatrix[9]]);
						clipplane=[dirnorm[0],dirnorm[1],dirnorm[2],-GLGE.dotVec3([modelmatrix[3],modelmatrix[7],modelmatrix[11]],dirnorm)-this.planeOffset];
						break;
					case GLGE.POS_YAXIS:
						var dirnorm=GLGE.toUnitVec3([modelmatrix[1],modelmatrix[5],modelmatrix[9]]);
						clipplane=[dirnorm[0],dirnorm[1],dirnorm[2],-GLGE.dotVec3([modelmatrix[3],modelmatrix[7],modelmatrix[11]],dirnorm)-this.planeOffset];
						break;
					case GLGE.NEG_ZAXIS:
						var dirnorm=GLGE.toUnitVec3([-modelmatrix[2],-modelmatrix[6],-modelmatrix[10]]);
						clipplane=[dirnorm[0],dirnorm[1],dirnorm[2],-GLGE.dotVec3([modelmatrix[3],modelmatrix[7],modelmatrix[11]],dirnorm)-this.planeOffset];
						break;
					case GLGE.POS_ZAXIS:
						var dirnorm=GLGE.toUnitVec3([modelmatrix[2],modelmatrix[6],modelmatrix[10]]);
						clipplane=[dirnorm[0],dirnorm[1],dirnorm[2],-GLGE.dotVec3([modelmatrix[3],modelmatrix[7],modelmatrix[11]],dirnorm)-this.planeOffset];
						break;
				}
				
				
				
				var itmvp=GLGE.transposeMat4(GLGE.inverseMat4(GLGE.mulMat4(pmatrix,matrix)));

				clipplane=GLGE.mulMat4Vec4(itmvp,clipplane);
				clipplane=GLGE.scaleVec4(clipplane,pmatrix[10]);
				clipplane[3] -= 1;
				if(clipplane[2]<0) GLGE.scaleVec4(clipplane,-1);
				var suffix=[ 1,0,0,0,
						0,1,0,0,
						clipplane[0],clipplane[1],clipplane[2],clipplane[3],
						0,0,0,1];
				pmatrix=GLGE.mulMat4(suffix,pmatrix);
				
			}
			var height=(!this.bufferHeight ? gl.scene.renderer.canvas.height : this.bufferHeight);
			var width=(!this.bufferWidth ? gl.scene.renderer.canvas.width : this.bufferWidth);

			//create the texture if it's not already created
			if(!this.glTexture || this.update){
				this.createFrameBuffer(gl);
				gl.scene.addRenderPass(this.frameBuffer,matrix, gl.scene.camera.getProjectionMatrix(),width,height,object, this.mirrorAxis ? true : false);
				gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
				this.update=false;
				return false;
			}else{	
				gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
				gl.scene.addRenderPass(this.frameBuffer,matrix, pmatrix,width,height,object, this.mirrorAxis ? true : false);
				return true;
			}
		}else{
			gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		}
	}else{
		return false;
	}
}
GLGE.TextureCamera.prototype.registerPasses=GLGE.TextureCamera.prototype.doTexture;
/**
* Creates the frame buffer for our texture
* @private
*/
GLGE.TextureCamera.prototype.createFrameBuffer=function(gl){
	var height=(!this.bufferHeight ? gl.scene.renderer.canvas.height : this.bufferHeight);
	var width=(!this.bufferWidth ? gl.scene.renderer.canvas.width : this.bufferWidth);
	
	if(!this.frameBuffer) this.frameBuffer = gl.createFramebuffer();
	if(!this.renderBuffer) this.renderBuffer = gl.createRenderbuffer();
	if(!this.glTexture) this.glTexture=gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.glTexture);

	var tex = new Uint8Array(width*height*4);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width,height, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    
	gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
	//dpeth stencil doesn't seem to work in either webkit or mozilla so don't use for now - reflected particles will be messed up!
	//gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_STENCIL,width, height);
	//gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_STENCIL_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,width, height);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
    
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.glTexture, 0);	
    
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
}



})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_texturecameracube.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){






/**
* @class A reflection texture will reflect in a plane for a specified transform
* @param {string} uid the unique id for this texture
* @see GLGE.Material
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.TextureCameraCube=function(uid){
	GLGE.Assets.registerAsset(this,uid);
	this.cubeBuffers=[];
}
GLGE.augment(GLGE.QuickNotation,GLGE.TextureCameraCube);
GLGE.augment(GLGE.JSONLoader,GLGE.TextureCameraCube);
GLGE.augment(GLGE.Events,GLGE.TextureCameraCube);
GLGE.TextureCameraCube.prototype.className="TextureCube";
GLGE.TextureCameraCube.prototype.texture=null;
GLGE.TextureCameraCube.prototype.glTexture=null;
GLGE.TextureCameraCube.prototype.object=null;
GLGE.TextureCameraCube.prototype.autoUpdate=false;
GLGE.TextureCameraCube.prototype.rendered=false;
GLGE.TextureCameraCube.prototype.bufferHeight=512;
GLGE.TextureCameraCube.prototype.bufferWidth=512;
GLGE.TextureCameraCube.prototype.offsetX=0;
GLGE.TextureCameraCube.prototype.offsetY=0;
GLGE.TextureCameraCube.prototype.offsetZ=0;

GLGE.TextureCameraCube.prototype.cameraMatries=[
						[0,0,-1,0,
						0,1,0,0,
						-1,0,0,0,
						0,0,0,1], 
						[0,0,1,0,
						0,1,0,0,
						1,0,0,0,
						0,0,0,1], 
						
						[-1,0,0,0,
						0,0,1,0,
						0,-1,0,0,
						0,0,0,1], 
						[-1,0,0,0,
						0,0,-1,0,
						0,1,0,0,
						0,0,0,1],
						
						[1,0,0,0,
						0,1,0,0,
						0,0,-1,0,
						0,0,0,1], 
						[-1,0,0,0,
						0,1,0,0,
						0,0,1,0,
						0,0,0,1]
];

GLGE.TextureCameraCube.prototype.pMatrix=GLGE.makePerspective(90, 1, 0.0001, 1000);

/**
* Forces an update of the cube map texture
**/
GLGE.TextureCameraCube.prototype.render=function(){
	this.rendered=false;
	return this;
}


/**
* set the X center offset
* @param {number} offset X offset for cube
**/
GLGE.TextureCameraCube.prototype.setOffsetX=function(offset){
	this.offsetX=offset
	return this;
}
/**
* Gets the X center offset
* @returns the X offset
**/
GLGE.TextureCameraCube.prototype.getOffsetX=function(){
	return this.offsetX;
}

/**
* set the Y center offset
* @param {number} offset Y offset for cube
**/
GLGE.TextureCameraCube.prototype.setOffsetY=function(offset){
	this.offsetY=offset
	return this;
}
/**
* Gets the Y center offset
* @returns the Y offset
**/
GLGE.TextureCameraCube.prototype.getOffsetY=function(){
	return this.offsetY;
}

/**
* set the Z center offset
* @param {number} offset Z offset for cube
**/
GLGE.TextureCameraCube.prototype.setOffsetZ=function(offset){
	this.offsetZ=offset
	return this;
}
/**
* Gets the X center offset
* @returns the X offset
**/
GLGE.TextureCameraCube.prototype.getOffsetZ=function(){
	return this.offsetZ;
}

/**
* set the auto update flag
* @param {number} buffer width
**/
GLGE.TextureCameraCube.prototype.setAutoUpdate=function(auto){
	this.autoUpdate=auto
	return this;
}
/**
* gets the auto update flag
* @returns the width
**/
GLGE.TextureCameraCube.prototype.getAutoUpdate=function(){
	return this.autoUpdate;
}

/**
* sets the RTT  render buffer width
* @param {number} buffer width
**/
GLGE.TextureCameraCube.prototype.setBufferWidth=function(width){
	this.bufferWidth=width;
	this.update=true;
	return this;
}
/**
* gets the RTT  render buffer width
* @returns the width
**/
GLGE.TextureCameraCube.prototype.getBufferWidth=function(){
	return this.bufferWidth;
}

/**
* sets the RTT  render buffer height
* @param {number} buffer height
**/
GLGE.TextureCameraCube.prototype.setBufferHeight=function(height){
	this.bufferHeight=height;
	this.update=true;
	return this;
}
/**
* gets the RTT  render buffer height
* @returns the height
**/
GLGE.TextureCameraCube.prototype.getBufferHeight=function(){
	return this.bufferHeight;
}


/**
* registers the render passes
* @private
**/
GLGE.TextureCameraCube.prototype.doTexture=function(gl,object){

	this.gl=gl;
	var objMatrix=object.getModelMatrix();
	
	var height=this.bufferHeight;
	var width=this.bufferWidth;

	if(!this.cubeBuffers.length || this.update){
		this.createFrameBuffers(gl);
		this.update=false;
		return false;
	}

	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.glTexture);
	if(!this.rendered || this.autoUpdate){
		for(var i=0;i<6;i++){
			var matrix=this.cameraMatries[i].slice(0);
			var m=GLGE.mulMat4(matrix,objMatrix);
			var v=GLGE.mulMat4Vec3(m,[this.offsetX,this.offsetY,this.offsetZ,1]);
			matrix[3]=-v[0];
			matrix[7]=-v[1];
			matrix[11]=-v[2];
			gl.scene.addRenderPass(this.cubeBuffers[i],matrix, this.pMatrix,width,height,object,true);
		}
		this.rendered=true;
	}
	return true;


}
GLGE.TextureCameraCube.prototype.registerPasses=GLGE.TextureCameraCube.prototype.doTexture;

/**
* Creates the frame buffer and texture
* @private
*/
GLGE.TextureCameraCube.prototype.createFrameBuffers=function(gl){
	var height=this.bufferHeight;
	var width=this.bufferWidth;
	
	
	var renderBuffer = gl.createRenderbuffer();
	this.glTexture=gl.createTexture();
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.glTexture);
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,width, height);

	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, width,height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, width,height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, width,height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, width,height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, width,height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, width,height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);	
    
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	
	var frameBuffer
	frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_X, this.glTexture, 0);	
	this.cubeBuffers.push(frameBuffer);	
	
	frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_X, this.glTexture, 0);	
	this.cubeBuffers.push(frameBuffer);	
		
	frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, this.glTexture, 0);	
	this.cubeBuffers.push(frameBuffer);
		
	frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Y, this.glTexture, 0);	
	this.cubeBuffers.push(frameBuffer);

	frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, this.glTexture, 0);	
	this.cubeBuffers.push(frameBuffer);

	frameBuffer = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_CUBE_MAP_POSITIVE_Z, this.glTexture, 0);	
	this.cubeBuffers.push(frameBuffer);
		
	
		
	

	

	
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
}



})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_texturecanvas.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){




/**
* @class A canvase texture to be included in a material
* @param {string} uid the unique id for this texture
* @see GLGE.Material
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.TextureCanvas=function(uid){
	this.canvas=document.createElement("canvas");
	//temp canvas to force chrome to update FIX ME when bug sorted!
	this.t=document.createElement("canvas");
	this.t.width=1;
	this.t.height=1;
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.QuickNotation,GLGE.TextureCanvas);
GLGE.augment(GLGE.JSONLoader,GLGE.TextureCanvas);
GLGE.augment(GLGE.Events,GLGE.TextureCanvas);
GLGE.TextureCanvas.prototype.className="TextureCanvas";
GLGE.TextureCanvas.prototype.glTexture=null;
GLGE.TextureCanvas.prototype.autoUpdate=true;
/**
* Gets the auto update flag
* @return {boolean} The auto update flag
*/
GLGE.TextureCanvas.prototype.getAutoUpdate=function(){
	return this.autoUpdate;
};
/**
* Sets the auto update flag
* @param {boolean} value The auto update flag
*/
GLGE.TextureCanvas.prototype.setAutoUpdate=function(value){
	this.autoUpdate=value;
	return this;
};
/**
* Gets the canvas used by the texture
* @return {canvas} The textures image url
*/
GLGE.TextureCanvas.prototype.getCanvas=function(){
	return this.canvas;
};
/**
* Sets the canvas used by the texture
* @param {canvas} canvas The canvas to use
*/
GLGE.TextureCanvas.prototype.setCanvas=function(canvas){
	this.canvas=canvas;
	return this;
};
/**
* Sets the canvas height
* @param {number} value The canvas height
*/
GLGE.TextureCanvas.prototype.setHeight=function(value){
	this.canvas.height=value;
	return this;
};
/**
* Sets the canvas width
* @param {number} value The canvas width
*/
GLGE.TextureCanvas.prototype.setWidth=function(value){
	this.canvas.width=value;
	return this;
};

/**
* gets the canvas height
* @returns {number} The canvas height
*/
GLGE.TextureCanvas.prototype.getHeight=function(){
	return this.canvas.height;
};
/**
* gets the canvas width
* @returns {number} The canvas width
*/
GLGE.TextureCanvas.prototype.getWidth=function(){
	return this.canvas.width;
};

/**
* does the canvas texture GL stuff
* @private
**/
GLGE.TextureCanvas.prototype.doTexture=function(gl){
	this.gl=gl;
	//create the texture if it's not already created
	if(!this.glTexture){
		this.glTexture=gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		this.updateCanvas(gl);
	}else{
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		if(this.autoUpdate || this.doUpdate) this.updateCanvas(gl);
	}
	this.doUpdate=false;

	
	return true;
}
/**
* Manually updates the canvas Texture
*/
GLGE.TextureCanvas.prototype.update=function(){
	this.doUpdate=true;
}
/**
* Updates the canvas texture
* @private
*/
GLGE.TextureCanvas.prototype.updateCanvas=function(gl){
	var canvas = this.canvas;
	gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.t); //force chrome to update remove when chrome bug fixed
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);
}


})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_texturecube.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){




/**
* @class A texture to be included in a material
* @param {string} uid the unique id for this texture
* @see GLGE.Material
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.TextureCube=function(uid){
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.QuickNotation,GLGE.TextureCube);
GLGE.augment(GLGE.JSONLoader,GLGE.TextureCube);
GLGE.augment(GLGE.Events,GLGE.TextureCube);
GLGE.TextureCube.prototype.className="TextureCube";
GLGE.TextureCube.prototype.posX=null;
GLGE.TextureCube.prototype.negX=null;
GLGE.TextureCube.prototype.posY=null;
GLGE.TextureCube.prototype.negY=null;
GLGE.TextureCube.prototype.posZ=null;
GLGE.TextureCube.prototype.negZ=null;
GLGE.TextureCube.prototype.texture=null;
GLGE.TextureCube.prototype.glTexture=null;
GLGE.TextureCube.prototype.loadState=0;
/**
* Sets the url for a given image
* @param {string} url the texture image url
* @param {string} image the image element to load
*/
GLGE.TextureCube.prototype.setSrc=function(url,image,mask){
	this.url=url;
	this.state=0;
	this[image]=new Image();
	var texture=this;
	this[image].onload = function(){
		texture.loadState+=mask;
	}	
	this[image].src=url;	
	if(this.glTexture && this.gl) {
		this.gl.deleteTexture(this.glTexture);
		this.glTexture=null;
	}
	return this;
}

/**
* Sets the positive X cube image
* @param {string} url the texture image url
*/
GLGE.TextureCube.prototype.setSrcPosX=function(url){
	this.setSrc(url,"posX",1);
	return this;
};
/**
* Sets the negative X cube image
* @param {string} url the texture image url
*/
GLGE.TextureCube.prototype.setSrcNegX=function(url){
	this.setSrc(url,"negX",2);
	return this;
};
/**
* Sets the positive Y cube image
* @param {string} url the texture image url
*/
GLGE.TextureCube.prototype.setSrcPosY=function(url){
	this.setSrc(url,"posY",4);
	return this;
};
/**
* Sets the negative Y cube image
* @param {string} url the texture image url
*/
GLGE.TextureCube.prototype.setSrcNegY=function(url){
	if(typeof url!="string"){
		this.negY=url;
		this.loadState+=8;
	}else{
		this.setSrc(url,"negY",8);
	}
	return this;
};
/**
* Sets the positive Z cube image
* @param {string} url the texture image url
*/
GLGE.TextureCube.prototype.setSrcPosZ=function(url){
	this.setSrc(url,"posZ",16);
	return this;
};
/**
* Sets the negative Z cube image
* @param {string} url the texture image url
*/
GLGE.TextureCube.prototype.setSrcNegZ=function(url){
	this.setSrc(url,"negZ",32);
	return this;
};

/**
* Sets the textures image location
* @private
**/
GLGE.TextureCube.prototype.doTexture=function(gl,object){
	this.gl=gl;
	//create the texture if it's not already created
	if(!this.glTexture) this.glTexture=gl.createTexture();
	//if the image is loaded then set in the texture data
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.glTexture);
	if(this.loadState==63 && this.state==0){
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.posX);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.negX);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.posY);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.negY);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.posZ);
		gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.negZ);
		
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.generateMipmap(gl.TEXTURE_CUBE_MAP);
		gl.bindTexture(gl.TEXTURE_CUBE_MAP, null);
		this.state=1;
	}
	gl.bindTexture(gl.TEXTURE_CUBE_MAP, this.glTexture);
	if(this.state==1) return true;
		else return false;
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_texturevideo.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){




/**
* @class A video texture to be included in a material
* @param {string} uid the unique id for this texture
* @see GLGE.Material
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.TextureVideo=function(uid){
	this.video=document.createElement("video");
	this.video.style.display="none";
	this.video.setAttribute("loop","loop");
	this.video.autoplay=true;
	//looping isn't working in firefox so quick fix!
	this.video.addEventListener("ended", function() { this.play(); }, true); 
	//video needs to be part of page to work for some reason :-s
	document.getElementsByTagName("body")[0].appendChild(this.video);
	//used to get webkit working
	this.canvas=document.createElement("canvas");
	this.ctx=this.canvas.getContext("2d");
	GLGE.Assets.registerAsset(this,uid);
	
}
GLGE.augment(GLGE.QuickNotation,GLGE.TextureVideo);
GLGE.augment(GLGE.JSONLoader,GLGE.TextureVideo);
GLGE.augment(GLGE.Events,GLGE.TextureVideo);
GLGE.TextureVideo.prototype.className="TextureVideo";
GLGE.TextureVideo.prototype.glTexture=null;
/**
* Gets the canvas used by the texture
* @return {video} The textures image url
*/
GLGE.TextureVideo.prototype.getVideo=function(){
	return this.video;
};
/**
* Sets the video used by the texture
* @param {video} canvas The canvas to use
*/
GLGE.TextureVideo.prototype.setVideo=function(video){
	this.video=video;
	return this;
};

/**
* Sets the source used for the video
* @param {string} src The URL of the video
*/
GLGE.TextureVideo.prototype.setSrc=function(src){
	this.video.src=src;
	return this;
};
/**
* gets the source used for the video
* @returns {string} The URL of the video
*/
GLGE.TextureVideo.prototype.getSrc=function(src){
	return this.video.src;
};

/**
* does the canvas texture GL stuff
* @private
**/
GLGE.TextureVideo.prototype.doTexture=function(gl){
	this.gl=gl;
	//create the texture if it's not already created
	if(!this.glTexture){
		this.glTexture=gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		this.updateTexture(gl);
	}else{
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		this.updateTexture(gl);
	}

	
	return true;
}
/**
* Updates the canvas texture
* @private
*/
GLGE.TextureVideo.prototype.updateTexture=function(gl){
	var video = this.video;
	gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
	//TODO: fix this when minefield is upto spec
	if(video.readyState>0){
	if(video.height<=0){
		video.style.display="";
		video.height=video.offsetHeight;
		video.width=video.offsetWidth;
		video.style.display="none";
	}
	this.canvas.height=video.height;
	this.canvas.width=video.width;
	this.ctx.drawImage(video, 0, 0);
	try{gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas);}
	catch(e){gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.canvas,null);}
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);
	
	/*
	use when video is working in webkit
	try{gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);}
	catch(e){gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video,null);}
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);
	*/
	}
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_lod.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){

/**
* @name GLGE.ObjectLod#downloadComplete
* @event fires when all the assets for this LOD have finished loading
* @param {object} data
*/

/**
* @class Creates a new load for a multimaterial
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
* @augments GLGE.Events
*/
GLGE.ObjectLod=function(uid){
    this.setMaterial(GLGE.DEFAULT_MATERIAL);
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.QuickNotation,GLGE.ObjectLod);
GLGE.augment(GLGE.JSONLoader,GLGE.ObjectLod);
GLGE.augment(GLGE.Events,GLGE.ObjectLod);
GLGE.ObjectLod.prototype.mesh=null;
GLGE.ObjectLod.prototype.className="ObjectLod";
GLGE.ObjectLod.prototype.material=null;
GLGE.ObjectLod.prototype.program=null;
GLGE.ObjectLod.prototype.GLShaderProgramPick=null;
GLGE.ObjectLod.prototype.GLShaderProgramShadow=null;
GLGE.ObjectLod.prototype.GLShaderProgram=null;
GLGE.ObjectLod.prototype.pixelSize=0;

/**
* sets the mesh
* @param {GLGE.Mesh} mesh 
*/
GLGE.ObjectLod.prototype.setMesh=function(mesh){
	if(typeof mesh=="string")  mesh=GLGE.Assets.get(mesh);
	
	//remove event listener from current material
	if(this.mesh){
		this.mesh.removeEventListener("shaderupdate",this.meshupdated);
		this.mesh.removeEventListener("boundupdate",this.boundupdated);
	}
	var multiMaterial=this;
	this.meshupdated=function(event){
		multiMaterial.GLShaderProgram=null;
	};
	
	this.boundupdated=function(event){
		multiMaterial.fireEvent("boundupdate",{});
	};
	//set event listener for new material
	mesh.addEventListener("shaderupdate",this.meshupdated);
	mesh.addEventListener("boundupdate",this.boundupdated);
	
	this.GLShaderProgram=null;
	this.mesh=mesh;
	return this;
}

/**
* Checks  if resources have finished downloading
* @returns {boolean}
*/
GLGE.ObjectLod.prototype.isComplete=function(){
    return this.material.isComplete();
}
/**
* gets the mesh
* @returns {GLGE.Mesh}
*/
GLGE.ObjectLod.prototype.getMesh=function(){
	return this.mesh;
}
/**
* sets the material
* @param {GLGE.Material} material 
*/
GLGE.ObjectLod.prototype.setMaterial=function(material){
	if(typeof material=="string")  material=GLGE.Assets.get(material);
	
	//remove event listener from current material
	if(this.material){
        this.material.removeEventListener("shaderupdate",this.materialupdated);
        this.material.removeEventListener("downloadComplete",this.downloadComplete);
	}
	var ObjectLOD=this;
	this.materialupdated=function(event){
		ObjectLOD.GLShaderProgram=null;
	};
	//set event listener for new material
	material.addEventListener("shaderupdate",this.materialupdated);
    
    this.downloadComplete=function(){
        ObjectLOD.fireEvent("downloadComplete");
    };
    material.addEventListener("downloadComplete",this.downloadComplete); 
    
	
	this.GLShaderProgram=null;
	this.material=material;
	return this;
}
/**
* gets the material
* @returns {GLGE.Material}
*/
GLGE.ObjectLod.prototype.getMaterial=function(){
	return this.material;
}

/**
* gets the pixelsize limit for this lod
* @returns {number}
*/
GLGE.ObjectLod.prototype.getPixelSize=function(){
	return this.pixelSize;
}
/**
* sets the pixelsize limit for this lod
* @returns {number}
*/
GLGE.ObjectLod.prototype.setPixelSize=function(value){
	this.pixelSize=parseFloat(value);
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_object.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){

/**
* @name GLGE.Object#downloadComplete
* @event fires when all the assets for this class have finished loading
* @param {object} data
*/

/**
* @name GLGE.Object#willRender
* @event fires when all the assets will be rendered
* @param {object} data
*/

/**
* @name GLGE.Object#willRender
* @event fires when all the assets will culled
* @param {object} data
*/

/**
* @class An object that can be rendered in a scene
* @augments GLGE.Animatable
* @augments GLGE.Placeable
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.Object=function(uid){
	this.multimaterials=[];
	this.renderCaches=[];
    var that=this;
    this.downloadComplete=function(){
        if(that.isComplete()) that.fireEvent("downloadComplete");
    }
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.Placeable,GLGE.Object);
GLGE.augment(GLGE.Animatable,GLGE.Object);
GLGE.augment(GLGE.QuickNotation,GLGE.Object);
GLGE.augment(GLGE.JSONLoader,GLGE.Object);
GLGE.Object.prototype.className="Object";
GLGE.Object.prototype.mesh=null;
GLGE.Object.prototype.skeleton=null;
GLGE.Object.prototype.scene=null;
GLGE.Object.prototype.transformMatrix=GLGE.identMatrix();
GLGE.Object.prototype.material=null;
GLGE.Object.prototype.gl=null;
GLGE.Object.prototype.multimaterials=null;
GLGE.Object.prototype.zTrans=false;
GLGE.Object.prototype.renderCaches=null;
GLGE.Object.prototype.id="";
GLGE.Object.prototype.pickable=true;
GLGE.Object.prototype.drawType=GLGE.DRAW_TRIS;
GLGE.Object.prototype.pointSize=1;
GLGE.Object.prototype.lineWidth=1;
GLGE.Object.prototype.cull=true;
GLGE.Object.prototype.culled=true;
GLGE.Object.prototype.visible=true;
GLGE.Object.prototype.depthTest=true;
GLGE.Object.prototype.meshFrame1=0;
GLGE.Object.prototype.meshFrame2=0;
GLGE.Object.prototype.meshBlendFactor=0;
GLGE.Object.prototype.noCastShadows=null;
GLGE.Object.prototype.noDepthMask=false;
GLGE.Object.prototype.shadowAlpha=true;
GLGE.Object.prototype.blending=[ "SRC_ALPHA","ONE_MINUS_SRC_ALPHA"];


//shadow fragment
var shfragStr=[];
shfragStr.push("#ifdef GL_ES\nprecision highp float;\n#endif\n");
shfragStr.push("uniform float distance;\n");
shfragStr.push("uniform bool shadowtype;\n");
shfragStr.push("varying vec3 eyevec;\n");
shfragStr.push("void main(void)\n  ");
shfragStr.push("{\n");
shfragStr.push("float depth = gl_FragCoord.z;\n");
shfragStr.push("if(shadowtype) depth=length(eyevec)/distance;\n");
shfragStr.push("vec4 rgba=fract(depth * vec4(16777216.0, 65536.0, 256.0, 1.0));\n");
shfragStr.push("gl_FragColor=rgba-rgba.rrgb*vec4(0.0,0.00390625,0.00390625,0.00390625);\n");
shfragStr.push("}\n");
GLGE.Object.prototype.shfragStr=shfragStr.join("");

//normal fragment
var nfragStr=[];
nfragStr.push("#ifdef GL_ES\nprecision highp float;\n#endif\n");
nfragStr.push("varying vec3 n;\n");
nfragStr.push("void main(void)\n");
nfragStr.push("{\n");
nfragStr.push("float depth = gl_FragCoord.z / gl_FragCoord.w;\n");
nfragStr.push("gl_FragColor=vec4(normalize(n)/2.0+0.5,depth/1000.0);\n");
nfragStr.push("}\n");
GLGE.Object.prototype.nfragStr=nfragStr.join("");


//picking fragment
var pkfragStr=[];
pkfragStr.push("#ifdef GL_ES\nprecision highp float;\n#endif\n");
pkfragStr.push("uniform float far;\n");
pkfragStr.push("uniform vec3 pickcolor;\n");
pkfragStr.push("varying vec3 n;\n");
pkfragStr.push("varying vec4 UVCoord;\n");
pkfragStr.push("void main(void)\n");
pkfragStr.push("{\n");
pkfragStr.push("float Xcoord = gl_FragCoord.x+0.5;\n");
pkfragStr.push("if(Xcoord>0.0) gl_FragColor = vec4(pickcolor,1.0);\n");
pkfragStr.push("if(Xcoord>1.0) gl_FragColor = vec4(n,1.0);\n");
pkfragStr.push("if(Xcoord>2.0){");	
pkfragStr.push("vec3 rgb=fract((gl_FragCoord.z/gl_FragCoord.w) * vec3(65536.0, 256.0, 1.0));\n");
pkfragStr.push("gl_FragColor=vec4(rgb-rgb.rrg*vec3(0.0,0.00390625,0.00390625),1.0);\n");
pkfragStr.push("}");
//x tex coord
pkfragStr.push("if(Xcoord>3.0){");	
pkfragStr.push("vec3 rgb=fract(UVCoord.x * vec3(65536.0, 256.0, 1.0));\n");
pkfragStr.push("gl_FragColor=vec4(rgb-rgb.rrg*vec3(0.0,0.00390625,0.00390625),1.0);\n");
pkfragStr.push("}");
//y tex coord
pkfragStr.push("if(Xcoord>4.0){");	
pkfragStr.push("vec3 rgb=fract(UVCoord.y * vec3(65536.0, 256.0, 1.0));\n");
pkfragStr.push("gl_FragColor=vec4(rgb-rgb.rrg*vec3(0.0,0.00390625,0.00390625),1.0);\n");
pkfragStr.push("}");
pkfragStr.push("}\n");
GLGE.Object.prototype.pkfragStr=pkfragStr.join("");


GLGE.Object.prototype.noDepthMask

/**
* Sets the depth mask for the object default is true
* @param {boolean} mask flag to depth masking
*/
GLGE.Object.prototype.setDepthMask=function(mask){
	this.noDepthMask=!mask;
	return this;
}

/**
* Gets the objects depth mask flag
* @returns  flag to indicate the depth mask
*/
GLGE.Object.prototype.getDepthMask=function(){
	return !this.noDepthMask;
}

/**
* Sets the object visibility
* @param {boolean} visable flag to indicate the objects visibility
*/
GLGE.Object.prototype.setVisible=function(visible){
	this.visible=visible;
	return this;
}

/**
* Gets the object visibility
* @returns  flag to indicate the objects visibility
*/
GLGE.Object.prototype.getVisible=function(){
	return this.visible;
}

/**
* Sets the object blending mode
* @param {array} gl blending funcs as strings, eg. [ "ONE", "ONE"]
*/
GLGE.Object.prototype.setBlending=function(blending){
	this.blending=blending;
	return this;
}

/**
* Gets the object blending mode
* @returns  gl blending funcs
*/
GLGE.Object.prototype.getBlending=function(){
	return this.blending;
}

/**
* Sets the first mesh frame to use when using an animated mesh
* @param {boolean} frame the inital frame
*/
GLGE.Object.prototype.setMeshFrame1=function(frame){
	this.meshFrame1=frame;
	return this;
}
/**
* Sets the second mesh frame to use when using an animated mesh
* @param {boolean} frame the final frame
*/
GLGE.Object.prototype.setMeshFrame2=function(frame){
	this.meshFrame2=frame;
	return this;
}
/**
* blending between frames
* @param {boolean} frame value 0-1 morth between frame1 and frame2
*/
GLGE.Object.prototype.setMeshBlendFactor=function(factor){
	this.meshBlendFactor=factor;
	return this;
}
/**
* Gets blending between frames
* @returns blender factor
*/
GLGE.Object.prototype.getMeshBlendFactor=function(){
	return this.meshBlendFactor;
}

/**
* Gets the pickable flag for the object
*/
GLGE.Object.prototype.getPickable=function(){
	return this.pickable;
}
/**
* Sets the pickable flag for the object
* @param {boolean} value the culling flag
*/
GLGE.Object.prototype.setPickable=function(pickable){
	this.pickable=pickable;
	return this;
}


/**
* Gets the depth test flag for the object
*/
GLGE.Object.prototype.getDepthTest=function(){
    return this.depthTest;
}
/**
* Sets the depth test flag for the object
* @param {boolean} value the culling flag
*/
GLGE.Object.prototype.setDepthTest=function(test){
	this.depthTest=test;
	return this;
}


/**
* Gets the culling flag for the object
*/
GLGE.Object.prototype.getCull=function(){
	return this.cull;
}
/**
* Sets the culling flag for the object
* @param {boolean} value the culling flag
*/
GLGE.Object.prototype.setCull=function(cull){
	this.cull=cull;
	return this;
}

/**
* Gets the objects draw type
*/
GLGE.Object.prototype.getDrawType=function(){
	return this.drawType;
}
/**
* Sets the objects draw type
* @param {GLGE.number} value the draw type of this object
*/
GLGE.Object.prototype.setDrawType=function(value){
	this.drawType=value;
	return this;
}

/**
* Gets the objects draw point size
*/
GLGE.Object.prototype.getPointSize=function(){
	return this.pointSize;
}
/**
* Sets the objects draw points size
* @param {GLGE.number} value the point size to render
*/
GLGE.Object.prototype.setPointSize=function(value){
	this.pointSize=parseFloat(value);
	return this;
}

/**
* Gets the objects line width
*/
GLGE.Object.prototype.getLineWidth=function(){
    return this.lineWidth;
}
/**
* Sets the objects line width
* @param {GLGE.number} value the line width
*/
GLGE.Object.prototype.setLineWidth=function(value){
	this.lineWidth=parseFloat(value);
	return this;
}

/**
* Sets a custom usinform on this object
* @param {string} type the uniform type eg 1i, 3fv, Matrix4fv, etc
* @param {string} name the uniform name
* @param {array} value the value of the uniform
*/
GLGE.Object.prototype.setUniform=function(type,name,value){
    if(!this.uniforms) this.uniforms={};
	this.uniforms[name]={type:type,value:value};
}
/**
* Gets the value of a custom uniform
* @param {string} name the name of the uniform to return
* @returns {number} the value of the uniform
*/
GLGE.Object.prototype.getUniform=function(name){
	if(!this.uniforms) this.uniforms={};
	return this.uniforms[name].value
}
/**
* Gets the type of a custom uniform
* @param {string} name the name of the uniform to return
* @returns {number} the type of the uniform
*/
GLGE.Object.prototype.getUniformType=function(name){
	if(!this.uniforms) this.uniforms={};
	return this.uniforms[name].type;
}

/**
* Sets the code to inject into the vertex shader
* @param {string} shader the glsl code to inject into the vertex shader of this object GLGE will call the function GLGE_Position(vec4 position) to modify the position
*/
GLGE.Object.prototype.setVertexShaderInjection=function(shader){
    this.shaderVertexInjection=shader;
    this.updateProgram();
    return this;
}

/**
* Gets the glsl code injected into the vertex shader of this object
* @returns {string} shader the glsl code injected into the vertex shader of this object
*/
GLGE.Object.prototype.getVertexShaderInjection=function(shader){
    return this.shaderVertexInjection;
}


/**
* Gets the objects skeleton
* @returns GLGE.Group
*/
GLGE.Object.prototype.getSkeleton=function(){
	return this.skeleton;
}
/**
* Sets the objects skeleton
* @param {GLGE.Group} value the skeleton group to set
*/
GLGE.Object.prototype.setSkeleton=function(value){
	this.skeleton=value;
	this.bones=null;
	return this;
}

GLGE.Object.prototype.getBoundingVolume=function(local){
	if(!local) local=0;
	if(!this.boundingVolume) this.boundingVolume=[];
	if(!this.boundmatrix) this.boundmatrix=[];
	var matrix=this.getModelMatrix();
	if(matrix!=this.boundmatrix[local] || !this.boundingVolume[local]){
		var multimaterials=this.multimaterials;
		var boundingVolume;
		for(var i=0;i<multimaterials.length;i++){
			if(multimaterials[i].lods[0].mesh){
				if(!boundingVolume){
					boundingVolume=multimaterials[i].lods[0].mesh.getBoundingVolume().clone();
				}else{
					boundingVolume.addBoundingVolume(multimaterials[i].lods[0].mesh.getBoundingVolume());
				}
			}
		}
		if(!boundingVolume) boundingVolume=new GLGE.BoundingVolume(0,0,0,0,0,0);

		if(local){
			boundingVolume.applyMatrix(this.getLocalMatrix());
		}else{
			boundingVolume.applyMatrix(this.getModelMatrix());
		}
		this.boundingVolume[local]=boundingVolume;
	}
	this.boundmatrix[local]=matrix;
	return this.boundingVolume[local];
}


/**
* Sets the the show casting flag
* @param {boolean} value cast or not
*/
GLGE.Object.prototype.setCastShadows=function(value){
	this.noCastShadows=!value;
	return this;
}
/**
* Gets the the show casting flag
* @returns boolean
*/
GLGE.Object.prototype.getCastShadows=function(){
	return !this.noCastShadows;
}

/**
* Sets the Z Transparency of this object
* @param {boolean} value Does this object need blending?
*/
GLGE.Object.prototype.setZtransparent=function(value){
	this.zTrans=value;
	return this;
}
/**
* Gets the z transparency
* @returns boolean
*/
GLGE.Object.prototype.isZtransparent=function(){
	return this.zTrans;
}

/**
* Checks  if resources have finished downloading
* @returns {boolean}
*/
GLGE.Object.prototype.isComplete=function(){
    for(var i=0;i<this.multimaterials.length;i++){
        if(!this.multimaterials[i].isComplete()) return false;
    }
    return true;
}


/**
* Sets the material associated with the object
* @param GLGE.Material
*/
GLGE.Object.prototype.setMaterial=function(material,idx){
	if(typeof material=="string")  material=GLGE.Assets.get(material);
	if(!idx) idx=0;
	if(!this.multimaterials[idx]){
        this.multimaterials[idx]=new GLGE.MultiMaterial();
        this.multimaterials[idx].addEventListener("downloadComplete",this.downloadComplete);
	}
	if(this.multimaterials[idx].getMaterial()!=material){
		this.multimaterials[idx].setMaterial(material);
		this.updateProgram();
	}
	return this;
}
/**
* Gets the material associated with the object
* @returns GLGE.Material
*/
GLGE.Object.prototype.getMaterial=function(idx){
	if(!idx) idx=0;
	if(this.multimaterials[idx]) {
		return this.multimaterials[idx].getMaterial();
	}else{
		return false;
	}
}
/**
* Sets the mesh associated with the object
* @param GLGE.Mesh
*/
GLGE.Object.prototype.setMesh=function(mesh,idx){
	if(typeof mesh=="string")  mesh=GLGE.Assets.get(mesh);
	if(!idx) idx=0;
	if(!this.multimaterials[idx]){
		var object=this;
		this.multimaterials[idx]=new GLGE.MultiMaterial();
		this.multimaterials[idx].addEventListener("downloadComplete",this.downloadComplete);
		this.multimaterials[idx].addEventListener("boundupdate",function(){object.boundingVolume=null});
	}
	this.multimaterials[idx].setMesh(mesh);
	this.boundingVolume=null;
	return this;
}
/**
* Gets the mesh associated with the object
* @returns GLGE.Mesh
*/
GLGE.Object.prototype.getMesh=function(idx){
	if(!idx) idx=0;
	if(this.multimaterials[idx]) {
		return this.multimaterials[idx].getMesh();
	}else{
		return false;
	}
}
/**
* Initiallize all the GL stuff needed to render to screen
* @private
*/
GLGE.Object.prototype.GLInit=function(gl){
	this.gl=gl;
}
/**
* Cleans up all the GL stuff we sets
* @private
*/
GLGE.Object.prototype.GLDestory=function(gl){
}
/**
* Updates the GL shader program for the object
* @private
*/
GLGE.Object.prototype.updateProgram=function(){
	for(var i=0; i<this.multimaterials.length;i++){
		this.multimaterials[i].updateProgram();
	}
}
/**
* Adds another material to this object
* @returns GLGE.Material
*/
GLGE.Object.prototype.addMultiMaterial=function(multimaterial){
	if(typeof multimaterial=="string")  multimaterial=GLGE.Assets.get(multimaterial);
	this.multimaterials.push(multimaterial);
	multimaterial.addEventListener("downloadComplete",this.downloadComplete);
	var object=this;
	multimaterial.addEventListener("boundupdate",function(){object.boundingVolume=null});
	this.boundingVolume=null;
	return this;
}
/**
* gets all of the objects materials and meshes
* @returns array of GLGE.MultiMaterial objects
*/
GLGE.Object.prototype.getMultiMaterials=function(){
	return this.multimaterials;
}
/**
* Creates the shader program for the object
* @private
*/
GLGE.Object.prototype.GLGenerateShader=function(gl){
	//create the programs strings
	//Vertex Shader
	var colors=UV=joints1=joints2=false;
	var lights=gl.lights;
	var vertexStr=["#ifdef GL_ES\nprecision highp float;\n#endif\n#define GLGE_VERTEX\n"];
	var tangent=false;
	if(!this.mesh.normals) this.mesh.calcNormals();
	vertexStr.push("attribute vec3 position;\n");
	vertexStr.push("attribute vec3 normal;\n");
	for(var i=0;i<this.mesh.buffers.length;i++){
		if(this.mesh.buffers[i].name=="tangent0") tangent=true;
		if(this.mesh.buffers[i].exclude) continue;
		if(this.mesh.buffers[i].size>1){
			vertexStr.push("attribute vec"+this.mesh.buffers[i].size+" "+this.mesh.buffers[i].name+";\n");
		}else{
			vertexStr.push("attribute float "+this.mesh.buffers[i].name+";\n");
		}
		if(this.mesh.buffers[i].name=="UV") UV=true;
		if(this.mesh.buffers[i].name=="color") colors=true;
		if(this.mesh.buffers[i].name=="joints1") joints1=this.mesh.buffers[i];
		if(this.mesh.buffers[i].name=="joints2") joints2=this.mesh.buffers[i];
	}
	if(this.mesh.framePositions.length>1){
		var morph=true;
		vertexStr.push("attribute vec3 position2;\n");
		vertexStr.push("attribute vec3 normal2;\n");
		vertexStr.push("uniform float framesBlend;\n");
		if(tangent) vertexStr.push("attribute vec3 tangent2;\n");
	}
	if(tangent) vertexStr.push("attribute vec3 tangent;\n");
	vertexStr.push("uniform mat4 worldView;\n");
	vertexStr.push("uniform mat4 projection;\n");  
	vertexStr.push("uniform mat4 worldInverseTranspose;\n");
	vertexStr.push("uniform mat4 envMat;\n");
	//vertexStr.push("uniform vec3 cameraPos;\n");
	vertexStr.push("uniform float cascadeLevel;\n");

	for(var i=0; i<lights.length;i++){
			if(lights[i].type==GLGE.L_OFF) continue;
			vertexStr.push("uniform vec3 lightpos"+i+";\n");
			vertexStr.push("uniform vec3 lightdir"+i+";\n");
			
			if((lights[i].type==GLGE.L_SPOT || lights[i].type==GLGE.L_DIR) && lights[i].getCastShadows() ){
				vertexStr.push("uniform mat4 lightmat"+i+";\n");
				vertexStr.push("varying vec4 spotcoord"+i+";\n");
			}
	}
	
	vertexStr.push("varying vec3 eyevec;\n"); 
	for(var i=0; i<lights.length;i++){
			if(lights[i].type==GLGE.L_OFF) continue;
			vertexStr.push("varying vec3 lightvec"+i+";\n"); 
			vertexStr.push("varying float lightdist"+i+";\n"); 
	}
	
	if(this.mesh.joints && this.mesh.joints.length>0){
		vertexStr.push("uniform vec4 jointMat["+(3*this.mesh.joints.length)+"];\n"); 
	}
	
	if(this.material) vertexStr.push(this.material.getVertexVarying(vertexStr));
    
	vertexStr.push("varying vec3 n;\n");  
	vertexStr.push("varying vec3 t;\n");  
	if(colors) vertexStr.push("varying vec4 vcolor;\n");  
	vertexStr.push("varying vec4 UVCoord;\n");
	vertexStr.push("varying vec3 OBJCoord;\n");
	
    if(this.shaderVertexInjection){
        vertexStr.push(this.shaderVertexInjection);
    }
    
	vertexStr.push("void main(void)\n");
	vertexStr.push("{\n");
	if(colors) vertexStr.push("vcolor=color;\n");  
	if(UV) vertexStr.push("UVCoord=UV;\n");
		else vertexStr.push("UVCoord=vec4(0.0,0.0,0.0,0.0);\n");
	vertexStr.push("OBJCoord = position;\n");
	vertexStr.push("vec3 tang;\n");
	vertexStr.push("vec4 pos = vec4(0.0, 0.0, 0.0, 1.0);\n");
	vertexStr.push("vec4 norm = vec4(0.0, 0.0, 0.0, 1.0);\n");
	if(tangent) vertexStr.push("vec4 tang4 = vec4(0.0, 0.0, 0.0, 1.0);\n");
	
	if(joints1){
		if(joints1.size==1){
			vertexStr.push("pos += vec4(dot(jointMat[int(3.0*joints1)],vec4(position,1.0)),\n"+
				"              dot(jointMat[int(3.0*joints1+1.0)],vec4(position,1.0)),\n"+
				"              dot(jointMat[int(3.0*joints1+2.0)],vec4(position,1.0)),1.0)*weights1;\n");
			vertexStr.push("norm += vec4(dot(jointMat[int(3.0*joints1)].xyz,normal),\n"+
				"               dot(jointMat[int(3.0*joints1+1.0)].xyz,normal),\n"+
				"               dot(jointMat[int(3.0*joints1+2.0)].xyz,normal),1.0)*weights1;\n");
			if (tangent)
				vertexStr.push("tang4 += vec4(dot(jointMat[int(3.0*joints1)].xyz,tangent),\n"+
					"               dot(jointMat[int(3.0*joints1+1.0)].xyz,tangent),\n"+
					"               dot(jointMat[int(3.0*joints1+2.0)].xyz,tangent),1.0)*weights1;\n");
		}else{
			for(var i=0;i<joints1.size;i++){
				vertexStr.push("pos += vec4(dot(jointMat[int(3.0*joints1["+i+"])],vec4(position,1.0)),\n"+
					"              dot(jointMat[int(3.0*joints1["+i+"]+1.0)],vec4(position,1.0)),\n"+
					"              dot(jointMat[int(3.0*joints1["+i+"]+2.0)],vec4(position,1.0)),1.0)*weights1["+i+"];\n");
				vertexStr.push("norm += vec4(dot(jointMat[int(3.0*joints1["+i+"])].xyz,normal),\n"+
					"               dot(jointMat[int(3.0*joints1["+i+"]+1.0)].xyz,normal),\n"+
					"               dot(jointMat[int(3.0*joints1["+i+"]+2.0)].xyz,normal),1.0)*weights1["+i+"];\n");
				if (tangent)
					vertexStr.push("tang4 += vec4(dot(jointMat[int(3.0*joints1["+i+"])].xyz,tangent),\n"+
						"               dot(jointMat[int(3.0*joints1["+i+"]+1.0)].xyz,tangent),\n"+
						"               dot(jointMat[int(3.0*joints1["+i+"]+2.0)].xyz,tangent),1.0)*weights1["+i+"];\n");
			}
		}


		if(joints2){
		    if(joints2.size==1){
			    vertexStr.push("pos += vec4(dot(jointMat[int(3.0*joints2)],vec4(position,1.0)),\n"+
                               "              dot(jointMat[int(3.0*joints2+1.0)],vec4(position,1.0)),\n"+
                               "              dot(jointMat[int(3.0*joints2+2.0)],vec4(position,1.0)),1.0)*weights2;\n");
			    vertexStr.push("norm += vec4(dot(jointMat[int(3.0*joints2)].xyz,normal),\n"+
                               "               dot(jointMat[int(3.0*joints2+1.0)].xyz,normal),\n"+
                               "               dot(jointMat[int(3.0*joints2+2.0)].xyz,normal),1.0)*weights2;\n");
				if (tangent)
						vertexStr.push("tang4 += vec4(dot(jointMat[int(3.0*joints2)].xyz,tangent),\n"+
						   "               dot(jointMat[int(3.0*joints2+1.0)].xyz,tangent),\n"+
						   "               dot(jointMat[int(3.0*joints2+2.0)].xyz,tangent),1.0)*weights2;\n");
		    }else{
			    for(var i=0;i<joints2.size;i++){
			        vertexStr.push("pos += vec4(dot(jointMat[int(3.0*joints2["+i+"])],vec4(position,1.0)),\n"+
                                   "              dot(jointMat[int(3.0*joints2["+i+"]+1.0)],vec4(position,1.0)),\n"+
                                   "              dot(jointMat[int(3.0*joints2["+i+"]+2.0)],vec4(position,1.0)),1.0)*weights2["+i+"];\n");
			        vertexStr.push("norm += vec4(dot(jointMat[int(3.0*joints2["+i+"])].xyz,normal),\n"+
                                   "               dot(jointMat[int(3.0*joints2["+i+"]+1.0)].xyz,normal),\n"+
                                   "               dot(jointMat[int(3.0*joints2["+i+"]+2.0)].xyz,normal),1.0)*weights2["+i+"];\n");
				if (tangent)
					    vertexStr.push("tang4 += vec4(dot(jointMat[int(3.0*joints2["+i+"])].xyz,tangent),\n"+
					       "               dot(jointMat[int(3.0*joints2["+i+"]+1.0)].xyz,tangent),\n"+
					       "               dot(jointMat[int(3.0*joints2["+i+"]+2.0)].xyz,tangent),1.0)*weights2["+i+"];\n");
			    }
		    }
		}
		
		for(var i=0; i<lights.length;i++){
			if(lights[i].type==GLGE.L_OFF) continue;
			if((lights[i].type==GLGE.L_SPOT || lights[i].type==GLGE.L_DIR) && lights[i].getCastShadows() ){
				vertexStr.push("spotcoord"+i+"=lightmat"+i+"*vec4(pos.xyz,1.0);\n");
			}
		}        
		if(this.shaderVertexInjection && this.shaderVertexInjection.indexOf("GLGE_Position")>-1){
		    vertexStr.push("pos=GLGE_Position(vec4(pos.xyz, 1.0));\n");
		}
		vertexStr.push("pos = worldView * vec4(pos.xyz, 1.0);\n");
		vertexStr.push("norm = worldInverseTranspose * vec4(norm.xyz, 1.0);\n");
		if(tangent) vertexStr.push("tang = (worldInverseTranspose*vec4(tang4.xyz,1.0)).xyz;\n");
	}else{	
		if(morph){
			vertexStr.push("vec4 pos4=vec4(mix(position,position2,framesBlend),1.0);\n");
		}else{
			vertexStr.push("vec4 pos4=vec4(position,1.0);\n");
		}
		  
		  
		if(this.shaderVertexInjection && this.shaderVertexInjection.indexOf("GLGE_Position")>-1){
		    vertexStr.push("pos4=GLGE_Position(pos4);\n");
		}
		
		//vertexStr.push("pos4.xyz = (pos4.xyz-cameraPos.xyz)/(pow(length(pos4.xyz-cameraPos.xyz),0.5))+cameraPos.xyz;\n");
		for(var i=0; i<lights.length;i++){
			if(lights[i].type==GLGE.L_OFF) continue;
			if((lights[i].type==GLGE.L_SPOT || lights[i].type==GLGE.L_DIR) && lights[i].getCastShadows() ){
			vertexStr.push("spotcoord"+i+"=lightmat"+i+"*pos4;\n");
			}
		}  
		
		vertexStr.push("pos = worldView * pos4;\n");
		if(morph){
			vertexStr.push("norm = worldInverseTranspose * vec4(mix(normal,normal2,framesBlend), 1.0);\n");  
			if(tangent) vertexStr.push("tang = (worldInverseTranspose*vec4(mix(tangent,tangent2,framesBlend),1.0)).xyz;\n");
		}else{
			vertexStr.push("norm = worldInverseTranspose * vec4(normal, 1.0);\n");  
			if(tangent) vertexStr.push("tang = (worldInverseTranspose*vec4(tangent,1.0)).xyz;\n");
		}
	}
    

	
	
	vertexStr.push("eyevec = -pos.xyz;\n");
	
	if(tangent) vertexStr.push("t = normalize(tang);");
		else  vertexStr.push("t = vec3(0.0,0.0,0.0);");
	vertexStr.push("n = normalize(norm.rgb);");

	
	for(var i=0; i<lights.length;i++){			
			if(lights[i].type==GLGE.L_OFF) continue;
			if(lights[i].getType()==GLGE.L_DIR){
				vertexStr.push("lightvec"+i+" = -lightdir"+i+";\n");
			}else{
				vertexStr.push("lightvec"+i+" = pos.xyz-lightpos"+i+";\n");
			}
			
			vertexStr.push("lightdist"+i+" = length(lightpos"+i+".xyz-pos.xyz);\n");
	}
	if(this.material) vertexStr.push(this.material.getLayerCoords(this.shaderVertexInjection));

	vertexStr.push("gl_Position = projection * pos;\n");
	vertexStr.push("gl_PointSize="+(this.pointSize.toFixed(5))+";\n");
	vertexStr.push("}\n");
	
	vertexStr=vertexStr.join("");

	//Fragment Shader
	fragStr=this.material.getFragmentShader(lights,colors,this.shaderVertexInjection,false);
	if(this.shadowAlpha){
		shfragStr=this.material.getFragmentShader(lights,colors,this.shaderVertexInjection,true);
	}else{
		shfragStr=this.shfragStr;
	}

	this.GLFragmentShaderNormal=GLGE.getGLShader(gl,gl.FRAGMENT_SHADER,this.nfragStr);
	this.GLFragmentShaderShadow=GLGE.getGLShader(gl,gl.FRAGMENT_SHADER,shfragStr);
	this.GLFragmentShaderPick=GLGE.getGLShader(gl,gl.FRAGMENT_SHADER,this.pkfragStr);
	this.GLFragmentShader=GLGE.getGLShader(gl,gl.FRAGMENT_SHADER,fragStr);
	this.GLVertexShader=GLGE.getGLShader(gl,gl.VERTEX_SHADER,vertexStr+"//default");
	this.GLVertexShaderShadow=GLGE.getGLShader(gl,gl.VERTEX_SHADER,vertexStr+"//shadow");
	this.GLVertexShaderPick=GLGE.getGLShader(gl,gl.VERTEX_SHADER,vertexStr+"//pick");
	this.GLVertexShaderNormal=GLGE.getGLShader(gl,gl.VERTEX_SHADER,vertexStr+"//normal");

	this.GLShaderProgramPick=GLGE.getGLProgram(gl,this.GLVertexShaderPick,this.GLFragmentShaderPick);
	this.GLShaderProgramNormal=GLGE.getGLProgram(gl,this.GLVertexShaderNormal,this.GLFragmentShaderNormal);
	this.GLShaderProgramShadow=GLGE.getGLProgram(gl,this.GLVertexShaderShadow,this.GLFragmentShaderShadow);
	this.GLShaderProgram=GLGE.getGLProgram(gl,this.GLVertexShaderShadow,this.GLFragmentShader);
	
	//if we failed then check for fallback option
	if (!gl.getProgramParameter(this.GLShaderProgram, gl.LINK_STATUS)) {
		if(this.material.fallback){
			this.material=this.material.fallback;
			this.multimaterial.material=this.material;
			this.GLGenerateShader(gl);
		}
	}

}
/**
* creates shader programs;
* @param multimaterial the multimaterial object to create the shader programs for
* @private
*/
GLGE.Object.prototype.createShaders=function(multimaterial){
	if(this.gl){
		this.mesh=multimaterial.mesh;
		this.material=multimaterial.material;
		this.multimaterial=multimaterial;
		this.GLGenerateShader(this.gl);
		multimaterial.GLShaderProgramPick=this.GLShaderProgramPick;
		multimaterial.GLShaderProgramShadow=this.GLShaderProgramShadow;
		multimaterial.GLShaderProgram=this.GLShaderProgram;
	}
}

/**
* Sets the shader program uniforms ready for rendering
* @private
*/
GLGE.Object.prototype.GLUniforms=function(gl,renderType,pickindex){
	var program;
	switch(renderType){
		case GLGE.RENDER_DEFAULT:
			program=this.GLShaderProgram;
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,program, "emitpass"), 0);
        	break;
		case GLGE.RENDER_EMIT:
			program=this.GLShaderProgram;
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,program, "emitpass"), 1);
		break;
		case GLGE.RENDER_SHADOW:
			program=this.GLShaderProgramShadow;
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,program, "shadowtype"), 1);
			break;
		case GLGE.RENDER_DEPTH:
			program=this.GLShaderProgramShadow;
			GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,program, "cascadeLevel"), 2);
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,program, "shadowtype"), 0);
			break;
		case GLGE.RENDER_NORMAL:
			program=this.GLShaderProgramNormal;
			break;
		case GLGE.RENDER_PICK:
			program=this.GLShaderProgramPick;
			var b = pickindex >> 16 & 0xFF; 
			var g = pickindex >> 8 & 0xFF; 
			var r = pickindex & 0xFF;
			GLGE.setUniform3(gl,"3f",GLGE.getUniformLocation(gl,program, "pickcolor"), r/255,g/255,b/255);
			break;
	}
    //set the line width
    gl.lineWidth(this.lineWidth);
    
    //set custom uinforms
    for(var key in this.uniforms){
    	var uniform=this.uniforms[key];
    	if(uniform.type=="Matrix4fv"){
    		GLGE.setUniformMatrix(gl,"Matrix4fv",GLGE.getUniformLocation(gl,program, key),false,uniform.value);
    	}else{
    		GLGE.setUniform(gl,uniform.type,GLGE.getUniformLocation(gl,program, key),uniform.value);
    	}
    }
	
	if(!program.caches) program.caches={};
	if(!program.glarrays) program.glarrays={};
	var pc=program.caches;
	var pgl=program.glarrays;
	var scene=gl.scene;
	var camera=scene.camera;

	if(pc.far!=camera.far){
		GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,program, "far"), camera.far);
		pc.far=camera.far;
	}
	if(renderType==GLGE.RENDER_DEFAULT || renderType==GLGE.RENDER_EMIT){
		if(pc.ambientColor!=scene.ambientColor){
			var ambientColor=scene.ambientColor;
			GLGE.setUniform3(gl,"3f",GLGE.getUniformLocation(gl,program, "amb"), ambientColor.r,ambientColor.g,ambientColor.b);
			pc.ambientColor=ambientColor;
		}
		if(pc.fogFar!=scene.fogFar){
			GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,program, "fogfar"), scene.fogFar);
			pc.fogFar=scene.fogFar;
		}
		if(pc.fogNear!=scene.fogNear){
			GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,program, "fognear"), scene.fogNear);
			pc.fogNear=scene.fogNear;
		}
		if(pc.fogType!=scene.fogType){
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,program, "fogtype"), scene.fogType);
			pc.fogType=scene.fogType;
		}
		if(pc.fogType!=scene.fogcolor){
			GLGE.setUniform3(gl,"3f",GLGE.getUniformLocation(gl,program, "fogcolor"), scene.fogColor.r,scene.fogColor.g,scene.fogColor.b);
			pc.fogcolor=scene.fogcolor;
		}
	}
	if(pc.meshBlendFactor!=this.meshBlendFactor){
		GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,program, "framesBlend"), this.meshBlendFactor);
		pc.meshBlendFactor=this.meshBlendFactor;
	}

			
	
	var cameraMatrix=camera.getViewMatrix();
	var objMatrix=modelMatrix=this.getModelMatrix();
	
	if(!pc.mvMatrix) pc.mvMatrix={cameraMatrix:null,modelMatrix:null};
	var mvCache=pc.mvMatrix;
	
	if(mvCache.cameraMatrix!=cameraMatrix || mvCache.modelMatrix!=modelMatrix){
		//generate and set the modelView matrix
		if(!this.caches.mvMatrix) this.caches.mvMatrix=GLGE.mulMat4(cameraMatrix,modelMatrix);
		mvMatrix=this.caches.mvMatrix;
		
		if(this.mesh.joints){
		mvMatrix=cameraMatrix;
		}
		

	
		var mvUniform = GLGE.getUniformLocation(gl,program, "worldView");
		var M1=GLGE.transposeMat4(mvMatrix);
		if(!pgl.mvMatrix){
			pgl.mvMatrixT=new Float32Array(M1);
		}else{
			GLGE.mat4gl(M1,pgl.mvMatrixT);
		}
		//GLGE.reuseMatrix4(M1);
		pgl.mvMatrix=mvMatrix;
		GLGE.setUniformMatrix(gl,"Matrix4fv",mvUniform, false, program.glarrays.mvMatrixT);
	    
		//invCamera matrix
		var icUniform = GLGE.getUniformLocation(gl,program, "envMat");
		if(icUniform){
			if(!this.caches.envMat){
				var envMat = GLGE.inverseMat4(cameraMatrix);
				envMat[3]=0;
				envMat[7]=0;
				envMat[11]=0;
				this.caches.envMat = envMat;
			}
			envMat=this.caches.envMat;
			M1=GLGE.transposeMat4(envMat);
			if(!program.glarrays.envMat){
				pgl.envMatT=new Float32Array(M1);
			}else{
				GLGE.mat4gl(M1,pgl.envMatT);	
			}
			pgl.envMat=envMat;
				
			GLGE.setUniformMatrix(gl,"Matrix4fv",icUniform, false, pgl.envMatT);
		}
		//normalising matrix
		if(!this.caches.normalMatrix){
			var normalMatrix = GLGE.inverseMat4(mvMatrix);
			this.caches.normalMatrix = normalMatrix;
		}
		normalMatrix=this.caches.normalMatrix;
		var nUniform = GLGE.getUniformLocation(gl,program, "worldInverseTranspose");
		
		if(!pgl.normalMatrix) pgl.normalMatrix=new Float32Array(normalMatrix);
			else GLGE.mat4gl(normalMatrix,pgl.normalMatrix);	
		GLGE.setUniformMatrix(gl,"Matrix4fv",nUniform, false, pgl.normalMatrix);
		
		var cUniform = GLGE.getUniformLocation(gl,program, "view");
		M1=GLGE.transposeMat4(cameraMatrix);
		if(!pgl.cameraMatrix){
			pgl.cameraMatrixT=new Float32Array(M1);
		}else{
			GLGE.mat4gl(M1,pgl.cameraMatrixT);	
		}
		//GLGE.reuseMatrix4(M1);
		pgl.cameraMatrix=cameraMatrix;
			
		GLGE.setUniformMatrix(gl,"Matrix4fv",cUniform, false, pgl.cameraMatrixT);
		
		mvCache.cameraMatrix=cameraMatrix;
		mvCache.modelMatrix=modelMatrix;
	}


	var pUniform = GLGE.getUniformLocation(gl,program, "projection");
	M1=GLGE.transposeMat4(camera.getProjectionMatrix());
	if(!pgl.pMatrix){
		pgl.pMatrixT=new Float32Array(M1);
	}else{
		GLGE.mat4gl(M1,pgl.pMatrixT);	
	}
	//GLGE.reuseMatrix4(M1);
	pgl.pMatrix=camera.getProjectionMatrix();
			
	GLGE.setUniformMatrix(gl,"Matrix4fv",pUniform, false, pgl.pMatrixT);

	

	
	//light
	//dont' need lighting for picking
	if(renderType==GLGE.RENDER_DEFAULT || renderType==GLGE.RENDER_SHADOW || renderType==GLGE.RENDER_DEPTH || renderType==GLGE.RENDER_EMIT){
		var pos,lpos;
		var lights=gl.lights
		if(!pc.lights) pc.lights=[];
		if(!pgl.lights) pgl.lights=[];
		if(!this.caches.lights) this.caches.lights=[];
		var lightCache=pc.lights;
		for(var i=0; i<lights.length;i++){
			if(lights[i].type==GLGE.L_OFF) continue;
			if(!lightCache[i]) lightCache[i]={modelMatrix:null,cameraMatrix:null};
			if(lightCache[i].modelMatrix!=modelMatrix || lightCache[i].cameraMatrix!=cameraMatrix){
				if(!this.caches.lights[i])this.caches.lights[i]={};
				
				if(!this.caches.lights[i].pos) this.caches.lights[i].pos=GLGE.mulMat4Vec4(GLGE.mulMat4(cameraMatrix,lights[i].getModelMatrix()),[0,0,0,1]);
				pos=this.caches.lights[i].pos;
				GLGE.setUniform3(gl,"3f",GLGE.getUniformLocation(gl,program, "lightpos"+i), pos[0],pos[1],pos[2]);	

					
				
				
				if(!this.caches.lights[i].lpos) this.caches.lights[i].lpos=GLGE.mulMat4Vec4(GLGE.mulMat4(cameraMatrix,lights[i].getModelMatrix()),[0,0,1,1]);
				lpos=this.caches.lights[i].lpos;
				GLGE.setUniform3(gl,"3f",GLGE.getUniformLocation(gl,program, "lightdir"+i),lpos[0]-pos[0],lpos[1]-pos[1],lpos[2]-pos[2]);
				
				if(lights[i].s_cache){
					var lightmat=GLGE.mulMat4(lights[i].s_cache.smatrix,modelMatrix);

					if(!pgl.lights[i]) pgl.lights[i]=new Float32Array(lightmat);
						else GLGE.mat4gl(lightmat,pgl.lights[i]);
					GLGE.setUniformMatrix(gl,"Matrix4fv",GLGE.getUniformLocation(gl,program, "lightmat"+i), true,pgl.lights[i]);
					GLGE.setUniform2(gl,"2f",GLGE.getUniformLocation(gl,program, "shadowoffset"+i), lights[i].s_cache.pmatrix[3],lights[i].s_cache.pmatrix[7]);
					lightCache[i].modelMatrix=modelMatrix;
					lightCache[i].cameraMatrix=cameraMatrix;
				}else{
					lightCache[i].modelMatrix=modelMatrix;
					lightCache[i].cameraMatrix=cameraMatrix;
				}
			}
		}
	}
	
	if(this.mesh.joints){
		if(!pc.joints) pc.joints=[];
		if(!pgl.joints) pgl.joints=[];
		if(!pgl.jointsT) pgl.jointsT=[];
		if(!pgl.jointsinv) pgl.jointsinv=[];
        if ((!pgl.jointsCombined)||pgl.jointsCombined.length!=this.mesh.joints.length*12) 
            pgl.jointsCombined = new Float32Array(this.mesh.joints.length*12);
		var jointCache=pc.joints;
		var ident=GLGE.identMatrix();
		for(i=0;i<this.mesh.joints.length;i++){
			if(!jointCache[i]) jointCache[i]={modelMatrix:null,invBind:null};
			if(typeof this.mesh.joints[i]=="string"){
				if(!this.bones) this.bones=this.skeleton.getNames();
				if(this.bones){
					var modelMatrix=this.bones[this.mesh.joints[i]].getModelMatrix();
				}
			}else{
				var modelMatrix=this.mesh.joints[i].getModelMatrix();
			}
			var invBind=this.mesh.invBind[i];
			if(jointCache[i].modelMatrix!=modelMatrix || jointCache[i].invBind!=invBind){
				var jointmat=GLGE.mulMat4(modelMatrix,invBind); 
				//jointmat=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];
				if(!pgl.joints[i]){
					pgl.jointsT[i]=new Float32Array(GLGE.transposeMat4(jointmat));
				}else{
					GLGE.mat4gl(GLGE.transposeMat4(jointmat),pgl.jointsT[i]);	
				}
				pgl.joints[i]=jointmat;
				if(!pgl.jointsinv[i]) pgl.jointsinv[i]=new Float32Array(GLGE.inverseMat4(jointmat));
				else GLGE.mat4gl(GLGE.inverseMat4(jointmat),pgl.jointsinv[i]);		
				var mat=pgl.jointsT[i];
				var combinedMat=pgl.jointsCombined;
				combinedMat[i*12]=mat[0];
				combinedMat[i*12+1]=mat[4];
				combinedMat[i*12+2]=mat[8];
				combinedMat[i*12+3]=mat[12];

				combinedMat[i*12+4]=mat[1];
				combinedMat[i*12+5]=mat[5];
				combinedMat[i*12+6]=mat[9];
				combinedMat[i*12+7]=mat[13];

				combinedMat[i*12+8]=mat[2];
				combinedMat[i*12+9]=mat[6];
				combinedMat[i*12+10]=mat[10];
				combinedMat[i*12+11]=mat[14];
                
				//GLGE.setUniform4(gl,"4f",GLGE.getUniformLocation(gl,program, "jointMat["+(i*3)+"]"), mat[0],mat[4],mat[8],mat[12]);
				//GLGE.setUniform4(gl,"4f",GLGE.getUniformLocation(gl,program, "jointMat["+(i*3+1)+"]"), mat[1],mat[5],mat[9],mat[13]);
				//GLGE.setUniform4(gl,"4f",GLGE.getUniformLocation(gl,program, "jointMat["+(i*3+2)+"]"), mat[2],mat[6],mat[10],mat[14]);
				jointCache[i].modelMatrix=modelMatrix;
				jointCache[i].invBind=invBind;
			}
		}
		gl.uniform4fv(GLGE.getUniformLocation(gl,program, "jointMat"),pgl.jointsCombined);
	}


	if(this.material && (renderType==GLGE.RENDER_DEFAULT || renderType==GLGE.RENDER_EMIT || this.shadowAlpha) && gl.scene.lastMaterial!=this.material){
		this.material.textureUniforms(gl,program,lights,this,renderType);
		gl.scene.lastMaterial=this.material;
	}
}
/**
* Renders the object to the screen
* @private
*/
GLGE.Object.prototype.GLRender=function(gl,renderType,pickindex,multiMaterial,distance){
	if(!gl) return;
	if(!this.gl) this.GLInit(gl);
	
	//if look at is set then look
	if(this.lookAt) this.Lookat(this.lookAt);
 
	//animate this object
	if(renderType==GLGE.RENDER_DEFAULT){
		if(this.animation) this.animate();
	}
	
	if(!this.renderCaches[renderType]) this.renderCaches[renderType]={};
	
	var cameraMatrix=gl.scene.camera.getViewMatrix();
	var modelMatrix=this.getModelMatrix();
	
	if(this.renderCaches[renderType].cameraMatrix!=cameraMatrix || this.renderCaches[renderType].modelMatrix!=modelMatrix){
		this.renderCaches[renderType]={};
		this.renderCaches[renderType].cameraMatrix=cameraMatrix;
		this.renderCaches[renderType].modelMatrix=modelMatrix;
	}
	
	this.caches=this.renderCaches[renderType];
	
	
	

	var pixelsize;
	
	if(multiMaterial==undefined){
		var start=0;
		var end=this.multimaterials.length;
	}else{
		var start=multiMaterial;
		var end=multiMaterial+1;
	}

	for(var i=start; i<end;i++){
		if(this.multimaterials[i].lods.length>1 && !pixelsize){
			var camerapos=gl.scene.camera.getPosition();
			var modelpos=this.getPosition();
			var dist=GLGE.lengthVec3([camerapos.x-modelpos.x,camerapos.y-modelpos.y,camerapos.z-modelpos.z]);
			dist=GLGE.mulMat4Vec4(gl.scene.camera.getProjectionMatrix(),[this.getBoundingVolume().getSphereRadius(),0,-dist,1]);
			pixelsize=dist[0]/dist[3]*gl.scene.renderer.canvas.width;
		}
	
		var lod=this.multimaterials[i].getLOD(pixelsize);

		if(lod.mesh && lod.mesh.loaded){
			if(renderType==GLGE.RENDER_NULL){
				if(lod.material) lod.material.registerPasses(gl,this);
				break;
			}
			if(!lod.GLShaderProgram){
				this.createShaders(lod);
			}else{
				this.GLShaderProgramPick=lod.GLShaderProgramPick;
				this.GLShaderProgramShadow=lod.GLShaderProgramShadow;
				this.GLShaderProgram=lod.GLShaderProgram;
			}
			this.mesh=lod.mesh;
			this.material=lod.material;
			
			var drawType;
			switch(this.drawType){
				case GLGE.DRAW_LINES:
					drawType=gl.LINES;
					break;
				case GLGE.DRAW_POINTS:
					drawType=gl.POINTS;
					break;
				case GLGE.DRAW_LINELOOPS:
					drawType=gl.LINE_LOOP;
					break;
				case GLGE.DRAW_LINESTRIPS:
					drawType=gl.LINE_STRIP;
					break;
				case GLGE.DRAW_TRIANGLESTRIP:
					drawType=gl.TRIANGLE_STRIP;
					break;
				default:
					drawType=gl.TRIANGLES;
					break;
			}

			switch(renderType){
				case  GLGE.RENDER_DEFAULT:
				case  GLGE.RENDER_EMIT:
					if(gl.program!=this.GLShaderProgram){
						gl.useProgram(this.GLShaderProgram);
						gl.program=this.GLShaderProgram;
					}
					this.mesh.GLAttributes(gl,this.GLShaderProgram,this.meshFrame1,this.meshFrame2);
					break;
				case  GLGE.RENDER_SHADOW:
				case GLGE.RENDER_DEPTH:
					if(gl.program!=this.GLShaderProgramShadow){
						gl.useProgram(this.GLShaderProgramShadow,this.meshFrame1,this.meshFrame2);
						gl.program=this.GLShaderProgramShadow;
					}
					if(!distance) distance=gl.scene.camera.getFar();
					GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,this.GLShaderProgramShadow, "distance"), distance);
					this.mesh.GLAttributes(gl,this.GLShaderProgramShadow,this.meshFrame1,this.meshFrame2);
					break;
				case  GLGE.RENDER_NORMAL:
					if(gl.program!=this.GLShaderProgramNormal){
						gl.useProgram(this.GLShaderProgramNormal);
						gl.program=this.GLShaderProgramNormal;
					}
					this.mesh.GLAttributes(gl,this.GLShaderProgramNormal,this.meshFrame1,this.meshFrame2);
					break;
				case  GLGE.RENDER_PICK:
					if(gl.program!=this.GLShaderProgramPick){
						gl.useProgram(this.GLShaderProgramPick);
						gl.program=this.GLShaderProgramPick;
					}
					this.mesh.GLAttributes(gl,this.GLShaderProgramPick,this.meshFrame1,this.meshFrame2);
					drawType=gl.TRIANGLES;
					break;
			}
			//render the object
			this.GLUniforms(gl,renderType,pickindex);
			switch (this.mesh.windingOrder) {
				case GLGE.Mesh.WINDING_ORDER_UNKNOWN:
					if (gl.scene.renderer.cullFaces){
						gl.cullFace(gl.scene.mirror ? gl.FRONT : gl.BACK);
						gl.enable(gl.CULL_FACE); 
					}else{
						gl.disable(gl.CULL_FACE); 
					}
					break;
				case GLGE.Mesh.WINDING_ORDER_CLOCKWISE:
					gl.cullFace(gl.scene.mirror ? gl.FRONT : gl.BACK);
					gl.enable(gl.CULL_FACE);    
					break;
				case GLGE.Mesh.WINDING_ORDER_COUNTER:
					gl.cullFace(gl.scene.mirror ? gl.BACK : gl.FRONT);
					gl.enable(gl.CULL_FACE);    
				default:
					break;
			}
			if(renderType==GLGE.RENDER_PICK) gl.disable(gl.CULL_FACE); 
			if(this.noDepthMask) gl.depthMask(false);
			if(this.mesh.GLfaces){
				gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.mesh.GLfaces);
				gl.drawElements(drawType, this.mesh.GLfaces.numItems, gl.UNSIGNED_SHORT, 0);
			}else{
				gl.drawArrays(drawType, 0, this.mesh.positions.length/3);
			}
			gl.depthMask(true);
			
			switch (this.mesh.windingOrder) {
				case GLGE.Mesh.WINDING_ORDER_UNKNOWN:
					if (gl.scene.renderer.cullFaces)
						gl.enable(gl.CULL_FACE);    
					break;
				case GLGE.Mesh.WINDING_ORDER_COUNTER:
					gl.cullFace(gl.BACK);
				default:
					break;
			}
			var matrix=this.matrix;
			var caches=this.caches;
			

			this.matrix=matrix;
			this.caches=caches;
		}
	}
}

})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_text.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){





/**
* @class Text that can be rendered in a scene
* @augments GLGE.Animatable
* @augments GLGE.Placeable
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.Text=function(uid){
	this.canvas=document.createElement("canvas");
	this.scaleCanvas=document.createElement("canvas");
	this.color={r:1.0,g:1.0,b:1.0};
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.Placeable,GLGE.Text);
GLGE.augment(GLGE.Animatable,GLGE.Text);
GLGE.augment(GLGE.QuickNotation,GLGE.Text);
GLGE.augment(GLGE.JSONLoader,GLGE.Text);
GLGE.Text.prototype.className="Text";
GLGE.Text.prototype.zTrans=true;
GLGE.Text.prototype.canvas=null;
GLGE.Text.prototype.aspect=1.0;
GLGE.Text.prototype.color=null;
GLGE.Text.prototype.text="";
GLGE.Text.prototype.font="Times";
GLGE.Text.prototype.size=100;
GLGE.Text.prototype.pickType=GLGE.TEXT_TEXTPICK;
GLGE.Text.prototype.pickable=true;
GLGE.Text.prototype.alpha=1;
GLGE.Text.prototype.dirty=true;

/**
* Gets the pick type for this text
* @returns {string} the pick type
*/
GLGE.Text.prototype.getPickType=function(){
	return this.pickType;
};
/**
* Sets the pick type GLGE.TEXT_BOXPICK for picking based on bound box or GLGE.TEXT_TEXTPICK for pixel perfect text picking
* @param {Number} value the picking type
*/
GLGE.Text.prototype.setPickType=function(value){
	this.pickType=value;
	return this;
};
/**
* Gets the font of the text
* @returns {string} the font of the text
*/
GLGE.Text.prototype.getFont=function(){
	return this.size;
};
/**
* Sets the font of the text
* @param {Number} value the font of the text
*/
GLGE.Text.prototype.setFont=function(value){
	this.font=value;
	this.dirty=true;
	return this;
};
/**
* Gets the size of the text
* @returns {string} the size of the text
*/
GLGE.Text.prototype.getSize=function(){
	return this.size;
};
/**
* Sets the size of the text
* @param {Number} value the size of the text
*/
GLGE.Text.prototype.setSize=function(value){
	this.size=value;
	this.dirty=true;
	return this;
};
/**
* Gets the rendered text
* @returns {string} the text rendered
*/
GLGE.Text.prototype.getText=function(){
	return this.text;
};
/**
* Sets the text to be rendered
* @param {Number} value the text to render
*/
GLGE.Text.prototype.setText=function(value){
	this.text=value;
	this.dirty=true;
	return this;
};
/**
* Sets the base colour of the text
* @param {string} color The colour of the material
*/
GLGE.Text.prototype.setColor=function(color){
	color=GLGE.colorParse(color);
	this.color={r:color.r,g:color.g,b:color.b};
	return this;
};
/**
* Sets the red base colour of the text
* @param {Number} r The new red level 0-1
*/
GLGE.Text.prototype.setColorR=function(value){
	this.color.r=value;
	return this;
};
/**
* Sets the green base colour of the text
* @param {Number} g The new green level 0-1
*/
GLGE.Text.prototype.setColorG=function(value){
	this.color.g=value;
	return this;
};
/**
* Sets the blue base colour of the text
* @param {Number} b The new blue level 0-1
*/
GLGE.Text.prototype.setColorB=function(value){
	this.color.b=value;
	return this;
};
/**
* Gets the current base color of the text
* @return {[r,g,b]} The current base color
*/
GLGE.Text.prototype.getColor=function(){
	return this.color;
	return this;
};

/**
* Sets the alpha
* @param {Number} b The new alpha level 0-1
*/
GLGE.Text.prototype.setAlpha=function(value){
	this.alpha=value;
	return this;
};

/**
* Gets the alpha
* @returns The alpha level
*/
GLGE.Text.prototype.getAlpha=function(){
	return this.alpha;
};

/**
* Sets the Z Transparency of this text
* @param {boolean} value Does this object need blending?
*/
GLGE.Text.prototype.setZtransparent=function(value){
	this.zTrans=value;
	return this;
}
/**
* Gets the z transparency
* @returns boolean
*/
GLGE.Text.prototype.isZtransparent=function(){
	return this.zTrans;
}
/**
* Creates the shader program for the object
* @private
*/
GLGE.Text.prototype.GLGenerateShader=function(gl){
	if(this.GLShaderProgram) gl.deleteProgram(this.GLShaderProgram);

	//Vertex Shader
	var vertexStr="";
	vertexStr+="attribute vec3 position;\n";
	vertexStr+="attribute vec2 uvcoord;\n";
	vertexStr+="varying vec2 texcoord;\n";
	vertexStr+="uniform mat4 Matrix;\n";
	vertexStr+="uniform mat4 PMatrix;\n";
	vertexStr+="varying vec4 pos;\n";
	
	vertexStr+="void main(void){\n";
	vertexStr+="texcoord=uvcoord;\n";    
	vertexStr+="pos = Matrix * vec4(position,1.0);\n";
	vertexStr+="gl_Position = PMatrix * pos;\n";
	vertexStr+="}\n";
	
	//Fragment Shader
	var fragStr="#ifdef GL_ES\nprecision highp float;\n#endif\n";
	fragStr=fragStr+"uniform sampler2D TEXTURE;\n";
	fragStr=fragStr+"varying vec2 texcoord;\n";
	fragStr=fragStr+"uniform mat4 Matrix;\n";
	fragStr=fragStr+"varying vec4 pos;\n";
	fragStr=fragStr+"uniform float far;\n";
	fragStr=fragStr+"uniform bool depthrender;\n";
	fragStr=fragStr+"uniform float distance;\n";
	fragStr=fragStr+"uniform int picktype;\n";
	fragStr=fragStr+"uniform vec3 pickcolor;\n";
	fragStr=fragStr+"uniform vec3 color;\n";
	fragStr=fragStr+"uniform float alpha;\n";
	fragStr=fragStr+"void main(void){\n";
	fragStr=fragStr+"float ob=pow(min(1.0,abs(dot(normalize(Matrix[2].rgb),vec3(0.0,0.0,1.0)))*2.0),1.5);\n";
	fragStr=fragStr+"float a=texture2D(TEXTURE,texcoord).a*alpha*ob;\n";
	fragStr=fragStr+"if(picktype=="+GLGE.TEXT_BOXPICK+"){gl_FragColor = vec4(pickcolor,1.0);}"
	fragStr=fragStr+"else if(picktype=="+GLGE.TEXT_TEXTPICK+"){if(alpha<1.0) discard; gl_FragColor = vec4(pickcolor,alpha);}"
	fragStr=fragStr+"else{gl_FragColor = vec4(color.rgb,a);};\n";
	fragStr=fragStr+"if (depthrender) { if(a<0.5) discard; float depth = gl_FragCoord.z / gl_FragCoord.w;\n";
	fragStr=fragStr+"vec4 rgba=fract(depth/distance * vec4(16777216.0, 65536.0, 256.0, 1.0));\n";
	fragStr=fragStr+"gl_FragColor=rgba-rgba.rrgb*vec4(0.0,0.00390625,0.00390625,0.00390625);}\n";
	fragStr=fragStr+"}\n";
	
	this.GLFragmentShader=gl.createShader(gl.FRAGMENT_SHADER);
	this.GLVertexShader=gl.createShader(gl.VERTEX_SHADER);


	gl.shaderSource(this.GLFragmentShader, fragStr);
	gl.compileShader(this.GLFragmentShader);
	if (!gl.getShaderParameter(this.GLFragmentShader, gl.COMPILE_STATUS)) {
	      GLGE.error(gl.getShaderInfoLog(this.GLFragmentShader));
	      return;
	}
	
	//set and compile the vertex shader
	//need to set str
	gl.shaderSource(this.GLVertexShader, vertexStr);
	gl.compileShader(this.GLVertexShader);
	if (!gl.getShaderParameter(this.GLVertexShader, gl.COMPILE_STATUS)) {
		GLGE.error(gl.getShaderInfoLog(this.GLVertexShader));
		return;
	}
	
	this.GLShaderProgram = gl.createProgram();
	gl.attachShader(this.GLShaderProgram, this.GLVertexShader);
	gl.attachShader(this.GLShaderProgram, this.GLFragmentShader);
	gl.linkProgram(this.GLShaderProgram);	
}
/**
* Initiallize all the GL stuff needed to render to screen
* @private
*/
GLGE.Text.prototype.GLInit=function(gl){
	this.gl=gl;
	this.createPlane(gl);
	this.GLGenerateShader(gl);
	
	this.glTexture=gl.createTexture();
	this.dirty=true;
}
/**
* Updates the canvas texture
* @private
*/
GLGE.Text.prototype.updateCanvas=function(gl){
	var canvas = this.canvas;
	canvas.width=1;
	canvas.height=this.size*1.2;
	var ctx = canvas.getContext("2d");
	ctx.font = this.size+"px "+this.font;
	canvas.width=ctx.measureText(this.text).width;
	canvas.height=this.size*1.2;
	 ctx = canvas.getContext("2d");
	ctx.textBaseline="top";
	ctx.font = (this.extra||"") + " " + this.size+"px "+this.font;
	this.aspect=canvas.width/canvas.height;
	ctx.fillText(this.text, 0, 0);   
	
	var height=Math.pow(2,Math.ceil(Math.log(canvas.height))/(Math.log(2)));
	var width=Math.pow(2,Math.ceil(Math.log(canvas.width))/(Math.log(2)));

	this.scaleCanvas.height=height;
	this.scaleCanvas.width=width;

	this.scaleContext=this.scaleCanvas.getContext("2d");
	this.scaleContext.clearRect(0,0,width,height);
	this.scaleContext.drawImage(canvas, 0, 0, width, height);
	
	gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
	//TODO: fix this when minefield is upto spec
	try{gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.scaleCanvas);}
	catch(e){gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.scaleCanvas,null);}
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);
	
	gl.bindTexture(gl.TEXTURE_2D, null);
	this.dirty=false;
}

/**
* Renders the text to the render buffer
* @private
*/
GLGE.Text.prototype.GLRender=function(gl,renderType,pickindex){
	if(!this.gl){
		this.GLInit(gl);
	}	
	if(this.dirty) this.updateCanvas(gl);
	if(renderType==GLGE.RENDER_DEFAULT || renderType==GLGE.RENDER_PICK || renderType==GLGE.RENDER_SHADOW){
		//if look at is set then look
		if(this.lookAt) this.Lookat(this.lookAt);
		
		if(gl.program!=this.GLShaderProgram){
			gl.useProgram(this.GLShaderProgram);
			gl.program=this.GLShaderProgram;
		}
					
		var attribslot;
		//disable all the attribute initially arrays - do I really need this?
		for(var i=0; i<8; i++) gl.disableVertexAttribArray(i);
		attribslot=GLGE.getAttribLocation(gl,this.GLShaderProgram, "position");

		gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
		gl.enableVertexAttribArray(attribslot);
		gl.vertexAttribPointer(attribslot, this.posBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		attribslot=GLGE.getAttribLocation(gl,this.GLShaderProgram, "uvcoord");
		gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
		gl.enableVertexAttribArray(attribslot);
		gl.vertexAttribPointer(attribslot, this.uvBuffer.itemSize, gl.FLOAT, false, 0, 0);
		
		gl.activeTexture(gl["TEXTURE0"]);
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.GLShaderProgram, "TEXTURE"),0);
		
		if(!pickindex) pickindex=0;
		var b = pickindex >> 16 & 0xFF; 
		var g = pickindex >> 8 & 0xFF; 
		var r = pickindex & 0xFF;
		GLGE.setUniform3(gl,"3f",GLGE.getUniformLocation(gl,this.GLShaderProgram, "pickcolor"),r/255,g/255,b/255);
		
		if(renderType==GLGE.RENDER_PICK){
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.GLShaderProgram, "picktype"), this.pickType);	
		}else{
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.GLShaderProgram, "picktype"), 0);	
		}
		var distance=gl.scene.camera.getFar();
		GLGE.setUniform(gl,"1f",GLGE.getUniformLocation(gl,this.GLShaderProgram, "distance"), distance);
		if(renderType==GLGE.RENDER_SHADOW){
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.GLShaderProgram, "depthrender"), 1);
		}else{
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.GLShaderProgram, "depthrender"), 0);
		}
		
		
		if(!this.GLShaderProgram.glarrays) this.GLShaderProgram.glarrays={};

		
		//generate and set the modelView matrix
		var scalefactor=this.size/100;
		var mMatrix=GLGE.mulMat4(gl.scene.camera.getViewMatrix(),GLGE.mulMat4(this.getModelMatrix(),GLGE.scaleMatrix(this.aspect*scalefactor,scalefactor,scalefactor)));
		var mUniform = GLGE.getUniformLocation(gl,this.GLShaderProgram, "Matrix");
		if(!this.GLShaderProgram.glarrays.mMatrix) this.GLShaderProgram.glarrays.mMatrix=new Float32Array(mMatrix);
			else GLGE.mat4gl(mMatrix,this.GLShaderProgram.glarrays.mMatrix);
		GLGE.setUniformMatrix(gl,"Matrix4fv",mUniform, true, this.GLShaderProgram.glarrays.mMatrix);
		
		var mUniform = GLGE.getUniformLocation(gl,this.GLShaderProgram, "PMatrix");

		if(!this.GLShaderProgram.glarrays.pMatrix) this.GLShaderProgram.glarrays.pMatrix=new Float32Array(gl.scene.camera.getProjectionMatrix());
			else GLGE.mat4gl(gl.scene.camera.getProjectionMatrix(),this.GLShaderProgram.glarrays.pMatrix);
		GLGE.setUniformMatrix(gl,"Matrix4fv",mUniform, true, this.GLShaderProgram.glarrays.pMatrix);
				
		var farUniform = GLGE.getUniformLocation(gl,this.GLShaderProgram, "far");
		GLGE.setUniform(gl,"1f",farUniform, gl.scene.camera.getFar());
			
		var alphaUniform = GLGE.getUniformLocation(gl,this.GLShaderProgram, "alpha");
		GLGE.setUniform(gl,"1f",alphaUniform, this.alpha);
		
		//set the color
		GLGE.setUniform3(gl,"3f",GLGE.getUniformLocation(gl,this.GLShaderProgram, "color"), this.color.r,this.color.g,this.color.b);
		
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.GLfaces);
		gl.drawElements(gl.TRIANGLES, this.GLfaces.numItems, gl.UNSIGNED_SHORT, 0);
		gl.scene.lastMaterial=null;
	}
}
/**
* creates the plane mesh to draw
* @private
*/
GLGE.Text.prototype.createPlane=function(gl){
	//create the vertex positions
	if(!this.posBuffer) this.posBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,1,0,-1,1,0,-1,-1,0,1,-1,0]), gl.STATIC_DRAW);
	this.posBuffer.itemSize = 3;
	this.posBuffer.numItems = 4;
	//create the vertex uv coords
	if(!this.uvBuffer) this.uvBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0,1,0,1,1,0,1]), gl.STATIC_DRAW);
	this.uvBuffer.itemSize = 2;
	this.uvBuffer.numItems = 4;
	//create the faces
	if(!this.GLfaces) this.GLfaces = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.GLfaces);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([2,1,0,0,3,2]), gl.STATIC_DRAW);
	this.GLfaces.itemSize = 1;
	this.GLfaces.numItems = 6;
}


})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_renderer.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){





/**
* @class Sets the scene to render
* @param {object} canvas The canvas element to render to
* @augments GLGE.QuickNotation
*/
GLGE.Renderer=function(canvas,error,props){
	this.viewport=[];
	this.canvas=canvas;
	if(!props) props={alpha:true,depth:true,stencil:true,antialias:true,premultipliedAlpha:true};
	try {
		this.gl = canvas.getContext("experimental-webgl",props);
	} catch(e) {}
	try {
		if(!this.gl) this.gl = canvas.getContext("webgl",props);
	} catch(e) {}
	if(!this.gl) {
        console.log("GLGE err:", typeof(globalNoWebGLError)=="undefined")
		if( (!error) && (typeof(globalNoWebGLError)=="undefined")){
			var div=document.createElement("div");
			div.setAttribute("style","position: absolute; top: 10px; left: 10px; font-family: sans-serif; font-size: 14px; padding: 10px;background-color: #fcffcb;color: #800; width: 200px; border:2px solid #f00");
			div.innerHTML="WebGL compatible Browser Required(Firefox 4 or Chrome 9 and up) or you may need to update your graphics card driver.";
			document.getElementsByTagName("body")[0].appendChild(div);
			throw "cannot create webgl context";
		}else{
			error();
			throw "cannot create webgl context";
		}
	}
	//firefox is doing something here?
	try{
	this.gl.canvas=canvas;
	}catch(e){};
	//this.gl = WebGLDebugUtils.makeDebugContext(this.gl);
	//this.gl.setTracing(true);

	//chome compatibility
	//TODO: Remove this when chome is right
	if (!this.gl.getProgramParameter)
	{
		this.gl.getProgramParameter = this.gl.getProgrami
	}
	if (!this.gl.getShaderParameter)
	{
		this.gl.getShaderParameter = this.gl.getShaderi
	}
	// End of Chrome compatibility code
	
	this.gl.uniformMatrix4fvX=this.gl.uniformMatrix4fv
	this.gl.uniformMatrix4fv=function(uniform,transpose,array){
		if(!transpose){
			this.uniformMatrix4fvX(uniform,false,array);
		}else{
			GLGE.mat4gl(GLGE.transposeMat4(array),array);
			this.uniformMatrix4fvX(uniform,false,array);
		}
	}
	var gl=this.gl;
	
	gl.af = gl.getExtension("MOZ_EXT_texture_filter_anisotropic") || gl.getExtension("WEBKIT_EXT_texture_filter_anisotropic") || gl.getExtension("EXT_texture_filter_anisotropic");;
	
	//set up defaults
	this.gl.clearDepth(1.0);
	this.gl.clearStencil(0);
	this.gl.enable(this.gl.DEPTH_TEST);
    
    
	this.gl.depthFunc(this.gl.LEQUAL);
	this.gl.blendFuncSeparate(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA,this.gl.ZERO,this.gl.ONE);	
};
GLGE.augment(GLGE.QuickNotation,GLGE.Renderer);
GLGE.Renderer.prototype.gl=null;
GLGE.Renderer.prototype.scene=null;
GLGE.C_STENCIL=1;
GLGE.C_DEPTH=2;
GLGE.C_COLOR=4;
GLGE.C_ALL=7;

GLGE.Renderer.prototype.clearType=GLGE.C_ALL;

/**
* Sets the width of the viewport to render
* @param width the width of the viewport to render
*/
GLGE.Renderer.prototype.setViewportWidth=function(width){
	this.viewport[0]=width;
	return this;
};
/**
* Sets the height of the viewport to render
* @param height the height of the viewport to render
*/
GLGE.Renderer.prototype.setViewportHeight=function(height){
	this.viewport[1]=height;
	return this;
};
/**
* Sets the left offset of the viewport to render
* @param left the left offset of the viewport to render
*/
GLGE.Renderer.prototype.setViewportOffsetX=function(left){
	this.viewport[2]=left;
	return this;
};
/**
* Sets the top offset of the viewport to render
* @param top the top offset of the viewport to render
*/
GLGE.Renderer.prototype.setViewportOffsetY=function(top){
	this.viewport[3]=top;
	return this;
};
/**
* Clears all viewport data and defaults back to canvas size
*/
GLGE.Renderer.prototype.clearViewport=function(){
	this.viewport=[];
};
/**
* Gets the width of the viewport to render
* @returns the viewport width
*/
GLGE.Renderer.prototype.getViewportWidth=function(){
	if(this.viewport.length>0){
		return this.viewport[0];
	}else{
		return this.canvas.width;
	}
};
/**
* Gets the height of the viewport to render
* @returns the viewport height
*/
GLGE.Renderer.prototype.getViewportHeight=function(){
	if(this.viewport.length>0){
		return this.viewport[1];
	}else{
		return this.canvas.height;
	}
};
/**
* Gets the left offset of the viewport to render
* @returns the left viewport offset
*/
GLGE.Renderer.prototype.getViewportOffsetX=function(){
	if(this.viewport.length>0){
		return this.viewport[2];
	}else{
		return 0;
	}
};
/**
* Gets the top offset of the viewport to render
* @returns the top viewport offset
*/
GLGE.Renderer.prototype.getViewportOffsetY=function(){
	if(this.viewport.length>0){
		return this.viewport[3];
	}else{
		return 0;
	}
};

/**
* Sets the clear type for rendering GLGE.C_ALL, GLGE.C_STENCIL, GLGE.C_DEPTH, GLGE.C_COLOR
* @param type how to clear the viewport for the next render
*/
GLGE.Renderer.prototype.setClearType=function(type){
	this.clearType=type;
	return this;
};
/**
* Gets the clear type for rendering GLGE.C_ALL, GLGE.C_STENCIL, GLGE.C_DEPTH, GLGE.C_COLOR
* @returns how to clear the viewport for the next render
*/
GLGE.Renderer.prototype.getClearType=function(){
	return this.clearType;
};
/**
* Clears the viewport
* @private
*/
GLGE.Renderer.prototype.GLClear=function(){
	var gl=this.gl;
	var clearType=this.clearType;
	var clear=0;
	if((clearType & GLGE.C_COLOR) ==  GLGE.C_COLOR){
		clear=clear | gl.COLOR_BUFFER_BIT;
	}
	if((clearType & GLGE.C_DEPTH) == GLGE.C_DEPTH){
		clear=clear | gl.DEPTH_BUFFER_BIT;
	}
	if((clearType & GLGE.C_STENCIL) == GLGE.C_STENCIL){
		clear=clear | gl.STENCIL_BUFFER_BIT;
	}
	gl.clear(clear);
};
/**
* Gets the scene which is set to be rendered
* @returns the current render scene
*/
GLGE.Renderer.prototype.getScene=function(){
	return this.scene;
};
/**
* Sets the scene to render
* @param {GLGE.Scene} scene The scene to be rendered
*/
GLGE.Renderer.prototype.setScene=function(scene){
	scene.renderer=this;
	this.scene=scene;
	if(!scene.gl) scene.GLInit(this.gl);
	//this.render();
	scene.camera.updateMatrix(); //reset camera matrix to force cache update
	return this;
};
/**
* Renders the current scene to the canvas
*/
GLGE.Renderer.prototype.render=function(){
	if(this.transitonFilter){
		var now=+new Date;
		if(now<this.transStarted+this.transDuration) {
			this.GLRenderTransition((now-this.transStarted)/this.transDuration);
			return;
		}
		if(this.transStarted==1){
			this.GLRenderTransition(0);
			this.transStarted=+new Date;
		}
	}
	if(this.cullFaces) this.gl.enable(this.gl.CULL_FACE);
	if (this.scene)	this.scene.render(this.gl);
	//if this is the first ever pass then render twice to fill shadow buffers
	if(!this.rendered&&this.scene){
		this.scene.render(this.gl);
		this.rendered=true;
	}
};

/**
* Uses the transitions filter to transition to the new scene
* @param {GLGE.Scene} scene The scene to transition to
* @param {Number} duration The transiton time in ms
*/
GLGE.Renderer.prototype.transitionTo=function(scene,duration){
	if(this.transitonFilter){
		this.transitonFilter.clearPersist(this.gl);
		this.oldScene=this.scene;
		this.transStarted=1;
		this.transDuration=duration;
	}
	this.setScene(scene);
};

/**
* Creates the buffers needed for transitions
* @private
*/
GLGE.Renderer.prototype.createTransitionBuffers=function(){
	var gl=this.gl;
	//Transition source buffer
	this.frameBufferTS = gl.createFramebuffer();
	this.renderBufferTS = gl.createRenderbuffer();
	this.textureTS = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.textureTS);
	this.widthTS=this.getViewportWidth();
	this.heightTS=this.getViewportHeight();
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.widthTS,this.heightTS, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferTS);
	gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBufferTS);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.widthTS, this.heightTS);
    
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureTS, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBufferTS);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	
	//Transition destination buffer
	this.frameBufferTD = gl.createFramebuffer();
	this.renderBufferTD = gl.createRenderbuffer();
	this.textureTD = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, this.textureTD);
	this.widthTD=this.getViewportWidth();
	this.heightTD=this.getViewportHeight();
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.widthTD,this.heightTD, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferTD);
	gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBufferTD);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.widthTD, this.heightTD);
    
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureTD, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBufferTD);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	
};

/**
* Sets the filter to use for the transition
* @param {GLGE.Filter2d} filter2d the 2d filter to use for transitions
*/
GLGE.Renderer.prototype.setTransitionFilter=function(filter2d){
	if(this.gl) filter2d.getFrameBuffer(this.gl);
	this.transitonFilter=filter2d;
	var renderer=this;
	filter2d.textures=[
		{
			name: "GLGE_SOURCE",
			doTexture: function(gl){
				gl.bindTexture(gl.TEXTURE_2D, renderer.textureTS);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}
		},
		{
			name: "GLGE_DEST",
			doTexture: function(gl){
				gl.bindTexture(gl.TEXTURE_2D, renderer.textureTD);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}
		}
	];
	return this;
}


/**
* Renders the transition effect
* @private
*/
GLGE.Renderer.prototype.GLRenderTransition=function(time){
	this.transitonFilter.setUniform("1f","time",time);
	
	if(!this.frameBufferTS){
		this.createTransitionBuffers();
		this.transitonFilter.getFrameBuffer(this.gl);
	}
	this.scene.transbuffer=this.frameBufferTS;
	this.scene.render(this.gl);	
	this.scene.transbuffer=null;
	
	this.oldScene.transbuffer=this.frameBufferTD;
	this.oldScene.render(this.gl);	
	this.oldScene.transbuffer=null;
	
	this.transitonFilter.GLRender(this.gl);
}


})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_camera.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){



/**
* @constant 
* @description Enumeration for a perspective camera
*/
GLGE.C_PERSPECTIVE=1;
/**
* @constant 
* @description Enumeration for a orthographic camera
*/
GLGE.C_ORTHO=2;

/**
* @class Creates a new camera object
* @augments GLGE.Animatable
* @augments GLGE.Placeable
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.Camera=function(uid){
	GLGE.Assets.registerAsset(this,uid);
};
GLGE.augment(GLGE.Placeable,GLGE.Camera);
GLGE.augment(GLGE.Animatable,GLGE.Camera);
GLGE.augment(GLGE.QuickNotation,GLGE.Camera);
GLGE.augment(GLGE.JSONLoader,GLGE.Camera);
GLGE.Camera.prototype.className="Camera";
GLGE.Camera.prototype.fovy=35;
GLGE.Camera.prototype.aspect=1.0;
GLGE.Camera.prototype.near=0.1;
GLGE.Camera.prototype.far=1000.0;
GLGE.Camera.prototype.orthoscale=5;
GLGE.Camera.prototype.type=GLGE.C_PERSPECTIVE;
GLGE.Camera.prototype.pMatrix=null;


/**
* Method gets the orthographic scale for the camers
* @return {Matrix} Returns the orthographic scale
*/
GLGE.Camera.prototype.getOrthoScale=function(){
	if(this.type==GLGE.C_ORTHO) {
		return this.orthoscale
	}else{
		GLGE.error("You may only get a scale for a orthographic camera");
		return 1;
	}
};
/**
* Method sets the orthographic scale for the camers
* @param {number} scale The new orthographic scale
*/
GLGE.Camera.prototype.setOrthoScale=function(scale){
	if(this.type==GLGE.C_ORTHO) {
		this.orthoscale=scale;
		this.pMatrix=null;
	}
	else
	{
		GLGE.error("You may only set a scale for a orthographic camera");
	}
	return this;
};

/**
* Method gets the far drawing distance
* @return {Matrix} Returns the cameras far draw distance
*/
GLGE.Camera.prototype.getFar=function(){
	return this.far;
};
/**
* Method sets the far draw distance of the camera
* @param {number} distance The far draw distance
*/
GLGE.Camera.prototype.setFar=function(distance){
	this.pMatrix=null;
	this.far=+distance;
	return this;
};

/**
* Method gets the near drawing distance
* @return {Matrix} Returns the cameras near draw distance
*/
GLGE.Camera.prototype.getNear=function(){
	return this.near;
};
/**
* Method sets the near draw distance of the camera
* @param {number} distance The near draw distance
*/
GLGE.Camera.prototype.setNear=function(distance){
	this.pMatrix=null;
	this.near=+distance;
	return this;
};

/**
* Method gets the current camera type
* @return {Matrix} Returns the camera type
*/
GLGE.Camera.prototype.getType=function(){
	this.pMatrix=null;
	return this.type
};
/**
* Method sets the type of camera GLGE.C_PERSPECTIVE or GLGE.C_ORTHO
* @param {number} type The type of this camera
*/
GLGE.Camera.prototype.setType=function(type){
	if(type==GLGE.C_PERSPECTIVE || type==GLGE.C_ORTHO){
		this.type=type;
		this.pMatrix=null;
	}else{
		GLGE.error("unsuported camera type");
	}
	return this;
};

/**
* Method gets the current yfov if the camera type is GLGE.C_PERSPECTIVE
* @return {Matrix} Returns the yfov
*/
GLGE.Camera.prototype.getFovY=function(){
	if(this.type==GLGE.C_PERSPECTIVE) {
		return this.fovy
	}else{
		GLGE.error("You may only get a yfov for a perspective camera");
		return 1;
	}
};
/**
* Method sets the yfov of the camera
* @param {number} yfov The new yfov of the camera
*/
GLGE.Camera.prototype.setFovY=function(fovy){
	if(this.type==GLGE.C_PERSPECTIVE) {
		this.fovy=+fovy;
		this.ymax=null;
		this.pMatrix=null;
	}
	else
	{
		GLGE.error("You may only set a yfov for a perspective camera");
	}
	return this;
};

/**
* Method gets the current aspect if the camera type is GLGE.C_PERSPECTIVE
* @return {Matrix} Returns the yfov
*/
GLGE.Camera.prototype.getAspect=function(){
	if(this.type==GLGE.C_PERSPECTIVE || this.type==GLGE.C_ORTHO) {
		return this.aspect
	}
	else
	{
		GLGE.error("You may only set a aspect for a perspective or orthographic camera");
		return 1;
	}
};
/**
* Method sets the aspect of the camera
* @param {number} aspect The new projection matrix
*/
GLGE.Camera.prototype.setAspect=function(aspect){
	if(this.type==GLGE.C_PERSPECTIVE || this.type==GLGE.C_ORTHO) {
		this.aspect=+aspect;
		this.pMatrix=null;
	}
	else
	{
		GLGE.error("You may only set a aspect for a perspective or orthographic camera");
	}
	return this;
};


/**
* Method gets the current projection matrix of this camera
* @return {Matrix} Returns the camera projection matrix
*/
GLGE.Camera.prototype.getProjectionMatrix=function(){
	if(!this.pMatrix){
		if(this.pMatrixOveride){
			this.pMatrix=this.pMatrixOveride;
		}else{
			switch(this.type){
				case GLGE.C_PERSPECTIVE:
					this.pMatrix=GLGE.makePerspective(this.fovy, this.aspect, this.near, this.far);
					break;
				case GLGE.C_ORTHO:
					this.pMatrix=GLGE.makeOrtho(-this.orthoscale*this.aspect,this.orthoscale*this.aspect,-this.orthoscale,this.orthoscale, this.near, this.far);
					break;
			}
		}
	}
	return this.pMatrix;
};
/**
* Method generates the projection matrix based on the 
* camera paramaters
* @param {Matrix} projection The new projection matrix
*/
GLGE.Camera.prototype.setProjectionMatrix=function(projection){
	this.pMatrix=projection;
	return this;
};
/**
* Method sets a custom projection matrix
* @param {Matrix} projection The new projection matrix
*/
GLGE.Camera.prototype.setCustomProjectionMatrix=function(projection){
	this.pMatrix=projection;
	this.pMatrixOveride=projection;
	return this;
};
/**
* Method generates the cameras view matrix
* @return Returns the view matrix based on this camera
* @type Matrix
*/
GLGE.Camera.prototype.updateMatrix=function(){
	var position=this.getPosition();
	var vMatrix=GLGE.translateMatrix(position.x,position.y,position.z);
	vMatrix=GLGE.mulMat4(vMatrix,this.getRotMatrix());
	if(this.parent) vMatrix=GLGE.mulMat4(this.parent.getModelMatrix(),vMatrix);
	this.location=[vMatrix[3],vMatrix[7],vMatrix[11]];
	this.matrix=GLGE.inverseMat4(vMatrix);
};
/**
* Method generates the cameras view matrix
* @return Returns the view matrix based on this camera
* @type Matrix
*/
GLGE.Camera.prototype.getViewMatrix=function(){
	if(!this.matrix || !this.rotmatrix) this.updateMatrix();
	return this.matrix;
};

/**
* Method generates the cameras view projection matrix
* @return Returns the view projection  matrix based on this camera
* @type Matrix
*/
GLGE.Camera.prototype.getViewProjection=function(){
	var projectionMatrix=this.getProjectionMatrix();
	var viewMatrix=this.getViewMatrix();
	if(projectionMatrix!=this.vpProjectionMatrix || viewMatrix!=this.vpViewMatrix){
		this.cameraViewProjection=GLGE.mulMat4(projectionMatrix,viewMatrix);
		this.vpProjectionMatrix=projectionMatrix;
		this.vpViewMatrix=viewMatrix;
	}
	return this.cameraViewProjection;
};



})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_light.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){



/**
* @class Creates a new light source to be added to a scene
* @property {Boolean} diffuse Dose this light source effect diffuse shading
* @property {Boolean} specular Dose this light source effect specular shading
* @augments GLGE.Animatable
* @augments GLGE.Placeable
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.Light=function(uid){
  this.color={r:1,g:1,b:1};
  GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.Placeable,GLGE.Light);
GLGE.augment(GLGE.Animatable,GLGE.Light);
GLGE.augment(GLGE.QuickNotation,GLGE.Light);
GLGE.augment(GLGE.JSONLoader,GLGE.Light);
GLGE.Light.prototype.className="Light";

/**
 * @name GLGE.Light#shaderupdate
 * @event fires when a light has changed resulting in need to recompile shaders
 * @param {object} data
 */

/**
* @constant
* @description Enumeration for an point light source
*/
GLGE.L_POINT=1;
/**
* @constant
* @description Enumeration for an directional light source
*/
GLGE.L_DIR=2;
/**
* @constant
* @description Enumeration for an spot light source
*/
GLGE.L_SPOT=3;
/**
* @constant
* @description Enumeration a light that is disabled
*/
GLGE.L_OFF=4;

GLGE.Light.prototype.constantAttenuation=1;
GLGE.Light.prototype.linearAttenuation=0.002;
GLGE.Light.prototype.quadraticAttenuation=0.0008;
GLGE.Light.prototype.spotCosCutOff=0.95;
GLGE.Light.prototype.spotCutOff=true;
GLGE.Light.prototype.spotPMatrix=null;
GLGE.Light.prototype.spotExponent=10;
GLGE.Light.prototype.color=null; 
GLGE.Light.prototype.diffuse=true; 
GLGE.Light.prototype.specular=true; 
GLGE.Light.prototype.type=GLGE.L_POINT;
GLGE.Light.prototype.frameBuffer=null;
GLGE.Light.prototype.renderBuffer=null;
GLGE.Light.prototype.texture=null;
GLGE.Light.prototype.bufferHeight=512;
GLGE.Light.prototype.bufferWidth=512;
GLGE.Light.prototype.shadowBias=0.0005;
GLGE.Light.prototype.varianceMin=0.00000005;
GLGE.Light.prototype.bleedCutoff=0.3;
GLGE.Light.prototype.dirNear=1;
GLGE.Light.prototype.distance=1000;
GLGE.Light.prototype.spotSoftness=0;
GLGE.Light.prototype.spotSoftnessDistance=0.3;
GLGE.Light.prototype.sceneAABB=[-1000,-1000,-1000,1000,1000,1000];


/**
* Sets the scene AABB minimum X value, used in LiSPSM shadows
* @param {number} value the lower X bound of the scene
*/

GLGE.Light.prototype.setSceneMinX=function(value){
	this.sceneAABB[0]=parseFloat(value);
	return this;
}
/**
* Gets the scene AABB minimum X value, used in LiSPSM shadows
* @returns {number} value  the lower X bound of the scene
*/
GLGE.Light.prototype.getSceneMinX=function(){
	return this.sceneAABB[0];
}

/**
* Sets the scene AABB maximum X value, used in LiSPSM shadows
* @param {number} value the upper X bound of the scene
*/
GLGE.Light.prototype.setSceneMaxX=function(value){
	this.sceneAABB[3]=parseFloat(value);
	return this;
}
/**
* Gets the scene AABB maximum X value, used in LiSPSM shadows
* @returns {number} value  the upper X bound of the scene
*/
GLGE.Light.prototype.getSceneMaxX=function(){
	return this.sceneAABB[3];
}


/**
* Sets the scene AABB minimum Y value, used in LiSPSM shadows
* @param {number} value the lower Y bound of the scene
*/
GLGE.Light.prototype.setSceneMinY=function(value){
	this.sceneAABB[1]=parseFloat(value);
	return this;
}
/**
* Gets the scene AABB minimum Y value, used in LiSPSM shadows
* @returns {number} value  the lower Y bound of the scene
*/
GLGE.Light.prototype.getSceneMinY=function(){
	return this.sceneAABB[1];
}

/**
* Sets the scene AABB maximum Y value, used in LiSPSM shadows
* @param {number} value the upper Y bound of the scene
*/
GLGE.Light.prototype.setSceneMaxY=function(value){
	this.sceneAABB[4]=parseFloat(value);
	return this;
}
/**
* Gets the scene AABB maximum Y value, used in LiSPSM shadows
* @returns {number} value  the upper Y bound of the scene
*/
GLGE.Light.prototype.getSceneMaxY=function(){
	return this.sceneAABB[4];
}


/**
* Sets the scene AABB minimum Z value, used in LiSPSM shadows
* @param {number} value the lower Z bound of the scene
*/
GLGE.Light.prototype.setSceneMinZ=function(value){
	this.sceneAABB[2]=parseFloat(value);
	return this;
}
/**
* Gets the scene AABB minimum Z value, used in LiSPSM shadows
* @returns {number} value  the lower Z bound of the scene
*/
GLGE.Light.prototype.getSceneMinZ=function(){
	return this.sceneAABB[2];
}


/**
* Sets the scene AABB maximum Z value, used in LiSPSM shadows
* @param {number} value the upper Z bound of the scene
*/
GLGE.Light.prototype.setSceneMaxY=function(value){
	this.sceneAABB[5]=parseFloat(value);
	return this;
}
/**
* Gets the scene AABB maximum Z value, used in LiSPSM shadows
* @returns {number} value  the upper Z bound of the scene
*/
GLGE.Light.prototype.getSceneMaxZ=function(){
	return this.sceneAABB[5];
}


/**
* Sets shadow near bias how much bias to nearer objects, good range between 0.01 and 100
* @param {number} value the near shadow bias
*/

GLGE.Light.prototype.setNearShadowBias=function(value){
	this.dirNear=value;
	return this;
}
/**
* Gets the near shadow bias
* @returns {number} value the near shadow bias
*/
GLGE.Light.prototype.getNearShadowBias=function(){
	return this.dirNear;
}


/**
* Sets the minium light bleed cutoff on directional shadows
* @param {number} value higher numbers prevent bleed at shadow edges
*/

GLGE.Light.prototype.setBleedCutoff=function(value){
	this.bleedCutoff=value;
	this.fireEvent("shaderupdate",{});
	return this;
}
/**
* Gets the minium light bleed cutoff on directional shadows
* @returns {number} value higher numbers prevent bleed at shadow edges
*/
GLGE.Light.prototype.getBleedCutoff=function(){
	return this.bleedCutoff;
}

/**
* Sets the minimum variance for filtering directional lighting
* @param {number} value small number cut off to prevent precision errors 
*/
GLGE.Light.prototype.setVarianceMin=function(value){
	this.varianceMin=value;
	this.fireEvent("shaderupdate",{});
	return this;
}
/**
* Sets the minimum variance for directional lighting
* @returns {number} value small number cut off to prevent precision errors 
*/
GLGE.Light.prototype.getVarianceMin=function(){
	return this.varianceMin;
}

/**
* Gets the spot lights projection matrix
* @returns the lights spot projection matrix
* @private
*/
GLGE.Light.prototype.getPMatrix=function(cvp,invlight,projectedDistance,distance,camera){
	if(!this.spotPMatrix){
		var far;
		if(this.scene && this.scene.camera) far=this.scene.camera.far;
			else far=1000;
		if(this.type==GLGE.L_SPOT){
			this.spotPMatrix=GLGE.makePerspective(Math.acos(this.spotCosCutOff)/3.14159*360, 1.0, 0.1, far);
		}
	}
	 if(this.type==GLGE.L_DIR){
		var lm=this.getModelMatrix();
		this.spotPMatrix=this.calcDirMatrix(camera,[lm[2],lm[6],lm[10]],this,invlight);
	}

	return this.spotPMatrix;
}


/**
* Caclulates eye direction as direction to center of point cloud
* @private
*/
GLGE.Light.prototype.calcDir=function(points, eyePos) {
	var dir=[0,0,0];
	for(var i = 0; i <points.length; i++) {
		dir=GLGE.addVec3(dir,GLGE.subVec3(points[i],eyePos));
	}
	return GLGE.toUnitVec3(dir);
};

/**
* Finds the aabb for a point cloud
* @private
*/
GLGE.Light.prototype.findBound=function(min, max, v) {
	for(var i = 0; i < 3; i++) {
		if(v[i]<min[i]) {
			min[i] = v[i];
		}else if(v[i] > max[i]) {
			max[i] = v[i];
		}
	}
}
/**
* creates a look at matrix for directional lights
* @private
*/
GLGE.Light.prototype.lightLook=function(pos, dir, up) {
	var lftN=GLGE.toUnitVec3(GLGE.crossVec3(dir,up));

	var upN=GLGE.toUnitVec3(GLGE.crossVec3(lftN,dir));
	var dirN=GLGE.toUnitVec3(dir);
	var m=[];
	m[0] = lftN[0]; m[4] = upN[0]; m[8] = -dirN[0]; m[12] = 0.0;
	m[1] = lftN[1]; m[5] = upN[1]; m[9] = -dirN[1]; m[13] = 0.0;
	m[2] = lftN[2]; m[6] = upN[2]; m[10] = -dirN[2]; m[14] = 0.0;
	m[3] = -GLGE.dotVec3(lftN,pos);
	m[7] = -GLGE.dotVec3(upN,pos);
	m[11] = GLGE.dotVec3(dirN,pos);
	m[15] = 1.0;
	
	return m;
}
/**
* transforms points by matrix mat
* @private
*/
GLGE.Light.prototype.transformPoints=function(points,mat){
	var transformed=[];
	for(var i=0;i<points.length;i++){
		var v=GLGE.mulMat4Vec4(mat,[points[i][0],points[i][1],points[i][2],1]);
		v[0]/=v[3];
		v[1]/=v[3];
		v[2]/=v[3];
		v[3]/=v[3];
		transformed.push(v);
	}
	return transformed;
}
/**
* scales and translates matrix to fit in unit cube
* @private
*/
GLGE.Light.prototype.scaleTranslateToFit=function(vMin, vMax) {
	var m=[];
	m[ 0] = 2/(vMax[0]-vMin[0]);
	m[ 1] = 0;
	m[ 2] = 0;
	m[ 3] = -(vMax[0]+vMin[0])/(vMax[0]-vMin[0]);

	m[ 4] = 0;
	m[ 5] = 2/(vMax[1]-vMin[1]);
	m[ 6] = 0;
	m[ 7] = -(vMax[1]+vMin[1])/(vMax[1]-vMin[1]);

	m[ 8] = 0;
	m[ 9] = 0;
	m[10] = 2/(vMax[2]-vMin[2]);
	m[11] = -(vMax[2]+vMin[2])/(vMax[2]-vMin[2]);

	m[12] = 0;
	m[13] = 0;
	m[14] = 0;
	m[15] = 1;
	return m;
};
/**
* find the aabb
* @private
*/
GLGE.Light.prototype.calcBounds=function(min, max, points) {
	min[0]=points[0][0];
	min[1]=points[0][1];
	min[2]=points[0][2];
	max[0]=points[0][0];
	max[1]=points[0][1];
	max[2]=points[0][2];
	for(var i=1; i<points.length; i++) {
		this.findBound(min,max,points[i]);
	}
}
/**
* add and scales
* @private
*/
GLGE.Light.prototype.linComb=function(pos, dir,  t) {
	return [pos[0]+t*dir[0],
			pos[1]+t*dir[1],
			pos[2]+t*dir[2]];
}
/**
* Gets frustum point edges and planes
* @private
*/
GLGE.Light.prototype.getEdgePlanesFromView=function(view){
	var iv=GLGE.inverseMat4(view);
	var points=[
		[-1,-1,-1,  1], //0
		[-1,-1,1,  1],//1
		[-1,1,-1,  1],//2
		[-1,1,1,  1],//3
		[1,-1,-1,  1],//4
		[1,-1,1,  1],//5
		[1,1,-1,  1],//6
		[1,1,1,  1]//7
	];
	var tPoint=this.transformPoints(points,iv);

	var P1=GLGE.toUnitVec3(GLGE.crossVec3(GLGE.subVec3( tPoint[1], tPoint[0]),GLGE.subVec3( tPoint[2], tPoint[0])));
	P1[3]=GLGE.dotVec3(P1,tPoint[0]);
	
	var P2=GLGE.toUnitVec3(GLGE.crossVec3(GLGE.subVec3( tPoint[6], tPoint[4]),GLGE.subVec3( tPoint[5], tPoint[4])));
	P2[3]=GLGE.dotVec3(P2,tPoint[4]);
	
	var P3=GLGE.toUnitVec3(GLGE.crossVec3(GLGE.subVec3( tPoint[7], tPoint[5]),GLGE.subVec3( tPoint[1], tPoint[5])));
	P3[3]=GLGE.dotVec3(P3,tPoint[5]);
	
	var P4=GLGE.toUnitVec3(GLGE.crossVec3(GLGE.subVec3( tPoint[2], tPoint[0]),GLGE.subVec3( tPoint[4], tPoint[0])));
	P4[3]=GLGE.dotVec3(P4,tPoint[0]);
	
	var P5=GLGE.toUnitVec3(GLGE.crossVec3(GLGE.subVec3( tPoint[3], tPoint[2]),GLGE.subVec3( tPoint[6], tPoint[2])));
	P5[3]=GLGE.dotVec3(P5,tPoint[2]);
	
	var P6=GLGE.toUnitVec3(GLGE.crossVec3(GLGE.subVec3( tPoint[4], tPoint[0]),GLGE.subVec3( tPoint[1], tPoint[0])));
	P6[3]=GLGE.dotVec3(P6,tPoint[0]);
	
	var edges=[
		[tPoint[0],tPoint[4]],
		[tPoint[4],tPoint[6]],
		[tPoint[6],tPoint[2]],
		[tPoint[2],tPoint[0]],
		[tPoint[1],tPoint[5]],
		[tPoint[5],tPoint[7]],
		[tPoint[7],tPoint[3]],
		[tPoint[3],tPoint[1]],
		[tPoint[0],tPoint[1]],
		[tPoint[3],tPoint[2]],
		[tPoint[7],tPoint[6]],
		[tPoint[5],tPoint[4]]
	];
		
	return {edges:edges, planes: [P1,P2,P3,P4,P5,P6], points: tPoint}
};
/**
* Gets aabb point edges and planes
* @private
*/
GLGE.Light.prototype.getEdgePlanesFromAABB=function(minx,miny,minz,maxx,maxy,maxz){	
	var planes=[
		[1,0,0,minx],
		[-1,0,0,-maxx],
		[0,1,0,miny],
		[0,-1,0,-maxy],
		[0,0,1,minz],
		[0,0,-1,-maxz]
	];
	
	var points=[
		[minx,miny,minz],
		[minx,miny,maxz],
		[minx,maxy,minz],
		[minx,maxy,maxz],
		[maxx,miny,minz],
		[maxx,miny,maxz],
		[maxx,maxy,minz],
		[maxx,maxy,maxz]	
	];
	var edges=[
		[points[0],points[4]],
		[points[4],points[6]],
		[points[6],points[2]],
		[points[2],points[0]],
		[points[1],points[5]],
		[points[5],points[7]],
		[points[7],points[3]],
		[points[3],points[1]],
		[points[0],points[1]],
		[points[3],points[2]],
		[points[7],points[6]],
		[points[5],points[4]]
	];
	return {edges:edges, planes:planes, points: points};
}
/**
* calcs point and edge intersects a plane
* @private
*/
GLGE.Light.prototype.planeEdgeIntersect=function(edge,plane){
	var d1=GLGE.dotVec3(edge[0],plane)-plane[3];
	var d2=GLGE.dotVec3(edge[1],plane)-plane[3];
	if((d1>0 && d2>0) || (d1<0 && d2<0)){
		return false;
	}else{
		var D=GLGE.subVec3(edge[1],edge[0]);
		D=GLGE.scaleVec3(D,-d1/(d2-d1));
		return GLGE.addVec3(edge[0],D);
	}
};
/**
* is point contained within planes
* @private
*/
GLGE.Light.prototype.pointInPlanes=function(point,planes){
	var tiny=-0.001;
	for(var i=0;i<planes.length;i++){
		if(GLGE.dotVec3(point,planes[i])-planes[i][3]<tiny) return false;
	}
	return true;
}
/**
* Gets point cloud for directional light
* @private
*/
GLGE.Light.prototype.getViewPoints=function(view){
	var viewPlaneEdges=this.getEdgePlanesFromView(view);
	
	var scenePlaneEdges=this.getEdgePlanesFromAABB(this.sceneAABB[0],this.sceneAABB[1],this.sceneAABB[2],this.sceneAABB[3],this.sceneAABB[4],this.sceneAABB[5]);
	
	var planes1=viewPlaneEdges.planes;
	var planes2=scenePlaneEdges.planes;
	var edges1=viewPlaneEdges.edges;
	var edges2=scenePlaneEdges.edges;
	var points=[];
	var planes=[];	
	
	for(var i=0;i<planes1.length;i++){
		for(var j=0;j<edges2.length;j++){
			var p=this.planeEdgeIntersect(edges2[j],planes1[i]);
			if(p) points.push(p);
		}
		planes.push(planes1[i]);
	}
	
	for(var i=0;i<planes2.length;i++){
		for(var j=0;j<edges1.length;j++){
			var p=this.planeEdgeIntersect(edges1[j],planes2[i]);
			if(p) points.push(p);
		}
		planes.push(planes2[i]);
	}
	
	var enclosedPoints=[];
	for(var i=0;i<points.length;i++){
		if(this.pointInPlanes(points[i],planes)){
			enclosedPoints.push(points[i]);
		}
	}
	
	for(var i=0;i<viewPlaneEdges.points.length;i++){
		if(this.pointInPlanes(viewPlaneEdges.points[i],planes)){
			enclosedPoints.push(viewPlaneEdges.points[i]);
		}
	}
	
	for(var i=0;i<scenePlaneEdges.points.length;i++){
		if(this.pointInPlanes(scenePlaneEdges.points[i],planes)){
			enclosedPoints.push(scenePlaneEdges.points[i]);
		}
	}
	
	return enclosedPoints;
};
/**
* Caclulates the LiSPSM matrix for directional light
* @private
*/
GLGE.Light.prototype.calcDirMatrix=function(camera, lightDir,light, invlight) {
	var vm=camera.matrix;
	var invm=GLGE.inverseMat4(vm);
	var mm=camera.getModelMatrix();
	var pm=camera.getProjectionMatrix();
	var cvp=camera.getViewProjection();
	
	var points=this.getViewPoints(cvp);
	
	//extend into light dir
	var add=GLGE.scaleVec3(lightDir,camera.far);
	var len=points.length;
	for(var i=0;i<len;i++){
		points.push(GLGE.addVec3(add,points[i]));
	}
	
	if(points.length==0) return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1];

	var viewDir=[mm[8],mm[9],mm[10]];
	var eyePos=[invm[3],invm[7],invm[11]];

	var min=[], max=[];
	var lispMtx;

	var nearDist=this.dirNear;
	var newDir=this.calcDir(points,eyePos);	
	
	var left=GLGE.crossVec3(lightDir,newDir);
	var up=GLGE.crossVec3(left,lightDir);
	up=GLGE.toUnitVec3(up);
	
	var dotProd = GLGE.dotVec3(newDir,lightDir);

	var sinGamma = Math.sqrt(1.0-dotProd*dotProd);


	var lightView=this.lightLook(eyePos,lightDir,up);

	var tPoints=this.transformPoints(points,lightView);

	this.calcBounds(min,max,tPoints);

	var factor = 1.0/sinGamma;
	var z_n = factor*nearDist; 
	var d = Math.abs(max[1]-min[1]);
	var z_f = z_n + d*sinGamma;
	var n = (z_n+Math.sqrt(z_f*z_n))/sinGamma;
	var f = n+d;
	var pos;

	var pos=this.linComb(eyePos,up,-(n-nearDist));

	lightView=this.lightLook(pos,lightDir,up);

	var lispMtx=GLGE.identMatrix();
	lispMtx[ 5] = (f+n)/(f-n);	
	lispMtx[ 7] = -2*f*n/(f-n);	
	lispMtx[13] = 1;
	lispMtx[15] = 0;

	var lightProj=GLGE.mulMat4(lispMtx,lightView);

	tPoints=this.transformPoints(points,lightProj);

	this.calcBounds(min,max,tPoints);

	lightProj=this.scaleTranslateToFit(min,max);

	lightProj=GLGE.mulMat4(lightProj,lispMtx); 
	lightProj=GLGE.mulMat4(lightProj,GLGE.mulMat4(lightView,GLGE.inverseMat4(invlight)));
	
	return lightProj;	
	
}

/**
* Sets the shadow casting flag
* @param {number} distance
*/
GLGE.Light.prototype.setDistance=function(value){
  this.distance=value;
  this.fireEvent("shaderupdate",{});
  return this;
}
/**
* Gets the shadow casting distance
* @returns {number} distance
*/
GLGE.Light.prototype.getDistance=function(){
  return this.distance;
}

/**
* Sets negative shadow flag
* @param {boolean} negative shadow
*/
GLGE.Light.prototype.setNegativeShadow=function(value){
  this.negativeShadow=value;
  this.fireEvent("shaderupdate",{});
  return this;
}
/**
* Gets negative shadow flag
* @param {boolean} negative shadow
*/
GLGE.Light.prototype.getNegative=function(){
  return this.negativeShadow;
}

/**
* Sets the shadow casting flag
* @param {number} value should cast shadows?
*/
GLGE.Light.prototype.setCastShadows=function(value){
  this.castShadows=value;
  this.fireEvent("shaderupdate",{});
  return this;
}
/**
* Gets the shadow casting flag
* @returns {number} true if casts shadows
*/
GLGE.Light.prototype.getCastShadows=function(){
  return this.castShadows;
  return this;
}
/**
* Sets the shadow bias
* @param {number} value The shadow bias
*/
GLGE.Light.prototype.setShadowBias=function(value){
  this.shadowBias=value;
  return this;
}
/**
* Gets the shadow bias
* @returns {number} The shadow buffer bias
*/
GLGE.Light.prototype.getShadowBias=function(){
  return this.shadowBias;
}

/**
* Sets the shadow buffer width
* @param {number} value The shadow buffer width
*/
GLGE.Light.prototype.setBufferWidth=function(value){
  this.bufferWidth=value;
  return this;
}
/**
* Gets the shadow buffer width
* @returns {number} The shadow buffer width
*/
GLGE.Light.prototype.getBufferHeight=function(){
  return this.bufferHeight;
}
/**
* Sets the shadow buffer width
* @param {number} value The shadow buffer width
*/
GLGE.Light.prototype.setBufferHeight=function(value){
  this.bufferHeight=value;
  return this;
}
/**
* Gets the shadow buffer width
* @returns {number} The shadow buffer width
*/
GLGE.Light.prototype.getBufferWidth=function(){
  return this.bufferWidth;
}
/**
* Sets the spot light cut off
* @param {number} value The cos of the angle to limit
*/
GLGE.Light.prototype.setSpotCosCutOff=function(value){
  this.spotPMatrix=null;
  this.spotCosCutOff=value;
  return this;
}
/**
* Gets the spot light cut off
* @returns {number} The cos of the limiting angle
*/
GLGE.Light.prototype.getSpotCosCutOff=function(){
  return this.spotCosCutOff;
}

/**
* Sets the spot light cut off true results in circle spot light otherwise square
* @param {number} value The spot cutoff flag
*/
GLGE.Light.prototype.setSpotCutOff=function(value){
  this.spotCutOff=value;
  this.fireEvent("shaderupdate",{});
  return this;
}
/**
* Gets the spot light cut off flag
* @returns {number} The spot cutoff flag
*/
GLGE.Light.prototype.getSpotCutOff=function(){
  return this.spotCutOff;
}

/**
* Sets the spot light exponent
* @param {number} value The spot lights exponent
*/
GLGE.Light.prototype.setSpotExponent=function(value){
  this.spotExponent=value;
  return this;
}
/**
* Gets the spot light exponent
* @returns {number} The exponent of the spot light
*/
GLGE.Light.prototype.getSpotExponent=function(){
  return this.spotExponent;
}
/**
* Sets the light sources Attenuation
* @returns {Object} The components of the light sources attenuation
*/
GLGE.Light.prototype.getAttenuation=function(constant,linear,quadratic){
  var attenuation={};
  attenuation.constant=this.constantAttenuation;
  attenuation.linear=this.linearAttenuation;
  attenuation.quadratic=this.quadraticAttenuation;
  return attenuation;
}
/**
* Sets the light sources Attenuation
* @param {Number} constant The constant part of the attenuation
* @param {Number} linear The linear part of the attenuation
* @param {Number} quadratic The quadratic part of the attenuation
*/
GLGE.Light.prototype.setAttenuation=function(constant,linear,quadratic){
  this.constantAttenuation=constant;
  this.linearAttenuation=linear;
  this.quadraticAttenuation=quadratic;
  return this;
}
/**
* Sets the light sources constant attenuation
* @param {Number} value The constant part of the attenuation
*/
GLGE.Light.prototype.setAttenuationConstant=function(value){
  this.constantAttenuation=value;
  return this;
}
/**
* Sets the light sources linear attenuation
* @param {Number} value The linear part of the attenuation
*/
GLGE.Light.prototype.setAttenuationLinear=function(value){
  this.linearAttenuation=value;
  return this;
}
/**
* Sets the light sources quadratic attenuation
* @param {Number} value The quadratic part of the attenuation
*/
GLGE.Light.prototype.setAttenuationQuadratic=function(value){
  this.quadraticAttenuation=value;
  return this;
}

/**
* Sets the color of the light source
* @param {string} color The color of the light
*/
GLGE.Light.prototype.setColor=function(color){
  color=GLGE.colorParse(color);
  this.color={r:color.r,g:color.g,b:color.b};
  return this;
}
/**
* Sets the red color of the light source
* @param {Number} value The new red level 0-1
*/
GLGE.Light.prototype.setColorR=function(value){
  this.color.r=value;
  return this;
}
/**
* Sets the green color of the light source
* @param {Number} value The new green level 0-1
*/
GLGE.Light.prototype.setColorG=function(value){
  this.color.g=value;
  return this;
}
/**
* Sets the blue color of the light source
* @param {Number} value The new blue level 0-1
*/
GLGE.Light.prototype.setColorB=function(value){
  this.color.b=value;
  return this;
}
/**
* Gets the current color of the light source
* @return {[r,g,b]} The current position
*/
GLGE.Light.prototype.getColor=function(){
  return this.color;
}
/**
* Gets the red color of the light source
* @param {Number} value The new red level 0-1
*/
GLGE.Light.prototype.getColorR=function(value){
  return this.color.r;
}
/**
* Gets the green color of the light source
* @param {Number} value The new green level 0-1
*/
GLGE.Light.prototype.getColorG=function(value){
  return this.color.g;
}
/**
* Gets the blue color of the light source
* @param {Number} value The new blue level 0-1
*/
GLGE.Light.prototype.getColorB=function(value){
  return this.color.b;
}
/**
* Gets the type of the light
* @return {Number} The type of the light source eg GLGE.L_POINT
*/
GLGE.Light.prototype.getType=function(){
  return this.type;
}
/**
* Sets the type of the light
* @param {Number} type The type of the light source eg GLGE.L_POINT
*/
GLGE.Light.prototype.setType=function(type){
  this.type=type;
  this.fireEvent("shaderupdate",{});
  return this;
}

/**
* Gets the softness of the spot shadow
* @return {Number} The type of the light source eg GLGE.L_POINT
*/
GLGE.Light.prototype.getSpotSoftness=function(){
  return this.spotSoftness;
}
/**
* Sets the softness of the spot shadow
* @param {Number} spotSoftness The type of the light source eg GLGE.L_POINT
*/
GLGE.Light.prototype.setSpotSoftness=function(spotSoftness){
  this.spotSoftness=+spotSoftness;
  if(this.gl) this.createSoftPrograms(this.gl);
  this.fireEvent("shaderupdate",{});
  return this;
}

/**
* Gets the spotlights blur distance in pixels
* @return {Number} The blur distance for spot lights
*/
GLGE.Light.prototype.getSpotSoftDistance=function(){
  return this.spotSoftnessDistance;
}
/**
* Sets the spotlights variance cutoff used to reduce light bleed
* @param {Number} spotSoftnessDistance the spotlights variance cutoff
*/
GLGE.Light.prototype.setSpotSoftDistance=function(spotSoftnessDistance){
  this.spotSoftnessDistance=+spotSoftnessDistance;
  this.fireEvent("shaderupdate",{});
  return this;
}


GLGE.Light.prototype.enableLight=function(){
    if (this.type == GLGE.L_OFF && this.old_type !== undefined) {
        this.setType(this.old_type);
        delete this.old_type;
    }
};

GLGE.Light.prototype.disableLight=function(){
    if (this.type != GLGE.L_OFF) {
        this.old_type=this.type;
        this.setType(GLGE.L_OFF);
    }
};

/**
* init for the rendering
* @private
*/
GLGE.Light.prototype.GLInit=function(gl){
  this.gl=gl;
  if((this.type==GLGE.L_SPOT || this.type==GLGE.L_DIR) && !this.texture){
    this.createSpotBuffer(gl);
    this.createSoftBuffer(gl);
    this.createSoftPrograms(gl);
  }
}
/**
* Sets up the WebGL needed to render the depth map for this light source. Only used for spot lights which produce shadows
* @private
*/
GLGE.Light.prototype.createSpotBuffer=function(gl){
    this.frameBuffer = gl.createFramebuffer();
    this.renderBuffer = gl.createRenderbuffer();
    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);

    try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.bufferWidth, this.bufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    } catch (e) {
        GLGE.error("incompatible texture creation method");
        var width=parseFloat(this.bufferWidth);
        var height=parseFloat(this.bufferHeight);
        var tex = new Uint8Array(width * height * 4);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.bufferWidth, this.bufferHeight);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

/**
* Sets up the buffers needed for the gaussian blured shadow buffer
* @private
*/
GLGE.Light.prototype.createSoftBuffer=function(gl){
    this.frameBufferSf = gl.createFramebuffer();
    this.renderBufferSf = gl.createRenderbuffer();
    this.textureSf = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.textureSf);

    try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.bufferWidth, this.bufferHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    } catch (e) {
        GLGE.error("incompatible texture creation method");
        var width=parseFloat(this.bufferWidth);
        var height=parseFloat(this.bufferHeight);
        var tex = new Uint8Array(width * height * 4);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    }

    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferSf);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderBufferSf);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.bufferWidth, this.bufferHeight);

    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.textureSf, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderBufferSf);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);

    //create the vertex positions
  if(!this.posBuffer) this.posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,1,0,-1,1,0,-1,-1,0,1,-1,0]), gl.STATIC_DRAW);
  this.posBuffer.itemSize = 3;
  this.posBuffer.numItems = 4;
  //create the vertex uv coords
  if(!this.uvBuffer) this.uvBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,1,0,1,0,0,1,0]), gl.STATIC_DRAW);
  this.uvBuffer.itemSize = 2;
  this.uvBuffer.numItems = 4;
  //create the faces
  if(!this.GLfaces) this.GLfaces = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.GLfaces);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,2,3,0]), gl.STATIC_DRAW);
  this.GLfaces.itemSize = 1;
  this.GLfaces.numItems = 6;
}

/**
* Sets up the programs require to do the soft shadows
* @private
*/
GLGE.Light.prototype.createSoftPrograms=function(gl){
  if(this.GLShaderProgram) gl.deleteProgram(this.GLShaderProgram);

  var vertexStr="";
  vertexStr+="attribute vec3 position;\n";
  vertexStr+="attribute vec2 uvcoord;\n";
  vertexStr+="varying vec2 texCoord;\n";
  vertexStr+="void main(void){\n";
  vertexStr+="texCoord=uvcoord;\n";
  vertexStr+="gl_Position = vec4(position,1.0);\n";
  vertexStr+="}\n";

  var SAMPLES=this.spotSoftness;
  var fragStr="precision highp float;\n";
  fragStr=fragStr+"uniform sampler2D TEXTURE;\n";
  fragStr=fragStr+"varying vec2 texCoord;\n";
  fragStr=fragStr+"uniform bool xpass;\n";
  fragStr=fragStr+"float blurSize = "+(1/this.bufferWidth).toFixed(10)+";\n";
  fragStr=fragStr+"float unpack(sampler2D TEX, vec2 co){;";
  fragStr=fragStr+"float value = dot(texture2D(TEX, co), vec4(0.000000059604644775390625,0.0000152587890625,0.00390625,1.0));";
  fragStr=fragStr+"return value;";
  fragStr=fragStr+"}";
  fragStr=fragStr+"vec2 unpack2(sampler2D TEX, vec2 co){;";
  fragStr=fragStr+"vec4 color = texture2D(TEX, co);";
  fragStr=fragStr+"float value1 = dot(color.rg, vec2(0.00390625,1.0));";
  fragStr=fragStr+"float value2 = dot(color.ba, vec2(0.00390625,1.0));";
  fragStr=fragStr+"return vec2(value1,value2);";
  fragStr=fragStr+"}";
  fragStr=fragStr+"vec4 pack(float value){;";
  fragStr=fragStr+"vec4 rgba=fract(value * vec4(16777216.0, 65536.0, 256.0, 1.0));\n";
  fragStr=fragStr+"return rgba-rgba.rrgb*vec4(0.0,0.00390625,0.00390625,0.00390625);";
  fragStr=fragStr+"}";
  fragStr=fragStr+"vec2 pack2(float value){;";
  fragStr=fragStr+"vec2 rg=fract(value * vec2(256.0, 1.0));\n";
  fragStr=fragStr+"return rg-rg.rr*vec2(0.0,0.00390625);";
  fragStr=fragStr+"}";
  fragStr=fragStr+"void main(void){\n";
  fragStr=fragStr+"float value = 0.0;";
  fragStr=fragStr+"vec2 value2;";
  fragStr=fragStr+"float mean = 0.0;";
  fragStr=fragStr+"float mean2 = 0.0;";
  fragStr=fragStr+"float color = 0.0;";
  fragStr=fragStr+"if(xpass){";
  for(var i=-SAMPLES;i<SAMPLES;i++){
    fragStr=fragStr+"value = unpack(TEXTURE, vec2(texCoord.x - "+(i+0.5).toFixed(1)+"*blurSize, texCoord.y));";
    fragStr=fragStr+"mean += value;";
    fragStr=fragStr+"mean2 += value*value;";
  }
  fragStr=fragStr+"gl_FragColor = vec4(pack2(pow(mean2/"+(SAMPLES*2).toFixed(2)+",0.5)),pack2(mean/"+(SAMPLES*2).toFixed(2)+"));\n";
  fragStr=fragStr+"}else{";
  for(var i=-SAMPLES;i<SAMPLES;i++){
    fragStr=fragStr+"value2 = unpack2(TEXTURE, vec2(texCoord.x, texCoord.y - "+(i+0.5).toFixed(1)+"*blurSize));";
    fragStr=fragStr+"mean += value2.g;";
    fragStr=fragStr+"mean2 += pow(value2.r,2.0);";
  }
  fragStr=fragStr+"gl_FragColor = vec4(pack2(pow(mean2/"+(SAMPLES*2).toFixed(2)+",0.5)),pack2(mean/"+(SAMPLES*2).toFixed(2)+"));\n";
  fragStr=fragStr+"}";

  fragStr=fragStr+"}\n";

  this.GLFragmentShader=gl.createShader(gl.FRAGMENT_SHADER);
  this.GLVertexShader=gl.createShader(gl.VERTEX_SHADER);

  gl.shaderSource(this.GLFragmentShader, fragStr);
  gl.compileShader(this.GLFragmentShader);
  if (!gl.getShaderParameter(this.GLFragmentShader, gl.COMPILE_STATUS)) {
        GLGE.error(gl.getShaderInfoLog(this.GLFragmentShader));
        return;
  }

  gl.shaderSource(this.GLVertexShader, vertexStr);
  gl.compileShader(this.GLVertexShader);
  if (!gl.getShaderParameter(this.GLVertexShader, gl.COMPILE_STATUS)) {
    GLGE.error(gl.getShaderInfoLog(this.GLVertexShader));
    return;
  }

  this.GLShaderProgram = gl.createProgram();
  gl.attachShader(this.GLShaderProgram, this.GLVertexShader);
  gl.attachShader(this.GLShaderProgram, this.GLFragmentShader);
  gl.linkProgram(this.GLShaderProgram);
}

/**
* Renders the blured shadow
* @private
*/
GLGE.Light.prototype.GLRenderSoft=function(gl){
  if(this.spotSoftness==0) return;

  if(!this.gl){
    this.GLInit(gl);
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBufferSf);

  if(gl.program!=this.GLShaderProgram){
    gl.useProgram(this.GLShaderProgram);
    gl.program=this.GLShaderProgram;
  }
  var attribslot;
  for(var i=0; i<8; i++) gl.disableVertexAttribArray(i);
  attribslot=GLGE.getAttribLocation(gl,this.GLShaderProgram, "position");

  gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
  gl.enableVertexAttribArray(attribslot);
  gl.vertexAttribPointer(attribslot, this.posBuffer.itemSize, gl.FLOAT, false, 0, 0);

  attribslot=GLGE.getAttribLocation(gl,this.GLShaderProgram, "uvcoord");
  gl.bindBuffer(gl.ARRAY_BUFFER, this.uvBuffer);
  gl.enableVertexAttribArray(attribslot);
  gl.vertexAttribPointer(attribslot, this.uvBuffer.itemSize, gl.FLOAT, false, 0, 0);

  gl.activeTexture(gl["TEXTURE0"]);
  gl.bindTexture(gl.TEXTURE_2D, this.texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.GLShaderProgram, "TEXTURE"),0);
  GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.GLShaderProgram, "xpass"),1);

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.GLfaces);

  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  gl.drawElements(gl.TRIANGLES, this.GLfaces.numItems, gl.UNSIGNED_SHORT, 0);

  //gl.disable(gl.BLEND);
  gl.activeTexture(gl["TEXTURE0"]);
  gl.bindTexture(gl.TEXTURE_2D, this.textureSf);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.GLShaderProgram, "TEXTURE"),0);
  GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.GLShaderProgram, "xpass"),0);

  gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
  gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.GLfaces);
  gl.drawElements(gl.TRIANGLES, this.GLfaces.numItems, gl.UNSIGNED_SHORT, 0);


  gl.bindTexture(gl.TEXTURE_2D, null);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
}


})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_scene.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){




/**
* @constant 
* @description Enumeration for no fog
*/
GLGE.FOG_NONE=1;
/**
* @constant 
* @description Enumeration for linear fall off fog
*/
GLGE.FOG_LINEAR=2;
/**
* @constant 
* @description Enumeration for exponential fall off fog
*/
GLGE.FOG_QUADRATIC=3;

/**
* @constant 
* @description Enumeration for linear fall off fog fading to sky
*/
GLGE.FOG_SKYLINEAR=4;
/**
* @constant 
* @description Enumeration for exponential fall off fog fading to sky
*/
GLGE.FOG_SKYQUADRATIC=5;

/**
* @class Scene class containing the camera, lights and objects
* @augments GLGE.Group
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.Scene=function(uid){
    GLGE.Group.call(this);
	this.children=[];
	this.camera=new GLGE.Camera();
	this.backgroundColor={r:1,g:1,b:1,a:1};
	this.ambientColor={r:0,g:0,b:0};
	this.fogColor={r:0.5,g:0.5,b:0.5};
	this.passes=[];
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.Group,GLGE.Scene);
GLGE.Scene.prototype.camera=null;
GLGE.Scene.prototype.className="Scene";
GLGE.Scene.prototype.renderer=null;
GLGE.Scene.prototype.backgroundColor=null;
GLGE.Scene.prototype.filter=null;
GLGE.Scene.prototype.fogColor=null;
GLGE.Scene.prototype.ambientColor=null;
GLGE.Scene.prototype.fogNear=10;
GLGE.Scene.prototype.fogFar=80;
GLGE.Scene.prototype.fogType=GLGE.FOG_NONE;
GLGE.Scene.prototype.passes=null;
GLGE.Scene.prototype.transbuffer=null;
GLGE.Scene.prototype.culling=true;


/**
* Gets the fog falloff type
* @returns {number} the far falloff type
*/
GLGE.Scene.prototype.getFogType=function(){	
	return this.fogType;
}
/**
* Sets the scenes fog falloff type
* @param {number} type The fog falloff type FOG_NONE,FOG_LINEAR,FOG_QUADRATIC
*/
GLGE.Scene.prototype.setFogType=function(type){	
	this.fogType=type;
	return this;
}

/**
* Gets the far fog distance
* @returns {number} the far distance of the fog
*/
GLGE.Scene.prototype.getFogFar=function(){	
	return this.fogFar;
}
/**
* Sets the scenes fog far distance
* @param {number} dist The fog far distance
*/
GLGE.Scene.prototype.setFogFar=function(dist){	
	this.fogFar=dist;
	return this;
}

/**
* Gets the near fog distance
* @returns {number} the near distance of the fog
*/
GLGE.Scene.prototype.getFogNear=function(){	
	return this.fogNear;
}
/**
* Sets the scenes fog near distance
* @param {number} dist The fog near distance
*/
GLGE.Scene.prototype.setFogNear=function(dist){	
	this.fogNear=dist;
	return this;
}

/**
* Gets the fog color
* @returns {object} An assoiative array r,g,b
*/
GLGE.Scene.prototype.getFogColor=function(){	
	return this.fogColor;
}
/**
* Sets the scenes fog color
* @param {string} color The fog color
*/
GLGE.Scene.prototype.setFogColor=function(color){	
	color=GLGE.colorParse(color);
	this.fogColor={r:color.r,g:color.g,b:color.b};
	return this;
}

/**
* Gets the scenes background color
* @returns {object} An assoiative array r,g,b
*/
GLGE.Scene.prototype.getBackgroundColor=function(){	
	return this.backgroundColor;
}
/**
* Sets the scenes background color
* @param {string} color The backgorund color
*/
GLGE.Scene.prototype.setBackgroundColor=function(color){	
	color=GLGE.colorParse(color);
	this.backgroundColor={r:color.r,g:color.g,b:color.b,a:color.a};
	return this;
}
/**
* Gets the scenes ambient light
* @returns {object} An assoiative array r,g,b
*/
GLGE.Scene.prototype.getAmbientColor=function(){	
	return this.ambientColor;
}

/**
* Sets the scenes ambient light
* @param {string} color The ambient light color
*/
GLGE.Scene.prototype.setAmbientColor=function(color){	
	color=GLGE.colorParse(color);
	this.ambientColor={r:color.r,g:color.g,b:color.b};
	if(this.renderer){
		this.renderer.gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, 1.0);
	}
	return this;
}
/**
* Sets the scenes ambient light
* @param {number} value the red componenent of the ambient light 0-1
*/
GLGE.Scene.prototype.setAmbientColorR=function(value){	
	this.ambientColor.r=value;
	return this;
}
/**
* Sets the scenes ambient light
* @param {number} value the green componenent of the ambient light 0-1
*/
GLGE.Scene.prototype.setAmbientColorG=function(value){	
	this.ambientColor.g=value;
	return this;
}
/**
* Sets the scenes ambient light
* @param {number} value the blue componenent of the ambient light 0-1
*/
GLGE.Scene.prototype.setAmbientColorB=function(value){	
	this.ambientColor.b=value;
	return this;
}

/**
* Sets the active camera for this scene
* @property {GLGE.Camera} object The object to be added
*/
GLGE.Scene.prototype.setCamera=function(camera){	
	if(typeof camera=="string")  camera=GLGE.Assets.get(camera);
	this.camera=camera;
	return this;
}
/**
* Gets the scenes active camera
* @returns {GLGE.Camera} The current camera
*/
GLGE.Scene.prototype.getCamera=function(){	
	return this.camera;
}


/**
* Sets the Culling Flag
*/
GLGE.Scene.prototype.setCull=function(cull){	
	this.culling=cull;
	return this;
}
/**
* Gets the Culling Flag
*/
GLGE.Scene.prototype.getCull=function(){	
	return this.culling;
}

/**
* used to initialize all the WebGL buffers etc need for this scene
* @private
*/
GLGE.Scene.prototype.GLInit=function(gl){
	this.gl=gl;
	gl.lights=this.getLights();
	//sets the camera aspect to same aspect as the canvas
	this.camera.setAspect(this.renderer.canvas.width/this.renderer.canvas.height);

	//this.createPickBuffer(gl);
	this.renderer.gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, 1.0);
	
	for(var i=0;i<this.children;i++){
		if(this.children[i].GLInit) children[i].GLInit(gl);
	}
}
/**
* used to clean up all the WebGL buffers etc need for this scene
* @private
*/
GLGE.Scene.prototype.GLDestroy=function(gl){
}
/**
* sort function
*/
GLGE.Scene.sortFunc=function(a,b){
	return a.zdepth-b.zdepth;
}

/**
* z sorts the objects
* @private
*/
GLGE.Scene.prototype.zSort=function(gl,objects){
	var cameraMatrix=gl.scene.camera.getViewMatrix();
	var transMatrix;
	for(var i=0;i<objects.length;i++){
		if(objects[i].object.getBoundingVolume){
			var center=objects[i].object.getBoundingVolume().getCenter();
		}else{
			var matrix=objects[i].object.getModelMatrix();
			var center=[matrix[3],matrix[7],matrix[11]];
		}
		objects[i].zdepth=center[0]*cameraMatrix[8]+center[1]*cameraMatrix[9]+center[2]*cameraMatrix[10]+cameraMatrix[11];
		if(objects[i].object.zDepth) {objects[i].zdepth=objects[i].object.zDepth;}
	}
	objects.sort(GLGE.Scene.sortFunc);
	return objects;
}
/**
* sets the 2d filter to apply
* @param {GLGE.Filter2d} filter the filter to apply when rendering the scene
*/
GLGE.Scene.prototype.setFilter2d=function(value){
	this.filter=value;
	return this;
}
/**
* gets the 2d filter being applied apply
* @returns {GLGE.Filter2d}
*/
GLGE.Scene.prototype.getFilter2d=function(filter){
	return this.filter;
}

/**
* sets the sky filter to apply
* @param {GLGE.Filter2d} filter tthe filter used to render the sky
*/
GLGE.Scene.prototype.setSkyFilter=function(value){
	this.skyfilter=value;
	return this;
}
/**
* gets the sky filter
* @returns {GLGE.Filter2d}
*/
GLGE.Scene.prototype.getSkyFilter=function(filter){
	return this.skyfilter;
}
/**
* gets the scenes frame buffer
* @private
*/
GLGE.Scene.prototype.getFrameBuffer=function(gl){
	if(this.filter) return this.filter.getFrameBuffer(gl);
	return null;
}
/**
* culls objects from the scene
* @private
*/
GLGE.Scene.prototype.objectsInViewFrustum=function(renderObjects,cvp){
	var obj;
	var returnObjects=[];
	var planes=GLGE.cameraViewProjectionToPlanes(cvp);
	for(var i=0;i<renderObjects.length;i++){
		obj=renderObjects[i];
		if(obj.getBoundingVolume && obj.cull){
			var boundingVolume=obj.getBoundingVolume();
			var center=boundingVolume.getCenter();
			var radius=boundingVolume.getSphereRadius();
			if(GLGE.sphereInFrustumPlanes([center[0],center[1],center[2],radius],planes)){
				var points=boundingVolume.getCornerPoints();
				if(GLGE.pointsInFrustumPlanes(points,planes)){
					returnObjects.push(obj);
					if(obj.culled) obj.fireEvent("willRender",{});
					obj.culled=false;
				}else{
					if(!obj.culled) obj.fireEvent("willCull",{});
					obj.culled=true;
				}
			}else{
				if(!obj.culled) obj.fireEvent("willCull",{});
				obj.culled=true;
			}
		}else{
			returnObjects.push(obj);
		}
	}
	return returnObjects;	
}
/**
* Extracts all of the scene elements that need rendering
* @private
*/
GLGE.Scene.prototype.unfoldRenderObject=function(renderObjects){
	var returnObjects=[];
	for(var i=0;i<renderObjects.length;i++){
		var renderObject=renderObjects[i];
		if(renderObject.getMultiMaterials){
			var multiMaterials=renderObject.getMultiMaterials();
			for(var j=0;j<multiMaterials.length;j++){
				var mat=multiMaterials[j].getMaterial();
				var mesh=multiMaterials[j].getMesh();
				if(!mat.meshIdx) mat.matIdx=j;
				if(!mat.meshIdx) mat.meshIdx=j;
				returnObjects.push({object:renderObject, multiMaterial:j});
			}
		}else{
			returnObjects.push({object:renderObject, multiMaterial:0});
		}
	}
	return returnObjects;
}

/**
* State sorting function
* @private
*/
GLGE.Scene.prototype.stateSort=function(a,b){
	if(!a.object.GLShaderProgram) return 1;
	if(!b.object.GLShaderProgram) return -1;
	var aidx=a.object.GLShaderProgram.progIdx;
	var bidx=b.object.GLShaderProgram.progIdx;
	if(aidx>bidx){
		return 1;
	}else if(aidx<bidx){
		return -1;
	}else{
		if(!a.object.multimaterials || !b.object.multimaterials) return -1;
		var aidx=a.object.multimaterials[a.multiMaterial].getMaterial().matIdx;
		var bidx=b.object.multimaterials[b.multiMaterial].getMaterial().matIdx;
		if(aidx>bidx){
			return 1;
		}else if(aidx<bidx){
			return -1;
		}else{
			var amesh=a.object.multimaterials[a.multiMaterial].getMesh();
			var bmesh=a.object.multimaterials[a.multiMaterial].getMesh();
			if(!amesh) return -1;
			if(!bmesh) return 1;
			var aidx=amesh.meshIdx;
			var bidx=bmesh.meshIdx;
			if(aidx>bidx){
				return 1;
			}else if(aidx<bidx){
				return -1;
			}else{
				return 0;
			}
		}
	}
}

/**
* Sets up the WebGL needed to render the sky for use in sky fog
* @private
*/
GLGE.Scene.prototype.createSkyBuffer=function(gl){
    this.skyTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.skyTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, this.renderer.canvas.width,this.renderer.canvas.height, 0, gl.RGB, gl.UNSIGNED_BYTE, null);
}


/**
* renders the scene
* @private
*/
GLGE.Scene.prototype.render=function(gl){
	this.animate();
	//if look at is set then look
	if(this.camera.lookAt) this.camera.Lookat(this.camera.lookAt);	

	gl.lights=this.getLights();
	
	var lights=gl.lights;
	gl.scene=this;
	this.lastMaterial=null;
	
	gl.disable(gl.BLEND);
	
	this.framebuffer=this.getFrameBuffer(gl);
	

	var renderObjects=this.getObjects();
	var cvp=this.camera.getViewProjection();
	
	if(this.culling){
		var cvp=this.camera.getViewProjection();
		renderObjects=this.objectsInViewFrustum(renderObjects,cvp);
	}
	renderObjects=this.unfoldRenderObject(renderObjects);
	renderObjects=renderObjects.sort(this.stateSort);

	
	//shadow stuff
	for(var i=0; i<lights.length;i++){
		if(lights[i].castShadows){
			if(!lights[i].gl) lights[i].GLInit(gl);
			var cameraMatrix=this.camera.matrix;
			var cameraPMatrix=this.camera.getProjectionMatrix();
			var projectedDistance=0;
			if(lights[i].getType()==GLGE.L_DIR){
				var mat=lights[i].getModelMatrix();
				var cmat=GLGE.inverseMat4(cameraMatrix);
				mat[3]=(mat[2])*lights[i].distance/2+cmat[3];
				mat[7]=(mat[6])*lights[i].distance/2+cmat[7];
				mat[11]=(mat[10])*lights[i].distance/2+cmat[11];
				lights[i].matrix=mat;
				var tvec=GLGE.mulMat4Vec4(cameraPMatrix,[0,0,lights[i].distance,1]);
				projectedDistance=tvec[3]/tvec[2]; //this is wrong?
			}
			
				gl.bindFramebuffer(gl.FRAMEBUFFER, lights[i].frameBuffer);

				if(!lights[i].s_cache) lights[i].s_cache={};
				lights[i].s_cache.imvmatrix=GLGE.inverseMat4(lights[i].getModelMatrix());
				lights[i].s_cache.mvmatrix=lights[i].getModelMatrix();
				lights[i].s_cache.pmatrix=lights[i].getPMatrix(cvp,lights[i].s_cache.imvmatrix,projectedDistance,this.camera.far/2, this.camera);
				lights[i].s_cache.smatrix=GLGE.mulMat4(lights[i].s_cache.pmatrix,lights[i].s_cache.imvmatrix);
				lights[i].shadowRendered=false;
				
				
				gl.viewport(0,0,parseFloat(lights[i].bufferWidth),parseFloat(lights[i].bufferHeight));
				gl.clearDepth(1.0);
				gl.clearColor(1, 1, 1, 1);
				gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
					
				var height=parseFloat(lights[i].bufferHeight);
				var width=parseFloat(lights[i].bufferWidth);
				


				gl.viewport(0,0,width,height);						

				this.camera.setProjectionMatrix(lights[i].s_cache.pmatrix);
				this.camera.matrix=lights[i].s_cache.imvmatrix;
				//draw shadows
				for(var n=0; n<renderObjects.length;n++){
					if(renderObjects[n].object.getCastShadows && !renderObjects[n].object.getCastShadows()) continue;
					if(renderObjects[n].object.className=="ParticleSystem") {continue;}
					if(lights[i].getType()==GLGE.L_SPOT){
						renderObjects[n].object.GLRender(gl, GLGE.RENDER_SHADOW,n,renderObjects[n].multiMaterial,lights[i].distance);
					}else{
						renderObjects[n].object.GLRender(gl, GLGE.RENDER_DEPTH,n,renderObjects[n].multiMaterial,lights[i].distance);
					}
				}

				
				lights[i].s_cache.smatrix=GLGE.mulMat4(lights[i].s_cache.pmatrix,lights[i].s_cache.imvmatrix);
			
				lights[i].GLRenderSoft(gl);
						
			this.camera.matrix=null;
			this.camera.setProjectionMatrix(cameraPMatrix);
		}
	}
	
	if(this.culling){
		var cvp=this.camera.getViewProjection();
		renderObjects=this.objectsInViewFrustum(renderObjects,cvp);
	}
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer);

	
	if(this.camera.animation) this.camera.animate();
	
	//null render pass to findout what else needs rendering
	this.getPasses(gl,renderObjects);	
	
	//first off render the passes
	var cameraMatrix=this.camera.matrix;
	var cameraPMatrix=this.camera.getProjectionMatrix();
	this.allowPasses=false;
	while(this.passes.length>0){
		var pass=this.passes.pop();
		gl.bindFramebuffer(gl.FRAMEBUFFER, pass.frameBuffer);
		this.camera.matrix=pass.cameraMatrix;
		this.camera.setProjectionMatrix(pass.projectionMatrix);
		this.mirror=pass.mirror;
		this.renderPass(gl,renderObjects,0,0,pass.width,pass.height,GLGE.RENDER_DEFAULT,pass.self);
	}
	this.mirror=false;
	
	this.camera.matrix=cameraMatrix;
	this.camera.setProjectionMatrix(cameraPMatrix);
	
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.filter ? this.framebuffer : this.transbuffer);
	this.renderPass(gl,renderObjects,this.renderer.getViewportOffsetX(),this.renderer.getViewportOffsetY(),this.renderer.getViewportWidth(),this.renderer.getViewportHeight());	

	
	this.applyFilter(gl,renderObjects, this.transbuffer);
	
	this.allowPasses=true;
}
/**
* gets the passes needed to render this scene
* @private
*/
GLGE.Scene.prototype.getPasses=function(gl,renderObjects){
	for(var i=0; i<renderObjects.length;i++){
		renderObjects[i].object.GLRender(gl,GLGE.RENDER_NULL,0,renderObjects[i].multiMaterial);
	}
}

/**
* renders the scene
* @private
*/
GLGE.Scene.prototype.renderPass=function(gl,renderObjects,offsetx,offsety,width,height,type,self){
	gl.clearDepth(1.0);
	gl.depthFunc(gl.LEQUAL);
	gl.viewport(offsetx,offsety,width,height);
	
	gl.clearColor(this.backgroundColor.r, this.backgroundColor.g, this.backgroundColor.b, this.backgroundColor.a);

	gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT | gl.STENCIL_BUFFER_BIT);

	if(!type) type=GLGE.RENDER_DEFAULT;
	
	if(this.skyfilter && type==GLGE.RENDER_DEFAULT){
		this.skyfilter.GLRender(gl);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		if(this.skyfilter && this.fogType==GLGE.FOG_SKYQUADRATIC || this.fogType==GLGE.FOG_SKYLINEAR){
			if(!this.skyTexture) this.createSkyBuffer(gl);
			gl.bindTexture(gl.TEXTURE_2D, this.skyTexture);
			gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGB, 0, 0, width, height, 0);
		}
	}
	
	var transObjects=[];
	gl.disable(gl.BLEND);
	for(var i=0; i<renderObjects.length;i++){
		if((!renderObjects[i].object.zTrans ||  type!=GLGE.RENDER_DEFAULT) && renderObjects[i].object!=self) renderObjects[i].object.GLRender(gl,type,0,renderObjects[i].multiMaterial);
			else if(renderObjects[i].object!=self) transObjects.push(renderObjects[i]);
	}

	gl.enable(gl.BLEND);
	transObjects=this.zSort(gl,transObjects);
	for(var i=0; i<transObjects.length;i++){
		if(transObjects[i].object.blending){
			if(transObjects[i].object.blending.length==4){
				gl.blendFuncSeparate(gl[transObjects[i].object.blending[0]],gl[transObjects[i].object.blending[1]],gl[transObjects[i].object.blending[2]],gl[transObjects[i].object.blending[3]]);
			}else{
				gl.blendFunc(gl[transObjects[i].object.blending[0]],gl[transObjects[i].object.blending[1]]);
			}
		}
		if(transObjects[i].object.depthTest===false){
			gl.disable(this.gl.DEPTH_TEST);   
		}else{
			gl.enable(this.gl.DEPTH_TEST);   
		}
		if(renderObjects[i]!=self) transObjects[i].object.GLRender(gl, type,0,transObjects[i].multiMaterial);
	}

}

GLGE.Scene.prototype.applyFilter=function(gl,renderObject,framebuffer){
    
    if(this.filter && this.filter.renderDepth){    
    	gl.clearDepth(1.0);
    	gl.depthFunc(gl.LEQUAL);
    	gl.bindFramebuffer(gl.FRAMEBUFFER, this.filter.getDepthBuffer(gl));
    	this.renderPass(gl,renderObject,0,0,this.filter.getDepthBufferWidth(), this.filter.getDepthBufferHeight(),GLGE.RENDER_SHADOW);	
    }
    
    if(this.filter && this.filter.renderEmit){    
        gl.clearDepth(1.0);
    	gl.depthFunc(gl.LEQUAL);
    	gl.bindFramebuffer(gl.FRAMEBUFFER, this.filter.getEmitBuffer(gl));
    	this.renderPass(gl,renderObject,0,0,this.filter.getEmitBufferWidth(),this.filter.getEmitBufferHeight(),GLGE.RENDER_EMIT);	
    }
	
	if(this.filter && this.filter.renderNormal){	
		gl.clearDepth(1.0);
		gl.depthFunc(gl.LEQUAL);
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.filter.getNormalBuffer(gl));
		this.renderPass(gl,renderObject,0,0,this.filter.getNormalBufferWidth(),this.filter.getNormalBufferHeight(),GLGE.RENDER_NORMAL);	
	}
    

    

	
	if(this.filter) this.filter.GLRender(gl,framebuffer);
}

/**
* Adds and additional render pass to the scene for RTT, reflections and refractions
* @private
*/
GLGE.Scene.prototype.addRenderPass=function(frameBuffer,cameraMatrix,projectionMatrix,width,height,self,mirror){
	if(this.allowPasses)	this.passes.push({frameBuffer:frameBuffer, cameraMatrix:cameraMatrix, projectionMatrix:projectionMatrix, height:height, width:width,self:self,mirror:mirror});
	return this;
}
/**
* Sets up the WebGL needed create a picking frame and render buffer
* @private
*/
/*GLGE.Scene.prototype.createPickBuffer=function(gl){
    this.framePickBuffer = gl.createFramebuffer();
    this.renderPickBufferD = gl.createRenderbuffer();
    this.renderPickBufferC = gl.createRenderbuffer();
    //this.pickTexture = gl.createTexture();
    //gl.bindTexture(gl.TEXTURE_2D, this.pickTexture);

    //TODO update when null is accepted
   /* try {
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    } catch (e) {
        var tex = new WebGLUnsignedByteArray(4*1*4);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 4,1, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    }
    
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.framePickBuffer);
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderPickBufferD);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16,4, 1);
    //gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.pickTexture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderPickBufferD);
    
    
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderPickBufferC);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA,4, 1);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, this.renderPickBufferC);
    
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.bindTexture(gl.TEXTURE_2D, null);
}*/

/**
* ray query from origin in the given direction
* @param origin the source of the ray
* @param direction the direction of the ray
*/
GLGE.Scene.prototype.ray=function(origin,direction){

		var gl=this.renderer.gl;
		var origmatrix=this.camera.matrix;	
		var origpmatrix=this.camera.pMatrix;
		
		this.camera.matrix=GLGE.inverseMat4(GLGE.Mat4([direction[2], direction[1], direction[0], origin[0],
									direction[0], direction[2], direction[1], origin[1],
									direction[1], direction[0], direction[2], origin[2],
									0, 0, 0, 1]));

		if(!this.pickPMatrix)	this.pickPMatrix=GLGE.makeOrtho(-0.0001,0.0001,-0.0001,0.0001,this.camera.near,this.camera.far);
		this.camera.pMatrix=this.pickPMatrix;
		gl.viewport(0,0,8,1);
		gl.clear(gl.DEPTH_BUFFER_BIT);
		gl.disable(gl.BLEND);
		gl.scene=this;
		var objects=this.getObjects();
		/*if(this.culling){
			var cvp=this.camera.getViewProjection();
			objects=this.objectsInViewFrustum(objects,cvp);
		}*/
		for(var i=0; i<objects.length;i++){
			if(objects[i].pickable) objects[i].GLRender(gl,GLGE.RENDER_PICK,i+1);
		}
		//gl.flush();

		var data = new Uint8Array(8 * 1 * 4);
		gl.readPixels(0, 0, 8, 1, gl.RGBA,gl.UNSIGNED_BYTE, data);
		
		var norm=[data[4]/255,data[5]/255,data[6]/255];
		var normalsize=Math.sqrt(norm[0]*norm[0]+norm[1]*norm[1]+norm[2]*norm[2])*0.5;
		norm=[norm[0]/normalsize-1,norm[1]/normalsize-1,norm[2]/normalsize-1];
		var obj=objects[data[0]+data[1]*256+data[2]*65536-1];

		var dist=(data[10]/255+0.00390625*data[9]/255+0.0000152587890625*data[8]/255)*this.camera.far;
		var tex=[];
		tex[0]=(data[14]/255+0.00390625*data[13]/255+0.0000152587890625*data[12]/255);
		tex[1]=(data[18]/255+0.00390625*data[17]/255+0.0000152587890625*data[16]/255);
		
				
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0,0,this.renderer.canvas.width,this.renderer.canvas.height);
		
		//revert the view matrix
		this.camera.matrix=origmatrix;	
		this.camera.pMatrix=origpmatrix;
		if (obj) {
			return {object:obj,distance:dist,coord:[origin[0]-direction[0]*dist,origin[1]-direction[1]*dist,origin[2]-direction[2]*dist],normal:norm,texture:tex};
		}
		return null;
}

/**
* Picks and object from canvas coords
* @param x the canvas x coord to pick
* @param y the canvas y coord to pick
*/

GLGE.Scene.prototype.pick=function(x,y){
	var ray = this.makeRay(x,y);
	if (!ray) {
		return null;
	}
	return this.ray(ray.origin,ray.coord);
};


/**
* Returns an object containing origin and coord, starting from the camera and pointing towards (x,y)
* @param x the canvas x coord to pick
* @param y the canvas y coord to pick
*/

GLGE.Scene.prototype.makeRay=function(x,y){
	if(!this.camera){
		GLGE.error("No camera set for picking");
		return null;
	}else if(this.camera.matrix && this.camera.pMatrix){
		//correct xy account for canvas scaling
		var canvas=this.renderer.canvas;
		x=x/canvas.offsetWidth*canvas.width;
		y=y/canvas.offsetHeight*canvas.height;
		
		var height=this.renderer.getViewportHeight();
		var width=this.renderer.getViewportWidth();
		var offsetx=this.renderer.getViewportOffsetX();
		var offsety=this.renderer.getViewportHeight()-this.renderer.canvas.height+this.renderer.getViewportOffsetY();
		var xcoord =  ((x-offsetx)/width-0.5)*2;
		var ycoord = -((y+offsety)/height-0.5)*2;
		var invViewProj=GLGE.mulMat4(GLGE.inverseMat4(this.camera.matrix),GLGE.inverseMat4(this.camera.pMatrix));
		var origin =GLGE.mulMat4Vec4(invViewProj,[xcoord,ycoord,-1,1]);
		origin=[origin[0]/origin[3],origin[1]/origin[3],origin[2]/origin[3]];
		var coord =GLGE.mulMat4Vec4(invViewProj,[xcoord,ycoord,1,1]);
		coord=[-(coord[0]/coord[3]-origin[0]),-(coord[1]/coord[3]-origin[1]),-(coord[2]/coord[3]-origin[2])];
		coord=GLGE.toUnitVec3(coord);
		return {origin: origin, coord: coord};
		
	}else{
		return null;
	}
	
};


})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_particles.js
 */

(function(GLGE){


/**
* @class A texture to be included in a material
* @param {string} uid the unique id for this texture
* @augments GLGE.Placeable
* @augments GLGE.Animatable
*/
GLGE.ParticleSystem=function(uid){
	this.startTime=(new Date()).getTime();
	this.texture={};
	this.startMaxVelocity={x:0,y:0,z:0};
	this.startMinVelocity={x:0,y:0,z:0};
	this.startMaxAcceleration={x:0,y:0,z:0};
	this.endMaxAcceleration={x:0,y:0,z:0};
	this.startMinAcceleration={x:0,y:0,z:0};
	this.endMinAcceleration={x:0,y:0,z:0};
	this.startColor={r:0,g:0,b:0,a:1};
	this.endColor={r:0,g:0,b:0,a:1};
	GLGE.Assets.registerAsset(this,uid);
}

GLGE.augment(GLGE.Placeable,GLGE.ParticleSystem);
GLGE.augment(GLGE.Animatable,GLGE.ParticleSystem);

GLGE.ParticleSystem.prototype.depthTest=true;
GLGE.ParticleSystem.prototype.zTrans=true;
GLGE.ParticleSystem.prototype.blending=[ "SRC_ALPHA", "ONE_MINUS_SRC_ALPHA","SRC_ALPHA","ONE_MINUS_SRC_ALPHA"];



/**
* Sets  predefined blends, accepts "ADD" "MIX"
* @param {string} blend predefined types "ADD" "MIX"
*/
GLGE.ParticleSystem.prototype.setBlend=function(blend){
	switch(blend){
		case "ADD":
			this.blending=[ "SRC_ALPHA", "ONE","SRC_ALPHA","ONE_MINUS_SRC_ALPHA"];
			break;
		case "MIX":
			this.blending=[ "SRC_ALPHA", "ONE_MINUS_SRC_ALPHA","SRC_ALPHA","ONE_MINUS_SRC_ALPHA"];
			break;
	}
	
	return this;
}

/**
* Sets the object blending mode
* @param {array} gl blending funcs as strings, eg. [ "ONE", "ONE"]
*/
GLGE.ParticleSystem.prototype.setBlending=function(blending){
	this.blending=blending;
	return this;
}

/**
* Gets the object blending mode
* @returns  gl blending funcs
*/
GLGE.ParticleSystem.prototype.getBlending=function(){
	return this.blending;
}

/**
* Sets the max velocity in the X direction
* @param {number} value the maximum velocity
*/
GLGE.ParticleSystem.prototype.setMaxVelX=function(value){
	this.startMaxVelocity.x=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the max velocity in the Y direction
* @param {number} value the maximum velocity
*/
GLGE.ParticleSystem.prototype.setMaxVelY=function(value){
	this.startMaxVelocity.y=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the max velocity in the Z direction
* @param {number} value the maximum velocity
*/
GLGE.ParticleSystem.prototype.setMaxVelZ=function(value){
	this.startMaxVelocity.z=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the max velocity in the all direction
* @param {number} x the maximum velocity in x axis
* @param {number} y the maximum velocity in y axis
* @param {number} z the maximum velocity in z axis
*/
GLGE.ParticleSystem.prototype.setMaxVelocity=function(x,y,z){
	this.startMaxVelocity={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.attribute=null;
}
/**
* Sets the min velocity in the X direction
* @param {number} value the minimum velocity
*/
GLGE.ParticleSystem.prototype.setMinVelX=function(value){
	this.startMinVelocity.x=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the min velocity in the Y direction
* @param {number} value the minimum velocity
*/
GLGE.ParticleSystem.prototype.setMinVelY=function(value){
	this.startMinVelocity.y=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the min velocity in the Z direction
* @param {number} value the minimum velocity
*/
GLGE.ParticleSystem.prototype.setMinVelZ=function(value){
	this.startMinVelocity.z=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the min velocity in the all direction
* @param {number} x the minimum velocity in x axis
* @param {number} y the minimum velocity in y axis
* @param {number} z the minimum velocity in z axis
*/
GLGE.ParticleSystem.prototype.setMinVelocity=function(x,y,z){
	this.startMinVelocity={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.attribute=null;
}

/**
* Sets the velocity in the X direction
* @param {number} value the minimum velocity
*/
GLGE.ParticleSystem.prototype.setVelX=function(value){
	this.startMaxVelocity.x=parseFloat(value);
	this.startMinVelocity.x=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the velocity in the Y direction
* @param {number} value the minimum velocity
*/
GLGE.ParticleSystem.prototype.setVelY=function(value){
	this.startMaxVelocity.y=parseFloat(value);
	this.startMinVelocity.y=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the velocity in the Z direction
* @param {number} value the minimum velocity
*/
GLGE.ParticleSystem.prototype.setVelZ=function(value){
	this.startMaxVelocity.z=parseFloat(value);
	this.startMinVelocity.z=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the velocity in the all direction
* @param {number} x the minimum velocity in x axis
* @param {number} y the minimum velocity in y axis
* @param {number} z the minimum velocity in z axis
*/
GLGE.ParticleSystem.prototype.setVelocity=function(x,y,z){
	this.startMaxVelocity={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.startMinVelocity={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.attribute=null;
}

/**
* Sets the max starting acceleration in the X direction
* @param {number} value the maximum acceleration
*/
GLGE.ParticleSystem.prototype.setMaxStartAccX=function(value){
	this.startMaxAcceleration.x=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the max starting acceleration in the Y direction
* @param {number} value the maximum acceleration
*/
GLGE.ParticleSystem.prototype.setMaxStartAccY=function(value){
	this.startMaxAcceleration.y=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the max starting acceleration in the Z direction
* @param {number} value the maximum acceleration
*/
GLGE.ParticleSystem.prototype.setMaxStartAccZ=function(value){
	this.startMaxAcceleration.z=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the max starting acceleration in the all direction
* @param {number} x the minimum velocity in x axis
* @param {number} y the minimum velocity in y axis
* @param {number} z the minimum velocity in z axis
*/
GLGE.ParticleSystem.prototype.setMaxStartAccelertaion=function(x,y,z){
	this.startMaxAcceleration={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.attribute=null;
}
/**
* Sets the min starting acceleration in the X direction
* @param {number} value the minimum acceleration
*/
GLGE.ParticleSystem.prototype.setMinStartAccX=function(value){
	this.startMinAcceleration.x=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the min starting acceleration in the Y direction
* @param {number} value the minimum acceleration
*/
GLGE.ParticleSystem.prototype.setMinStartAccY=function(value){
	this.startMinAcceleration.y=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the min starting acceleration in the Z direction
* @param {number} value the minimum acceleration
*/
GLGE.ParticleSystem.prototype.setMinStartAccZ=function(value){
	this.startMinAcceleration.z=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the min starting acceleration in the all direction
* @param {number} x the minimum velocity in x axis
* @param {number} y the minimum velocity in y axis
* @param {number} z the minimum velocity in z axis
*/
GLGE.ParticleSystem.prototype.setMinStartAccelertaion=function(x,y,z){
	this.startMinAcceleration={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.attribute=null;
}

/**
* Sets the starting acceleration in the X direction
* @param {number} value the minimum acceleration
*/
GLGE.ParticleSystem.prototype.setStartAccX=function(value){
	this.startMaxAcceleration.x=parseFloat(value);
	this.startMinAcceleration.x=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the starting acceleration in the Y direction
* @param {number} value the minimum acceleration
*/
GLGE.ParticleSystem.prototype.setStartAccY=function(value){
	this.startMaxAcceleration.y=parseFloat(value);
	this.startMinAcceleration.y=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the starting acceleration in the Z direction
* @param {number} value the minimum acceleration
*/
GLGE.ParticleSystem.prototype.setStartAccZ=function(value){
	this.startMaxAcceleration.z=parseFloat(value);
	this.startMinAcceleration.z=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the starting acceleration in the all direction
* @param {number} x the minimum velocity in x axis
* @param {number} y the minimum velocity in y axis
* @param {number} z the minimum velocity in z axis
*/
GLGE.ParticleSystem.prototype.setStartAccelertaion=function(x,y,z){
	this.startMaxAcceleration={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.startMinAcceleration={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.attribute=null;
}

/**
* Sets the maximum ending acceleration in the X direction
* @param {number} value the maximum acceleration
*/
GLGE.ParticleSystem.prototype.setMaxEndAccX=function(value){
	this.endMaxAcceleration.x=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the maximum ending acceleration in the Y direction
* @param {number} value the maximum acceleration
*/
GLGE.ParticleSystem.prototype.setMaxEndAccY=function(value){
	this.endMaxAcceleration.y=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the maximum ending acceleration in the Z direction
* @param {number} value the maximum acceleration
*/
GLGE.ParticleSystem.prototype.setMaxEndAccZ=function(value){
	this.endMaxAcceleration.z=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the maximum ending acceleration in the all direction
* @param {number} x the maximum velocity in x axis
* @param {number} y the maximum velocity in y axis
* @param {number} z the maximum velocity in z axis
*/
GLGE.ParticleSystem.prototype.setMaxEndAccelertaion=function(x,y,z){
	this.endMaxAcceleration={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.attribute=null;
}
/**
* Sets the minimum ending acceleration in the X direction
* @param {number} value the minimum acceleration
*/
GLGE.ParticleSystem.prototype.setMinEndAccX=function(value){
	this.endMinAcceleration.x=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the minimum ending acceleration in the Y direction
* @param {number} value the minimum acceleration
*/
GLGE.ParticleSystem.prototype.setMinEndAccY=function(value){
	this.endMinAcceleration.y=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the minimum ending acceleration in the Z direction
* @param {number} value the minimum acceleration
*/
GLGE.ParticleSystem.prototype.setMinEndAccZ=function(value){
	this.endMinAcceleration.z=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the minimum ending acceleration in the all direction
* @param {number} x the minimum velocity in x axis
* @param {number} y the minimum velocity in y axis
* @param {number} z the minimum velocity in z axis
*/
GLGE.ParticleSystem.prototype.setMinEndAccelertaion=function(x,y,z){
	this.endMinAcceleration={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.attribute=null;
}
/**
* Sets the ending acceleration in the X direction
* @param {number} value the acceleration
*/
GLGE.ParticleSystem.prototype.setEndAccX=function(value){
	this.endMinAcceleration.x=parseFloat(value);
	this.endMaxAcceleration.x=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the ending acceleration in the Y direction
* @param {number} value the acceleration
*/
GLGE.ParticleSystem.prototype.setEndAccY=function(value){
	this.endMinAcceleration.y=parseFloat(value);
	this.endMaxAcceleration.y=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the ending acceleration in the Z direction
* @param {number} value the acceleration
*/
GLGE.ParticleSystem.prototype.setEndAccZ=function(value){
	this.endMinAcceleration.z=parseFloat(value);
	this.endMaxAcceleration.z=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the ending acceleration in the all direction
* @param {number} x the minimum velocity in x axis
* @param {number} y the minimum velocity in y axis
* @param {number} z the minimum velocity in z axis
*/
GLGE.ParticleSystem.prototype.setEndAccelertaion=function(x,y,z){
	this.endMinAcceleration={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.endMaxAcceleration={x:parseFloat(x),y:parseFloat(y),z:parseFloat(z)};
	this.attribute=null;
}

/**
* Sets the starting color of the particle
* @param {number} value the start color
*/
GLGE.ParticleSystem.prototype.setStartColor=function(value){
	var color=GLGE.colorParse(value);
	this.startColor=color;
	this.attribute=null;
}
/**
* Sets the ending color of the particle
* @param {number} value the end color
*/
GLGE.ParticleSystem.prototype.setEndColor=function(value){
	var color=GLGE.colorParse(value);
	this.endColor=color;
	this.attribute=null;
}
/**
* Sets the starting size of the particle
* @param {number} value the start size
*/
GLGE.ParticleSystem.prototype.setStartSize=function(value){
	this.startSize=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the ending size of the particle
* @param {number} value the end size
*/
GLGE.ParticleSystem.prototype.setEndSize=function(value){
	this.endSize=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the particles lifetime
* @param {number} value the particles life time
*/
GLGE.ParticleSystem.prototype.setLifeTime=function(value){
	this.maxLifeTime=parseFloat(value);
	this.minLifeTime=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the particles maximum lifetime
* @param {number} value the particles life time
*/
GLGE.ParticleSystem.prototype.setMaxLifeTime=function(value){
	this.maxLifeTime=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the particles minimum lifetime
* @param {number} value the particles life time
*/
GLGE.ParticleSystem.prototype.setMinLifeTime=function(value){
	this.minLifeTime=parseFloat(value);
	this.attribute=null;
}
/**
* Sets the total number of particles
* @param {number} value the number of particles
*/
GLGE.ParticleSystem.prototype.setNumParticles=function(value){
	this.numParticles=parseFloat(value);
	this.attribute=null;
}


/**
* The particles velocity function used to generate the initial particles velocities
*/
GLGE.ParticleSystem.prototype.velocityFunction=function(i){
	return [
		(this.startMaxVelocity.x-this.startMinVelocity.x) * Math.random()+this.startMinVelocity.x,
		(this.startMaxVelocity.y-this.startMinVelocity.y) * Math.random()+this.startMinVelocity.y,
		(this.startMaxVelocity.z-this.startMinVelocity.z) * Math.random()+this.startMinVelocity.z
		];
}
/**
* The particles acceleration function used to generate the initial particles accelerations
*/
GLGE.ParticleSystem.prototype.accelerationFunction=function(i){
	return [[
		(this.startMaxAcceleration.x-this.startMinAcceleration.x) * Math.random()+this.startMinAcceleration.x,
		(this.startMaxAcceleration.y-this.startMinAcceleration.y) * Math.random()+this.startMinAcceleration.y,
		(this.startMaxAcceleration.z-this.startMinAcceleration.z) * Math.random()+this.startMinAcceleration.z,
		],
		[
		(this.endMaxAcceleration.x-this.endMinAcceleration.x) * Math.random()+this.endMinAcceleration.x,
		(this.endMaxAcceleration.y-this.endMinAcceleration.y) * Math.random()+this.endMinAcceleration.y,
		(this.endMaxAcceleration.z-this.endMinAcceleration.z) * Math.random()+this.endMinAcceleration.z,
		]];
}
/**
* The particles color function used to generate the initial colors
*/
GLGE.ParticleSystem.prototype.colorFunction=function(i){
	return [[this.startColor.r,this.startColor.g,this.startColor.b,this.startColor.a],[this.endColor.r,this.endColor.g,this.endColor.b,this.endColor.a]];
}
/**
* The particles position  function used to generate the initial positions
*/
GLGE.ParticleSystem.prototype.positionFunction=function(i){
	return [0,0,0];
}
/**
* The particles size function used to generate the initial sizes
*/
GLGE.ParticleSystem.prototype.sizeFunction=function(i){
	return [this.startSize,this.endSize];
}
/**
* The particles life time function used to generate the initial lifetimes
*/
GLGE.ParticleSystem.prototype.lifeTimeFunction=function(i){
	return (this.maxLifeTime-this.minLifeTime)*Math.random()+this.minLifeTime;
}
//lifetime of a particle
GLGE.ParticleSystem.prototype.minLifeTime=2000;
GLGE.ParticleSystem.prototype.maxLifeTime=2000;
//particle emit rate
GLGE.ParticleSystem.prototype.numParticles=200;
GLGE.ParticleSystem.prototype.startTime=0;
GLGE.ParticleSystem.prototype.startSize=0;
GLGE.ParticleSystem.prototype.endSize=1;
GLGE.ParticleSystem.prototype.toRender=true;
GLGE.ParticleSystem.prototype.renderFirst=true;
GLGE.ParticleSystem.prototype.className="ParticleSystem";
GLGE.ParticleSystem.prototype.zTrans=true;
GLGE.ParticleSystem.prototype.velocity=null;
GLGE.ParticleSystem.prototype.loop=1;
/**
* Sets a new velocity function for this particle system
* @param {function} func the new function
*/
GLGE.ParticleSystem.prototype.setVelocityFunction=function(func){
	this.velocityFunction=func;
	this.particles=null;
}
/**
* Sets a new acceleration function for this particle system
* @param {function} func the new function
*/
GLGE.ParticleSystem.prototype.setAccelerationFunction=function(func){
	this.accelerationFunction=func;
	this.particles=null;
}
/**
* Sets a new position function for this particle system
* @param {function} func the new function
*/
GLGE.ParticleSystem.prototype.setPositionFunction=function(func){
	this.colorFunction=func;
	this.particles=null;
}
/**
* Sets a new color function for this particle system
* @param {function} func the new function
*/
GLGE.ParticleSystem.prototype.setColorFunction=function(func){
	this.positionFunction=func;
	this.particles=null;
}
/**
* Sets a new size function for this particle system
* @param {function} func the new function
*/
GLGE.ParticleSystem.prototype.setSizeFunction=function(func){
	this.sizeFunction=func;
	this.particles=null;
}
/**
* generates the particles
* @private
*/
GLGE.ParticleSystem.prototype.generateParticles=function(gl){
	var num_particles=this.numParticles;
	this.attribute={initPos:[],initAcc:[],endAcc:[],initVel:[],initColor:[],endColor:[],sizeAndOffset:[]};
	this.faces=[];
	for(var i=0; i<num_particles;i++){
		var position=this.positionFunction(i);
		var velocity=this.velocityFunction(i);
		var acceleration=this.accelerationFunction(i);
		var color=this.colorFunction(i);
		var size=this.sizeFunction(i);
		var lifetime=this.lifeTimeFunction(i);
		var offsetTime=Math.floor(Math.random()*lifetime);
		for(var y=-1;y<=1;y=y+2){
			for(var x=-1;x<=1;x=x+2){
				this.attribute.initPos.push(parseFloat(position[0])+x,parseFloat(position[1])+y,parseFloat(position[2]));
				this.attribute.initAcc.push(acceleration[0][0],acceleration[0][1],acceleration[0][2]);
				this.attribute.endAcc.push(acceleration[1][0],acceleration[1][1],acceleration[1][2]);
				this.attribute.initVel.push(velocity[0],velocity[1],velocity[2]);
				this.attribute.initColor.push(color[0][0],color[0][1],color[0][2],color[0][3]);
				this.attribute.endColor.push(color[1][0],color[1][1],color[1][2],color[1][3]);
				this.attribute.sizeAndOffset.push(size[0],size[1],offsetTime,lifetime);
			}
		}
	}
	
	//create the face buffer
	for(var i=0; i<num_particles;i=i+4){
		this.faces.push(0+i,1+i,2+i);
		this.faces.push(1+i,2+i,3+i);
	}
	this.facesGL=gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.facesGL);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.faces), gl.STATIC_DRAW);
	this.facesGL.num=this.faces.length;

	this.attribute.initPosGL=this.createBuffer(gl,this.attribute.initPos);
	this.attribute.initAccGL=this.createBuffer(gl,this.attribute.initAcc);
	this.attribute.endAccGL=this.createBuffer(gl,this.attribute.endAcc);
	this.attribute.initVelGL=this.createBuffer(gl,this.attribute.initVel);
	this.attribute.initColorGL=this.createBuffer(gl,this.attribute.initColor);
	this.attribute.endColorGL=this.createBuffer(gl,this.attribute.endColor);
	this.attribute.sizeAndOffsetGL=this.createBuffer(gl,this.attribute.sizeAndOffset);
}
/**
* Show the paricle system loop
* @param {boolean} value the lopping flag
*/
GLGE.ParticleSystem.prototype.setLoop=function(value){
	this.loop=value;
}
/**
* Resets the particle system
*/
GLGE.ParticleSystem.prototype.reset=function(){
	this.startTime=(new Date()).getTime();
}

/**
* Creates the particle system shader programs
* @private
*/
GLGE.ParticleSystem.prototype.generateProgram=function(gl){
	var vtxShader=[
	//attributes
	"attribute vec3 position;",
	"attribute vec3 initVel;",
	"attribute vec3 initAcc;",
	"attribute vec3 endAcc;",
	"attribute vec4 initColor;",
	"attribute vec4 endColor;",
	"attribute vec4 sizeTimeLife;",
	//uniforms
	"uniform float time;",
	"uniform bool loop;",
	"uniform mat4 mvMatrix;",
	"uniform mat4 pMatrix;",
	//varying
	"varying vec2 UV;",
	"varying vec4 color;",
	//main
	"void main(){",
	
	"UV = (position.xy+1.0)/2.0;",
	"if((time>sizeTimeLife[2] && (time-sizeTimeLife[2])<sizeTimeLife[3]) || loop){",
	"float localTime = mod((time - sizeTimeLife[2]), sizeTimeLife[3]);",
	"color = (endColor-initColor)/sizeTimeLife[3]*localTime+initColor;",
	"float size = (sizeTimeLife[1]-sizeTimeLife[0])/sizeTimeLife[3]*localTime+sizeTimeLife[0];",
	"vec3 pos = (endAcc-initAcc)*(localTime*log(localTime)-localTime)+0.5*initAcc*localTime*localTime+initVel*localTime;",
	"pos = (mvMatrix*vec4(pos,1.0)).xyz;",
	"vec3 positions = pos+(position*size);",
	"gl_Position = pMatrix*vec4(positions,1.0);",
	"}else{",
	"gl_Position = vec4(0.0,0.0,0.0,1.0);",
	"}",
	"}"
	].join("");
	frgShader=[
	"#ifdef GL_ES\nprecision highp float;\n#endif\n",
	//uniforms
	"uniform sampler2D texture;",
	//varying
	"varying vec2 UV;",
	"varying vec4 color;",
	//main
	"void main(){",
	"gl_FragColor=texture2D(texture,UV)*color;",
	"}"
	].join("");


	var vertexShader=gl.createShader(gl.VERTEX_SHADER);
	var fragmentShader=gl.createShader(gl.FRAGMENT_SHADER);

	gl.shaderSource(vertexShader, vtxShader);
	gl.compileShader(vertexShader);
	if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
	      GLGE.error(gl.getShaderInfoLog(vertexShader));
	      return;
	}

	gl.shaderSource(fragmentShader,frgShader);
	gl.compileShader(fragmentShader);
	if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
	      GLGE.error(gl.getShaderInfoLog(fragmentShader));
	      return;
	}

	if(this.program) gl.deleteProgram(this.Program);
	this.program = gl.createProgram();
	gl.attachShader(this.program, vertexShader);
	gl.attachShader(this.program, fragmentShader);
	gl.linkProgram(this.program);	
}
/**
* Creates the particle system buffers
* @private
*/
GLGE.ParticleSystem.prototype.createBuffer=function(gl,array){
	var buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(array), gl.STATIC_DRAW);
	return buffer;
}
/**
* Sets the uniforms
* @private
*/
GLGE.ParticleSystem.prototype.setUniforms=function(gl){
	var program=this.program;
	if(!program.glarrays) program.glarrays={};
	var cameraMatrix=gl.scene.camera.getViewMatrix();
	
	var pos=this.getPosition();
	//var camerapos=gl.scene.camera.getPosition();
	var mvMatrix=GLGE.mulMat4(cameraMatrix,[
		1,0,0,pos.x,
		0,1,0,pos.y,
		0,0,1,pos.z,
		0,0,0,1]);

		
	var mvUniform = GLGE.getUniformLocation(gl,program, "mvMatrix");

	if(!program.glarrays.mvMatrix) program.glarrays.mvMatrix=new Float32Array(mvMatrix);
		else GLGE.mat4gl(mvMatrix,program.glarrays.mvMatrix);
	gl.uniformMatrix4fv(mvUniform, true, program.glarrays.mvMatrix);

	var pUniform = GLGE.getUniformLocation(gl,program, "pMatrix");
	if(!program.glarrays.pMatrix) program.glarrays.pMatrix=new Float32Array(gl.scene.camera.getProjectionMatrix());
			else GLGE.mat4gl(gl.scene.camera.getProjectionMatrix(),program.glarrays.pMatrix);	
	gl.uniformMatrix4fv(pUniform, true, program.glarrays.pMatrix);

	gl.uniform1f(GLGE.getUniformLocation(gl,program, "time"), ((new Date()).getTime()-this.startTime));
	gl.uniform1i(GLGE.getUniformLocation(gl,program, "loop"), this.loop);
	
	
	gl.activeTexture(gl.TEXTURE0);
	//create the texture if it's not already created
	if(!this.glTexture) this.glTexture=gl.createTexture();
	//if the image is loaded then set in the texture data
	if(this.texture.state==1){
		gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,this.texture.image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.generateMipmap(gl.TEXTURE_2D);
		gl.bindTexture(gl.TEXTURE_2D, null);
		this.texture.state=2;
		program.texture=true;
	}
	gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
	if(program.texture){
		gl.uniform1i(GLGE.getUniformLocation(gl,program, "texture"), 0);
	}

}
/**
* Sets the particle image
* @param {string} url the image url
*/
GLGE.ParticleSystem.prototype.setImage=function(url){
	var texture=this.texture;
	texture.image=new Image();
	texture.image.onload=function(e){
		texture.state=1;
	}
	texture.image.src=url;
}
/**
* Sets the attributes
* @private
*/
GLGE.ParticleSystem.prototype.setAttributes=function(gl){
	for(var i=0; i<8; i++) gl.disableVertexAttribArray(i);
	
	var attrib=GLGE.getAttribLocation(gl,this.program, "position");
	if(attrib>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.attribute.initPosGL);
		gl.enableVertexAttribArray(attrib);
		gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
	}

	var attrib=GLGE.getAttribLocation(gl,this.program, "initAcc");
	if(attrib>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.attribute.initAccGL);
		gl.enableVertexAttribArray(attrib);
		gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
	}

	var attrib=GLGE.getAttribLocation(gl,this.program, "endAcc");
	if(attrib>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.attribute.endAccGL);
		gl.enableVertexAttribArray(attrib);
		gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
	}

	var attrib=GLGE.getAttribLocation(gl,this.program, "initColor");
	if(attrib>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.attribute.initColorGL);
		gl.enableVertexAttribArray(attrib);
		gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);
	}

	var attrib=GLGE.getAttribLocation(gl,this.program, "endColor");
	if(attrib>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.attribute.endColorGL);
		gl.enableVertexAttribArray(attrib);
		gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);
	}

	var attrib=GLGE.getAttribLocation(gl,this.program, "sizeTimeLife");
	if(attrib>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.attribute.sizeAndOffsetGL);
		gl.enableVertexAttribArray(attrib);
		gl.vertexAttribPointer(attrib, 4, gl.FLOAT, false, 0, 0);
	}
	
	var attrib=GLGE.getAttribLocation(gl,this.program, "initVel");
	if(attrib>-1){
		gl.bindBuffer(gl.ARRAY_BUFFER, this.attribute.initVelGL);
		gl.enableVertexAttribArray(attrib);
		gl.vertexAttribPointer(attrib, 3, gl.FLOAT, false, 0, 0);
	}
	
}

/**
* Renders the particle system
* @private
*/
GLGE.ParticleSystem.prototype.GLRender=function(gl){
	if(!this.attribute) this.generateParticles(gl);
	if(!this.program) this.generateProgram(gl);
	
	gl.program=this.program;
	
	gl.useProgram(this.program);
	this.setAttributes(gl);
	this.setUniforms(gl);
	gl.depthMask(false);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.facesGL);
	gl.drawElements(gl.TRIANGLES,this.facesGL.num, gl.UNSIGNED_SHORT, 0);
	gl.depthMask(true);

	
	gl.scene.lastMaterial=null;
}
/**
* @function Adds a particle system to the scene
* @param {GLGE.ParticleSystem} the particle system to add
*/
GLGE.Scene.prototype.addParticleSystem=GLGE.Scene.prototype.addGroup;
/**
* @function Adds a particle system to the group
* @param {GLGE.ParticleSystem} the particle system to add
*/
GLGE.Group.prototype.addParticleSystem=GLGE.Group.prototype.addGroup;

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_md2.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){

/**
 * @name GLGE.MD2#md2AnimFinished
 * @event fired when the the animation has finished
 * @param {object} data
 */

/**
* @class A quake MD2 model class
* @augments GLGE.Object
*/
GLGE.MD2=function(uid){
	this.MD2Started=+new Date;
	this.setAnimation(new GLGE.AnimationVector);
	GLGE.Object.call(this,uid);
}
GLGE.augment(GLGE.Object,GLGE.MD2);
GLGE.MD2.prototype.loadingCache={};
GLGE.MD2.prototype.headersCache={};
GLGE.MD2.prototype.meshCache={};
GLGE.MD2.prototype.MD2Animations={};
GLGE.MD2.prototype.MD2StartFrame=0;
GLGE.MD2.prototype.MD2EndFrame=0;
GLGE.MD2.prototype.MD2Loop=true;
GLGE.MD2.prototype.MD2AnimFinished=false;

GLGE.MD2.prototype.headerNames=[
"ident",
"version",
"skinwidth",
"skinheight",
"framesize",
"num_skins",
"num_xyz",
"num_st",
"num_tris",
"num_glcmds",
"num_frames",
"ofs_skins",
"ofs_st",
"ofs_tris",
"ofs_frames",
"ofs_glcmds",
"ofs_end"];

GLGE.MD2.prototype.preNormals = [
  [-0.525731,  0.000000,  0.850651], [-0.442863,  0.238856,  0.864188], [-0.295242,  0.000000,  0.955423], 
  [-0.309017,  0.500000,  0.809017], [-0.162460,  0.262866,  0.951056], [ 0.000000,  0.000000,  1.000000], 
  [ 0.000000,  0.850651,  0.525731], [-0.147621,  0.716567,  0.681718], [ 0.147621,  0.716567,  0.681718], 
  [ 0.000000,  0.525731,  0.850651], [ 0.309017,  0.500000,  0.809017], [ 0.525731,  0.000000,  0.850651], 
  [ 0.295242,  0.000000,  0.955423], [ 0.442863,  0.238856,  0.864188], [ 0.162460,  0.262866,  0.951056], 
  [-0.681718,  0.147621,  0.716567], [-0.809017,  0.309017,  0.500000], [-0.587785,  0.425325,  0.688191], 
  [-0.850651,  0.525731,  0.000000], [-0.864188,  0.442863,  0.238856], [-0.716567,  0.681718,  0.147621], 
  [-0.688191,  0.587785,  0.425325], [-0.500000,  0.809017,  0.309017], [-0.238856,  0.864188,  0.442863], 
  [-0.425325,  0.688191,  0.587785], [-0.716567,  0.681718, -0.147621], [-0.500000,  0.809017, -0.309017], 
  [-0.525731,  0.850651,  0.000000], [ 0.000000,  0.850651, -0.525731], [-0.238856,  0.864188, -0.442863], 
  [ 0.000000,  0.955423, -0.295242], [-0.262866,  0.951056, -0.162460], [ 0.000000,  1.000000,  0.000000], 
  [ 0.000000,  0.955423,  0.295242], [-0.262866,  0.951056,  0.162460], [ 0.238856,  0.864188,  0.442863], 
  [ 0.262866,  0.951056,  0.162460], [ 0.500000,  0.809017,  0.309017], [ 0.238856,  0.864188, -0.442863], 
  [ 0.262866,  0.951056, -0.162460], [ 0.500000,  0.809017, -0.309017], [ 0.850651,  0.525731,  0.000000], 
  [ 0.716567,  0.681718,  0.147621], [ 0.716567,  0.681718, -0.147621], [ 0.525731,  0.850651,  0.000000], 
  [ 0.425325,  0.688191,  0.587785], [ 0.864188,  0.442863,  0.238856], [ 0.688191,  0.587785,  0.425325], 
  [ 0.809017,  0.309017,  0.500000], [ 0.681718,  0.147621,  0.716567], [ 0.587785,  0.425325,  0.688191], 
  [ 0.955423,  0.295242,  0.000000], [ 1.000000,  0.000000,  0.000000], [ 0.951056,  0.162460,  0.262866], 
  [ 0.850651, -0.525731,  0.000000], [ 0.955423, -0.295242,  0.000000], [ 0.864188, -0.442863,  0.238856], 
  [ 0.951056, -0.162460,  0.262866], [ 0.809017, -0.309017,  0.500000], [ 0.681718, -0.147621,  0.716567], 
  [ 0.850651,  0.000000,  0.525731], [ 0.864188,  0.442863, -0.238856], [ 0.809017,  0.309017, -0.500000], 
  [ 0.951056,  0.162460, -0.262866], [ 0.525731,  0.000000, -0.850651], [ 0.681718,  0.147621, -0.716567], 
  [ 0.681718, -0.147621, -0.716567], [ 0.850651,  0.000000, -0.525731], [ 0.809017, -0.309017, -0.500000], 
  [ 0.864188, -0.442863, -0.238856], [ 0.951056, -0.162460, -0.262866], [ 0.147621,  0.716567, -0.681718], 
  [ 0.309017,  0.500000, -0.809017], [ 0.425325,  0.688191, -0.587785], [ 0.442863,  0.238856, -0.864188],
  [ 0.587785,  0.425325, -0.688191], [ 0.688191,  0.587785, -0.425325], [-0.147621,  0.716567, -0.681718], 
  [-0.309017,  0.500000, -0.809017], [ 0.000000,  0.525731, -0.850651], [-0.525731,  0.000000, -0.850651], 
  [-0.442863,  0.238856, -0.864188], [-0.295242,  0.000000, -0.955423], [-0.162460,  0.262866, -0.951056], 
  [ 0.000000,  0.000000, -1.000000], [ 0.295242,  0.000000, -0.955423], [ 0.162460,  0.262866, -0.951056], 
  [-0.442863, -0.238856, -0.864188], [-0.309017, -0.500000, -0.809017], [-0.162460, -0.262866, -0.951056], 
  [ 0.000000, -0.850651, -0.525731], [-0.147621, -0.716567, -0.681718], [ 0.147621, -0.716567, -0.681718], 
  [ 0.000000, -0.525731, -0.850651], [ 0.309017, -0.500000, -0.809017], [ 0.442863, -0.238856, -0.864188], 
  [ 0.162460, -0.262866, -0.951056], [ 0.238856, -0.864188, -0.442863], [ 0.500000, -0.809017, -0.309017], 
  [ 0.425325, -0.688191, -0.587785], [ 0.716567, -0.681718, -0.147621], [ 0.688191, -0.587785, -0.425325], 
  [ 0.587785, -0.425325, -0.688191], [ 0.000000, -0.955423, -0.295242], [ 0.000000, -1.000000,  0.000000], 
  [ 0.262866, -0.951056, -0.162460], [ 0.000000, -0.850651,  0.525731], [ 0.000000, -0.955423,  0.295242], 
  [ 0.238856, -0.864188,  0.442863], [ 0.262866, -0.951056,  0.162460], [ 0.500000, -0.809017,  0.309017], 
  [ 0.716567, -0.681718,  0.147621], [ 0.525731, -0.850651,  0.000000], [-0.238856, -0.864188, -0.442863], 
  [-0.500000, -0.809017, -0.309017], [-0.262866, -0.951056, -0.162460], [-0.850651, -0.525731,  0.000000], 
  [-0.716567, -0.681718, -0.147621], [-0.716567, -0.681718,  0.147621], [-0.525731, -0.850651,  0.000000], 
  [-0.500000, -0.809017,  0.309017], [-0.238856, -0.864188,  0.442863], [-0.262866, -0.951056,  0.162460], 
  [-0.864188, -0.442863,  0.238856], [-0.809017, -0.309017,  0.500000], [-0.688191, -0.587785,  0.425325], 
  [-0.681718, -0.147621,  0.716567], [-0.442863, -0.238856,  0.864188], [-0.587785, -0.425325,  0.688191], 
  [-0.309017, -0.500000,  0.809017], [-0.147621, -0.716567,  0.681718], [-0.425325, -0.688191,  0.587785], 
  [-0.162460, -0.262866,  0.951056], [ 0.442863, -0.238856,  0.864188], [ 0.162460, -0.262866,  0.951056], 
  [ 0.309017, -0.500000,  0.809017], [ 0.147621, -0.716567,  0.681718], [ 0.000000, -0.525731,  0.850651], 
  [ 0.425325, -0.688191,  0.587785], [ 0.587785, -0.425325,  0.688191], [ 0.688191, -0.587785,  0.425325], 
  [-0.955423,  0.295242,  0.000000], [-0.951056,  0.162460,  0.262866], [-1.000000,  0.000000,  0.000000], 
  [-0.850651,  0.000000,  0.525731], [-0.955423, -0.295242,  0.000000], [-0.951056, -0.162460,  0.262866], 
  [-0.864188,  0.442863, -0.238856], [-0.951056,  0.162460, -0.262866], [-0.809017,  0.309017, -0.500000], 
  [-0.864188, -0.442863, -0.238856], [-0.951056, -0.162460, -0.262866], [-0.809017, -0.309017, -0.500000], 
  [-0.681718,  0.147621, -0.716567], [-0.681718, -0.147621, -0.716567], [-0.850651,  0.000000, -0.525731], 
  [-0.688191,  0.587785, -0.425325], [-0.587785,  0.425325, -0.688191], [-0.425325,  0.688191, -0.587785], 
  [-0.425325, -0.688191, -0.587785], [-0.587785, -0.425325, -0.688191], [-0.688191, -0.587785, -0.425325]
];

GLGE.MD2.prototype.MD2FrameRate=6;

/**
* Gets the absolute path given an import path and the path it's relative to
* @param {string} path the path to get the absolute path for
* @param {string} relativeto the path the supplied path is relativeto
* @returns {string} absolute path
* @private
*/
GLGE.MD2.prototype.getAbsolutePath=function(path,relativeto){
	if(path.substr(0,7)=="http://" || path.substr(0,7)=="file://"  || path.substr(0,7)=="https://"){
		return path;
	}
	else
	{
		if(!relativeto){
			relativeto=window.location.href;
		}
		if (relativeto.indexOf("://")==-1){
			return relativeto.slice(0,relativeto.lastIndexOf("/"))+"/"+path;
		}
		//find the path compoents
		var bits=relativeto.split("/");
		var domain=bits[2];
		var proto=bits[0];
		var initpath=[];
		for(var i=3;i<bits.length-1;i++){
			initpath.push(bits[i]);
		}
		//relative to domain
		if(path.substr(0,1)=="/"){
			initpath=[];
		}
		var locpath=path.split("/");
		for(var i=0;i<locpath.length;i++){
			if(locpath[i]=="..") initpath.pop();
				else if(locpath[i]!="") initpath.push(locpath[i]);
		}
		return proto+"//"+domain+"/"+initpath.join("/");
	}
}

/**
* Sets the MD2 framerate
* @param {string} framerate the MD2 files framerate
*/
GLGE.MD2.prototype.setMD2FrameRate=function(framerate){
	this.MD2FrameRate=framerate;
	return this;
}

/**
* Should GLGE Generate the tangents for the model
* @param {boolean} value tflag inidcating auto generation of tangents
*/
GLGE.MD2.prototype.setAutoTangents=function(value){
	this.doTangents=value;
	return this;
}

/**
* Sets the MD2 animation
* @param {string} framerate the MD2 files framerate
*/
GLGE.MD2.prototype.setMD2Animation=function(anim,loop){
	this.MD2Anim=anim;
	this.MD2AnimFinished=false;
	if(loop!=undefined) this.MD2Loop=loop;
	this.MD2Started=+new Date;
	if(this.MD2Animations[this.url] && this.MD2Animations[this.url][anim]){
		this.MD2LastAnimFrame=this.lastMD2Frame;
		var a=this.MD2Animations[this.url][anim];
		this.MD2StartFrame=a[0];
		this.MD2EndFrame=a[1];
	}
	return this;
}

/**
* Gets a list of availalbe animations
* @returns {array} array
*/
GLGE.MD2.prototype.getAnimations=function(){
	var animations=[];
	for(var name in this.MD2Animations[this.url]) animations.push(name);
	return animations;
}

/**
* Sets the MD2 frame number
* @param {string} frame the frame to display
*/
GLGE.MD2.prototype.setMD2Frame=function(frame){
	var totalframes=this.MD2EndFrame-this.MD2StartFrame+1;
	if(totalframes==1) return;
	if(this.MD2Loop){
		frame=frame%totalframes;
		var frame2=((Math.floor(frame)+1)%totalframes);
	}else{
		frame=Math.min(totalframes-1,frame);
		frame2=Math.min(totalframes-1,Math.floor(frame)+1);
		if(frame==(totalframes-1) && !this.MD2AnimFinished){
			this.MD2AnimFinished=true;
			this.fireEvent("md2AnimFinished",{});
		}
	}
	var framefrac=frame%1;
	if(frame<1 && this.MD2LastAnimFrame!=undefined){
		frame=this.MD2LastAnimFrame-this.MD2StartFrame;
	}else{
		this.MD2LastAnimFrame=null;
		this.lastMD2Frame=Math.floor(frame)+this.MD2StartFrame;
	}
	this.setMeshFrame1(Math.floor(frame)+this.MD2StartFrame);
	this.setMeshFrame2(frame2+this.MD2StartFrame);
	this.setMeshBlendFactor(framefrac);
}

GLGE.MD2.prototype.animate=function(now,nocache){
	if(!now) now=+new Date;
	if(this.header){
		var frame=(now-this.MD2Started)/1000*this.MD2FrameRate;
		this.setMD2Frame(frame);
	}
	GLGE.Object.prototype.animate.call(this,now,nocache);
}

/**
* Sets the url of the MD2 model
* @param {string} url the url to the MD2 file
*/
GLGE.MD2.prototype.setSrc=function(url,relativeTo){
	if(relativeTo) url=this.getAbsolutePath(url,relativeTo);
	this.url=url;
	
	//prevent the same model parsing multiple times
	if(this.loadingCache[this.url] && !this.headersCache[url]){
		var that=this;
		setTimeout(function(){that.setSrc(url)},15);
		return;
	}
	
	this.loadingCache[this.url]=true;
	if(this.headersCache[url]){
		this.header=this.headersCache[url];
		this.setMesh(this.meshCache[url]);
		if(this.MD2Anim) this.setMD2Animation(this.MD2Anim);
		this.fireEvent("loaded",{url:this.url});
		return;
	}
	
	var that=this;
	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType('text/plain; charset=x-user-defined');
	xhr.open("GET", url, true);
	xhr.send(null);
	this.verts=[];
	this.normals=[];
	
	xhr.onreadystatechange = function (aEvt) {
		if (xhr.readyState == 4) {
			if(xhr.status == 200 || xhr.status == 0){
				response = xhr.responseText;
				if (response) {
					var buffer = new ArrayBuffer(response.length);
					var byteArray = new Uint8Array(buffer);
					var byteArray = [];
					for(var i=0;i<response.length;i++){
						byteArray[i]=response.charCodeAt(i) & 0xff;
					}
					that.bufferLoaded(byteArray);
				}
			}else{
				alert("Error loading page\n");
			}
		}
	};
}

/**
* Called when the model has loaded
* @private
*/
GLGE.MD2.prototype.bufferLoaded=function(byteArray){
	this.byteArray=byteArray;
	this.parseHeader();
	this.parseFrames();
	this.parseUVs();
	this.parseFaces();
	if(this.MD2Anim) this.setMD2Animation(this.MD2Anim,this.MD2Loop);
}

/**
* Extract header info
* @private
*/
GLGE.MD2.prototype.parseHeader=function(){
	this.header={};
	for (var i=0; i<this.headerNames.length; i++) {
		this.header[this.headerNames[i]]=this.getUint16At(i*4);
	}
	this.headersCache[this.url]=this.header;
}
/**
* get 16 bit int at location
* @private
*/
GLGE.MD2.prototype.getUint16At=function(index){
	return this.byteArray[index]+this.byteArray[index+1]*256;
}
/**
* get 32 bit float at location
* @private
*/
GLGE.MD2.prototype.getFloat32At=function(index){
	var b3=this.byteArray[index];
	var b2=this.byteArray[index+1];
	var b1=this.byteArray[index+2];
	var b0=this.byteArray[index+3];
	sign = 1 - (2 * (b0 >> 7)),
	exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127,
	mantissa = ((b1 & 0x7f) << 16) | (b2 << 8) | b3;

	if (mantissa == 0 && exponent == -127) {
		return 0.0;
	}

	if (exponent == -127) { // Denormalized
		return sign * mantissa * Math.pow(2, -126 - 23);
	}

	return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
}
/**
* process the frame data
* @private
*/
GLGE.MD2.prototype.parseFrames=function(){
	
	var vertsArray = this.byteArray;
	var startFrame=0;
	var MD2Animations={};
	for(var j=0;j<this.header.num_frames;j++){
		var scaleTrans=[
			this.getFloat32At(this.header.ofs_frames+j*this.header.framesize),
			this.getFloat32At(this.header.ofs_frames+4+j*this.header.framesize),
			this.getFloat32At(this.header.ofs_frames+8+j*this.header.framesize),
			this.getFloat32At(this.header.ofs_frames+12+j*this.header.framesize),
			this.getFloat32At(this.header.ofs_frames+16+j*this.header.framesize),
			this.getFloat32At(this.header.ofs_frames+20+j*this.header.framesize)
		];	
		var verts=[];
		var normals=[];
		var start=this.header.ofs_frames+24+j*this.header.framesize;
		var frameName="";
		for(var i=start;i<start+16;i++){
			if(vertsArray[i]==0) break;
			frameName+=String.fromCharCode(vertsArray[i]);
		}
		frameName=frameName.replace(/[0-9]/g,'');
		if(lastFrameName && frameName!=lastFrameName){
			MD2Animations[lastFrameName]=[startFrame,j-1];
			startFrame=j;
		}
		var lastFrameName=frameName;
		start=this.header.ofs_frames+40+j*this.header.framesize;
		for(var i=start;i<start+this.header.framesize-40;i=i+12){
			verts.push(vertsArray[i]*scaleTrans[0]+scaleTrans[3]);
			verts.push(vertsArray[i+1]*scaleTrans[1]+scaleTrans[4]);
			verts.push(vertsArray[i+2]*scaleTrans[2]+scaleTrans[5]);
			verts.push(vertsArray[i+4]*scaleTrans[0]+scaleTrans[3]);
			verts.push(vertsArray[i+5]*scaleTrans[1]+scaleTrans[4]);
			verts.push(vertsArray[i+6]*scaleTrans[2]+scaleTrans[5]);
			verts.push(vertsArray[i+8]*scaleTrans[0]+scaleTrans[3]);
			verts.push(vertsArray[i+9]*scaleTrans[1]+scaleTrans[4]);
			verts.push(vertsArray[i+10]*scaleTrans[2]+scaleTrans[5]);
			var n=this.preNormals[vertsArray[i+3]];
			if(!n) n=[0,0,1]; //sanity check
			normals.push(n[0]);normals.push(n[1]);normals.push(n[2]);
			n=this.preNormals[vertsArray[i+7]];
			if(!n) n=[0,0,1]; //sanity check
			normals.push(n[0]);normals.push(n[1]);normals.push(-n[2]);
			n=this.preNormals[vertsArray[i+11]];
			if(!n) n=[0,0,1]; //sanity check
			normals.push(n[0]);normals.push(n[1]);normals.push(n[2]);
		}
		this.verts[j]=verts;
		this.normals[j]=normals;
	}
	MD2Animations[lastFrameName]=[startFrame,j-2];
	this.MD2Animations[this.url]=MD2Animations;
}
/**
* Process the UV data
* @private
*/
GLGE.MD2.prototype.parseUVs=function(){
	var uvs=[];
	var byteArray=this.byteArray;
	var start=this.header.ofs_st;
	for(var i=start;i<start+this.header.num_st*4;i=i+4){
		uvs.push(this.getUint16At(i)/this.header.skinwidth);
		uvs.push(1-this.getUint16At(i+2)/this.header.skinheight);
	}
	this.globaluvs=uvs;
}
/**
* parses the face data in the md2 file
* @private
*/
GLGE.MD2.prototype.parseFaces=function(){
	var start=this.header.ofs_tris;
	var len=start+this.header.num_tris*12;
	var faces=[];
	var uvs=[];
	var verts=[];
	var normals=[];
	var idx=0;
	for(var i=start;i<len;i=i+12){
		faces.push(idx++);
		faces.push(idx++);
		faces.push(idx++);
		var n1=this.getUint16At(i);
		var n2=this.getUint16At(i+2);
		var	n3=this.getUint16At(i+4);
		for(var j=0;j<this.verts.length;j++){
			if(!verts[j]){verts[j]=[];normals[j]=[];}
			var v=this.verts[j];
			var n=this.normals[j];
			verts[j].push(v[n1*3]);
			verts[j].push(v[n1*3+1]);
			verts[j].push(v[n1*3+2]);
			normals[j].push(n[n1*3]);
			normals[j].push(n[n1*3+1]);
			normals[j].push(n[n1*3+2]);
			verts[j].push(v[n2*3]);
			verts[j].push(v[n2*3+1]);
			verts[j].push(v[n2*3+2]);
			normals[j].push(n[n2*3]);
			normals[j].push(n[n2*3+1]);
			normals[j].push(n[n2*3+2]);
			verts[j].push(v[n3*3]);
			verts[j].push(v[n3*3+1]);
			verts[j].push(v[n3*3+2]);
			normals[j].push(n[n3*3]);
			normals[j].push(n[n3*3+1]);
			normals[j].push(n[n3*3+2]);
		}
		uvs.push(this.globaluvs[this.getUint16At(i+6)*2]);
		uvs.push(this.globaluvs[this.getUint16At(i+6)*2+1]);
		uvs.push(this.globaluvs[this.getUint16At(i+8)*2]);
		uvs.push(this.globaluvs[this.getUint16At(i+8)*2+1]);
		uvs.push(this.globaluvs[this.getUint16At(i+10)*2]);
		uvs.push(this.globaluvs[this.getUint16At(i+10)*2+1]);
	}
	this.normals=normals;
	this.verts=verts;
	this.uvs=uvs;
	this.faces=faces;
	this.createMesh()
}

/**
* creates the mesh
* @private
*/
GLGE.MD2.prototype.createMesh=function(){
	var m=new GLGE.Mesh;
	var verts=this.verts;
	var normals=this.normals;
	var uvs=this.uvs;
	var faces=this.faces;
	for(var i=0;i<verts.length;i++){
		m.setPositions(verts[i],i).setNormals(normals[i],i);
	}
	if(this.doTangents){
		m.setUV(uvs).setFaces(faces);
	}else{
		m.setFaces(faces).setUV(uvs);
	}
	this.setMesh(m);
	this.meshCache[this.url]=m;
	this.fireEvent("loaded",{url:this.url});
}

GLGE.Group.prototype.addMD2=GLGE.Group.prototype.addObject;
GLGE.Scene.prototype.addMD2=GLGE.Scene.prototype.addObject;


})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_md3.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){

/**
 * @name GLGE.MD3#md3AnimFinished
 * @event fired when the the animation has finished
 * @param {object} data
 */

/**
* @class A quake MD3 model class
* @augments GLGE.Group
*/
GLGE.MD3=function(uid){
	this.MD3Started=+new Date;
	this.MD3Materials=[];
	this.surfaces=[];
	this.MD3Children=[];
	this.loaded=false;
	this.setAnimation(new GLGE.AnimationVector); //set animation to force animation
	GLGE.Group.call(this,uid);
}

GLGE.augment(GLGE.Group,GLGE.MD3);
GLGE.MD3.prototype.MD3FrameRate=10;
GLGE.MD3.prototype.MD3Animations={};
GLGE.MD3.prototype.MD3Tags={};
GLGE.MD3.prototype.MD3StartFrame=0;
GLGE.MD3.prototype.MD3EndFrame=0;
GLGE.MD3.prototype.MD3Loop=true;

GLGE.MD3.prototype.headerNames=[
"NUM_FRAMES",
"NUM_TAGS",
"NUM_SURFACES",
"NUM_SKINS",
"OFS_FRAMES",
"OFS_TAGS",
"OFS_SURFACES",
"OFS_EOF"
];

GLGE.MD3.prototype.surfaceHeaderNames=[
"NUM_FRAMES",
"NUM_SHADERS",
"NUM_VERTS",
"NUM_TRIANGLES",
"OFS_TRIANGLES",
"OFS_SHADERS",
"OFS_ST",
"OFS_XYZNORMAL",
"OFS_END"
]


/**
* Gets the absolute path given an import path and the path it's relative to
* @param {string} path the path to get the absolute path for
* @param {string} relativeto the path the supplied path is relativeto
* @returns {string} absolute path
* @private
*/
GLGE.MD3.prototype.getAbsolutePath=function(path,relativeto){
	if(path.substr(0,7)=="http://" || path.substr(0,7)=="file://"  || path.substr(0,7)=="https://"){
		return path;
	}
	else
	{
		if(!relativeto){
			relativeto=window.location.href;
		}
		if (relativeto.indexOf("://")==-1){
			return relativeto.slice(0,relativeto.lastIndexOf("/"))+"/"+path;
		}
		//find the path compoents
		var bits=relativeto.split("/");
		var domain=bits[2];
		var proto=bits[0];
		var initpath=[];
		for(var i=3;i<bits.length-1;i++){
			initpath.push(bits[i]);
		}
		//relative to domain
		if(path.substr(0,1)=="/"){
			initpath=[];
		}
		var locpath=path.split("/");
		for(var i=0;i<locpath.length;i++){
			if(locpath[i]=="..") initpath.pop();
				else if(locpath[i]!="") initpath.push(locpath[i]);
		}
		return proto+"//"+domain+"/"+initpath.join("/");
	}
}


/**
* Sets the url of the MD3 model
* @param {string} url the url to the MD3 file
*/
GLGE.MD3.prototype.setSrc=function(url,relativeTo){
	if(relativeTo) url=this.getAbsolutePath(url,relativeTo);
	this.url=url;
	
	var that=this;
	var xhr = new XMLHttpRequest();
	xhr.overrideMimeType('text/plain; charset=x-user-defined');
	xhr.open("GET", url, true);
	xhr.send(null);
	this.verts=[];
	this.normals=[];
	
	xhr.onreadystatechange = function (aEvt) {
		if (xhr.readyState == 4) {
			if(xhr.status == 200 || xhr.status == 0){
				response = xhr.responseText;
				if (response) {
					var buffer = new ArrayBuffer(response.length);
					var byteArray = new Uint8Array(buffer);
					var byteArray = [];
					for(var i=0;i<response.length;i++){
						byteArray[i]=response.charCodeAt(i) & 0xff;
					}
					that.bufferLoaded(byteArray);
				}
			}else{
				alert("Error loading page\n");
			}
		}
	};
}


/**
* Sets the MD3 framerate
* @param {string} framerate the MD3 files framerate
*/
GLGE.MD3.prototype.setMD3FrameRate=function(framerate){
	this.MD3FrameRate=framerate;
	return this;
}

/**
* Sets the tag to attach the model to
* @param {string} tag The name of the tag to attach to.
*/
GLGE.MD3.prototype.setTag=function(tag){
	this.MD3Tag=tag;
	return this;
}


/**
* Called when the model has loaded
* @private
*/
GLGE.MD3.prototype.bufferLoaded=function(byteArray){
	this.byteArray=byteArray;
	this.parseHeader();
	this.parseFrames();
	this.parseTags();
	this.createTags();
	this.parseSurfaces();
	this.addSurfaces(); //adds the surfaces to this group
	if(this.MD3Anim) this.setMD3Animation(this.MD3Anim,this.MD3Loop);
	if(this.MD3Children.length>0) this.addMD3Childred();
	this.loaded=true;
	this.fireEvent("loaded",{url:this.url});
}
/**
* Adds the child md3 object
* @private
*/
GLGE.MD3.prototype.addMD3Childred=function(){
	for(var i=0; i<this.MD3Children.length;i++){
		this.addMD3(this.MD3Children[i]);
	}
}

/**
* Adds the surfaces to this group
* @private
*/
GLGE.MD3.prototype.addSurfaces=function(){

	for(var i=0;i<this.surfaces.length;i++){
		if(this.MD3Tag) {
			t=this.MD3Tags[this.url][this.MD3Tag];
			this.surfaces[i].setLocX(t[0][0]).setLocY(t[0][1]).setLocX(t[0][1]).setRotMatrix(t[1]);
		}
		this.addObject(this.surfaces[i]);
	}
	return this;
}

/**
* Gets a list of availalbe animations
* @returns {array} array
*/
GLGE.MD3.prototype.getAnimations=function(){
	var animations=[];
	for(var name in this.MD3Animations[this.url]) animations.push(name);
	return animations;
}

/**
* Sets the MD3 animation
* @param {string} framerate the MD3 files framerate
*/
GLGE.MD3.prototype.setMD3Animation=function(anim,loop){
	this.MD3Anim=anim;
	if(loop!=undefined) this.MD3Loop=loop;
	this.MD3Started=+new Date;
	if(this.MD3Animations[this.url] && this.MD3Animations[this.url][anim]){
		this.MD3LastAnimFrame=this.lastMD2Frame;
		var a=this.MD3Animations[this.url][anim];
		this.MD3StartFrame=a[0];
		this.MD3EndFrame=a[1];
	}
	return this;
}


/**
* Creates the tag groups
* @private
*/
GLGE.MD3.prototype.createTags=function(){
	var tags=this.MD3Tags[this.url];
	this.MD3TagGroups={};
	for(var tag in tags){
		var t=tags[tag];
		var g=(new GLGE.Group).setLocX(t[0][0]).setLocY(t[0][1]).setLocX(t[0][1]).setRotMatrix(t[1]);
		this.addGroup(g);
		this.MD3TagGroups[tag]=g;
	}
	
}

/**
* Extract tag info
* @private
*/
GLGE.MD3.prototype.parseTags=function(){
		//alert(this.url);
	var start=this.headers.OFS_TAGS;
	var tagSize=112;
	var data=this.MD3Tags[this.url]={};
	for(var i=0;i<this.headers.NUM_TAGS;i++){
		var name=this.getStringAt(start+i*tagSize,64).replace(/[0-9_]/g,'');
		var posStart=start+i*tagSize+64
		var pos=[this.getFloat32At(posStart)*10,this.getFloat32At(posStart+4)*10,this.getFloat32At(posStart+8)*10];
		var rotStart=posStart+12;
		var rot=[this.getFloat32At(rotStart),this.getFloat32At(rotStart+4),this.getFloat32At(rotStart+8),0,
			this.getFloat32At(rotStart+12),this.getFloat32At(rotStart+16),this.getFloat32At(rotStart+20),0,
			this.getFloat32At(rotStart+24),this.getFloat32At(rotStart+28),this.getFloat32At(rotStart+32),0,
			0,0,0,1];
		/*var rot=[this.getFloat32At(rotStart),this.getFloat32At(rotStart+12),this.getFloat32At(rotStart+24),0,
			this.getFloat32At(rotStart+4),this.getFloat32At(rotStart+16),this.getFloat32At(rotStart+28),0,
			this.getFloat32At(rotStart+8),this.getFloat32At(rotStart+20),this.getFloat32At(rotStart+32),0,
			0,0,0,1];*/
		data[name]=[pos,rot];
		//alert(name);
		//alert(pos);
	}
	
}

/**
* Extract frame info
* @private
*/
GLGE.MD3.prototype.parseFrames=function(){
	var start=this.headers.OFS_FRAMES+40;
	var frameSize=56;
	var animations={};
	var lastName=false;
	var firstFrame=0;
	for(var i=0;i<this.headers.NUM_FRAMES;i++){
		var name=this.getStringAt(start+i*frameSize,16).replace(/[0-9_]/g,'');
		if(lastName && lastName!=name){
			animations[lastName]=[firstFrame,i-1];
			firstFrame=i;
		}
		lastName=name;
	}
	animations[lastName]=[firstFrame,i-3];

	this.MD3Animations[this.url]=animations;
}
/**
* Extract header info
* @private
*/
GLGE.MD3.prototype.parseHeader=function(){
	this.headers={};
	for (var i=0; i<this.headerNames.length; i++) {
		this.headers[this.headerNames[i]]=this.getSint32At(i*4+76);
	}
}
/**
* Parse the surfaces 
* @private
*/
GLGE.MD3.prototype.parseSurfaces=function(){
	this.surfaceHeaders=[];
	var offset=this.headers.OFS_SURFACES;
	for(var i=0;i<this.headers.NUM_SURFACES;i++){
		var start=offset+72;
		var sHeaders=this.surfaceHeaders[i]={offset:offset};
		var idx=0;
		for(var j=start;j<start+36;j=j+4){
			sHeaders[this.surfaceHeaderNames[idx++]]=this.getSint32At(j);
		}
		var normverts=this.parseNormVerts(i);
		var uvs=this.parseUVs(i);
		var faces=this.parseFaces(i);
		var mesh=this.createMesh(normverts[0],normverts[1],uvs,faces);
		var surface=new GLGE.Object;
		if(!this.MD3Materials[i]) this.MD3Materials[i]=new GLGE.Material;
		surface.setMaterial(this.MD3Materials[i]);
		surface.setMesh(mesh);
		this.surfaces.push(surface);
		offset+=this.surfaceHeaders[i].OFS_END;
	}
}

/**
* Creates a mesh
* @private
*/
GLGE.MD3.prototype.createMesh=function(verts,normals,uvs,faces){
	var m=new GLGE.Mesh;
	for(var i=0;i<verts.length;i++){
		m.setPositions(verts[i],i).setNormals(normals[i],i);
	}
	m.setFaces(faces).setUV(uvs);
	return m;	
}

/**
* Parse the Faces
* @private
*/
GLGE.MD3.prototype.parseFaces=function(surface){
	var header=this.surfaceHeaders[surface];
	var faces=[];
	var start=header.offset+header.OFS_TRIANGLES;
	var end=12*header.NUM_TRIANGLES;
	for(var i=start; i<start+end;i=i+12){
		faces.push(this.getSint32At(i));
		faces.push(this.getSint32At(i+4));
		faces.push(this.getSint32At(i+8));
	}
	return faces;
}
/**
* Parse the vertex UVs
* @private
*/
GLGE.MD3.prototype.parseUVs=function(surface){
	var header=this.surfaceHeaders[surface];
	var uvs=[];
	var start=header.offset+header.OFS_ST;
	var end=8*header.NUM_VERTS;
	for(var i=start; i<start+end;i=i+8){
		uvs.push(this.getFloat32At(i));
		uvs.push(1-this.getFloat32At(i+4));
	}
	return uvs;
}
/**
* Parse the verts for each frame
* @private
*/
GLGE.MD3.prototype.parseNormVerts=function(surface){
	var header=this.surfaceHeaders[surface];
	var verts=[];
	var normals=[];
	var start=header.offset+header.OFS_XYZNORMAL;
	var frameSize=8*header.NUM_VERTS;
	for(var frame=0; frame<header.NUM_FRAMES; frame++){
		var frameVerts=[];
		var frameNormals=[];
		for(var i=start+frame*frameSize; i<start+(frame+1)*frameSize;i=i+8){
			frameVerts.push(this.getSint16At(i)/64);
			frameVerts.push(this.getSint16At(i+2)/64);
			frameVerts.push(this.getSint16At(i+4)/64);
			var norm=this.decodeNormal(this.byteArray[i+6],this.byteArray[i+7]);
			frameNormals.push(norm[0]);
			frameNormals.push(norm[1]);
			frameNormals.push(norm[2]);
		}
		verts[frame]=frameVerts;
		normals[frame]=frameNormals;
	}
	return [verts,normals];
}

/**
* Decode the normal coords
* @private
*/
GLGE.MD3.prototype.decodeNormal=function(zenith,azimuth){
	var lat = zenith * (2 * Math.PI) / 255;
	var lng = azimuth * (2 * Math.PI) / 255;
	var clat=Math.cos(lat);
	var slat=Math.sin(lat);
	var clng=Math.cos(lng);
	var slng=Math.sin(lng);
	return [-clat*slng,-slat*slng,clng];
}

/**
* Gets the attach points(tags) availalbe
* @returns Array of availalbe attach points
*/
GLGE.MD3.prototype.getAttachPoints=function(){
	var attachPoints=[];
	for(var tag in this.MD3TagGroups) attachPoints.push(tag);
	return attachPoints
}

/**
* get 16 bit int at location
* @private
*/
GLGE.MD3.prototype.getSint16At=function(index){
	var value=this.byteArray[index]|(this.byteArray[index+1]<<8);
	if(value>0x8000) value=value-0x10000;
	return value;
}
/**
* get 32 bit signed int at location
* @private
*/
GLGE.MD3.prototype.getSint32At=function(index){
	var value=this.byteArray[index]|(this.byteArray[index+1]<<8)|(this.byteArray[index+2]<<16)|(this.byteArray[index+3]<<24);
	if(value>0x80000000) value=value-0x100000000;
	return value;
}

/**
* Get 32 bit float at location
* @private
*/
GLGE.MD3.prototype.getFloat32At=function(index){
	var b3=this.byteArray[index];
	var b2=this.byteArray[index+1];
	var b1=this.byteArray[index+2];
	var b0=this.byteArray[index+3];
	sign = 1 - (2 * (b0 >> 7)),
	exponent = (((b0 << 1) & 0xff) | (b1 >> 7)) - 127,
	mantissa = ((b1 & 0x7f) << 16) | (b2 << 8) | b3;

	if (mantissa == 0 && exponent == -127) {
		return 0.0;
	}

	if (exponent == -127) { // Denormalized
		return sign * mantissa * Math.pow(2, -126 - 23);
	}

	return sign * (1 + mantissa * Math.pow(2, -23)) * Math.pow(2, exponent);
}

/**
* Get 32 bit float at location
* @private
*/
GLGE.MD3.prototype.getStringAt=function(index,size){
	var name="";
	for(var i=index;i<index+size;i++){
		if(this.byteArray[i]==0) break;
		name+=String.fromCharCode(this.byteArray[i]);
	}
	return name;
}

/**
* Adds an MD3 model as a child of this MD3 Group
* @param {GLGE.MD3} md3 the md3 group to attach
*/
GLGE.MD3.prototype.addMD3=function(md3){
	if(!this.loaded){
		this.addEventListener("loaded",function(){
			this.addMD3(md3);
		});
		return;
	}
	if(this.MD3TagGroups){
		var attach=md3.MD3Tag;
		if(attach && this.MD3TagGroups[attach]){
			this.MD3TagGroups[attach].addGroup(md3);
		}else{
			this.addGroup(md3);
		}
	}else{
		this.MD3Children.push(md3);
	}
	return this;
}

/**
* sets the attach tag for this md3 model
* @param {String} tag the tag to attach to
*/
GLGE.MD3.prototype.setMD3Tag=function(tag){
	this.MD3Tag=tag;
	return this;
}



/**
* Sets the MD3 frame number
* @param {string} frame the frame to display
*/
GLGE.MD3.prototype.setMD3Frame=function(frame){
	var totalframes=this.MD3EndFrame-this.MD3StartFrame;
	if(totalframes==0) return;
	if(this.MD3Loop){
		frame=frame%totalframes;
		var frame2=((Math.floor(frame)+1)%totalframes);
	}else{
		frame=Math.min(totalframes,frame);
		frame2=Math.min(totalframes,Math.floor(frame)+1);
		if(frame==totalframes){
			this.fireEvent("md3AnimFinished",{});
		}
	}
	var framefrac=frame%1;
	if(frame<1 && this.MD3LastAnimFrame){
		frame=this.MD3LastAnimFrame-this.MD3StartFrame;
	}else{
		this.MD3LastAnimFrame=null;
		this.lastMD3Frame=Math.floor(frame)+this.MD3StartFrame;
	}
	for(var i=0;i<this.surfaces.length;i++){
		this.surfaces[i].setMeshFrame1(Math.floor(frame)+this.MD3StartFrame);
		this.surfaces[i].setMeshFrame2(frame2+this.MD3StartFrame);
		this.surfaces[i].setMeshBlendFactor(framefrac);
	}
}

GLGE.MD3.prototype.animate=function(now,nocache){
	if(!now) now=+new Date;
	if(this.headers){
		var frame=(now-this.MD3Started)/1000*this.MD3FrameRate;
		this.setMD3Frame(frame);
	}
	GLGE.Object.prototype.animate.call(this,now,nocache);
}
/**
* Sets the Material to use
* @param {GLGE.Material} material the material to use
* @param {number} surface the surface to attach the material to
*/
GLGE.MD3.prototype.setMaterial=function(material,surface){
	if(!surface) surface=0;
	this.MD3Materials[surface]=material;
	if(this.surfaces[surface]) this.surfaces[surface].setMaterial(material);
}

var matfunc=function(idx){
	return function(material){
		this.setMaterial(material,idx);
	}
}
for(var i=1;i<32;i++){
	GLGE.MD3.prototype["setMaterial"+i]=matfunc(i);
}

GLGE.Group.prototype.addMD3=GLGE.Group.prototype.addGroup;
GLGE.Scene.prototype.addMD3=GLGE.Scene.prototype.addGroup;


})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_filter2d.js
 * @author me@paulbrunt.co.uk
 */
 
 if(!window["GLGE"]){
	window["GLGE"]={};
}

(function(GLGE){


GLGE.FILTER_POST=0;
GLGE.FILTER_SKY=1;

GLGE.Filter2d=function(uid){
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.QuickNotation,GLGE.Filter2d);
GLGE.Filter2d.prototype.renderDepth=false;
GLGE.Filter2d.prototype.renderNormal=false;
GLGE.Filter2d.prototype.renderEmit=false;
GLGE.Filter2d.prototype.persist=false;
GLGE.Filter2d.prototype.passes=null;
GLGE.Filter2d.prototype.textures=null;
GLGE.Filter2d.prototype.uniforms=null;
GLGE.Filter2d.prototype.buffers=null;
GLGE.Filter2d.prototype.filterType=GLGE.FILTER_POST;
GLGE.Filter2d.prototype.depthBufferWidth=null;
GLGE.Filter2d.prototype.depthBufferHeight=null;
GLGE.Filter2d.prototype.emitBufferWidth=null;
GLGE.Filter2d.prototype.emitBufferHeight=null;
GLGE.Filter2d.prototype.normalBufferWidth=null;
GLGE.Filter2d.prototype.normalBufferHeight=null;


GLGE.Filter2d.prototype.setFilterType=function(filterType){
	this.filterType=filterType;
	return this;
}
GLGE.Filter2d.prototype.getFilterType=function(){
	return this.filterType;
}

GLGE.Filter2d.prototype.addTexture=function(texture){
	if(!this.textures) this.textures=[];
	this.textures.push(texture);
}
GLGE.Filter2d.prototype.removeTexture=function(texture){
	var idx=this.textures.indexOf(texture);
	if(idx>-1) this.textures.splice(idx,1);
}

GLGE.Filter2d.prototype.createBuffer=function(gl,width,height){
	if(!width) width=gl.canvas.width;
	if(!height) height=gl.canvas.height;
	var frameBuffer = gl.createFramebuffer();
	var renderBuffer = gl.createRenderbuffer();
	var texture = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, texture);

	var tex = new Uint8Array(width*height*4);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, tex);
    
	gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
	gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
	
	gl.bindRenderbuffer(gl.RENDERBUFFER, null);
	gl.bindFramebuffer(gl.FRAMEBUFFER, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
	return [frameBuffer,renderBuffer,texture];
}

GLGE.Filter2d.prototype.getFrameBuffer=function(gl){
	if(!this.passes) return null;
	
	if(!this.gl) this.gl=gl;
	if(!this.buffers){
		this.buffers=this.createBuffer(gl);
	}
	return this.buffers[0];
}


GLGE.Filter2d.prototype.getEmitBuffer=function(gl){
    if(!this.passes) return null;
	
	if(!this.gl) this.gl=gl;
	if(!this.emitBuffers){
		this.emitBuffers=this.createBuffer(gl,this.getEmitBufferWidth(),this.getEmitBufferHeight());
	}
	return this.emitBuffers[0];
}

GLGE.Filter2d.prototype.setEmitBufferWidth=function(value){
	this.emitBufferWidth=value;
	this.emitBuffers=null;
}
GLGE.Filter2d.prototype.getEmitBufferWidth=function(){
	return (this.emitBufferWidth ? this.emitBufferWidth : this.gl.canvas.width);
}

GLGE.Filter2d.prototype.setEmitBufferHeight=function(value){
	this.emitBufferHeight=value;
	this.emitBuffers=null;
}
GLGE.Filter2d.prototype.getEmitBufferHeight=function(){
	return (this.emitBufferHeight ? this.emitBufferHeight : this.gl.canvas.height);
}

GLGE.Filter2d.prototype.getDepthBuffer=function(gl){
	if(!this.passes) return null;
	
	if(!this.gl) this.gl=gl;
	if(!this.depthBuffers){
		this.depthBuffers=this.createBuffer(gl,this.getDepthBufferWidth(),this.getDepthBufferHeight());
	}
	return this.depthBuffers[0];
}

GLGE.Filter2d.prototype.setDepthBufferWidth=function(value){
	this.depthBufferWidth=value;
	this.depthBuffers=null;
}
GLGE.Filter2d.prototype.getDepthBufferWidth=function(){
	return (this.depthBufferWidth ? this.depthBufferWidth : this.gl.canvas.width);
}

GLGE.Filter2d.prototype.setDepthBufferHeight=function(value){
	this.depthBufferHeight=value;
	this.depthBuffers=null;
}
GLGE.Filter2d.prototype.getDepthBufferHeight=function(){
	return (this.depthBufferHeight ? this.depthBufferHeight : this.gl.canvas.height);
}

GLGE.Filter2d.prototype.setNormalBufferWidth=function(value){
	this.normalBufferWidth=value;
	this.normalBuffers=null;
}
GLGE.Filter2d.prototype.getNormalBufferWidth=function(){
	return (this.normalBufferWidth ? this.normalBufferWidth : this.gl.canvas.width);
}

GLGE.Filter2d.prototype.setNormalBufferHeight=function(value){
	this.normalBufferHeight=value;
	this.normalBuffers=null;
}
GLGE.Filter2d.prototype.getNormalBufferHeight=function(){
	return (this.normalBufferHeight ? this.normalBufferHeight : this.gl.canvas.height);
}

GLGE.Filter2d.prototype.getNormalBuffer=function(gl){
	if(!this.gl) this.gl=gl;
	if(!this.normalBuffers){
		this.normalBuffers=this.createBuffer(gl,this.getNormalBufferWidth(),this.getNormalBufferHeight());
	}
	return this.normalBuffers[0];
}

GLGE.Filter2d.prototype.setUniform=function(type,name,value){
	if(!this.uniforms) this.uniforms={};
	this.uniforms[name]={type:type,value:value};
}
GLGE.Filter2d.prototype.getUniform=function(name){
	if(!this.uniforms) this.uniforms={};
	return this.uniforms[name].value
}
GLGE.Filter2d.prototype.getUniformType=function(name){
	if(!this.uniforms) this.uniforms={};
	return this.uniforms[name].type;
}

GLGE.Filter2d.prototype.addPassFile=function(url){
	var req = new XMLHttpRequest();
    var filter=this;
	if(req) {
		req.open("GET", url, false);
		req.send("");
		filter.addPass(req.responseText);
	}	
}

GLGE.Filter2d.prototype.addPass=function(GLSL,width,height){
	if(!this.passes) this.passes=[];
	this.passes.push({GLSL:GLSL,height:height,width:width});
}

/**
* Creates the preserve texture
* @private
*/
GLGE.Filter2d.prototype.createPersistTexture=function(gl){
    this.persistTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.persistTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width,gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
}


//does all passes and renders result to screen
GLGE.Filter2d.prototype.GLRender=function(gl,buffer){
	gl.disable(gl.BLEND);
	if(!buffer) buffer=null;
	if(this.passes){
		for(var i=0;i<this.passes.length;i++){
			//set the frame buffer here
			if(this.passes.length-1==i){
				gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
			}else{
				if(!this.passes[i].buffer) this.passes[i].buffer=this.createBuffer(gl,this.passes[i].width,this.passes[i].height);
				gl.bindFramebuffer(gl.FRAMEBUFFER, this.passes[i].buffer[0]);
			}
			var width=(this.passes[i].width ? this.passes[i].width : gl.canvas.width);
			var height=(this.passes[i].height ? this.passes[i].height : gl.canvas.height);
			gl.viewport(0,0,width,height);
			gl.clearDepth(1.0);
			gl.depthFunc(gl.LEQUAL);
			gl.clearColor(0, 0, 0, 0);
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
			
			if(!this.passes[i].program){
				this.passes[i].program=this.GLCreateShader(gl,this.passes[i].GLSL);
			}
			gl.useProgram(this.passes[i].program);
			gl.program=this.passes[i].program;
			
			for(var j=0; j<8; j++) gl.disableVertexAttribArray(j);
			attribslot=GLGE.getAttribLocation(gl,this.passes[i].program, "position");
			if(!this.posBuffer) this.createPlane(gl);

			gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
			gl.enableVertexAttribArray(attribslot);
			gl.vertexAttribPointer(attribslot, this.posBuffer.itemSize, gl.FLOAT, false, 0, 0);
			this.GLSetUniforms(gl,i);
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.GLfaces);
			gl.drawElements(gl.TRIANGLES, this.GLfaces.numItems, gl.UNSIGNED_SHORT, 0);
		}
		if(this.persist){
			if(!this.persistTexture) this.createPersistTexture(gl);
			gl.bindTexture(gl.TEXTURE_2D, this.persistTexture);
			gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 0, 0, gl.canvas.width, gl.canvas.height, 0);
		}
	}
}

GLGE.Filter2d.prototype.clearPersist=function(gl){
	if(!this.persistTexture) this.createPersistTexture(gl);
	gl.bindTexture(gl.TEXTURE_2D, this.persistTexture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.canvas.width,gl.canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
	gl.bindTexture(gl.TEXTURE_2D, null);
}

var glmat=new Float32Array(16);

GLGE.Filter2d.prototype.GLSetUniforms=function(gl,pass){
	if(this.filterType==GLGE.FILTER_SKY){
		var invViewProj=GLGE.transposeMat4(GLGE.mulMat4(GLGE.inverseMat4(gl.scene.camera.matrix),GLGE.inverseMat4(gl.scene.camera.pMatrix)));
		GLGE.mat4gl(invViewProj,glmat)
		GLGE.setUniformMatrix(gl,"Matrix4fv",GLGE.getUniformLocation(gl,this.passes[pass].program, "invViewProj"),false,glmat);
	}

	for(var key in this.uniforms){
		var uniform=this.uniforms[key];
		if(uniform.type=="Matrix4fv"){
			GLGE.setUniformMatrix(gl,"Matrix4fv",GLGE.getUniformLocation(gl,this.passes[pass].program, key),false,uniform.value);
		}else{
			GLGE.setUniform(gl,uniform.type,GLGE.getUniformLocation(gl,this.passes[pass].program, key),uniform.value);
		}
	}

	
	var tidx=0;
	
	if(this.buffers){
		if(pass==0){
			gl.activeTexture(gl["TEXTURE"+tidx]);
			gl.bindTexture(gl.TEXTURE_2D, this.buffers[2]);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		}
		GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.passes[pass].program, "GLGE_RENDER"), tidx);
		tidx++;
		
		if(this.persist){
			if(pass==0){
				gl.activeTexture(gl["TEXTURE"+tidx]);
				gl.bindTexture(gl.TEXTURE_2D, this.persistTexture);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.passes[pass].program, "GLGE_PERSIST"), tidx);
			tidx++;
		}
		
		if(this.renderDepth){
			if(pass==0){
				gl.activeTexture(gl["TEXTURE"+tidx]);
				gl.bindTexture(gl.TEXTURE_2D, this.depthBuffers[2]);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.passes[pass].program, "GLGE_DEPTH"), tidx);
			tidx++;
		}
	    
	      if(this.renderEmit){
			if(pass==0){
				gl.activeTexture(gl["TEXTURE"+tidx]);
				gl.bindTexture(gl.TEXTURE_2D, this.emitBuffers[2]);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.passes[pass].program, "GLGE_EMIT"), tidx);
			tidx++;
	      }
	    
		
		if(this.renderNormal){
			if(pass==0){
				gl.activeTexture(gl["TEXTURE"+tidx]);
				gl.bindTexture(gl.TEXTURE_2D, this.normalBuffers[2]);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.passes[pass].program, "GLGE_NORMAL"), tidx);
			tidx++;
		}
		
		
		for(var i=0;i<this.passes.length;i++){
			if(this.passes[i].buffer){
				gl.activeTexture(gl["TEXTURE"+tidx]);
				gl.bindTexture(gl.TEXTURE_2D, this.passes[i].buffer[2]);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			}
			GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.passes[pass].program, "GLGE_PASS"+i), tidx);
			tidx++;
		}
	}
	
	if(!this.textures) this.textures=[];
	for(var i=0; i<this.textures.length;i++){
		gl.activeTexture(gl["TEXTURE"+(i+tidx)]);
		this.textures[i].doTexture(gl,null);
		var name = "TEXTURE"+i
		if(this.textures[i].name) name=this.textures[i].name;
		GLGE.setUniform(gl,"1i",GLGE.getUniformLocation(gl,this.passes[pass].program, name), i+tidx);
	}
}

/**
* creates the screen aligned plane mesh
* @private
*/
GLGE.Filter2d.prototype.createPlane=function(gl){
	//create the vertex positions
	if(!this.posBuffer) this.posBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, this.posBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([1,1,0.5,-1,1,0.5,-1,-1,0.5,1,-1,0.5]), gl.STATIC_DRAW);
	this.posBuffer.itemSize = 3;
	this.posBuffer.numItems = 4;
	//create the faces
	if(!this.GLfaces) this.GLfaces = gl.createBuffer();
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.GLfaces);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0,1,2,2,3,0]), gl.STATIC_DRAW);
	this.GLfaces.itemSize = 1;
	this.GLfaces.numItems = 6;
}

/**
* Creates a shader program
* @private
*/
GLGE.Filter2d.prototype.GLCreateShader=function(gl,fragStr){
	//Vertex Shader
	var vertexStr=[];
	
	vertexStr.push("uniform mat4 invViewProj;\n");
	vertexStr.push("attribute vec3 position;\n");
	vertexStr.push("varying vec2 texCoord;\n");
	vertexStr.push("varying vec3 rayCoord;\n");
	
	vertexStr.push("void main(void){\n");
	vertexStr.push("vec4 near=invViewProj * vec4(position.xy,-1.0,1.0);\n");    
	vertexStr.push("near/=near.w;\n");    
	vertexStr.push("vec4 far=invViewProj * vec4(position.xy,1.0,1.0);\n");    
	vertexStr.push("far/=far.w;\n");    
	vertexStr.push("rayCoord=normalize(far.xyz-near.xyz);\n"); 
	vertexStr.push("texCoord=(position.xy+vec2(1.0,1.0))/2.0;\n");    
	vertexStr.push("gl_Position = vec4(position.xyz,1.0);\n");
	vertexStr.push("}\n");
	
	var GLVertexShader=GLGE.getGLShader(gl,gl.VERTEX_SHADER,vertexStr.join(""));
	var GLFragmentShader=GLGE.getGLShader(gl,gl.FRAGMENT_SHADER,fragStr);

	return GLGE.getGLProgram(gl,GLVertexShader,GLFragmentShader);
}

})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.
 
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.
 
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
 
 /**
 * @fileOverview
 * @name glge_filter_glow.js
 * @author me@paulbrunt.co.uk
 */
(function(GLGE){
 
/**
* @class Postprocessing glow filter
* @augments GLGE.Filter2d
*/
GLGE.FilterGlow=function(uid){
	this.setEmitBufferWidth(256);
	this.setEmitBufferHeight(256);
	GLGE.Assets.registerAsset(this,uid);
};
GLGE.augment(GLGE.Filter2d,GLGE.FilterGlow);
GLGE.FilterGlow.prototype.renderEmit=true;
GLGE.FilterGlow.prototype.blur=1.2;
GLGE.FilterGlow.prototype.intensity=3;
GLGE.FilterGlow.prototype.fxaacutoff=2;
GLGE.FilterGlow.prototype.fxaastartintensity=0;

GLGE.FilterGlow.prototype.setEmitBufferWidth=function(value){
	GLGE.Filter2d.prototype.setEmitBufferWidth.call(this,value);
	this.createPasses();
	return this;
}
GLGE.FilterGlow.prototype.setEmitBufferHeight=function(value){
	GLGE.Filter2d.prototype.setEmitBufferHeight.call(this,value);
	this.createPasses();
	return this;
}
GLGE.FilterGlow.prototype.setBlur=function(blur){
	this.blur=blur;
	this.createPasses();
	return this;
}
GLGE.FilterGlow.prototype.setIntensity=function(intensity){
	this.intensity=intensity;
	this.createPasses();
	return this;
}
GLGE.FilterGlow.prototype.setFXAA=function(value){
	this.useFXAA=value;
	this.createPasses();
	return this;
}
GLGE.FilterGlow.prototype.setFXAACutoff=function(value){
	this.fxaacutoff=value;
	this.createPasses();
	return this;
}
GLGE.FilterGlow.prototype.setFXAAStartIntensity=function(value){
	this.fxaastartintensity=value;
	this.createPasses();
	return this;
}
GLGE.FilterGlow.prototype.createPasses=function(){
	var pass1=[];
	pass1.push("precision highp float;");
	pass1.push("uniform sampler2D GLGE_EMIT;");
	pass1.push("varying vec2 texCoord;");
	pass1.push("float blurSize="+(1/this.emitBufferWidth*this.blur).toFixed(10)+";");
	pass1.push("float rand(vec2 co){;");
	pass1.push("return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);");
	pass1.push("}");
	pass1.push("void main(void){");
	pass1.push("vec4 color=vec4(0.0,0.0,0.0,0.0);");
	pass1.push("float rnd=1.0-rand(texCoord.xy)*4.0*blurSize;");
	pass1.push("color += texture2D(GLGE_EMIT, vec2(texCoord.x - 4.0*blurSize, texCoord.y)) * 0.05 * rnd;");
	pass1.push("color += texture2D(GLGE_EMIT, vec2(texCoord.x - 3.0*blurSize, texCoord.y)) * 0.09 * rnd;");
	pass1.push("color += texture2D(GLGE_EMIT, vec2(texCoord.x - 2.0*blurSize, texCoord.y)) * 0.12 * rnd;");
	pass1.push("color += texture2D(GLGE_EMIT, vec2(texCoord.x - blurSize, texCoord.y)) * 0.15 * rnd;");
	pass1.push("color += texture2D(GLGE_EMIT, vec2(texCoord.x, texCoord.y)) * 0.18 * rnd;");
	pass1.push("color += texture2D(GLGE_EMIT, vec2(texCoord.x + blurSize, texCoord.y)) * 0.15 * rnd;");
	pass1.push("color += texture2D(GLGE_EMIT, vec2(texCoord.x + 2.0*blurSize, texCoord.y)) * 0.12 * rnd;");
	pass1.push("color += texture2D(GLGE_EMIT, vec2(texCoord.x + 3.0*blurSize, texCoord.y)) * 0.09 * rnd;");
	pass1.push("color += texture2D(GLGE_EMIT, vec2(texCoord.x + 4.0*blurSize, texCoord.y)) * 0.05 * rnd;");
	pass1.push("gl_FragColor = vec4(color.rgb,1.0);");
	pass1.push("}");
	
	var pass2=[];
	pass2.push("precision highp float;");
	pass2.push("uniform sampler2D GLGE_PASS0;");
	pass2.push("uniform sampler2D GLGE_RENDER;");
	pass2.push("uniform sampler2D GLGE_EMIT;");
	pass2.push("varying vec2 texCoord;");
	pass2.push("float blurSize="+(1/this.emitBufferHeight*this.blur).toFixed(10)+";");
	pass2.push("float rand(vec2 co){;");
	pass2.push("return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);");
	pass2.push("}");
	pass2.push("void main(void){");
	pass2.push("vec4 color=vec4(0.0,0.0,0.0,0.0);");
	pass2.push("float rnd=1.0-rand(texCoord.xy)*4.0*blurSize;");
	pass2.push("color += texture2D(GLGE_PASS0, vec2(texCoord.x, texCoord.y - 4.0*blurSize)) * 0.05 * rnd;");
	pass2.push("color += texture2D(GLGE_PASS0, vec2(texCoord.x, texCoord.y - 3.0*blurSize)) * 0.09 * rnd;");
	pass2.push("color += texture2D(GLGE_PASS0, vec2(texCoord.x, texCoord.y - 2.0*blurSize)) * 0.12 * rnd;");
	pass2.push("color += texture2D(GLGE_PASS0, vec2(texCoord.x, texCoord.y - blurSize)) * 0.15 * rnd;");
	pass2.push("color += texture2D(GLGE_PASS0, vec2(texCoord.x, texCoord.y)) * 0.18 * rnd;");
	pass2.push("color += texture2D(GLGE_PASS0, vec2(texCoord.x, texCoord.y + blurSize)) * 0.15 * rnd;");
	pass2.push("color += texture2D(GLGE_PASS0, vec2(texCoord.x, texCoord.y + 2.0*blurSize)) * 0.12 * rnd;");
	pass2.push("color += texture2D(GLGE_PASS0, vec2(texCoord.x, texCoord.y + 3.0*blurSize)) * 0.09 * rnd;");
	pass2.push("color += texture2D(GLGE_PASS0, vec2(texCoord.x, texCoord.y + 4.0*blurSize)) * 0.05 * rnd;");
	pass2.push("gl_FragColor = vec4(color.rgb*"+(this.intensity.toFixed(5))+"+texture2D(GLGE_RENDER,texCoord).rgb,1.0);");
	pass2.push("}");
	
	
	this.passes=[];
	this.addPass(pass1.join(""));
	this.addPass(pass2.join(""));
	
	if(this.useFXAA){
		var pass3=[]
		pass3.push("precision highp float;");
		pass3.push("uniform sampler2D GLGE_PASS1;");
		pass3.push("varying vec2 texCoord;");
		pass3.push("vec2 inverse_buffer_size=vec2(1.0/1280.0,1.0/720.0);");
		pass3.push("#define FXAA_REDUCE_MIN   (1.0/128.0)");
		pass3.push("#define FXAA_REDUCE_MUL   (1.0/16.0)");
		pass3.push("#define FXAA_SPAN_MAX     8.0");
		pass3.push("void  main(){");
		pass3.push("	vec3 rgbNW = texture2D(GLGE_PASS1,  (gl_FragCoord.xy + vec2(-1.0,-1.0)) * inverse_buffer_size).xyz;");
		pass3.push("	vec3 rgbNE = texture2D(GLGE_PASS1,  (gl_FragCoord.xy + vec2(1.0,-1.0)) * inverse_buffer_size).xyz;");
		pass3.push("	vec3 rgbSW = texture2D(GLGE_PASS1,  (gl_FragCoord.xy + vec2(-1.0,1.0)) * inverse_buffer_size).xyz;");
		pass3.push("	vec3 rgbSE = texture2D(GLGE_PASS1,  (gl_FragCoord.xy + vec2(1.0,1.0)) * inverse_buffer_size).xyz;");
		pass3.push("	vec3 rgbM  = texture2D(GLGE_PASS1,  gl_FragCoord.xy  * inverse_buffer_size).xyz;");
		pass3.push("	vec3 luma = vec3(0.299, 0.587, 0.114);");
		pass3.push("	float lumaNW = dot(rgbNW, luma);");
		pass3.push("	float lumaNE = dot(rgbNE, luma);");
		pass3.push("	float lumaSW = dot(rgbSW, luma);");
		pass3.push("	float lumaSE = dot(rgbSE, luma);");
		pass3.push("	float lumaM  = dot(rgbM,  luma);");
		pass3.push("	float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));");
		pass3.push("	float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));");
			
		pass3.push("	vec2 dir;");
		pass3.push("	dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));");
		pass3.push("	dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));");
			
		pass3.push("	float dirReduce = max(");
		pass3.push("	(lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),");
		pass3.push("	FXAA_REDUCE_MIN);");
			
		pass3.push("	float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);");
		pass3.push("	dir = min(vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),");
		pass3.push("	max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),");
		pass3.push("	dir * rcpDirMin)) * inverse_buffer_size;");
			  
		pass3.push("	vec3 rgbA = 0.5 * (");
		pass3.push("	texture2D(GLGE_PASS1,   gl_FragCoord.xy  * inverse_buffer_size + dir * (1.0/3.0 - 0.5)).xyz +");
		pass3.push("	texture2D(GLGE_PASS1,   gl_FragCoord.xy  * inverse_buffer_size + dir * (2.0/3.0 - 0.5)).xyz);");
			
		pass3.push("	vec3 rgbB = rgbA * 0.5 + 0.25 * (");
		pass3.push("	texture2D(GLGE_PASS1,  gl_FragCoord.xy  * inverse_buffer_size + dir *  - 0.5).xyz +");
		pass3.push("	texture2D(GLGE_PASS1,  gl_FragCoord.xy  * inverse_buffer_size + dir * 0.5).xyz);");
		pass3.push("	float lumaB = dot(rgbB, luma);");
		pass3.push("	if((lumaB < lumaMin) || (lumaB > lumaMax)) gl_FragColor = vec4(rgbA,1.0);");
		pass3.push("	    else gl_FragColor = vec4(rgbB,1.0);");
		pass3.push("	if(length(rgbM)>"+this.fxaacutoff.toFixed(2)+") gl_FragColor = vec4(rgbM,1.0);");
		pass3.push("	if(length(rgbM)<"+this.fxaastartintensity.toFixed(2)+") gl_FragColor = vec4(rgbM,1.0);");
		pass3.push("}");
		this.addPass(pass3.join("\n"));
	}
	
}



})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.
 
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.
 
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
 
 /**
 * @fileOverview
 * @name glge_filter_ao.js
 * @author me@paulbrunt.co.uk
 */
(function(GLGE){
 
/**
* @class Postprocessing Ambient Occlusion filter
* @augments GLGE.Filter2d
*/
GLGE.FilterAO=function(){
	this.setUniform("1f","cavitygamma",1/3);
	this.setUniform("1f","whiteMul",2);
	this.setUniform("1f","aogamma",1/3);
	this.setUniform("1f","maxDist",0.025);
	this.passes=[];
};
GLGE.augment(GLGE.Filter2d,GLGE.FilterAO);
GLGE.FilterAO.prototype.renderNormal=true;
GLGE.FilterAO.prototype.quality=1;
GLGE.FilterAO.prototype.range=80;
GLGE.FilterAO.prototype.samples=16;
GLGE.FilterAO.prototype.useRender=true;

GLGE.FilterAO.prototype.getNormalBufferHeight=function(){
	return (this.normalBufferHeight ? this.normalBufferHeight : (this.gl.canvas.height*this.quality|0));
}

GLGE.FilterAO.prototype.getNormalBufferWidth=function(){
	return (this.normalBufferWidth ? this.normalBufferWidth : (this.gl.canvas.width*this.quality|0));
}

GLGE.FilterAO.prototype.setUseRender=function(value){
	this.useRender=value;
	this.normalBuffers=null;
	this.passes=[];
	return this;
}

GLGE.FilterAO.prototype.setSamples=function(value){
	this.samples=value;
	this.normalBuffers=null;
	this.passes=[];
	return this;
}

GLGE.FilterAO.prototype.setQuality=function(value){
	this.quality=value;
	this.normalBuffers=null;
	this.passes=[];
	return this;
}

GLGE.FilterAO.prototype.setRange=function(value){
	this.range=value;
	if(this.gl){
		this.setUniform("1f","blurX",this.range/this.getNormalBufferWidth()*this.quality/this.samples);
		this.setUniform("1f","blurY",this.range/this.getNormalBufferHeight()/this.samples);
	}
	return this;
}

GLGE.FilterAO.prototype.setCavityGamma=function(value){
	this.setUniform("1f","cavitygamma",1/value);
	return this;
}
GLGE.FilterAO.prototype.setAmbientMultiplier=function(value){
	this.setUniform("1f","whiteMul",value);
	return this;
}
GLGE.FilterAO.prototype.setAmbientGamma=function(value){
	this.setUniform("1f","aogamma",1/value);
	return this;
}
GLGE.FilterAO.prototype.setMaximumDistance=function(value){
	this.setUniform("1f","maxDist",value);
	return this;
}

GLGE.FilterAO.prototype.GLRender=function(gl,buffer){
	this.gl=gl;
	if(this.passes.length==0){
		this.createPasses();
	}
	return GLGE.Filter2d.prototype.GLRender.call(this,gl,buffer)
}

GLGE.FilterAO.prototype.createPasses=function(){
	if(!this.gl) return;
	
	
	var width=this.getNormalBufferWidth();
	var height=this.getNormalBufferHeight();
	
	
	var size=(this.samples/4)|0;
	var weights=[];
	for(var i=-size,cnt=0; i<=size;i++,cnt++){
		var n=size-Math.abs(i)+1;
		weights[cnt]=n/(size*size+size);
	}
	weights[size]=0;
	
	this.setUniform("1f","blurX",this.range/width*this.quality/this.samples);
	this.setUniform("1f","blurY",this.range/height/this.samples);



	
	var pass1=[];
	pass1.push("precision highp float;");
	pass1.push("uniform sampler2D GLGE_NORMAL;");
	pass1.push("uniform float maxDist;");
	pass1.push("varying vec2 texCoord;");
	pass1.push("uniform float blurX;");
	pass1.push("float rand(vec2 co){");
	pass1.push("return (fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453)-0.5)*2.0;");
	pass1.push("}");
	pass1.push("void main(void){");
	pass1.push("vec4 n=texture2D(GLGE_NORMAL,texCoord.xy).rgba;");
	pass1.push("vec4 color=vec4(0.0,0.0,0.0,n.a);");
	pass1.push("float blurSize=blurX/(n.a*n.a+1.0);");
	pass1.push("float offset=rand(texCoord.xy)*blurSize+texCoord.x;");
	pass1.push("vec3 samp;");
	pass1.push("float delta;");
	for(var i=-size,cnt=0;i<=size;i++,cnt++){
		if(i==0) continue;
		pass1.push("samp = texture2D(GLGE_NORMAL, vec2("+i+".0*blurSize+offset, texCoord.y)).rga;");
		pass1.push("delta=abs(n.a-samp.b);");
		pass1.push("if(delta<maxDist){");
		pass1.push("delta/=maxDist;");
		pass1.push("color.b -= (samp.r-0.5) * "+weights[cnt]+" * "+((2*i)/Math.abs(i) | 0)+".0;");
		pass1.push("color.rg += samp.rg * "+weights[cnt]+" * (1.0-delta);");
		pass1.push("color.rg += n.rg  * "+weights[cnt]+" * delta;");
		pass1.push("}else{");
		pass1.push("color.rg +=n.rg * "+weights[cnt]+";");
		pass1.push("}");
	}
	pass1.push("color.b = (color.b+1.0)*0.5;");
	pass1.push("gl_FragColor = color;");
	pass1.push("}");
	
	var pass2=[];
	pass2.push("precision highp float;");
	pass2.push("uniform sampler2D GLGE_PASS0;");
	pass2.push("uniform sampler2D GLGE_RENDER;");
	pass2.push("uniform sampler2D GLGE_NORMAL;");
	pass2.push("varying vec2 texCoord;");
	pass2.push("uniform float blurY;");
	
	
	pass2.push("uniform float cavitygamma;");
	pass2.push("uniform float whiteMul;");
	pass2.push("uniform float aogamma;");
	pass2.push("uniform float maxDist;");
	
	
	pass2.push("float rand(vec2 co){");
	pass2.push("return (fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453)-0.5)*2.0;");
	pass2.push("}");
	pass2.push("void main(void){");
	pass2.push("vec4 color=vec4(0.0,0.0,0.0,1.0);");
	pass2.push("vec4 samp=vec4(0.0);");
	pass2.push("float random=rand(texCoord.xy);");
	if(this.quality<1){
		pass2.push("vec2 displace=vec2("+(0.5/width)+","+(0.5/height)+")*random;");
		pass2.push("vec4 n=texture2D(GLGE_PASS0, texCoord.xy+displace);");
	}else{
		pass2.push("vec4 n=texture2D(GLGE_PASS0, texCoord.xy);");
	}
	pass2.push("float delta;");
	pass2.push("float blurSize=blurY/(n.a*n.a+1.0);");
	pass2.push("float offset=random*blurSize+texCoord.y;");
	
	for(var i=-size,cnt=0;i<=size;i++,cnt++){
		if(i==0) continue;
		if(this.quality<1){
			pass2.push("samp = texture2D(GLGE_PASS0, vec2(texCoord.x, "+i+".0*blurSize + offset)+displace);");
		}else{
			pass2.push("samp = texture2D(GLGE_PASS0, vec2(texCoord.x, "+i+".0*blurSize + offset));");
		}
		pass2.push("delta=abs(n.a-samp.a);");
		pass2.push("if(delta<maxDist){");
		pass2.push("delta/=maxDist;");
		pass2.push("color.a -= (samp.g-0.5) * "+weights[cnt]+" * "+((i*2)/Math.abs(i) | 0)+".0;");
		pass2.push("color.rg += samp.rg  * "+weights[cnt]+" * (1.0-delta);");
		pass2.push("color.rg += n.rg * "+weights[cnt]+" * delta;");
		pass2.push("}else{");
		pass2.push("color.rg += n.rg * "+weights[cnt]+";");
		pass2.push("}");
	}
	pass2.push("color.a = (color.a+1.0)*n.b;");
	pass2.push("color.a = pow(color.a,cavitygamma);");
	if(this.quality<1){
		pass2.push("float dif =  length(color.rg-texture2D(GLGE_NORMAL, texCoord.xy+displace).rg);");
		pass2.push("samp =  texture2D(GLGE_NORMAL, texCoord.xy+displace+"+(1/this.gl.canvas.height)+").rgba;");
		pass2.push("if(abs(n.a-samp.a)<maxDist) dif =  max(length(color.rg-samp.rg),dif);");
		pass2.push("samp =  texture2D(GLGE_NORMAL, texCoord.xy+displace-"+(1/this.gl.canvas.height)+").rgba;");
		pass2.push("if(abs(n.a-samp.a)<maxDist) dif =  max(length(color.rg-samp.rg),dif);");
	}else{
		pass2.push("float dif =  length(color.rg-texture2D(GLGE_NORMAL, texCoord.xy).rg);");
	}
	
	pass2.push("float result = 1.0-((dif*(color.a-0.5)*2.0)+1.0)*0.5;");
	pass2.push("result = pow(min(result*whiteMul,1.0),aogamma);");
	pass2.push("gl_FragColor = vec4(vec3(result),1.0);");
	

	if(this.useRender) pass2.push("gl_FragColor = vec4(texture2D(GLGE_RENDER, texCoord.xy).rgb*gl_FragColor.r,1.0);");
	pass2.push("}");
	
	var pass3=[]
		pass3.push("precision highp float;");
		pass3.push("uniform sampler2D GLGE_PASS1;");
		pass3.push("varying vec2 texCoord;");
		pass3.push("vec2 inverse_buffer_size=vec2(1.0/"+this.gl.canvas.width.toFixed(1)+",1.0/"+this.gl.canvas.height.toFixed(1)+");");
		pass3.push("#define FXAA_REDUCE_MIN   (1.0/128.0)");
		pass3.push("#define FXAA_REDUCE_MUL   (1.0/16.0)");
		pass3.push("#define FXAA_SPAN_MAX     8.0");
		pass3.push("void  main(){");
		pass3.push("	vec3 rgbNW = texture2D(GLGE_PASS1,  (gl_FragCoord.xy + vec2(-1.0,-1.0)) * inverse_buffer_size).xyz;");
		pass3.push("	vec3 rgbNE = texture2D(GLGE_PASS1,  (gl_FragCoord.xy + vec2(1.0,-1.0)) * inverse_buffer_size).xyz;");
		pass3.push("	vec3 rgbSW = texture2D(GLGE_PASS1,  (gl_FragCoord.xy + vec2(-1.0,1.0)) * inverse_buffer_size).xyz;");
		pass3.push("	vec3 rgbSE = texture2D(GLGE_PASS1,  (gl_FragCoord.xy + vec2(1.0,1.0)) * inverse_buffer_size).xyz;");
		pass3.push("	vec3 rgbM  = texture2D(GLGE_PASS1,  gl_FragCoord.xy  * inverse_buffer_size).xyz;");
		pass3.push("	vec3 luma = vec3(0.299, 0.587, 0.114);");
		pass3.push("	float lumaNW = dot(rgbNW, luma);");
		pass3.push("	float lumaNE = dot(rgbNE, luma);");
		pass3.push("	float lumaSW = dot(rgbSW, luma);");
		pass3.push("	float lumaSE = dot(rgbSE, luma);");
		pass3.push("	float lumaM  = dot(rgbM,  luma);");
		pass3.push("	float lumaMin = min(lumaM, min(min(lumaNW, lumaNE), min(lumaSW, lumaSE)));");
		pass3.push("	float lumaMax = max(lumaM, max(max(lumaNW, lumaNE), max(lumaSW, lumaSE)));");
			
		pass3.push("	vec2 dir;");
		pass3.push("	dir.x = -((lumaNW + lumaNE) - (lumaSW + lumaSE));");
		pass3.push("	dir.y =  ((lumaNW + lumaSW) - (lumaNE + lumaSE));");
			
		pass3.push("	float dirReduce = max(");
		pass3.push("	(lumaNW + lumaNE + lumaSW + lumaSE) * (0.25 * FXAA_REDUCE_MUL),");
		pass3.push("	FXAA_REDUCE_MIN);");
			
		pass3.push("	float rcpDirMin = 1.0/(min(abs(dir.x), abs(dir.y)) + dirReduce);");
		pass3.push("	dir = min(vec2( FXAA_SPAN_MAX,  FXAA_SPAN_MAX),");
		pass3.push("	max(vec2(-FXAA_SPAN_MAX, -FXAA_SPAN_MAX),");
		pass3.push("	dir * rcpDirMin)) * inverse_buffer_size;");
			  
		pass3.push("	vec3 rgbA = 0.5 * (");
		pass3.push("	texture2D(GLGE_PASS1,   gl_FragCoord.xy  * inverse_buffer_size + dir * (1.0/3.0 - 0.5)).xyz +");
		pass3.push("	texture2D(GLGE_PASS1,   gl_FragCoord.xy  * inverse_buffer_size + dir * (2.0/3.0 - 0.5)).xyz);");
			
		pass3.push("	vec3 rgbB = rgbA * 0.5 + 0.25 * (");
		pass3.push("	texture2D(GLGE_PASS1,  gl_FragCoord.xy  * inverse_buffer_size + dir *  - 0.5).xyz +");
		pass3.push("	texture2D(GLGE_PASS1,  gl_FragCoord.xy  * inverse_buffer_size + dir * 0.5).xyz);");
		pass3.push("	float lumaB = dot(rgbB, luma);");
		pass3.push("	if((lumaB < lumaMin) || (lumaB > lumaMax)) gl_FragColor = vec4(rgbA,1.0);");
		pass3.push("	    else gl_FragColor = vec4(rgbB,1.0);");
		pass3.push("	if(length(rgbM)>10.0) gl_FragColor = vec4(rgbM,1.0);");
		pass3.push("}");
		
	this.passes=[];
	this.addPass(pass1.join(""),width,height);
	this.addPass(pass2.join(""));
	this.addPass(pass3.join("\n"));
}



})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.
 
Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.
 
THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/
 
 /**
 * @fileOverview
 * @name glge_collada.js
 * @author me@paulbrunt.co.uk
 */
 
if(typeof(GLGE) == "undefined"){
	/**
	* @namespace Holds the functionality of the library
	*/
	GLGE = {};
}

(function(GLGE){
 GLGE.ColladaDocuments=[];
 

 
 
/**
* @class Class to represent a collada object
* @augments GLGE.Group
*/
GLGE.Collada=function(uid){
	GLGE.Group.call(this);
	this.children=[];
	this.actions={};
	this.boneIdx=0;
	this.actionsIdx=0;
	GLGE.Assets.registerAsset(this,uid);


	

};
GLGE.augment(GLGE.Group,GLGE.Collada);
GLGE.Collada.prototype.type=GLGE.G_NODE;
GLGE.Collada.prototype.useLights=false;
GLGE.Collada.prototype.useCamera=false
GLGE.Collada.prototype.useBinaryAlpha=false;
/**
* Gets the absolute path given an import path and the path it's relative to
* @param {string} path the path to get the absolute path for
* @param {string} relativeto the path the supplied path is relativeto
* @returns {string} absolute path
* @private
*/
GLGE.Collada.prototype.getAbsolutePath=function(path,relativeto){
	if(path.substr(0,7)=="http://" || path.substr(0,7)=="file://"  || path.substr(0,7)=="https://"){
		return path;
	}
	else
	{
		if(!relativeto){
			relativeto=window.location.href;
		}
		if (relativeto.indexOf("://")==-1){
			return relativeto.slice(0,relativeto.lastIndexOf("/"))+"/"+path;
		}
		//find the path compoents
		var bits=relativeto.split("/");
		var domain=bits[2];
		var proto=bits[0];
		var initpath=[];
		for(var i=3;i<bits.length-1;i++){
			initpath.push(bits[i]);
		}
		//relative to domain
		if(path.substr(0,1)=="/"){
			initpath=[];
		}
		var locpath=path.split("/");
		for(i=0;i<locpath.length;i++){
			if(locpath[i]=="..") initpath.pop();
				else if(locpath[i]!="") initpath.push(locpath[i]);
		}
		return proto+"//"+domain+"/"+initpath.join("/");
	}
}
/**
* function to get the element with a specified id
* @param {string} id the id of the element
* @private
*/
GLGE.Collada.prototype.getElementById=function(id){
	if(!this.idcache){
		var tags=this.getElementsByTagName("*");
		var attribid;
		this.idcache={};
		for(var i=0; i<tags.length;i++){
			attribid=tags[i].getAttribute("id");
			if(attribid!="") this.idcache[attribid]=tags[i];
		}
	}
	return this.idcache[id];
}


/**
* function extracts a javascript array from the document
* @param {DOM Element} node the value to parse
* @private
*/
GLGE.Collada.prototype.parseArray=function(node){
	var value;
	var child=node.firstChild;
	var prev="";
	var output=[];
	var currentArray;
	var i;
	while(child){
		currentArray=(prev+child.nodeValue).replace(/\s+/g," ").replace(/^\s+/g,"").split(" ");
		child=child.nextSibling;
		if(currentArray[0]=="") currentArray.unshift();
		if(child) prev=currentArray.pop();
		for(i=0;i<currentArray.length;i++) if(currentArray[i]!="") output.push(currentArray[i]);
	}
	
	return output;
};

/**
* determine if this is a sketchupfile
* @private
*/
GLGE.Collada.prototype.isSketchupFile = function() {
    var asset=this.xml.getElementsByTagName("asset");
    if (!asset || asset.length==0)
        return false;
    for (var i=0;i<asset.length;++i){
        var contributor=asset[i].getElementsByTagName("contributor");
        if (!contributor || contributor.length==0)
            return false;
        for (var j=0;j<contributor.length;++j) {
            var authoring=contributor[j].getElementsByTagName("authoring_tool");
            if (!authoring || authoring.length==0)
                return false;
            for (var k=0;k<authoring.length;++k) {    
                var tool=authoring[k].firstChild.nodeValue;
                if (tool.indexOf("Google")==0) {
                    return true;
                }
            }
        }        
    }
    return false;
};


/**
* set flag indicating if binary alpha should be used
* @param {boolean} flag the flag indicating binary alpha use
*/
GLGE.Collada.prototype.setUseBinaryAlpha=function(flag){
	this.useBinaryAlpha=flag;
	return this;
}

/**
* set flag indicating if camera should be extracted from the collada document
* @param {boolean} node the value to parse
*/
GLGE.Collada.prototype.setUseCamera=function(usecamera){
	this.useCamera=usecamera;
	return this;
}
/**
* get flag indicating if camera should be extracted from the collada document
* @returns {boolean} node the value to parse
*/
GLGE.Collada.prototype.getUseCamera=function(){
	return this.useCamera;
}

/**
* set flag indicating if lights should be extracted from the collada document
* @param {boolean} node the value to parse
*/
GLGE.Collada.prototype.setUseLights=function(uselights){
	this.useLights=uselights;
	return this;
}
/**
* get flag indicating if lights should be extracted from the collada document
* @returns {boolean} node the value to parse
*/
GLGE.Collada.prototype.getUseLights=function(uselights){
	return this.useLights;
}

/**
* loads an collada file from a given url
* @param {DOM Element} node the value to parse
* @param {string} relativeTo optional the path the url is relative to
*/
GLGE.Collada.prototype.setDocument=function(url,relativeTo,cb){
	this.url=url;
    this.loadedCallback=cb;
	//use # to determine the is of the asset to extract
	if(url.indexOf("#")!=-1){
		this.rootId=url.substr(url.indexOf("#")+1);
		url=url.substr(0,url.indexOf("#"));
	}
	if(relativeTo) url=this.getAbsolutePath(url,relativeTo);
	this.docURL=url;
	if(GLGE.ColladaDocuments[url]){
		this.xml=GLGE.ColladaDocuments[url];
	}else{
		var req = new XMLHttpRequest();
		if(req) {
			req.overrideMimeType("text/xml")
			var docurl=url;
			var docObj=this;
			req.onreadystatechange = function() {
				if(this.readyState  == 4)
				{
					if(this.status  == 200 || this.status==0){
						this.responseXML.getElementById=docObj.getElementById;
						docObj.loaded(docurl,this.responseXML);
					}else{ 
						GLGE.error("Error loading Document: "+docurl+" status "+this.status);
					}
				}
			};
			req.open("GET", url, true);
			req.send("");
		}	
	}
};

/**
* gets data for a given source element
* @param {string} id the id of the source element
* @private
*/
GLGE.Collada.prototype.getSource=function(id){
	var element=this.xml.getElementById(id);
    if (!element )
        return []
	if(!element.jsArray || this.badAccessor){
		var value;
		if(element.tagName=="vertices"){
			value=[];
			var inputs=element.getElementsByTagName("input");
			for(var i=0;i<inputs.length;i++){
				value[i]=this.getSource(inputs[i].getAttribute("source").substr(1));
				value[i].block=inputs[i].getAttribute("semantic");
			}
		}else{
			var accessor=element.getElementsByTagName("technique_common")[0].getElementsByTagName("accessor")[0];
			var sourceArray=this.xml.getElementById(accessor.getAttribute("source").substr(1));
			var type=sourceArray.tagName;
			value=this.parseArray(sourceArray);
			stride=parseInt(accessor.getAttribute("stride"));
			offset=parseInt(accessor.getAttribute("offset"));
			if(!offset) offset=0;
			if(!stride) stride=1;
			count=parseInt(accessor.getAttribute("count"));
			var params=accessor.getElementsByTagName("param");
			var pmask=[];
			for(var i=0;i<params.length;i++){if(params[i].hasAttribute("name") || this.exceptions.badAccessor || this.badAccessor) pmask.push({type:params[i].getAttribute("type"),name:params[i].getAttribute("name")}); else pmask.push(false);}
			value={array:value,stride:stride,offset:offset,count:count,pmask:pmask,type:type};
		}	

		element.jsArray=value;
	}
	
	return element.jsArray;
};


var meshCache={};
/**
* Creates a new object and added the meshes parse in the geomertry
* @param {string} id id of the geomerty to parse
* @private
*/
GLGE.Collada.prototype.getMeshes=function(id,skeletonData){
	if(!meshCache[this.url]) meshCache[this.url]=[];
	if(meshCache[this.url][id]) return meshCache[this.url][id];
	
	var i,n;
	var mesh;
	var inputs;
	var inputArray;		
	var vertexJoints;
	var vertexWeights;
	var faces;
	var outputData;
	var block;
	var set;
	var rootNode=this.xml.getElementById(id);
    if (!rootNode) {
        GLGE.error("Collada.getMeshes returning [], id: " + id);
        return [];        
    }
    var temp = rootNode.getElementsByTagName("mesh");
    if (!temp){
        GLGE.error("Collada.getMeshes returning [], id: " + id);
        return [];        
    }
    meshNode = null;
    if (temp.length) {
        meshNode = temp[0];
    }
    else {
        GLGE.error("Collada.getMeshes returning [], id: " + id);
    }
	var meshes=[];
	if(!meshNode) return meshes;
	
	//convert polylists to triangles my head hurts now :-(
	var polylists=meshNode.getElementsByTagName("polylist");
	for(i=0;i<polylists.length;i++){
		faces=this.parseArray(polylists[i].getElementsByTagName("p")[0]);
		vcount=this.parseArray(polylists[i].getElementsByTagName("vcount")[0]);
		var inputcount=polylists[i].getElementsByTagName("input");
		var maxoffset=0;
		for(n=0;n<inputcount.length;n++) maxoffset=Math.max(maxoffset,inputcount[n].getAttribute("offset"));
		var tris=[];
		var cnt=0;
		for(n=0;n<vcount.length;n++){
		
			for(var j=0; j<vcount[n]-2;j++){
				for(var k=0;k<=maxoffset;k++){
					tris.push(faces[cnt+k]);
				}
				for(k=0;k<=maxoffset;k++){
					tris.push(faces[cnt+(maxoffset+1)*(j+1)+k]);
				}
				for(k=0;k<=maxoffset;k++){
					tris.push(faces[cnt+(maxoffset+1)*(j+2)+k]);
				}
			}
			cnt=cnt+(maxoffset+1)*vcount[n];
		}
		polylists[i].getElementsByTagName("p")[0].data=tris;
	}
	
	//convert polygons to tris
	var polygons=meshNode.getElementsByTagName("polygons");
	for(i=0;i<polygons.length;i++){
		var polys=polygons[i].getElementsByTagName("p");
		var tris=[];
		for(var l=0;l<polys.length;l++){
			var faces=this.parseArray(polys[l]);
			var inputcount=polygons[i].getElementsByTagName("input");
			var maxoffset=0;
			for(n=0;n<inputcount.length;n++) maxoffset=Math.max(maxoffset,inputcount[n].getAttribute("offset"));
			var cnt=0;
			for(j=0; j<(faces.length/(maxoffset+1))-2;j++){
				for(k=0;k<=maxoffset;k++){
					tris.push(faces[cnt+k]);
				}
				for(k=0;k<=maxoffset;k++){
					tris.push(faces[cnt+(maxoffset+1)*(j+1)+k]);
				}
				for(k=0;k<=maxoffset;k++){
					tris.push(faces[cnt+(maxoffset+1)*(j+2)+k]);
				}
			}
			cnt=cnt+(maxoffset+1)*(faces.length/(maxoffset+1));
		}
		if(polys.length>0) polygons[i].getElementsByTagName("p")[0].data=tris;
	}
	
	
	//create a mesh for each set of faces
	var triangles=[];
	var tris=meshNode.getElementsByTagName("triangles");
	for(i=0;i<polylists.length;i++){triangles.push(polylists[i])};
	for(i=0;i<polygons.length;i++){if(polygons[i].getElementsByTagName("p").length>0) triangles.push(polygons[i])};
	for(i=0;i<tris.length;i++){triangles.push(tris[i])};
	
	for(i=0;i<triangles.length;i++){
		//go though the inputs to get the data layout
		inputs=triangles[i].getElementsByTagName("input");
		vertexJoints=[];
		vertexWeights=[];
		inputArray=[];
		outputData={};
		for(n=0;n<inputs.length;n++){
			inputs[n].data=this.getSource(inputs[n].getAttribute("source").substr(1));
			block=inputs[n].getAttribute("semantic");
			if(block=="TEXCOORD"){
					set=inputs[n].getAttribute("set");
					if(!set) set=0;
					block=block+set;
			}
			if(block=="VERTEX"){
				for(var l=0;l<inputs[n].data.length;l++){
					outputData[inputs[n].data[l].block]=[];
				}
			}
			inputs[n].block=block;
			inputs[n].offset=parseInt(inputs[n].getAttribute("offset"));
			outputData[block]=[];
			inputArray.push(inputs[n]);
			//inputArray[inputs[n].getAttribute("offset")]=inputs[n];
		}
		//get the face data and push the data into the mesh
		if(triangles[i].getElementsByTagName("p")[0].data) faces=triangles[i].getElementsByTagName("p")[0].data;
			else faces=this.parseArray(triangles[i].getElementsByTagName("p")[0]);

		for(var n=0;n<inputArray.length;n++){
			if(inputArray[n].block!="VERTEX"){
				inputArray[n].data=[inputArray[n].data];
				inputArray[n].data[0].block=inputArray[n].block;
			}
		}
		
		//get max offset
		var maxoffset=0;
		for(n=0;n<inputArray.length;n++){
			maxoffset=Math.max(inputArray[n].offset+1,maxoffset);
		}
		
		for(j=0;j<faces.length;j=j+maxoffset){
			for(n=0;n<inputArray.length;n++){
				for(var l=0;l<inputArray[n].data.length;l++){
					var block=inputArray[n].data[l].block;
					var pcnt=inputArray[n].data[l].stride;
					for(k=0;k<inputArray[n].data[l].stride;k++){
						if(inputArray[n].data[l].pmask[k]){
							outputData[block].push(inputArray[n].data[l].array[faces[j+inputArray[n].offset]*inputArray[n].data[l].stride+k+inputArray[n].data[l].offset]);
						}
					}
					if(skeletonData && block=="POSITION"){
						for(k=0;k<skeletonData.count;k++){
							vertexJoints.push(skeletonData.vertexJoints[faces[j+inputArray[n].offset]*skeletonData.count+k]);
							vertexWeights.push(skeletonData.vertexWeight[faces[j+inputArray[n].offset]*skeletonData.count+k]);
						}
					}
					//account for 1D and 2D
					if(block=="POSITION" && pcnt==1) {outputData[block].push(0);outputData[block].push(0);}
					if(block=="POSITION" && pcnt==2) outputData[block].push(0);
					//we can't handle 3d texcoords at the moment so try two
					if(block=="TEXCOORD0" && pcnt==3) outputData[block].pop();
					if(block=="TEXCOORD1" && pcnt==3) outputData[block].pop();
				}
			}
		}
		
		//create faces array
		faces=[];
		//create mesh
        var windingOrder=GLGE.Mesh.WINDING_ORDER_CLOCKWISE;
		if(!outputData.NORMAL){
            console.log("Autogenerating normals, do not know facings");
			outputData.NORMAL=[];
			for(n=0;n<outputData.POSITION.length;n=n+9){
				var vec1=GLGE.subVec3([outputData.POSITION[n],outputData.POSITION[n+1],outputData.POSITION[n+2]],[outputData.POSITION[n+3],outputData.POSITION[n+4],outputData.POSITION[n+5]]);
				var vec2=GLGE.subVec3([outputData.POSITION[n+6],outputData.POSITION[n+7],outputData.POSITION[n+8]],[outputData.POSITION[n],outputData.POSITION[n+1],outputData.POSITION[n+2]]);
				var vec3=GLGE.toUnitVec3(GLGE.crossVec3(GLGE.toUnitVec3(vec2),GLGE.toUnitVec3(vec1)));
				outputData.NORMAL.push(vec3[0]);
				outputData.NORMAL.push(vec3[1]);
				outputData.NORMAL.push(vec3[2]);
				outputData.NORMAL.push(vec3[0]);
				outputData.NORMAL.push(vec3[1]);
				outputData.NORMAL.push(vec3[2]);
				outputData.NORMAL.push(vec3[0]);
				outputData.NORMAL.push(vec3[1]);
				outputData.NORMAL.push(vec3[2]);
			}
            var len=outputData.POSITION.length/3;
         	for(n=0;n<len;n++) faces.push(n);   
		}else {
            windingOrder=GLGE.Mesh.WINDING_ORDER_CLOCKWISE;
			for(n=0;n<outputData.POSITION.length;n=n+9){
				var vec1=GLGE.subVec3([outputData.POSITION[n],outputData.POSITION[n+1],outputData.POSITION[n+2]],[outputData.POSITION[n+3],outputData.POSITION[n+4],outputData.POSITION[n+5]]);
				var vec2=GLGE.subVec3([outputData.POSITION[n+6],outputData.POSITION[n+7],outputData.POSITION[n+8]],[outputData.POSITION[n],outputData.POSITION[n+1],outputData.POSITION[n+2]]);
				var vec3=GLGE.crossVec3(vec2,vec1);
                var clockwise_winding_order=0;                
                for (var dp=0;dp<9;dp+=3) {
                    if (
                        vec3[0]*outputData.NORMAL[n+dp]
                        + vec3[1]*outputData.NORMAL[n+dp+1]
                        + vec3[2]*outputData.NORMAL[n+dp+2]<0) {
                        clockwise_winding_order-=1;
                    }else clockwise_winding_order+=1;
                }
                if (clockwise_winding_order<0) {
                    var len=outputData.POSITION.length/3;
                    faces.push(n/3);
                    faces.push(n/3+2);
                    faces.push(n/3+1);//invert
                }else {
	                faces.push(n/3);
                    faces.push(n/3+1);
                    faces.push(n/3+2);
                }
            }
        }
	
        if (!this.isSketchupFile())
            windingOrder=GLGE.Mesh.WINDING_ORDER_UNKNOWN;
		function min(a,b){
            return (a>b?b:a);
        }
        var MAXVERTS=21843;
        MAXVERTS*=3;//always must be a multiple of 3 (3 vertices)
        var nummesh=((faces.length-faces.length%MAXVERTS)/MAXVERTS)+(faces.length%MAXVERTS?1:0);
		var trimesh=[];
        var vstride=3;
        var nstride=3;
        var tstride=2;
        for (var index=0;index<nummesh;++index) {
            trimesh.push(new GLGE.Mesh(undefined,windingOrder));
		    trimesh[index].setPositions(outputData.POSITION.slice(MAXVERTS*index*vstride,min(MAXVERTS*vstride*(index+1),outputData.POSITION.length)));
		    trimesh[index].setNormals(outputData.NORMAL.slice(MAXVERTS*index*nstride,min(MAXVERTS*(index+1)*nstride,outputData.POSITION.length)));
		    
		    if(outputData.TEXCOORD0) trimesh[index].setUV(outputData.TEXCOORD0.slice(MAXVERTS*index*tstride,min(MAXVERTS*(index+1)*tstride,outputData.TEXCOORD0.length)));
		    if(!outputData.TEXCOORD0 && outputData.TEXCOORD1) trimesh[index].setUV(outputData.TEXCOORD1.slice(MAXVERTS*index*tstride,min(MAXVERTS*(index+1)*tstride,outputData.TEXCOORD1.length)));
		    if(outputData.TEXCOORD1) trimesh[index].setUV2(outputData.TEXCOORD1.slice(MAXVERTS*index*tstride,min(MAXVERTS*(index+1)*tstride,outputData.TEXCOORD1.length)));
        }

		if(skeletonData){
			if(skeletonData.count>8){
				var newjoints=[];
				var newweights=[];
				for(var j=0;j<vertexWeights.length;j=j+skeletonData.count){
					var tmp=[];
					for(k=0;k<skeletonData.count;k++){
						tmp.push({weight:vertexWeights[j+k],joint:vertexJoints[j+k]});
					}
					tmp.sort(function(a,b){return parseFloat(b.weight)-parseFloat(a.weight)});
					for(k=0;k<8;k++){
						newjoints.push(tmp[k].joint);
						newweights.push(tmp[k].weight);
					}
				}
				vertexJoints=newjoints;
				vertexWeights=newweights;
				skeletonData.count=8;
			}
            for (var index=0;index<nummesh;++index) {			
			    trimesh[index].setJoints(skeletonData.joints);
			    trimesh[index].setInvBindMatrix(skeletonData.inverseBindMatrix);
                var maxval=min(MAXVERTS*(index+1)*skeletonData.count,vertexJoints.length);
                var minval=MAXVERTS*index*skeletonData.count;
			    trimesh[index].setVertexJoints(vertexJoints.slice(minval,maxval),skeletonData.count);
			    trimesh[index].setVertexWeights(vertexWeights.slice(minval,maxval),skeletonData.count);
            }
		}
        for (var index=0;index<nummesh;++index) {		
		    trimesh[index].setFaces(faces.slice(0,min(MAXVERTS*(index+1),faces.length)-MAXVERTS*(index)));
		    trimesh[index].matName=triangles[i].getAttribute("material");
            
		    meshes.push(trimesh[index]);
        }
	}
	meshCache[this.url][id]=meshes;
	return meshes;
};

/**
* Gets the float4 parameter for a shader
* @private
*/
GLGE.Collada.prototype.getFloat4=function(profile,sid){
    // MCB: it's possible for newparam to be in effect scope
	var params=profile.getElementsByTagName("newparam");
	for(var i=0;i<params.length;i++){
		if(params[i].getAttribute("sid")==sid){
			return params[i].getElementsByTagName("float4")[0].firstChild.nodeValue;
			break;
		}
	}
	return null;
}

/**
* Gets the float parameter for a shader
* @private
*/
GLGE.Collada.prototype.getFloat=function(profile,sid){
    // MCB: it's possible for newparam to be in effect scope
	var params=profile.getElementsByTagName("newparam");
	for(var i=0;i<params.length;i++){
		if(params[i].getAttribute("sid")==sid){
			return params[i].getElementsByTagName("float")[0].firstChild.nodeValue;
			break;
		}
	}
	return null;
}

/**
* Gets the sampler for a texture
* @private
*/
GLGE.Collada.prototype.getSampler=function(profile,sid){
    // MCB: it's possible for newparam to be in effect scope
	var params=profile.getElementsByTagName("newparam");
	for(var i=0;i<params.length;i++){
		if(params[i].getAttribute("sid")==sid){
			//only do 2d atm.
			return params[i].getElementsByTagName("sampler2D")[0].getElementsByTagName("source")[0].firstChild.nodeValue;
			break;
		}
	}
	return null;
}
/**
* Gets the surface for a texture
* @private
*/
GLGE.Collada.prototype.getSurface=function(profile,sid){
    // MCB: it's possible for newparam to be in effect scope
	var params=profile.getElementsByTagName("newparam");
	for(var i=0;i<params.length;i++){
		if(params[i].getAttribute("sid")==sid){
			return params[i].getElementsByTagName("surface")[0].getElementsByTagName("init_from")[0].firstChild.nodeValue;
			break;
		}
	}
	return null;
}

/**
* Gets the the collada image location
* @private
*/
GLGE.Collada.prototype.getImage=function(id){
	var image=this.xml.getElementById(id);
	if(!image) return;
	return this.getAbsolutePath(image.getElementsByTagName("init_from")[0].firstChild.nodeValue,this.docURL);

}

/**
* creates a material layer
* @private
*/
GLGE.Collada.prototype.createMaterialLayer=function(node,material,common,mapto,bvi){
	var textureImage;
	var imageid=this.getSurface(common,this.getSampler(common,node.getAttribute("texture")));
	if(!imageid) imageid=node.getAttribute("texture"); //assume converter bug  - workround
	textureImage=this.getImage(imageid);
	var texture=new GLGE.Texture();
	texture.setSrc(textureImage);
	material.addTexture(texture);
	var layer=new GLGE.MaterialLayer();
	layer.setTexture(texture);
	layer.setMapto(mapto);
	if(node.hasAttribute("texcoord") && bvi[node.getAttribute("texcoord")]){
		if(bvi[node.getAttribute("texcoord")]==1) {
			layer.setMapinput(GLGE.UV2);
		}else if (bvi[node.getAttribute("texcoord")]==0) {
			layer.setMapinput(GLGE.UV1);
		} else {
            GLGE.error("GLGE only supports 2 texture sets\n");
			layer.setMapinput(GLGE.UV1);
        }
	}else {
        GLGE.error("Collada material does not specify texture coordinates, but it may have them: defaulting to set 0\n");
        
        layer.setMapinput(GLGE.UV1);
    }
    
	// JHD: Added correct bracket enclosing for the "true" case.
	if (node.getElementsByTagName("blend_mode")[0]) {
		var blend = node.getElementsByTagName("blend_mode")[0].firstChild.nodeValue;
		if (blend == "MULTIPLY")
			layer.setBlendMode(GLGE.BL_MUL);
	}
	// JDH - End

	material.addMaterialLayer(layer);
}


/**
 * Function will get element by id starting from specified node.
 * Author: Renato Bebić <renato.bebic@gmail.com>
 *
 * The material getter below borked if there is e.g. a scene node with the same name as the material.
 * This is used to fix that by only looking for materials in the library_materials element.
 */
function getChildElementById( dNode, id ) {

	var dResult = null;

	if ( dNode.getAttribute('id') == id )
		return dNode;

	for ( var i = 0; i < dNode.childNodes.length; i++ ) {
		if ( dNode.childNodes[i].nodeType == 1 ) {
                        dResult = getChildElementById( dNode.childNodes[i], id ); //note: 1-level deep would suffice here, doesn't need to recurse into further childs. but this works.
                        if ( dResult != null )
				break;
		}
	}

	return dResult;
}

var MaterialCache={};

/**
* Gets the sampler for a texture
* @param {string} id the id or the material element
* @private
*/
GLGE.Collada.prototype.getMaterial=function(id,bvi){	

	// JHD: Added "else" and enclosing brackets
	if (!MaterialCache[this.url]) {
		MaterialCache[this.url] = {};
	} else if (MaterialCache[this.url][id]) {
		return MaterialCache[this.url][id];
	}
	
    	var materialLib=this.xml.getElementsByTagName("library_materials")[0];
	var materialNode=getChildElementById(materialLib, id); //this.xml.getElementById(id);
    if (!materialNode) {
        var returnMaterial=new GLGE.Material();
	    MaterialCache[this.url][id]=returnMaterial;        
        return returnMaterial;
    }
	var effectid=materialNode.getElementsByTagName("instance_effect")[0].getAttribute("url").substr(1);
	var effect=this.xml.getElementById(effectid);
	var common=effect.getElementsByTagName("profile_COMMON")[0];
	//glge only supports one technique currently so try and match as best we can
	var technique=common.getElementsByTagName("technique")[0];
	var returnMaterial=new GLGE.Material();
	returnMaterial.setBinaryAlpha(this.useBinaryAlpha);
    
	returnMaterial.setSpecular(0);
	
	MaterialCache[this.url][id]=returnMaterial;
	
	var child;
	var color;
	
	
	//do ambient lighting
	var ambient=technique.getElementsByTagName("ambient");
	if(ambient.length>0){
		child=ambient[0].firstChild;
		do{
			switch(child.tagName){
				case "color":
					color=child.firstChild.nodeValue.replace(/\s+/g,' ').split(" ");
					returnMaterial.setAmbient({r:color[0],g:color[1],b:color[2]});
					break;
				case "param":
					color=this.getFloat4(common,child.getAttribute("ref")).replace(/\s+/g,' ').split(" ");
					returnMaterial.setAmbient({r:color[0],g:color[1],b:color[2]});
					break;
				case "texture":
					this.createMaterialLayer(child,returnMaterial,common,GLGE.M_AMBIENT,bvi);
					break;
			}
		}while(child=child.nextSibling);
	}
	
	//do diffuse color
	var diffuse=technique.getElementsByTagName("diffuse");
	if(diffuse.length>0){
		child=diffuse[0].firstChild;
		do{
			switch(child.tagName){
				case "color":
					color=child.firstChild.nodeValue.replace(/\s+/g,' ').split(" ");
					returnMaterial.setColor({r:color[0],g:color[1],b:color[2]});
					break;
				case "param":
					color=this.getFloat4(common,child.getAttribute("ref")).replace(/\s+/g,' ').split(" ");
					returnMaterial.setColor({r:color[0],g:color[1],b:color[2]});
					break;
				case "texture":
					this.createMaterialLayer(child,returnMaterial,common,GLGE.M_COLOR,bvi);
					break;
			}
		}while(child=child.nextSibling);
	}
	
	
	var bump=technique.getElementsByTagName("bump");
	if(bump.length>0){
		child=bump[0].firstChild;
		do{
			switch(child.tagName){
				case "texture":
					this.createMaterialLayer(child,returnMaterial,common,GLGE.M_NOR,bvi);
					break;
			}
		}while(child=child.nextSibling);
	}
	
	//do shininess
	var shininess=technique.getElementsByTagName("shininess");
	if(shininess.length>0){
		returnMaterial.setSpecular(1);
		child=technique.getElementsByTagName("shininess")[0].firstChild;
		do{
			switch(child.tagName){
				case "float":
					if(parseFloat(child.firstChild.nodeValue)>1) returnMaterial.setShininess(parseFloat(child.firstChild.nodeValue));
						else  returnMaterial.setShininess(parseFloat(child.firstChild.nodeValue)*128);
					break;
				case "param":
					var value=parseFloat(this.getFloat(common,child.getAttribute("ref")));
					if(value>1) returnMaterial.setShininess(value);
						else    returnMaterial.setShininess(value*128);
					break;
                // MCB: texture is invalid here. should remove this case.
				case "texture":
					this.createMaterialLayer(child,returnMaterial,common,GLGE.M_SHINE,bvi);
					break;
			}
		}while(child=child.nextSibling);
	}
	
	//do specular color
	var specular=technique.getElementsByTagName("specular");
	if(specular.length>0){
		returnMaterial.setSpecular(1);
		child=specular[0].firstChild;
		do{
			switch(child.tagName){
				case "color":
					color=child.firstChild.nodeValue.replace(/\s+/g,' ').split(" ");
					returnMaterial.setSpecularColor({r:color[0],g:color[1],b:color[2]});
					break;
				case "param":
					color=this.getFloat4(common,child.getAttribute("ref")).replace(/\s+/g,' ').split(" ");
					returnMaterial.setSpecularColor({r:color[0],g:color[1],b:color[2]});
					break;
				case "texture":
					this.createMaterialLayer(child,returnMaterial,common,GLGE.M_SPECCOLOR,bvi);
					break;
			}
		}while(child=child.nextSibling);
	}

	//do reflectivity
	/*
	var reflectivity=technique.getElementsByTagName("reflectivity");
	if(reflectivity.length>0){
		child=reflectivity[0].firstChild;
		do{
			switch(child.tagName){
				case "float":
					//returnMaterial.setReflectivity(parseFloat(child.firstChild.nodeValue))
					break;
				case "param":
					//returnMaterial.setReflectivity(parseFloat(this.getFloat(common,child.getAttribute("ref"))));
					break;
                // MCB: texture is invalid here. should remove this case.
				case "texture":
					var imageid=this.getSurface(common,this.getSampler(common,child.getAttribute("texture")));
					textureImage=this.getImage(imageid);
					var texture=new GLGE.Texture(textureImage);
					returnMaterial.addTexture(texture);
					returnMaterial.addMaterialLayer(new GLGE.MaterialLayer(texture,GLGE.M_REFLECT,GLGE.UV1));
					break;
			}
		}while(child=child.nextSibling);
	}*/
	
	//do emission color
	var emission=technique.getElementsByTagName("emission");
	if(emission.length>0){
		child=emission[0].firstChild;
		do{
			switch(child.tagName){
				case "color":
					color=child.firstChild.nodeValue.split(" ");
					returnMaterial.setEmit({r:color[0],g:color[1],b:color[2]});
					break;
				case "param":
					color=this.getFloat4(common,child.getAttribute("ref")).split(" ");
					returnMaterial.setEmit(color[0]);
					break;
				case "texture":
					this.createMaterialLayer(child,returnMaterial,common,GLGE.M_EMIT,bvi);
					break;
			}
		}while(child=child.nextSibling);
	}

	//do reflective color
	var reflective=technique.getElementsByTagName("reflective");
	if(reflective.length>0){
		child=reflective[0].firstChild;
		do{
			switch(child.tagName){
				case "color":
					color=child.firstChild.nodeValue.replace(/\s+/g,' ').split(" ");
//TODO				returnMaterial.setReflectiveColor({r:color[0],g:color[1],b:color[2]});
					break;
				case "param":
					color=this.getFloat4(common,child.getAttribute("ref")).replace(/\s+/g,' ').split(" ");
//TODO				returnMaterial.setReflectiveColor({r:color[0],g:color[1],b:color[2]});
					break;
				case "texture":
					this.createMaterialLayer(child,returnMaterial,common,GLGE.M_REFLECT,bvi);
					break;
			}
		}while(child=child.nextSibling);
	}

	//do transparency
	var transparency=technique.getElementsByTagName("transparency");
	if(transparency.length>0){
		child=transparency[0].firstChild;
		do{
			switch(child.tagName){
				case "float":
//TODO				returnMaterial.setTransparency(parseFloat(child.firstChild.nodeValue))
				//Causing issues with a couple of models
					if(child.firstChild.nodeValue<1){
						returnMaterial.setAlpha(parseFloat(child.firstChild.nodeValue));
						returnMaterial.trans=true;
					}
					break;
				case "param":
//TODO                    	returnMaterial.setTransparency(parseFloat(this.getFloat(common,child.getAttribute("ref"))));
					break;
			}
		}while(child=child.nextSibling);
	}
	
	//do transparent color
	var transparent=technique.getElementsByTagName("transparent");
	if(transparent.length>0){
        var opaque=transparent[0].getAttribute("opaque");
        if(!opaque) opaque="A_ONE"; // schema default
        
		child=transparent[0].firstChild;
		do{
			switch(child.tagName){
                // MCB: float is invalid here. should remove this case.
				case "float":
					var alpha=parseFloat(child.firstChild.nodeValue);
					if(alpha<1){
						returnMaterial.setAlpha(parseFloat(child.firstChild.nodeValue));
						returnMaterial.trans=true;
					}
					break;
				case "color":
					color=child.firstChild.nodeValue.replace(/\s+/g,' ').split(" ");
					var alpha=this.getMaterialAlpha(color,opaque,1);
//TODO                    	var alpha=this.getMaterialAlpha(color,opaque,returnMaterial.getTransparency());
					if(alpha<1){
						returnMaterial.setAlpha(alpha);
						returnMaterial.trans=true;
					}
					break;
				case "param":
					color=this.getFloat4(common,child.getAttribute("ref")).replace(/\s+/g,' ').split(" ");
					var alpha=this.getMaterialAlpha(color,opaque,1);
//TODO                    	var alpha=this.getMaterialAlpha(color,opaque,returnMaterial.getTransparency());
					if(alpha<1){
						returnMaterial.setAlpha(alpha);
						returnMaterial.trans=true;
					}
					break;
                // MCB: this case assumes opaque="A_ONE" and transparency="1.0"
				case "texture":
					this.createMaterialLayer(child,returnMaterial,common,GLGE.M_ALPHA,bvi);
					returnMaterial.trans=true;
					break;
			}
		}while(child=child.nextSibling);
	}

	return returnMaterial;
};

/**
* gets the material alpha from the transparent color
* @param {color} the transparent color
* @param {opaque} the transparent color opaque attribute value
* @param {transparency} the transparency value
* @private
*/
GLGE.Collada.prototype.getMaterialAlpha=function(color,opaque,transparency){
    var returnAlpha;

    switch(opaque){
        case "A_ONE":
            returnAlpha=parseFloat(color[3])*transparency;
            break;
        case "A_ZERO":
            returnAlpha=1-parseFloat(color[3])*transparency;
            break;
        case "RGB_ONE":
            var luminance=parseFloat(color[0])*0.212671
                         +parseFloat(color[1])*0.715160
                         +parseFloat(color[2])*0.072169;
            returnAlpha=luminance*transparency;
            break;
        case "RGB_ZERO":
            var luminance=parseFloat(color[0])*0.212671
                         +parseFloat(color[1])*0.715160
                         +parseFloat(color[2])*0.072169;
            returnAlpha=1-luminance*transparency;
            break;
    }
    return returnAlpha;
};


GLGE.Collada.prototype.setMaterialOntoMesh=function(meshes,node) {
	var materials=node.getElementsByTagName("instance_material");
	var objMaterials={};
	for(var i=0; i<materials.length;i++){
		var bvis=materials[i].getElementsByTagName("bind_vertex_input");
		var bvi={};
		for(var j=0;j<bvis.length;j++){
			if (bvis[j].hasAttribute("input_set")) {
				bvi[bvis[j].getAttribute("semantic")]=bvis[j].getAttribute("input_set");					
			}else {//the exporter is buggy eg VCGLab | MeshLab and does not specify input_set
				function getLastNumber(str){
					var retval="";
					for (var i=str.length-1;i>=0;--i)
						if (str[i]>="0"&&str[i]<="9")
							retval=str[i]+retval;
					if (retval.length==0) return "0";
					return retval;
				}
				bvi[bvis[j].getAttribute("semantic")]=getLastNumber(bvis[j].getAttribute("semantic"));
			}
		}
		mat=this.getMaterial(materials[i].getAttribute("target").substr(1),bvi);
		objMaterials[materials[i].getAttribute("symbol")]=mat;
	}
	//create GLGE object
	var obj=new GLGE.Object();
	for(i=0; i<meshes.length;i++){
		if(objMaterials[meshes[i].matName] && objMaterials[meshes[i].matName].trans){
			obj.setZtransparent(true);
			//default to not pickable for transparent objects
			obj.setPickable(false);
		}
		var multimat=new GLGE.MultiMaterial();
		multimat.setMesh(meshes[i]);
		if(!objMaterials[meshes[i].matName]){
			objMaterials[meshes[i].matName]=new GLGE.Material();
			objMaterials[meshes[i].matName].setColor("lightgrey");
		}
		multimat.setMaterial(objMaterials[meshes[i].matName]);
		obj.addMultiMaterial(multimat);
	}
	obj.setSkeleton(this);
	node.GLGEObj=obj;
};

/**
* creates a GLGE Object from a given instance Geomertry
* @param {node} node the element to parse
* @private
*/
GLGE.Collada.prototype.getInstanceGeometry=function(node){
	if(node.GLGEObj && false){
		var obj=new GLGE.ObjectInstance();
		obj.setObject(node.GLGEObj);
		return obj;
	}else{
		// JHD
		var geometryId = node.getAttribute("url").substr(1);
		var meshes = this.getMeshes(geometryId);
		// JHD - End
		this.setMaterialOntoMesh(meshes, node);
		// JHD
		node.GLGEObj.id = geometryId;
		// JHD - End
		return node.GLGEObj;
	}
};


/**
* creates an array of animation curves
* @param {string} id the id of the sampler
* @private
*/
GLGE.Collada.prototype.getAnimationSampler=function(id,rotation){
	var frameRate=30;
	var inputs=this.xml.getElementById(id).getElementsByTagName("input");
	var outputData={};
	var inputsArray=[];
	var data,block;
	for(var i=0;i<inputs.length;i++){
		//modify get source to return the array and element length
		data=this.getSource(inputs[i].getAttribute("source").substr(1));
		block=inputs[i].getAttribute("semantic");
		inputsArray.push({block:block,data:data});
	}
	for(var n=0;n<inputsArray.length;n++){
		block=inputsArray[n].block;
		outputData[block]={};
		outputData[block].data=[];
		outputData[block].names=[];
		for(var k=0;k<inputsArray[n].data.array.length;k=k+inputsArray[n].data.stride){
			var pcnt=0;
			for(i=0;i<inputsArray[n].data.pmask.length;i++){
				if(inputsArray[n].data.pmask[i]){
					outputData[block].names.push(inputsArray[n].data.pmask[i].name);
					if(inputsArray[n].data.pmask[i].type=="float4x4"){
						outputData[block].stride=16;
						for(var j=0;j<16;j++){
							outputData[block].data.push(inputsArray[n].data.array[j+k+inputsArray[n].data.offset+i]);
						}
					}else{
						pcnt++;
						outputData[block].stride=pcnt;
						outputData[block].data.push(inputsArray[n].data.array[k+inputsArray[n].data.offset+i]);
					}
				}
			}
		}
	}
	//this should return an array of curves
	var point;
	var anim=[];
	for(var i=0; i<outputData["OUTPUT"].stride;i++){
		anim.push(new GLGE.AnimationCurve());
	}
	for(var i=0;i<outputData["INPUT"].data.length;i++){
		for(var j=0;j<outputData["OUTPUT"].stride;j++){
			anim[j].name=outputData["OUTPUT"].names[j];
			//fix if type is bezier and no tangent the fallback to linear
			if(outputData["INTERPOLATION"] && outputData["INTERPOLATION"].data[i]=="BEZIER" && !outputData["IN_TANGENT"]){
				outputData["INTERPOLATION"].data[i]="LINEAR";
			}
			
			if((!outputData["INTERPOLATION"]) || outputData["INTERPOLATION"].data[i]=="LINEAR"){
				point=new GLGE.LinearPoint();
				point.setX(outputData["INPUT"].data[i]*frameRate);
				var val=parseFloat(outputData["OUTPUT"].data[i*outputData["OUTPUT"].stride+j]);
				if(val==-180) val=-179.9;
				if(val==180) val=179.9;
				if(this.exceptions["flipangle"] && rotation){
					if(anim[j].lastval){
						if(Math.abs(anim[j].lastval-(360+val))<Math.abs(anim[j].lastval-val)){
							val=360+val;
						}else if(Math.abs(anim[j].lastval-(val-360))<Math.abs(anim[j].lastval-val)){
							val=val-360;
						}
					}
				}
				point.setY(val);
				anim[j].lastval=val;
				anim[j].addPoint(point);
			}
			
			if(outputData["INTERPOLATION"] && outputData["INTERPOLATION"].data[i]=="BEZIER"){
				point=new GLGE.BezTriple();
				point.setX1(outputData["IN_TANGENT"].data[(i*outputData["OUTPUT"].stride+j)*2]*frameRate);
				point.setY1(outputData["IN_TANGENT"].data[(i*outputData["OUTPUT"].stride+j)*2+1]);
				point.setX2(Math.round(outputData["INPUT"].data[i]*frameRate));
				point.setY2(outputData["OUTPUT"].data[i*outputData["OUTPUT"].stride+j]);
				point.setX3(outputData["OUT_TANGENT"].data[(i*outputData["OUTPUT"].stride+j)*2]*frameRate);
				point.setY3(outputData["OUT_TANGENT"].data[(i*outputData["OUTPUT"].stride+j)*2+1]);
				anim[j].addPoint(point);			
			}
		}
	}
	return anim;
}

/**
* Gets the animation vector for a node
* @param {object} channels the animation channels effecting this node
* @private
*/
GLGE.Collada.prototype.getAnimationVector=function(channels){
	//I can see no nice way to map a seuqnce of animated transforms onto a single transform 
	//so instead calc transform for each frame then use quat and trans then linear between them
	var maxFrame=0;
	//get the initial state of the target
	var targetNode=this.xml.getElementById(channels[0].target[0]);
	
	//blender 2.5a bug work round
	var target=channels[0].target[0].toString()
	if(!targetNode){
		var target=target.substring(target.indexOf("_")+1);
		targetNode=this.xml.getElementById(target);
	}
	if(!targetNode){
		var target=target.substring(target.indexOf("_")+1);
		targetNode=this.xml.getElementById(target);
	}
	//end work round
	if(!targetNode){
		GLGE.error("unable to find targetNode:"+target+" within collada document");
		return new GLGE.AnimationVector();
	}
	
	//get the initial transforms for the target node
	var child=targetNode.firstChild;

	var transforms=[];
	var sids={};
	do{
		switch(child.tagName){
			case "matrix":
			case "translate":
			case "rotate":
			case "scale":
				def={type:child.tagName,data:this.parseArray(child),animations:[]};
				if(child.hasAttribute("sid")) sids[child.getAttribute("sid")]=def;
				transforms.push(def);
				break;
		}
		child=child.nextSibling
	}while(child);
	//loop though the animation channels effecting this node
	var anim={};
	for(var i=0;i<channels.length;i++){
		var target=channels[i].target;
		var animcurves=this.getAnimationSampler(channels[i].source,/ANGLE/i.test(target));
		for(j=0;j<animcurves.length;j++){
			maxFrame=Math.max(maxFrame,animcurves[j].keyFrames[animcurves[j].keyFrames.length-1].x);
		}
		if(target[1].indexOf(".")!=-1){
			var splittarget=target[1].split(".");
			switch(splittarget[1]){
				case "X":
					sids[splittarget[0]].animations[0]=animcurves[0];
					break;
				case "Y":
					sids[splittarget[0]].animations[1]=animcurves[0];
					break;
				case "Z":
					sids[splittarget[0]].animations[2]=animcurves[0];
					break;
				case "ANGLE":
					sids[splittarget[0]].animations[3]=animcurves[0];
					break;
			}
		}else if(target[1].indexOf("(")!=-1){
			//do bracket type
			var idx=target[1].split("(");
			sidtarget=idx.shift();
			if(idx.length>1) idx=parseInt(idx[0])+4*parseInt(idx[1]);
				else idx=parseInt(idx[0]);
			sids[sidtarget].animations[idx]=animcurves[0];
		}else{
			//do all
			for(var j=0;j<animcurves.length;j++){
				switch(animcurves[j].name){
					case "X":
						sids[target[1]].animations[0]=animcurves[j];
						break;
					case "Y":
						sids[target[1]].animations[1]=animcurves[j];
						break;
					case "Z":
						sids[target[1]].animations[2]=animcurves[j];
						break;
					case "ANGLE":
						sids[target[1]].animations[3]=animcurves[j];
						break;
					default:
						sids[target[1]].animations[j]=animcurves[j];
						break;
				}
			}
		}
	
	}
	var animVector=new GLGE.AnimationVector();
	animVector.setFrames(maxFrame);
	var quatxcurve=new GLGE.AnimationCurve(); quatxcurve.setChannel("QuatX");
	var quatycurve=new GLGE.AnimationCurve(); quatycurve.setChannel("QuatY");
	var quatzcurve=new GLGE.AnimationCurve(); quatzcurve.setChannel("QuatZ");
	var quatwcurve=new GLGE.AnimationCurve(); quatwcurve.setChannel("QuatW");
	var locxcurve=new GLGE.AnimationCurve(); locxcurve.setChannel("LocX");
	var locycurve=new GLGE.AnimationCurve(); locycurve.setChannel("LocY");
	var loczcurve=new GLGE.AnimationCurve(); loczcurve.setChannel("LocZ");
	var scalexcurve=new GLGE.AnimationCurve(); scalexcurve.setChannel("ScaleX");
	var scaleycurve=new GLGE.AnimationCurve(); scaleycurve.setChannel("ScaleY");
	var scalezcurve=new GLGE.AnimationCurve(); scalezcurve.setChannel("ScaleZ");
	animVector.addAnimationCurve(quatxcurve);
	animVector.addAnimationCurve(quatycurve);
	animVector.addAnimationCurve(quatzcurve);
	animVector.addAnimationCurve(quatwcurve);
	animVector.addAnimationCurve(locxcurve);
	animVector.addAnimationCurve(locycurve);
	animVector.addAnimationCurve(loczcurve);
	animVector.addAnimationCurve(scalexcurve);
	animVector.addAnimationCurve(scaleycurve);
	animVector.addAnimationCurve(scalezcurve);
	var lastQuat=null;
	for(var frame=0; frame<maxFrame;frame++){
		var matrix=GLGE.identMatrix();
		for(var i=0;i<transforms.length;i++){
			//get full transform for this frame
			switch(transforms[i].type){
				case "matrix":
					var matrix_array=[
						(transforms[i].animations[0] ? transforms[i].animations[0].getValue(frame) : transforms[i].data[0]),
						(transforms[i].animations[1] ? transforms[i].animations[1].getValue(frame) : transforms[i].data[1]),
						(transforms[i].animations[2] ? transforms[i].animations[2].getValue(frame) : transforms[i].data[2]),
						(transforms[i].animations[3] ? transforms[i].animations[3].getValue(frame) : transforms[i].data[3]),
						(transforms[i].animations[4] ? transforms[i].animations[4].getValue(frame) : transforms[i].data[4]),
						(transforms[i].animations[5] ? transforms[i].animations[5].getValue(frame) : transforms[i].data[5]),
						(transforms[i].animations[6] ? transforms[i].animations[6].getValue(frame) : transforms[i].data[6]),
						(transforms[i].animations[7] ? transforms[i].animations[7].getValue(frame) : transforms[i].data[7]),
						(transforms[i].animations[8] ? transforms[i].animations[8].getValue(frame) : transforms[i].data[8]),
						(transforms[i].animations[9] ? transforms[i].animations[9].getValue(frame) : transforms[i].data[9]),
						(transforms[i].animations[10] ? transforms[i].animations[10].getValue(frame) : transforms[i].data[10]),
						(transforms[i].animations[11] ? transforms[i].animations[11].getValue(frame) : transforms[i].data[11]),
						(transforms[i].animations[12] ? transforms[i].animations[12].getValue(frame) : transforms[i].data[12]),
						(transforms[i].animations[13] ? transforms[i].animations[13].getValue(frame) : transforms[i].data[13]),
						(transforms[i].animations[14] ? transforms[i].animations[14].getValue(frame) : transforms[i].data[14]),
						(transforms[i].animations[15] ? transforms[i].animations[15].getValue(frame) : transforms[i].data[15])
					];
					matrix=GLGE.mulMat4(matrix,GLGE.Mat4(matrix_array));
					break;
				case "rotate":
					var rotate_array=[
						(transforms[i].animations[0] ? transforms[i].animations[0].getValue(frame) : transforms[i].data[0]),
						(transforms[i].animations[1] ? transforms[i].animations[1].getValue(frame) : transforms[i].data[1]),
						(transforms[i].animations[2] ? transforms[i].animations[2].getValue(frame) : transforms[i].data[2]),
						(transforms[i].animations[3] ? transforms[i].animations[3].getValue(frame) : transforms[i].data[3])
					];
					matrix=GLGE.mulMat4(matrix,GLGE.angleAxis(rotate_array[3]*0.017453278,[ rotate_array[0], rotate_array[1], rotate_array[2]]));
					break;
				case "translate":
					var translate_array=[
						(transforms[i].animations[0] ? transforms[i].animations[0].getValue(frame) : transforms[i].data[0]),
						(transforms[i].animations[1] ? transforms[i].animations[1].getValue(frame) : transforms[i].data[1]),
						(transforms[i].animations[2] ? transforms[i].animations[2].getValue(frame) : transforms[i].data[2])
					];
					matrix=GLGE.mulMat4(matrix,GLGE.translateMatrix(translate_array[0],translate_array[1],translate_array[2]));
					break;
				case "scale":
					var scale_array=[
						(transforms[i].animations[0] ? transforms[i].animations[0].getValue(frame) : transforms[i].data[0]),
						(transforms[i].animations[1] ? transforms[i].animations[1].getValue(frame) : transforms[i].data[1]),
						(transforms[i].animations[2] ? transforms[i].animations[2].getValue(frame) : transforms[i].data[2])
					];
					matrix=GLGE.mulMat4(matrix,GLGE.scaleMatrix(scale_array[0],scale_array[1],scale_array[2]));
					break;
			}
		}
		scale=GLGE.matrix2Scale(matrix);
		matrix=GLGE.mulMat4(matrix,GLGE.scaleMatrix(1/scale[0],1/scale[1],1/scale[2]));
		//convert to quat and trans and add to the curve
		quat=GLGE.rotationMatrix2Quat(matrix);
		if(lastQuat){
			//make sure we are in the same range as previous!
			if((lastQuat[0]*quat[0]+lastQuat[1]*quat[1]+lastQuat[2]*quat[2]+lastQuat[3]*quat[3])<0){
				quat[0]=quat[0]*-1;
				quat[1]=quat[1]*-1;
				quat[2]=quat[2]*-1;
				quat[3]=quat[3]*-1;
			}
		}
		lastQuat=quat;
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(quat[0]);
		quatxcurve.addPoint(point);
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(quat[1]);
		quatycurve.addPoint(point);
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(quat[2]);
		quatzcurve.addPoint(point);
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(quat[3]);
		quatwcurve.addPoint(point);
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(matrix[3]);
		locxcurve.addPoint(point);
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(matrix[7]);
		locycurve.addPoint(point);
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(matrix[11]);
		loczcurve.addPoint(point);
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(scale[0].toFixed(4));
		scalexcurve.addPoint(point);
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(scale[1].toFixed(4));
		scaleycurve.addPoint(point);
		point=new GLGE.LinearPoint();
		point.setX(frame);
		point.setY(scale[2].toFixed(4));
		scalezcurve.addPoint(point);
	}
	//return the animation vector
	/*for(var i=0; i<targetNode.GLGEObjects.length;i++){
		targetNode.GLGEObjects[i].setAnimation(animVector);
		targetNode.GLGEObjects[i].animationStart=0;
		targetNode.GLGEObjects[i].setFrameRate(30);
	}*/
	return animVector;
}

var actionCache={};
/**
* creates an action form the intially animation within the document
* @private
*/
GLGE.Collada.prototype.getAnimations=function(){
	if(actionCache[this.url]){
		this.actions=actionCache[this.url];
	}else{
		var animationClips=this.xml.getElementsByTagName("animation_clip");
		var animations=this.xml.getElementsByTagName("animation");
		if(animationClips.length==0){
			animations.name="default";
			var clips=[animations];
		}else{
			var clips=[];
			for(var i=0;i<animationClips.length;i++){
				var anim=[];
				var instances=animationClips[i].getElementsByTagName("instance_animation");
				for(var j=0;j<instances.length;j++){
					anim.push(this.xml.getElementById(instances[j].getAttribute("url").substr(1)));
				}
				anim.name=animationClips[i].getAttribute("id");
				clips.push(anim);
			}
		}

		for(var k=0;k<clips.length;k++){
			var animations=clips[k];
			var channels,target,source;
			var channelGroups={};
			for(var i=0;i<animations.length;i++){
				channels=animations[i].getElementsByTagName("channel");
				for(var j=0;j<channels.length;j++){
					var target=channels[j].getAttribute("target").split("/");
					source=channels[j].getAttribute("source").substr(1);
					if(!channelGroups[target[0]]) channelGroups[target[0]]=[];
					channelGroups[target[0]].push({source:source,target:target});
				}
			}
			var action=new GLGE.Action();
			for(var target in channelGroups){
				var animVector=this.getAnimationVector(channelGroups[target]);
				var targetNode=this.xml.getElementById(target);
				//blender 2.5a bug work round
				if(!targetNode){
					target=target.substring(target.indexOf("_")+1);
					targetNode=this.xml.getElementById(target);
				}
				if(!targetNode){
					target=target.substring(target.indexOf("_")+1);
					targetNode=this.xml.getElementById(target);
				}
				//end work round
				if(!targetNode){
					GLGE.error("unable to find targetNode:"+target+" within collada document");
					continue;
				}
				for(var i=0; i<targetNode.GLGEObjects.length;i++){
					var ac=new GLGE.ActionChannel();

					var name=targetNode.GLGEObjects[i].getName();
					ac.setTarget(name);
					ac.setAnimation(animVector);
					action.addActionChannel(ac);
				}
			}
			this.addColladaAction({name:animations.name,action:action});
		}
	}
	actionCache[this.url]=this.actions;
	for(var n in this.actions) {this.setAction(this.actions[n],0,true);break}
}
/**
* Adds a collada action
* @param {object} action object hold action info
* @private
*/
GLGE.Collada.prototype.addColladaAction=function(action){
	this.actions[action.name]=action.action;
}
/**
* Gets the available actions from the collada file
* @returns {object} all the available actions within the collada file
*/
GLGE.Collada.prototype.getColladaActions=function(){
	return this.actions;
}


/**
* creates a GLGE Object from a given instance controler
* @param {node} node the element to parse
* @private
*/
GLGE.Collada.prototype.getInstanceController=function(node){
	var obj=new GLGE.Object();
	var controller=this.xml.getElementById(node.getAttribute("url").substr(1));
	if(!controller){
		GLGE.error("unable to find id:"+node.getAttribute("url").substr(1)+" within collada document");
		return obj;
	}
	var skeletons=node.getElementsByTagName("skeleton");
	var joints=controller.getElementsByTagName("joints")[0];
	var inputs=joints.getElementsByTagName("input");
	var bindShapeMatrix;
	if(controller.getElementsByTagName("bind_shape_matrix").length>0){
		bindShapeMatrix=this.parseArray(controller.getElementsByTagName("bind_shape_matrix")[0]);
	}else{
		//assume identity
		bindShapeMatrix=GLGE.identMatrix();
	}

	var inverseBindMatrix=[bindShapeMatrix];
	var base=new GLGE.Group;
	this.addGroup(base);
	var joints=[base];
	var mat;
	for(var i=0; i<inputs.length;i++){
		if(inputs[i].getAttribute("semantic")=="JOINT"){
			var jointdata=this.getSource(inputs[i].getAttribute("source").substr(1));
			if(jointdata.type=="IDREF_array"){
				var all_items_incorrect=(jointdata.array.length!=0);
				for(var k=0;k<jointdata.array.length;k=k+jointdata.stride){
					var curNode=this.getNode(this.xml.getElementById(jointdata.array[k]),true);
					var name=curNode.getName();
					if (!this.xml.getElementById(jointdata.array[k])) {
						GLGE.error("Bone is not specified "+jointdata.array[k]);
						inverseBindMatrix=[bindShapeMatrix=GLGE.identMatrix()];
					}else all_items_incorrect=false;
					joints.push(name);
				}
				if (all_items_incorrect)
					inverseBindMatrix=[bindShapeMatrix=GLGE.identMatrix()];
			}else if(jointdata.type=="Name_array"){
				var sidArray={};
				var sid,name;
				//is this right controller with no skeleton set, export bug??
				if(skeletons.length==0){
					var elements=this.xml.getElementsByTagName("node");
					for(k=0; k<elements.length;k++){
						sid=elements[k].getAttribute("sid");
						if(sid){
							sidArray[sid]=elements[k];
						}
						name=elements[k].getAttribute("name");
						if(name && !sidArray[name]){
							sidArray[name]=elements[k];
						}
					}
				}else{
					for(var n=0; n<skeletons.length;n++){
						var skeletonElement=this.xml.getElementById(skeletons[n].firstChild.nodeValue.substr(1));
						sid=skeletonElement.getAttribute("sid");
						if(sid) sidArray[sid]=skeletonElement;
						var elements=skeletonElement.getElementsByTagName("*");
						for(k=0; k<elements.length;k++){
							sid=elements[k].getAttribute("sid");
							if(sid){
								sidArray[sid]=elements[k];
							}
							name=elements[k].getAttribute("name");
							if(name && !sidArray[name]){
								sidArray[name]=elements[k];
							}
						}
					}
				}
				for(var k=0;k<jointdata.array.length;k=k+jointdata.stride){
					if(jointdata.array[k]!=""){
						var name=this.getNode(sidArray[jointdata.array[k]],true).getName();
						joints.push(name);
					}
				}
			}

		}
	}
	for(var i=0; i<inputs.length;i++){
		//TODO: sort out correct use of accessors for these source
		if(inputs[i].getAttribute("semantic")=="INV_BIND_MATRIX"){
			var matrixdata=this.getSource(inputs[i].getAttribute("source").substr(1));
			for(var k=0;k<matrixdata.array.length;k=k+matrixdata.stride){
				mat=matrixdata.array.slice(k,k+16);
				inverseBindMatrix.push(GLGE.mulMat4(GLGE.Mat4(mat),GLGE.Mat4(bindShapeMatrix.slice(0,16))));
			}
		}
	}
	//go though the inputs to get the data layout
	var vertexWeight=controller.getElementsByTagName("vertex_weights")[0];
	inputs=vertexWeight.getElementsByTagName("input");
	var inputArray=[];
	var outputData={};
	for(var n=0;n<inputs.length;n++){
		block=inputs[n].getAttribute("semantic");
		inputs[n].data=this.getSource(inputs[n].getAttribute("source").substr(1));
		inputs[n].block=block;
		outputData[block]=[];
		var offset=inputs[n].getAttribute("offset");
		if (!inputArray[offset])
			inputArray[offset]=[];//may be more than 1 input per offset -DRH
		inputArray[offset].push(inputs[n]);
	}
	
	
	var vcounts=this.parseArray(vertexWeight.getElementsByTagName("vcount")[0]);

	var vs=this.parseArray(vertexWeight.getElementsByTagName("v")[0]);

	//find the maximum vcount
	var maxJoints=0;

	for(var i=0; i<vcounts.length;i++) if(vcounts[i]) maxJoints=Math.max(maxJoints,parseInt(vcounts[i]));
	vPointer=0;
	var block;
	for(var i=0; i<vcounts.length;i++){
		for(var j=0; j<vcounts[i];j++){
			for(var k=0; k<inputArray.length;k++){
				for (var ksub=0; ksub < inputArray[k].length; ++ksub) {
					block=inputArray[k][ksub].block;
					for(n=0;n<inputArray[k][ksub].data.stride;n++){
						if(inputArray[k][ksub].data.pmask[n]){
							if(block!="JOINT"){
								outputData[block].push(inputArray[k][ksub].data.array[parseInt(vs[vPointer])+parseInt(inputArray[k][ksub].data.offset)]);
							}else{
								outputData[block].push(parseInt(vs[vPointer]));
							}
							vPointer++;
						}
					}
				}
			}
		}
		//pad out the remaining data
		for(j=j; j<maxJoints;j++){
			for(var k=0; k<inputArray.length;k++){
				for (var ksub=0; ksub < inputArray[k].length; ++ksub) {
					block=inputArray[k][ksub].block;
					outputData[block].push(0);
				}
			}
		}
	}	

	if(!this.badAccessor && outputData["JOINT"].length==0){
		this.badAccessor=true;
		return this.getInstanceController(node);
	}
	
	for(var i=0;i<outputData["JOINT"].length;i++){
			outputData["JOINT"][i]++;
	}
	//blender fix
	if(this.exceptions.negjoints){
		for(var i=0;i<outputData["JOINT"].length;i++){
			if(outputData["JOINT"][i]==0){
				outputData["WEIGHT"][i]=0;
			}
		}
	}

	var skeletonData={vertexJoints:outputData["JOINT"],vertexWeight:outputData["WEIGHT"],joints:joints,inverseBindMatrix:inverseBindMatrix,count:maxJoints};

	var meshes=this.getMeshes(controller.getElementsByTagName("skin")[0].getAttribute("source").substr(1),skeletonData);

	this.setMaterialOntoMesh(meshes,node);
	return node.GLGEObj;
};

/**
* creates a GLGE lights from a given instance light
* @param {node} node the element to parse
* @private
*/
GLGE.Collada.prototype.getInstanceLight=function(node){
	var type=node.getElementsByTagName("technique_common")[0].getElementsByTagName("*")[0];
	var light=new GLGE.Light;
	var color=type.getElementsByTagName("color");
	if(color.length>0){
		var colors=color[0].firstChild.nodeValue.split(" ");
		var c="rgb("+((colors[0]*255)|0)+","+((colors[1]*255)|0)+","+((colors[2]*255)|0)+")";
		light.setColor(c);
	}
	switch (type.tagName) {
		// JHD
		case "point":
			light.setType(GLGE.L_POINT);
		case "spot":
			// JHD - End
			var ca = type.getElementsByTagName("constant_attenuation");
			if (ca.length > 0)
				light.setAttenuationConstant(parseFloat(ca[0].firstChild.nodeValue));
			var la = type.getElementsByTagName("linear_attenuation");
			if (la.length > 0)
				light.setAttenuationLinear(parseFloat(la[0].firstChild.nodeValue));
			var qa = type.getElementsByTagName("quadratic_attenuation");
			if (qa.length > 0)
				light.setAttenuationQuadratic(parseFloat(qa[0].firstChild.nodeValue));
			// JHD
			if (type.tagName == "spot") {
				light.setType(GLGE.L_SPOT);
			} else {
				break;
			}
			// case "spot":
			// JHD - End
			var se = type.getElementsByTagName("falloff_exponent");
			if (se.length > 0) {
				var exp = parseFloat(se[0].firstChild.nodeValue);
				if (exp < 1.0001)
					exp *= 128; // if less then one then assume they
				// are using 0-1 so convert to 0-128
				light.setSpotExponent(exp);
			}
			var fa = type.getElementsByTagName("falloff_angle");
			if (fa.length > 0)
				light.setSpotCosCutOff(Math.cos(parseFloat(fa[0].firstChild.nodeValue) / 180
						* Math.PI));
			break;
	}
	return light;
}

// JHD
/**
* Creates a new group and parses it's children
* @param {DOM Element} node the element to parse
* @param {boolean} ref should this just get a reference for later addition
* @private
*/
GLGE.Collada.prototype.addColladaCamera = function(object) {
	object.matrix = null; // Clear any cache
	object.parent = this;
	this.children.push(object);
	this.hasCamera = true;

	return this;
}
// JHD - End

/**
* Creates a new group and parses it's children
* @param {DOM Element} node the element to parse
* @param {boolean} ref should this just get a reference for later addition
* @private
*/
GLGE.Collada.prototype.getNode=function(node,ref){

	//if a reference has previously been created then add it now
	if(!ref && node.GLGEObject){
		newGroup=node.GLGEObject;
		delete(this.GLGEObject);
		return newGroup;
	}
	
	//if a reference is requested a the node previously created then return here
	if(ref && node && node.GLGEObjects){
		return node.GLGEObjects[0];
	}
	
	var newGroup=new GLGE.Group();
	var name="bone"+(++this.boneIdx);
	newGroup.setName(name);
	if (!node) {
        return newGroup;
    }
	if(!node.GLGEObjects) node.GLGEObjects=[];
	node.GLGEObjects.push(newGroup); //map Collada DOM to GLGE
	var child=node.firstChild;
	var matrix=GLGE.identMatrix();
	var data;
	if(child) do{
		switch(child.tagName){
			case "node":
				newGroup.addGroup(this.getNode(child));
				break;
			case "instance_node":
				newGroup.addGroup(this.getNode(this.xml.getElementById(child.getAttribute("url").substr(1))));
				break;
			case "instance_visual_scene":
				newGroup.addGroup(this.getNode(this.xml.getElementById(child.getAttribute("url").substr(1))));
				break;
			case "instance_light":
				if(this.useLights) newGroup.addLight(this.getInstanceLight(this.xml.getElementById(child.getAttribute("url").substr(1))));
				break;
			case "instance_geometry":
				newGroup.addObject(this.getInstanceGeometry(child));
				break;
			case "instance_controller":
				newGroup.addObject(this.getInstanceController(child));
				break;
			// JHD
			case "instance_camera":
				if(!this.useCamera) break;
				newGroup.addColladaCamera(this.getNode(this.xml.getElementById(child.getAttribute("url").substr(1))));
				break;
			case "optics":
				if(!this.useCamera) break;
				var opticChild = child.getElementsByTagName("technique_common");
				if (opticChild && opticChild.length > 0) {
					opticChild = opticChild[0].getElementsByTagName("perspective");
					if (opticChild && opticChild.length > 0) {
						var yFov = opticChild[0].getElementsByTagName("yfov");
						if (yFov && yFov.length > 0) {
							newGroup.yFov = parseFloat(yFov[0].textContent);
						}
						var zNear = opticChild[0].getElementsByTagName("znear");
						if (zNear && zNear.length > 0) {
							newGroup.zNear = parseFloat(zNear[0].textContent);
						}
						var zFar = opticChild[0].getElementsByTagName("zfar");
						if (zFar && zFar.length > 0) {
							newGroup.zFar = parseFloat(zFar[0].textContent);
						}
					}
				}
				break;
				// JHD - End
			case "matrix":
				matrix=this.parseArray(child);
				break;
			case "translate":
				data=this.parseArray(child);
				matrix=GLGE.mulMat4(matrix,GLGE.translateMatrix(data[0],data[1],data[2]));
				break;
			case "rotate":
				data=this.parseArray(child);
				matrix=GLGE.mulMat4(matrix,GLGE.angleAxis(data[3]*0.017453278,[data[0],data[1],data[2]]));
				break;
			case "scale":
				data=this.parseArray(child);
				matrix=GLGE.mulMat4(matrix,GLGE.scaleMatrix(data[0],data[1],data[2]));
				break;
		}
	}while(child=child.nextSibling);
	
	newGroup.setLoc(matrix[3],matrix[7],matrix[11]);
	var mat=GLGE.Mat4([matrix[0], matrix[1], matrix[2], 0,
								matrix[4], matrix[5], matrix[6], 0,
								matrix[8], matrix[9], matrix[10], 0,
								0, 0, 0, 1]);
			
	newGroup.setRotMatrix(mat);
	
	if(ref) node.GLGEObject=newGroup;
	
	return newGroup;
};
/**
* Initializes the Object/Scene when the collada document has been loaded
* @private
*/
GLGE.Collada.prototype.initVisualScene=function(){
    var metadata=this.xml.getElementsByTagName("asset");
    var up_axis="Z_UP";
    if(metadata.length) {
        var up_axis_node=metadata[0].getElementsByTagName("up_axis");
        if (up_axis_node.length) {
            up_axis_node=up_axis_node[0];
            var cur_axis=up_axis_node.firstChild.nodeValue;
            if (cur_axis.length)
                up_axis=cur_axis;
        }
    }
    var transformRoot=this;
    if (up_axis[0]!="Y"&&up_axis[0]!="y") {
        transformRoot = new GLGE.Group();
        this.addChild(transformRoot);
        if (up_axis[0]!="Z"&&up_axis[0]!="z") {
            transformRoot.setRotMatrix(GLGE.Mat4([0, -1 , 0,  0,
					                     1, 0, 0, 0,
					                     0, 0, 1, 0,
					                     0, 0, 0, 1]));
          
        }else {
            transformRoot.setRotMatrix(GLGE.Mat4([1, 0 , 0,  0,
					                     0, 0, 1, 0,
					                     0, -1, 0, 0,
					                     0, 0, 0, 1]));
            
        }
    }
	if(!this.rootId){
		var scene=this.xml.getElementsByTagName("scene");
		if(scene.length>0){
			transformRoot.addGroup(this.getNode(scene[0]));
		}else{
			GLGE.error("Please indicate the asset to render in Collada Document"+this.url);
		}
	}else{
		var root=this.xml.getElementById(this.rootId);
		if(root){
			transformRoot.addGroup(this.getNode(root));
		}else{
			GLGE.error("Asset "+this.rootId+" not found in document"+this.url);
		}
	}
	
	if(this.useCamera){
		// JHD
		var tempCamera;
		var findChild = function(root) {
			if (root.hasCamera) {
				tempCamera = root;
				return;
			}
			if (!root.children) {
				return;
			}
			for ( var i = 0; i < root.children.length && !tempCamera; i++) {
				findChild(root.children[i]);
			}
		};
		findChild(transformRoot);
		if (tempCamera) {
			pp = transformRoot.parent.parent;
			pp.camera.locX = tempCamera.locX;
			pp.camera.locY = tempCamera.locY;
			pp.camera.locZ = tempCamera.locZ;
			if (tempCamera.children && tempCamera.children.length > 0) {
				var child = tempCamera.children[0];
				if (child.yFov) {
					pp.camera.fovy = child.yFov;
					pp.camera.pMatrix = null;
				}
				// TODO: Does this really get applied into WebGL states?
				if (child.zNear) {
					pp.camera.near = child.zNear;
				}
				if (child.zFar) {
					pp.camera.far = child.zFar;
				}
			}
			// Clear camera cache - The camera has, at this point, already been
			// calculated!
			pp.camera.matrix = null;
			pp.camera.rotmatrix = tempCamera.rotmatrix;
			pp.camera.lookAt = null;
		}
		// JHD - End
	}
	
};


/**
* Exceptions for the bad exports out there, I'm sure there will be many more :-(
*/
var exceptions={
	"default":{},
	"COLLADA Mixamo exporter":{badAccessor:true},
	"FBX COLLADA exporter":{badAccessor:true},
	"Blender2.5":{flipangle:true,negjoints:true}
}
	
GLGE.Collada.prototype.getExceptions=function(){
	if(this.xml.getElementsByTagName("authoring_tool").length>0 && this.xml.getElementsByTagName("authoring_tool")[0].firstChild.nodeValue=="COLLADA Mixamo exporter"){
		return exceptions["COLLADA Mixamo exporter"];
	}
	if(this.xml.getElementsByTagName("authoring_tool").length>0 && this.xml.getElementsByTagName("authoring_tool")[0].firstChild.nodeValue=="FBX COLLADA exporter"){
		return exceptions["FBX COLLADA exporter"];
	}
	if(this.xml.getElementsByTagName("authoring_tool").length>0 && /Blender 2.5/.test(this.xml.getElementsByTagName("authoring_tool")[0].firstChild.nodeValue)){
		return exceptions["Blender2.5"];
	}
}
/**
* Called when a collada document has is loaded
* @param {string} url the url of the loaded document
* @param {DOM Document} xml the xml document
* @private
*/
GLGE.Collada.prototype.loaded=function(url,xml){
	this.xml=xml;
	if(xml.getElementsByTagName("authoring_tool").length>0) this.exceptions=exceptions[xml.getElementsByTagName("authoring_tool")[0].firstChild.nodeValue];
	this.exceptions=this.getExceptions();
	if(!this.exceptions) this.exceptions=exceptions['default'];
/// FIXME -- I used to have some try/catches going on here to avoid silent fails
	this.initVisualScene();
	this.getAnimations();
    if (this.loadedCallback) {
        this.loadedCallback(this);
    }
    //WTF firefox gets here too soon????
    var collada=this;
    setTimeout(function(){
        collada.fireEvent("loaded",{url:this.url});
        if(collada.isComplete()) collada.fireEvent("downloadComplete",{});
    },1);
};

GLGE.Scene.prototype.addCollada=GLGE.Scene.prototype.addGroup;
GLGE.Group.prototype.addCollada=GLGE.Group.prototype.addGroup;


if(GLGE.Document){
	/**
	* Parses the dom element and creates a collada object
	* @param {domelement} ele the element to create the objects from
	* @private
	*/
	GLGE.Document.prototype.getCollada=function(ele){
		if(!ele.object){
			ele.object=new GLGE[this.classString(ele.tagName)]();
			ele.object.setDocument(ele.getAttribute("document"),this.getAbsolutePath(this.rootURL,null));
			ele.removeAttribute("document");
			this.setProperties(ele);
		}
		return ele.object;
	}
}

})(GLGE);
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_input.js
 * @author me@paulbrunt.co.uk
 */


 if(!GLGE){
	/**
	* @namespace Holds the functionality of the library
	*/
	var GLGE={};
}

(function(GLGE){
	/**
	* @class Creates a heightmap for a region of the world based on an image. Originally created as a quick and easy collision detection. At least until we have a better physics implementation.
	* @deprecated not intended as a permanent addition
	* @param {string} imageURL The url of the image to generate the hightmap for
	* @param {number} imageWidth The width of the image
	* @param {number} imageHeight The height of the image
	* @param {number} x1 The lower X bound of the height map in world coords
	* @param {number} x2 The upper X bound of the height map in world coords
	* @param {number} y1 The lower Y bound of the height map in world coords
	* @param {number} y2 The upper Y bound of the height map in world coords
	* @param {number} z1 The lower Z bound of the height map in world coords
	* @param {number} z2 The upper Z bound of the height map in world coords
	*/
	GLGE.HeightMap = function(imageURL, imageWidth, imageHeight, x1, x2, y1, y2, z1, z2){
		this.canvas = document.createElement("canvas");
		this.context = this.canvas.getContext('2d');
		this.canvas.width = imageWidth;
		this.canvas.height = imageHeight;
		this.minX = x1;
		this.maxX = x2;
		this.minY = y1;
		this.maxY = y2;
		this.minZ = z1;
		this.maxZ = z2;

		var image = new Image();
		image.heightmap = this;
		image.onload = function(e){
			this.heightmap.context.drawImage(this, 0, 0);
			this.heightmap.data = this.heightmap.context.getImageData(0, 0, this.heightmap.canvas.width, this.heightmap.canvas.height).data;
			this.heightmap.minImgValue = this.heightmap.data[0];
			this.heightmap.maxImgValue = this.heightmap.data[0];
			for (i = 0; i < this.heightmap.data.length; i += 4) {
				if (this.heightmap.data[i] < this.heightmap.minImgValue) {
					this.heightmap.minImgValue = this.heightmap.data[i];
				}
				if (this.heightmap.data[i] > this.heightmap.maxImgValue) {
			  		this.heightmap.maxImgValue = this.heightmap.data[i];
				}
			}
		};
		image.src = imageURL;
	}
	GLGE.HeightMap.prototype.canvas = null;
	GLGE.HeightMap.prototype.context = null;
	GLGE.HeightMap.prototype.minZ = null;
	GLGE.HeightMap.prototype.maxZ = null;
	GLGE.HeightMap.prototype.minY = null;
	GLGE.HeightMap.prototype.maxY = null;
	GLGE.HeightMap.prototype.minX = null;
	GLGE.HeightMap.prototype.maxX = null;
	GLGE.HeightMap.prototype.data = null;
	/**
	* Gets the pixel height at the specified image coords
	* @param {number} x the x image coord
	* @param {number} y the y image coord
	* @private
	*/
	GLGE.HeightMap.prototype.getPixelAt = function(x, y){
		if (this.data) {
			return (((this.data[(this.canvas.width * y + x) * 4]) - this.minImgValue) / (this.maxImgValue - this.minImgValue)) * (this.maxZ - this.minZ) + this.minZ;
		}
		else {
			return 0;
		}
	}
	/**
	* Function to get he height as specified x, y world coords
	* @param {number} x the x world coord
	* @param {number} y the y world coord
	* @returns {number} the height of the level in world units
	*/
	GLGE.HeightMap.prototype.getHeightAt = function(x, y){
		var retValue;
		if (this.lastx != undefined && x == this.lastx && y == this.lasty) {
			retValue = this.lastValue;
		}
		else {
			var imgX = Math.round((x - this.minX) / (this.maxX - this.minX) * this.canvas.width);
			var imgY = Math.round((y - this.minY) / (this.maxY - this.minY) * this.canvas.height);
			retValue = this.getPixelAt(imgX, imgY);
			this.lastValue = retValue;
		}
		this.lastx = x;
		this.lasty = y;
		return retValue;
	}
	/**
	* @class Monitors keyboard input for use in render loops
	*/
	GLGE.KeyInput=function(){
		if(!document.keyStates) document.keyStates=[];
		document.addEventListener("keydown",this.onKeyDown,false);
		document.addEventListener("keyup",this.onKeyUp,false);
	}
	/**
	* Tests if a key is pressed
	* @param {number} the keycode to check
	* @returns {boolean} key returns true if the key is being pressed
	*/
	GLGE.KeyInput.prototype.isKeyPressed=function(key){
		if(document.keyStates[key]) return true;
			else return false;
	};
	var skiptimmer=null;
	/**
	* document keydown event used to monitor the key states
	* @param {event} e the event being fired
	* @private
	*/
	GLGE.KeyInput.prototype.onKeyDown=function(e){
		document.keyStates[e.keyCode]=true;
	};
	/**
	* Document keyup event used to monitor the key states
	* @param {event} e the event being fired
	* @private
	*/
	GLGE.KeyInput.prototype.onKeyUp=function(e){
		document.keyStates[e.keyCode]=false;
	};
	/**
	* @class Monitors mouse input for use in render loops
	*/
	GLGE.MouseInput=function(element){
		this.element=element;
		this.element.mouseX=0;
		this.element.mouseY=0;
		if(!this.element.buttonState) this.element.buttonState=[];
		element.addEventListener("mousemove",this.onMouseMove,false);
		element.addEventListener("mousedown",this.onMouseDown,false);
		element.addEventListener("mouseup",this.onMouseUp,false);
	}
	GLGE.MouseInput.prototype.element=null;
	/**
	* Elements mousemove event used to monitor the mouse states
	* @param {event} e the event being fired
	* @private
	*/
	GLGE.MouseInput.prototype.onMouseMove=function(e){
		this.mouseX=e.clientX;
		this.mouseY=e.clientY;
	}
	/**
	* Elements mousedown event used to monitor the mouse states
	* @param {event} e the event being fired
	* @private
	*/
	GLGE.MouseInput.prototype.onMouseDown=function(e){
		this.buttonState[e.button]=true;
	}
	/**
	* Elements mouseup event used to monitor the mouse states
	* @param {event} e the event being fired
	* @private
	*/
	GLGE.MouseInput.prototype.onMouseUp=function(e){
		this.buttonState[e.button]=false;
	}
	/**
	* Tests if a mouse button is pressed
	* @param {number} button the button to check
	* @returns {boolean} returns true if the button is being pressed
	*/
	GLGE.MouseInput.prototype.isButtonDown=function(button){
		if(this.element.buttonState[button]) return true;
			else return false;
	}
	/**
	* Gets the mouse coords
	* @returns {object} the current mouse coors
	*/
	GLGE.MouseInput.prototype.getMousePosition=function(){
		return {x:this.element.mouseX,y:this.element.mouseY}
	}

	/**
	* @constant 
	* @description Enumeration for the left mouse button
	*/
	GLGE.MI_LEFT=0;
	/**
	* @constant 
	* @description Enumeration for the middle mouse button
	*/
	GLGE.MI_MIDDLE=1;
	/**
	* @constant 
	* @description Enumeration for the right mouse button
	*/
	GLGE.MI_RIGHT=2;

	/**
	* @constant 
	* @description Enumeration for the backspace key
	*/
	GLGE.KI_BACKSPACE=8;
	/**
	* @constant 
	* @description Enumeration for the tab key
	*/
	GLGE.KI_TAB=9;
	/**
	* @constant 
	* @description Enumeration for the enter key
	*/
	GLGE.KI_ENTER=13;
	/**
	* @constant 
	* @description Enumeration for the shift key
	*/
	GLGE.KI_SHIFT=16;
	/**
	* @constant 
	* @description Enumeration for the ctrl key
	*/
	GLGE.KI_CTRL=17;
	/**
	* @constant 
	* @description Enumeration for the alt key
	*/
	GLGE.KI_ALT=18;
	/**
	* @constant 
	* @description Enumeration for the pause/break key
	*/
	GLGE.KI_PAUSE_BREAK=19;
	/**
	* @constant 
	* @description Enumeration for the caps lock key
	*/
	GLGE.KI_CAPS_LOCK=20;
	/**
	* @constant 
	* @description Enumeration for the escape key
	*/
	GLGE.KI_ESCAPE=27;
	/**
	* @constant 
	* @description Enumeration for the page up key
	*/
	GLGE.KI_PAGE_UP=33;
	/**
	* @constant 
	* @description Enumeration for the page down key
	*/
	GLGE.KI_PAGE_DOWN=34;
	/**
	* @constant 
	* @description Enumeration for the end key
	*/
	GLGE.KI_END=35;
	/**
	* @constant 
	* @description Enumeration for the home key
	*/
	GLGE.KI_HOME=36;
	/**
	* @constant 
	* @description Enumeration for the left arrow key
	*/
	GLGE.KI_LEFT_ARROW=37;
	/**
	* @constant 
	* @description Enumeration for the up arrow key
	*/
	GLGE.KI_UP_ARROW=38;
	/**
	* @constant 
	* @description Enumeration for the right arrow key
	*/
	GLGE.KI_RIGHT_ARROW=39;
	/**
	* @constant 
	* @description Enumeration for the down arrow key
	*/
	GLGE.KI_DOWN_ARROW=40;
	/**
	* @constant 
	* @description Enumeration for the insert key
	*/
	GLGE.KI_INSERT=45;
	/**
	* @constant 
	* @description Enumeration for the delete key
	*/
	GLGE.KI_DELETE=46;
	/**
	* @constant 
	* @description Enumeration for the 0 key
	*/
	GLGE.KI_0=48;
	/**
	* @constant 
	* @description Enumeration for the 1 key
	*/
	GLGE.KI_1=49;
	/**
	* @constant 
	* @description Enumeration for the 2 key
	*/
	GLGE.KI_2=50;
	/**
	* @constant 
	* @description Enumeration for the 3 key
	*/
	GLGE.KI_3=51;
	/**
	* @constant 
	* @description Enumeration for the 4 key
	*/
	GLGE.KI_4=52;
	/**
	* @constant 
	* @description Enumeration for the 5 key
	*/
	GLGE.KI_5=53;
	/**
	* @constant 
	* @description Enumeration for the 6 key
	*/
	GLGE.KI_6=54;
	/**
	* @constant 
	* @description Enumeration for the 7 key
	*/
	GLGE.KI_7=55;
	/**
	* @constant 
	* @description Enumeration for the 8 key
	*/
	GLGE.KI_8=56;
	/**
	* @constant 
	* @description Enumeration for the 9 key
	*/
	GLGE.KI_9=57;
	/**
	* @constant 
	* @description Enumeration for the a key
	*/
	GLGE.KI_A=65;
	/**
	* @constant 
	* @description Enumeration for the b key
	*/
	GLGE.KI_B=66;
	/**
	* @constant 
	* @description Enumeration for the c key
	*/
	GLGE.KI_C=67;
	/**
	* @constant 
	* @description Enumeration for the d key
	*/
	GLGE.KI_D=68;
	/**
	* @constant 
	* @description Enumeration for the e key
	*/
	GLGE.KI_E=69;
	/**
	* @constant 
	* @description Enumeration for the f key
	*/
	GLGE.KI_F=70;
	/**
	* @constant 
	* @description Enumeration for the g key
	*/
	GLGE.KI_G=71;
	/**
	* @constant 
	* @description Enumeration for the h key
	*/
	GLGE.KI_H=72;
	/**
	* @constant 
	* @description Enumeration for the i key
	*/
	GLGE.KI_I=73;
	/**
	* @constant 
	* @description Enumeration for the j key
	*/
	GLGE.KI_J=74;
	/**
	* @constant 
	* @description Enumeration for the k key
	*/
	GLGE.KI_K=75;
	/**
	* @constant 
	* @description Enumeration for the l key
	*/
	GLGE.KI_L=76;
	/**
	* @constant 
	* @description Enumeration for the m key
	*/
	GLGE.KI_M=77;
	/**
	* @constant 
	* @description Enumeration for the n key
	*/
	GLGE.KI_N=78;
	/**
	* @constant 
	* @description Enumeration for the o key
	*/
	GLGE.KI_O=79;
	/**
	* @constant 
	* @description Enumeration for the p key
	*/
	GLGE.KI_P=80;
	/**
	* @constant 
	* @description Enumeration for the q key
	*/
	GLGE.KI_Q=81;
	/**
	* @constant 
	* @description Enumeration for the r key
	*/
	GLGE.KI_R=82;
	/**
	* @constant 
	* @description Enumeration for the s key
	*/
	GLGE.KI_S=83;
	/**
	* @constant 
	* @description Enumeration for the t key
	*/
	GLGE.KI_T=84;
	/**
	* @constant 
	* @description Enumeration for the u key
	*/
	GLGE.KI_U=85;
	/**
	* @constant 
	* @description Enumeration for the v key
	*/
	GLGE.KI_V=86;
	/**
	* @constant 
	* @description Enumeration for the w key
	*/
	GLGE.KI_W=87;
	/**
	* @constant 
	* @description Enumeration for the x key
	*/
	GLGE.KI_X=88;
	/**
	* @constant 
	* @description Enumeration for the y key
	*/
	GLGE.KI_Y=89;
	/**
	* @constant 
	* @description Enumeration for the z key
	*/
	GLGE.KI_Z=90;
	/**
	* @constant 
	* @description Enumeration for the left window key key
	*/
	GLGE.KI_LEFT_WINDOW_KEY=91;
	/**
	* @constant 
	* @description Enumeration for the right window key key
	*/
	GLGE.KI_RIGHT_WINDOW_KEY=92;
	/**
	* @constant 
	* @description Enumeration for the select key key
	*/
	GLGE.KI_SELECT_KEY=93;
	/**
	* @constant 
	* @description Enumeration for the numpad 0 key
	*/
	GLGE.KI_NUMPAD_0=96;
	/**
	* @constant 
	* @description Enumeration for the numpad 1 key
	*/
	GLGE.KI_NUMPAD_1=97;
	/**
	* @constant 
	* @description Enumeration for the numpad 2 key
	*/
	GLGE.KI_NUMPAD_2=98;
	/**
	* @constant 
	* @description Enumeration for the numpad 3 key
	*/
	GLGE.KI_NUMPAD_3=99;
	/**
	* @constant 
	* @description Enumeration for the numpad 4 key
	*/
	GLGE.KI_NUMPAD_4=100;
	/**
	* @constant 
	* @description Enumeration for the numpad 5 key
	*/
	GLGE.KI_NUMPAD_5=101;
	/**
	* @constant 
	* @description Enumeration for the numpad 6 key
	*/
	GLGE.KI_NUMPAD_6=102;
	/**
	* @constant 
	* @description Enumeration for the numpad 7 key
	*/
	GLGE.KI_NUMPAD_7=103;
	/**
	* @constant 
	* @description Enumeration for the numpad 8 key
	*/
	GLGE.KI_NUMPAD_8=104;
	/**
	* @constant 
	* @description Enumeration for the numpad 9 key
	*/
	GLGE.KI_NUMPAD_9=105;
	/**
	* @constant 
	* @description Enumeration for the multiply key
	*/
	GLGE.KI_MULTIPLY=106;
	/**
	* @constant 
	* @description Enumeration for the add key
	*/
	GLGE.KI_ADD=107;
	/**
	* @constant 
	* @description Enumeration for the subtract key
	*/
	GLGE.KI_SUBTRACT=109;
	/**
	* @constant 
	* @description Enumeration for the decimal point key
	*/
	GLGE.KI_DECIMAL_POINT=110;
	/**
	* @constant 
	* @description Enumeration for the divide key
	*/
	GLGE.KI_DIVIDE=111;
	/**
	* @constant 
	* @description Enumeration for the f1 key
	*/
	GLGE.KI_F1=112;
	/**
	* @constant 
	* @description Enumeration for the f2 key
	*/
	GLGE.KI_F2=113;
	/**
	* @constant 
	* @description Enumeration for the f3 key
	*/
	GLGE.KI_F3=114;
	/**
	* @constant 
	* @description Enumeration for the f4 key
	*/
	GLGE.KI_F4=115;
	/**
	* @constant 
	* @description Enumeration for the f5 key
	*/
	GLGE.KI_F5=116;
	/**
	* @constant 
	* @description Enumeration for the f6 key
	*/
	GLGE.KI_F6=117;
	/**
	* @constant 
	* @description Enumeration for the f7 key
	*/
	GLGE.KI_F7=118;
	/**
	* @constant 
	* @description Enumeration for the f8 key
	*/
	GLGE.KI_F8=119;
	/**
	* @constant 
	* @description Enumeration for the f9 key
	*/
	GLGE.KI_F9=120;
	/**
	* @constant 
	* @description Enumeration for the f10 key
	*/
	GLGE.KI_F10=121;
	/**
	* @constant 
	* @description Enumeration for the f11 key
	*/
	GLGE.KI_F11=122;
	/**
	* @constant 
	* @description Enumeration for the f12 key
	*/
	GLGE.KI_F12=123;
	/**
	* @constant 
	* @description Enumeration for the num lock key
	*/
	GLGE.KI_NUM_LOCK=144;
	/**
	* @constant 
	* @description Enumeration for the scroll lock key
	*/
	GLGE.KI_SCROLL_LOCK=145;
	/**
	* @constant 
	* @description Enumeration for the semi-colon key
	*/
	GLGE.KI_SEMI_COLON=186;
	/**
	* @constant 
	* @description Enumeration for the equal sign key
	*/
	GLGE.KI_EQUAL_SIGN=187;
	/**
	* @constant 
	* @description Enumeration for the comma key
	*/
	GLGE.KI_COMMA=188;
	/**
	* @constant 
	* @description Enumeration for the dash key
	*/
	GLGE.KI_DASH=189;
	/**
	* @constant 
	* @description Enumeration for the period key
	*/
	GLGE.KI_PERIOD=190;
	/**
	* @constant 
	* @description Enumeration for the forward slash key
	*/
	GLGE.KI_FORWARD_SLASH=191;
	/**
	* @constant 
	* @description Enumeration for the grave accent key
	*/
	GLGE.KI_GRAVE_ACCENT=192;
	/**
	* @constant 
	* @description Enumeration for the open bracket key
	*/
	GLGE.KI_OPEN_BRACKET=219;
	/**
	* @constant 
	* @description Enumeration for the back slash key
	*/
	GLGE.KI_BACK_SLASH=220;
	/**
	* @constant 
	* @description Enumeration for the close braket key
	*/
	GLGE.KI_CLOSE_BRAKET=221;
	/**
	* @constant 
	* @description Enumeration for the single quote key
	*/
	GLGE.KI_SINGLE_QUOTE=222;
	/**
	* @constant 
	* @description Enumeration for the space key
	*/
	GLGE.KI_SPACE=32;
	
	
	//code by @paul_irish
	if ( !window.requestAnimationFrame ) {

		window.requestAnimationFrame = ( function() {

			return window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function( /* function FrameRequestCallback */ callback, /* DOMElement Element */ element ) {

				window.setTimeout( callback, 1000 / 60 );

			};

		} )();

	}
	
})(GLGE);



/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_wavefront.js
 * @author me@paulbrunt.co.uk
 */

(function(GLGE){
/**
* @class parses and displays a warefront object file with mtl material
* @param {string} uid the unique id for this object
* @augments GLGE.Object
*/
GLGE.Wavefront=function(uid){
	this.multimaterials=[];
	this.materials={};
	this.instances=[];
	this.queue=[];
	this.idMaterials = [];//storaged name of material (string)
	GLGE.Object.call(this,uid);
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.Object,GLGE.Wavefront);
/**
* Gets the absolute path given an import path and the path it's relative to
* @param {string} path the path to get the absolute path for
* @param {string} relativeto the path the supplied path is relativeto
* @returns {string} absolute path
* @private
*/
GLGE.Wavefront.prototype.getAbsolutePath=function(path,relativeto){
	if(path.substr(0,7)=="http://" || path.substr(0,7)=="file://"  || path.substr(0,8)=="https://"){
		return path;
	}
	else
	{
		if(!relativeto){
			relativeto=window.location.href;
		}
		if(relativeto.indexOf("?")>0){
			relativeto=relativeto.substr(0,relativeto.indexOf("?"));
		}
		//find the path compoents
		var bits=relativeto.split("/");
		var domain=bits[2];
		var proto=bits[0];
		var initpath=[];
		for(var i=3;i<bits.length-1;i++){
			initpath.push(bits[i]);
		}
		//relative to domain
		if(path.substr(0,1)=="/"){
			initpath=[];
		}
		var locpath=path.split("/");
		for(i=0;i<locpath.length;i++){
			if(locpath[i]=="..") initpath.pop();
				else if(locpath[i]!="") initpath.push(locpath[i]);
		}
		return proto+"//"+domain+"/"+initpath.join("/");
	}
};



/**
* Loads a material file from a url
* @param {string} url the url of the material file
* @private
*/
GLGE.Wavefront.prototype.loadMaterials=function(url){
	if(!this.loading){
		this.loadFile(url,null,function(url,text){
			this.parseMaterials(text.split("\n"));
			if(this.queue.length>0){
				var matUrl=this.queue.pop();
				this.loadMaterials(matUrl,this.src);
			}else{
				this.parseMesh();
				this.fireEvent("loaded",{});
			}
		});
	}else{
		this.queue.push(url);
	}

};
/**
* creates the GLGE materials from a mtl file
* @param {string} file the file to parse
* @private
*/
GLGE.Wavefront.prototype.parseMaterials=function(file){
	//loop though all lines and look for matlibs
	var j = 0;
	var i = 0;
	var index = 0;
	var idNameMaterial;
	while(i<file.length)
	{
		//newmtl
		if(file[i].substr(0,6)=="newmtl")
		{
			var data=file[i].replace(/^\s+|\s+$/g,"").replace(/\s+/g," ").split(" ");
			var material=new GLGE.Material;
			idNameMaterial = file[j].substr(7);
			j=i+1;
			
			while(file[j].substr(0,6) != "newmtl")
			{
				
				data=file[j].replace(/^\s+|\s+$/g,"").replace(/\s+/g," ").split(" ");
				if(data.length>1)
				{
					switch(data[0]){
						case "Kd":
							material.setColorR(parseFloat(data[1]));
							material.setColorG(parseFloat(data[2]));
							material.setColorB(parseFloat(data[3]));
							break;
						case "Ks":
							material.setSpecularColor({r:parseFloat(data[1]),g:parseFloat(data[2]),b:parseFloat(data[3])});
							break;
						case "Ns":
							material.setShininess(parseFloat(data[1]));
							break;
						case "d":
							this.setZtransparent(true);
							material.setAlpha(parseFloat(data[1]));
							break;
						case "map_Kd":
							var ml=new GLGE.MaterialLayer;
							ml.setMapto(GLGE.M_COLOR);
							ml.setMapinput(GLGE.UV1);
							var tex=new GLGE.Texture;
							var k=1;
							while(data[k][0]=="-") k=k+2;
							tex.setSrc(this.getAbsolutePath(data[k],this.relativeTo));
							material.addTexture(tex);
							ml.setTexture(tex);
							material.addMaterialLayer(ml);
							break;
						case "map_Ks":
						case "map_spec":
							var ml=new GLGE.MaterialLayer;
							ml.setMapto(GLGE.M_SPECULAR);
							ml.setMapinput(GLGE.UV1);
							var tex=new GLGE.Texture;
							var k=1;
							while(data[k][0]=="-") k=k+2;
							tex.setSrc(this.getAbsolutePath(data[k],this.relativeTo));
							material.addTexture(tex);
							ml.setTexture(tex);
							material.addMaterialLayer(ml);
							break;
						case "bump":
						case "map_bump":
							var ml=new GLGE.MaterialLayer;
							ml.setMapto(GLGE.M_NOR);
							ml.setMapinput(GLGE.UV1);
							var tex=new GLGE.Texture;
							var k=1;
							while(data[k][0]=="-") k=k+2;
							tex.setSrc(this.getAbsolutePath(data[k],this.relativeTo));
							material.addTexture(tex);
							ml.setTexture(tex);
							material.addMaterialLayer(ml);
							break;
					}
				}
				j++;
				if(j>=file.length)
					break;
			}
			i=j-1;
			this.materials[index]=material;
			this.idMaterials.push(idNameMaterial);
			index++;
		}
		i++;
	}
};
/**
* loads a resource from a url
* @param {string} url the url of the resource to load
* @param {string} relativeTo the url to load relative to
* @param {function} callback thefunction to call once the file is loaded
* @private
*/
GLGE.Wavefront.prototype.loadFile=function(url,relativeTo,callback){
	this.loading=true;
	if(!callback) callback=this.loaded;
	if(!relativeTo && this.relativeTo) relativeTo=this.relativeTo;
	url=this.getAbsolutePath(url,relativeTo);
	if(!this.relativeTo) this.relativeTo=url;
	var req = new XMLHttpRequest();
	var that=this;
	if(req) {
		req.overrideMimeType("text/plain")
		req.onreadystatechange = function() {
			if(this.readyState  == 4)
			{
				if(this.status  == 200 || this.status==0){
					that.loading=false;
					callback.call(that,url,this.responseText);
				}else{ 
					GLGE.error("Error loading Document: "+url+" status "+this.status);
				}
			}
		};
		req.open("GET", url, true);
		req.send("");
	}	
}
/**
* loads a wavefront ojvect from a given url
* @param {DOM Element} url the url to retrieve
* @param {string} relativeTo optional the path the url is relative to
*/
GLGE.Wavefront.prototype.setSrc=function(url,relativeTo){
	this.src=this.getAbsolutePath(url,relativeTo);
	this.loadFile(this.src,relativeTo);
};
/**
* loads a resource from a url
* @param {string} url the url of the resource loaded
* @param {string} objfile the loaded file
* @private
*/
GLGE.Wavefront.prototype.loaded=function(url,objfile){
	this.file=objArray=objfile.split("\n");
	var hasMaterial=false;
	//loop through the file and load the Materials
	for(var i=0;i<objArray.length;i++){
		var data=objArray[i].split(" ");
		if(data.length>1){
			if(data[0]=="mtllib"){
				hasMaterial=true;
				this.loadMaterials(data[1]);
			}
		}
	}
	if(!hasMaterial){
		this.parseMesh();
		this.fireEvent("loaded",{});
	}
	
};
/**
* creates a new multimaterial
* @private
*/
GLGE.Wavefront.prototype.createMultiMaterial=function(idxDataOrig,idxDataOrigMap,verts,norms,texCoords,faces,material,smooth){
	//loop though the indexes to produce streams
	var positions=[];
	var normals=[];
	var uv=[];
	var newfaces=[];
	var idxData=[];
	var idxDataMap={};
	for(var i=0;i<faces.length;i++){
		var data=idxDataOrig[faces[i]];
		var idx=idxDataMap[data];
		if((typeof idx === "undefined") || !smooth){
			idxData.push(data);
			idxDataMap[data]=idxData.length-1;
			newfaces.push(idxData.length-1);
		}else{
			newfaces.push(idxDataMap[data]);
		}
	}
	faces=newfaces;
	for(i=0;i<idxData.length;i++){
		if(idxData[i].indexOf("/")>0) var vertData=idxData[i].split("/");
			else var vertData=[idxData[i]];
		if(!verts[vertData[0]-1]) GLGE.error(vertData[0]);
		positions.push(verts[vertData[0]-1][1]);
		positions.push(verts[vertData[0]-1][2]);
		positions.push(verts[vertData[0]-1][3]);
		if(vertData[1]){
			uv.push(texCoords[vertData[1]-1][1]);
			uv.push(texCoords[vertData[1]-1][2]);
		}
		if(vertData[2]){
			normals.push(norms[vertData[2]-1][1]);
			normals.push(norms[vertData[2]-1][2]);
			normals.push(norms[vertData[2]-1][3]);
		}
	}
	if(positions.length/3>65024){
		var newPositions=[];
		var newNormals=[];
		var newUVs=[];
		for(var i=0;i<faces.length;i++){
			newPositions.push(positions[faces[i]*3],positions[faces[i]*3+1],positions[faces[i]*3+2]);
			if(normals.length>0) newNormals.push(normals[faces[i]*3],normals[faces[i]*3+1],normals[faces[i]*3+2]);
			if(uv.length>0) newUVs.push(uv[faces[i]*2],uv[faces[i]*2+1]);
		}
		positions=newPositions;
		normals=newNormals;
		uv=newUVs;
		faces=[];
	}
	var multiMat=new GLGE.MultiMaterial;
	var mesh=new GLGE.Mesh;
	
	mesh.setPositions(positions);
	if(normals.length>0) mesh.setNormals(normals);
	if(uv.length>0) mesh.setUV(uv);
	if(faces.length>0) mesh.setFaces(faces);
	multiMat.setMesh(mesh);
	multiMat.setMaterial(material);
	this.addMultiMaterial(multiMat);

}
/**
* Parses the mesh
* @private
*/
GLGE.Wavefront.prototype.parseMesh=function(){
	objArray=this.file;
	var texCoords=[];
	var verts=[];
	var norms=[];
	var faces=[];
	var idxData=[];
	var idxDataMap={};
	var vertoffset=0;
	var smooth=true;
	var material=new GLGE.Material;
	for(var i=0;i<objArray.length;i++){
		if(objArray[i][0]!="#"){
			var data=objArray[i].replace(/^\s+|\s+$/g,"").replace(/\s+/g," ").split(" ");
			if(data.length>0){
				switch(data[0]){
					case "s":
						if(data[1]=="1") smooth=true;
							else smooth=false;
					case "o":
						if(faces.length>0){
							this.createMultiMaterial(idxData,idxDataMap,verts,norms,texCoords,faces,material,smooth);
							faces=[];
							material=new GLGE.Material;
						}
						break;
					case "usemtl":
						if(faces.length>0){
							this.createMultiMaterial(idxData,idxDataMap,verts,norms,texCoords,faces,material,smooth);
							faces=[];
						}
						if(this.idMaterials.indexOf(data[1]) == -1)//Material no name 
							material=this.materials[0];//default
						else
							material=this.materials[this.idMaterials.indexOf(data[1])];//get Idname material
						break;
					case "v":
						verts.push(data);
						break;
					case "vt":
						texCoords.push(data);
						break;
					case "vn":
						norms.push(data);
						break;
					case "f":
						var tmpface=[];
						for(var j=1;j<data.length;j++){
							var idx=idxDataMap[data[j]];
							if((typeof idx === "undefined") || !smooth){
								idxData.push(data[j]);
								idx=idxData.length-1;
								idxDataMap[data[j]]=idx;
							}
							tmpface.push(idx);
						}
						for(j=0;j<tmpface.length-2;j++){
							faces.push(tmpface[0]-vertoffset);
							faces.push(tmpface[1+j]-vertoffset);
							faces.push(tmpface[2+j]-vertoffset);
						}
						break;
				}
			}
		}
	}
	this.createMultiMaterial(idxData,idxDataMap,verts,norms,texCoords,faces,material,smooth);
};

/**
* Parses the dom element and creates a texture
* @param {domelement} ele the element to create the objects from
* @private
*/
GLGE.Document.prototype.getWavefront=function(ele){
	if(!ele.object){
		var rel=this.getAbsolutePath(this.rootURL,null);
		ele.object=new GLGE[this.classString(ele.tagName)];
		//ele.object.setSrc(this.getAbsolutePath(ele.getAttribute("src"),rel));
		ele.object.setSrc(ele.getAttribute("src"),rel);
		ele.removeAttribute("src");
		this.setProperties(ele);
	}
	return ele.object;
}
})(GLGE);

/*
Copyright (c) 2011 Juan Mellado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
References:
- "LZMA SDK" by Igor Pavlov
  http://www.7-zip.org/sdk.html
*/

var LZMA = LZMA || {};

LZMA.OutWindow = function(){
  this._windowSize = 0;
};

LZMA.OutWindow.prototype.create = function(windowSize){
  if ( (!this._buffer) || (this._windowSize !== windowSize) ){
    this._buffer = [];
  }
  this._windowSize = windowSize;
  this._pos = 0;
  this._streamPos = 0;
};

LZMA.OutWindow.prototype.flush = function(){
  var size = this._pos - this._streamPos;
  if (size !== 0){
    while(size --){
      this._stream.writeByte(this._buffer[this._streamPos ++]);
    }
    if (this._pos >= this._windowSize){
      this._pos = 0;
    }
    this._streamPos = this._pos;
  }
};

LZMA.OutWindow.prototype.releaseStream = function(){
  this.flush();
  this._stream = null;
};

LZMA.OutWindow.prototype.setStream = function(stream){
  this.releaseStream();
  this._stream = stream;
};

LZMA.OutWindow.prototype.init = function(solid){
  if (!solid){
    this._streamPos = 0;
    this._pos = 0;
  }
};

LZMA.OutWindow.prototype.copyBlock = function(distance, len){
  var pos = this._pos - distance - 1;
  if (pos < 0){
    pos += this._windowSize;
  }
  while(len --){
    if (pos >= this._windowSize){
      pos = 0;
    }
    this._buffer[this._pos ++] = this._buffer[pos ++];
    if (this._pos >= this._windowSize){
      this.flush();
    }
  }
};

LZMA.OutWindow.prototype.putByte = function(b){
  this._buffer[this._pos ++] = b;
  if (this._pos >= this._windowSize){
    this.flush();
  }
};

LZMA.OutWindow.prototype.getByte = function(distance){
  var pos = this._pos - distance - 1;
  if (pos < 0){
    pos += this._windowSize;
  }
  return this._buffer[pos];
};

LZMA.RangeDecoder = function(){
};

LZMA.RangeDecoder.prototype.setStream = function(stream){
  this._stream = stream;
};

LZMA.RangeDecoder.prototype.releaseStream = function(){
  this._stream = null;
};

LZMA.RangeDecoder.prototype.init = function(){
  var i = 5;

  this._code = 0;
  this._range = -1;
  
  while(i --){
    this._code = (this._code << 8) | this._stream.readByte();
  }
};

LZMA.RangeDecoder.prototype.decodeDirectBits = function(numTotalBits){
  var result = 0, i = numTotalBits, t;

  while(i --){
    this._range >>>= 1;
    t = (this._code - this._range) >>> 31;
    this._code -= this._range & (t - 1);
    result = (result << 1) | (1 - t);

    if ( (this._range & 0xff000000) === 0){
      this._code = (this._code << 8) | this._stream.readByte();
      this._range <<= 8;
    }
  }

  return result;
};

LZMA.RangeDecoder.prototype.decodeBit = function(probs, index){
  var prob = probs[index],
      newBound = (this._range >>> 11) * prob;

  if ( (this._code ^ 0x80000000) < (newBound ^ 0x80000000) ){
    this._range = newBound;
    probs[index] += (2048 - prob) >>> 5;
    if ( (this._range & 0xff000000) === 0){
      this._code = (this._code << 8) | this._stream.readByte();
      this._range <<= 8;
    }
    return 0;
  }

  this._range -= newBound;
  this._code -= newBound;
  probs[index] -= prob >>> 5;
  if ( (this._range & 0xff000000) === 0){
    this._code = (this._code << 8) | this._stream.readByte();
    this._range <<= 8;
  }
  return 1;
};

LZMA.initBitModels = function(probs, len){
  while(len --){
    probs[len] = 1024;
  }
};

LZMA.BitTreeDecoder = function(numBitLevels){
  this._models = [];
  this._numBitLevels = numBitLevels;
};

LZMA.BitTreeDecoder.prototype.init = function(){
  LZMA.initBitModels(this._models, 1 << this._numBitLevels);
};

LZMA.BitTreeDecoder.prototype.decode = function(rangeDecoder){
  var m = 1, i = this._numBitLevels;

  while(i --){
    m = (m << 1) | rangeDecoder.decodeBit(this._models, m);
  }
  return m - (1 << this._numBitLevels);
};

LZMA.BitTreeDecoder.prototype.reverseDecode = function(rangeDecoder){
  var m = 1, symbol = 0, i = 0, bit;

  for (; i < this._numBitLevels; ++ i){
    bit = rangeDecoder.decodeBit(this._models, m);
    m = (m << 1) | bit;
    symbol |= bit << i;
  }
  return symbol;
};

LZMA.reverseDecode2 = function(models, startIndex, rangeDecoder, numBitLevels){
  var m = 1, symbol = 0, i = 0, bit;

  for (; i < numBitLevels; ++ i){
    bit = rangeDecoder.decodeBit(models, startIndex + m);
    m = (m << 1) | bit;
    symbol |= bit << i;
  }
  return symbol;
};

LZMA.LenDecoder = function(){
  this._choice = [];
  this._lowCoder = [];
  this._midCoder = [];
  this._highCoder = new LZMA.BitTreeDecoder(8);
  this._numPosStates = 0;
};

LZMA.LenDecoder.prototype.create = function(numPosStates){
  for (; this._numPosStates < numPosStates; ++ this._numPosStates){
    this._lowCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
    this._midCoder[this._numPosStates] = new LZMA.BitTreeDecoder(3);
  }
};

LZMA.LenDecoder.prototype.init = function(){
  var i = this._numPosStates;
  LZMA.initBitModels(this._choice, 2);
  while(i --){
    this._lowCoder[i].init();
    this._midCoder[i].init();
  }
  this._highCoder.init();
};

LZMA.LenDecoder.prototype.decode = function(rangeDecoder, posState){
  if (rangeDecoder.decodeBit(this._choice, 0) === 0){
    return this._lowCoder[posState].decode(rangeDecoder);
  }
  if (rangeDecoder.decodeBit(this._choice, 1) === 0){
    return 8 + this._midCoder[posState].decode(rangeDecoder);
  }
  return 16 + this._highCoder.decode(rangeDecoder);
};

LZMA.Decoder2 = function(){
  this._decoders = [];
};

LZMA.Decoder2.prototype.init = function(){
  LZMA.initBitModels(this._decoders, 0x300);
};

LZMA.Decoder2.prototype.decodeNormal = function(rangeDecoder){
  var symbol = 1;

  do{
    symbol = (symbol << 1) | rangeDecoder.decodeBit(this._decoders, symbol);
  }while(symbol < 0x100);

  return symbol & 0xff;
};

LZMA.Decoder2.prototype.decodeWithMatchByte = function(rangeDecoder, matchByte){
  var symbol = 1, matchBit, bit;

  do{
    matchBit = (matchByte >> 7) & 1;
    matchByte <<= 1;
    bit = rangeDecoder.decodeBit(this._decoders, ( (1 + matchBit) << 8) + symbol);
    symbol = (symbol << 1) | bit;
    if (matchBit !== bit){
      while(symbol < 0x100){
        symbol = (symbol << 1) | rangeDecoder.decodeBit(this._decoders, symbol);
      }
      break;
    }
  }while(symbol < 0x100);

  return symbol & 0xff;
};

LZMA.LiteralDecoder = function(){
};

LZMA.LiteralDecoder.prototype.create = function(numPosBits, numPrevBits){
  var i;

  if (this._coders
    && (this._numPrevBits === numPrevBits)
    && (this._numPosBits === numPosBits) ){
    return;
  }
  this._numPosBits = numPosBits;
  this._posMask = (1 << numPosBits) - 1;
  this._numPrevBits = numPrevBits;

  this._coders = [];

  i = 1 << (this._numPrevBits + this._numPosBits);
  while(i --){
    this._coders[i] = new LZMA.Decoder2();
  }
};

LZMA.LiteralDecoder.prototype.init = function(){
  var i = 1 << (this._numPrevBits + this._numPosBits);
  while(i --){
    this._coders[i].init();
  }
};

LZMA.LiteralDecoder.prototype.getDecoder = function(pos, prevByte){
  return this._coders[( (pos & this._posMask) << this._numPrevBits)
    + ( (prevByte & 0xff) >>> (8 - this._numPrevBits) )];
};

LZMA.Decoder = function(){
  this._outWindow = new LZMA.OutWindow();
  this._rangeDecoder = new LZMA.RangeDecoder();
  this._isMatchDecoders = [];
  this._isRepDecoders = [];
  this._isRepG0Decoders = [];
  this._isRepG1Decoders = [];
  this._isRepG2Decoders = [];
  this._isRep0LongDecoders = [];
  this._posSlotDecoder = [];
  this._posDecoders = [];
  this._posAlignDecoder = new LZMA.BitTreeDecoder(4);
  this._lenDecoder = new LZMA.LenDecoder();
  this._repLenDecoder = new LZMA.LenDecoder();
  this._literalDecoder = new LZMA.LiteralDecoder();
  this._dictionarySize = -1;
  this._dictionarySizeCheck = -1;

  this._posSlotDecoder[0] = new LZMA.BitTreeDecoder(6);
  this._posSlotDecoder[1] = new LZMA.BitTreeDecoder(6);
  this._posSlotDecoder[2] = new LZMA.BitTreeDecoder(6);
  this._posSlotDecoder[3] = new LZMA.BitTreeDecoder(6);
};

LZMA.Decoder.prototype.setDictionarySize = function(dictionarySize){
  if (dictionarySize < 0){
    return false;
  }
  if (this._dictionarySize !== dictionarySize){
    this._dictionarySize = dictionarySize;
    this._dictionarySizeCheck = Math.max(this._dictionarySize, 1);
    this._outWindow.create( Math.max(this._dictionarySizeCheck, 4096) );
  }
  return true;
};

LZMA.Decoder.prototype.setLcLpPb = function(lc, lp, pb){
  var numPosStates = 1 << pb;

  if (lc > 8 || lp > 4 || pb > 4){
    return false;
  }

  this._literalDecoder.create(lp, lc);

  this._lenDecoder.create(numPosStates);
  this._repLenDecoder.create(numPosStates);
  this._posStateMask = numPosStates - 1;

  return true;
};

LZMA.Decoder.prototype.init = function(){
  var i = 4;

  this._outWindow.init(false);

  LZMA.initBitModels(this._isMatchDecoders, 192);
  LZMA.initBitModels(this._isRep0LongDecoders, 192);
  LZMA.initBitModels(this._isRepDecoders, 12);
  LZMA.initBitModels(this._isRepG0Decoders, 12);
  LZMA.initBitModels(this._isRepG1Decoders, 12);
  LZMA.initBitModels(this._isRepG2Decoders, 12);
  LZMA.initBitModels(this._posDecoders, 114);

  this._literalDecoder.init();

  while(i --){
    this._posSlotDecoder[i].init();
  }

  this._lenDecoder.init();
  this._repLenDecoder.init();
  this._posAlignDecoder.init();
  this._rangeDecoder.init();
};

LZMA.Decoder.prototype.decode = function(inStream, outStream, outSize){
  var state = 0, rep0 = 0, rep1 = 0, rep2 = 0, rep3 = 0, nowPos64 = 0, prevByte = 0,
      posState, decoder2, len, distance, posSlot, numDirectBits;

  this._rangeDecoder.setStream(inStream);
  this._outWindow.setStream(outStream);

  this.init();

  while(outSize < 0 || nowPos64 < outSize){
    posState = nowPos64 & this._posStateMask;

    if (this._rangeDecoder.decodeBit(this._isMatchDecoders, (state << 4) + posState) === 0){
      decoder2 = this._literalDecoder.getDecoder(nowPos64 ++, prevByte);

      if (state >= 7){
        prevByte = decoder2.decodeWithMatchByte(this._rangeDecoder, this._outWindow.getByte(rep0) );
      }else{
        prevByte = decoder2.decodeNormal(this._rangeDecoder);
      }
      this._outWindow.putByte(prevByte);

      state = state < 4? 0: state - (state < 10? 3: 6);

    }else{

      if (this._rangeDecoder.decodeBit(this._isRepDecoders, state) === 1){
        len = 0;
        if (this._rangeDecoder.decodeBit(this._isRepG0Decoders, state) === 0){
          if (this._rangeDecoder.decodeBit(this._isRep0LongDecoders, (state << 4) + posState) === 0){
            state = state < 7? 9: 11;
            len = 1;
          }
        }else{
          if (this._rangeDecoder.decodeBit(this._isRepG1Decoders, state) === 0){
            distance = rep1;
          }else{
            if (this._rangeDecoder.decodeBit(this._isRepG2Decoders, state) === 0){
              distance = rep2;
            }else{
              distance = rep3;
              rep3 = rep2;
            }
            rep2 = rep1;
          }
          rep1 = rep0;
          rep0 = distance;
        }
        if (len === 0){
          len = 2 + this._repLenDecoder.decode(this._rangeDecoder, posState);
          state = state < 7? 8: 11;
        }
      }else{
        rep3 = rep2;
        rep2 = rep1;
        rep1 = rep0;

        len = 2 + this._lenDecoder.decode(this._rangeDecoder, posState);
        state = state < 7? 7: 10;

        posSlot = this._posSlotDecoder[len <= 5? len - 2: 3].decode(this._rangeDecoder);
        if (posSlot >= 4){

          numDirectBits = (posSlot >> 1) - 1;
          rep0 = (2 | (posSlot & 1) ) << numDirectBits;

          if (posSlot < 14){
            rep0 += LZMA.reverseDecode2(this._posDecoders,
                rep0 - posSlot - 1, this._rangeDecoder, numDirectBits);
          }else{
            rep0 += this._rangeDecoder.decodeDirectBits(numDirectBits - 4) << 4;
            rep0 += this._posAlignDecoder.reverseDecode(this._rangeDecoder);
            if (rep0 < 0){
              if (rep0 === -1){
                break;
              }
              return false;
            }
          }
        }else{
          rep0 = posSlot;
        }
      }

      if (rep0 >= nowPos64 || rep0 >= this._dictionarySizeCheck){
        return false;
      }

      this._outWindow.copyBlock(rep0, len);
      nowPos64 += len;
      prevByte = this._outWindow.getByte(0);
    }
  }

  this._outWindow.flush();
  this._outWindow.releaseStream();
  this._rangeDecoder.releaseStream();

  return true;
};

LZMA.Decoder.prototype.setDecoderProperties = function(properties){
  var value, lc, lp, pb, dictionarySize;

  if (properties.size < 5){
    return false;
  }

  value = properties.readByte();
  lc = value % 9;
  value = ~~(value / 9);
  lp = value % 5;
  pb = ~~(value / 5);

  if ( !this.setLcLpPb(lc, lp, pb) ){
    return false;
  }

  dictionarySize = properties.readByte();
  dictionarySize |= properties.readByte() << 8;
  dictionarySize |= properties.readByte() << 16;
  dictionarySize += properties.readByte() * 16777216;

  return this.setDictionarySize(dictionarySize);
};

LZMA.decompress = function(properties, inStream, outStream, outSize){
  var decoder = new LZMA.Decoder();

  if ( !decoder.setDecoderProperties(properties) ){
    throw "Incorrect stream properties";
  }

  if ( !decoder.decode(inStream, outStream, outSize) ){
    throw "Error in data stream";
  }

  return true;
};

LZMA.decompressFile = function(inStream, outStream){
  var decoder = new LZMA.Decoder(), outSize;

  if ( !decoder.setDecoderProperties(inStream) ){
    throw "Incorrect stream properties";
  }

  outSize = inStream.readByte();
  outSize |= inStream.readByte() << 8;
  outSize |= inStream.readByte() << 16;
  outSize += inStream.readByte() * 16777216;

  inStream.readByte();
  inStream.readByte();
  inStream.readByte();
  inStream.readByte();

  if ( !decoder.decode(inStream, outStream, outSize) ){
    throw "Error in data stream";
  }

  return true;
};
/*
Copyright (c) 2011 Juan Mellado

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

/*
References:
- "OpenCTM: The Open Compressed Triangle Mesh file format" by Marcus Geelnard
  http://openctm.sourceforge.net/
*/

var CTM = CTM || {};

CTM.CompressionMethod = {
  RAW: 0x00574152,
  MG1: 0x0031474d,
  MG2: 0x0032474d
};

CTM.Flags = {
  NORMALS: 0x00000001
};

CTM.File = function(stream){
  this.load(stream);
};

CTM.File.prototype.load = function(stream){
  this.header = new CTM.FileHeader(stream);

  this.body = new CTM.FileBody(this.header);
  
  this.getReader().read(stream, this.body);
};

CTM.File.prototype.getReader = function(){
  var reader;

  switch(this.header.compressionMethod){
    case CTM.CompressionMethod.RAW:
      reader = new CTM.ReaderRAW();
      break;
    case CTM.CompressionMethod.MG1:
      reader = new CTM.ReaderMG1();
      break;
    case CTM.CompressionMethod.MG2:
      reader = new CTM.ReaderMG2();
      break;
  }

  return reader;
};

CTM.FileHeader = function(stream){
  stream.readInt32(); //magic "OCTM"
  this.fileFormat = stream.readInt32();
  this.compressionMethod = stream.readInt32();
  this.vertexCount = stream.readInt32();
  this.triangleCount = stream.readInt32();
  this.uvMapCount = stream.readInt32();
  this.attrMapCount = stream.readInt32();
  this.flags = stream.readInt32();
  this.comment = stream.readString();
};

CTM.FileHeader.prototype.hasNormals = function(){
  return this.flags & CTM.Flags.NORMALS;
};

CTM.FileBody = function(header){
  var i = header.triangleCount * 3,
      v = header.vertexCount * 3,
      n = header.hasNormals()? header.vertexCount * 3: 0,
      u = header.vertexCount * 2,
      a = header.vertexCount * 4,
      j = 0;

  var data = new ArrayBuffer(
    (i + v + n + (u * header.uvMapCount) + (a * header.attrMapCount) ) * 4);

  this.indices = new Uint32Array(data, 0, i);

  this.vertices = new Float32Array(data, i * 4, v);

  if ( header.hasNormals() ){
    this.normals = new Float32Array(data, (i + v) * 4, n);
  }
  
  if (header.uvMapCount){
    this.uvMaps = [];
    for (j = 0; j < header.uvMapCount; ++ j){
      this.uvMaps[j] = {uv: new Float32Array(data,
        (i + v + n + (j * u) ) * 4, u) };
    }
  }
  
  if (header.attrMapCount){
    this.attrMaps = [];
    for (j = 0; j < header.attrMapCount; ++ j){
      this.attrMaps[j] = {attr: new Float32Array(data,
        (i + v + n + (u * header.uvMapCount) + (j * a) ) * 4, a) };
    }
  }
};

CTM.FileMG2Header = function(stream){
  stream.readInt32(); //magic "MG2H"
  this.vertexPrecision = stream.readFloat32();
  this.normalPrecision = stream.readFloat32();
  this.lowerBoundx = stream.readFloat32();
  this.lowerBoundy = stream.readFloat32();
  this.lowerBoundz = stream.readFloat32();
  this.higherBoundx = stream.readFloat32();
  this.higherBoundy = stream.readFloat32();
  this.higherBoundz = stream.readFloat32();
  this.divx = stream.readInt32();
  this.divy = stream.readInt32();
  this.divz = stream.readInt32();
  
  this.sizex = (this.higherBoundx - this.lowerBoundx) / this.divx;
  this.sizey = (this.higherBoundy - this.lowerBoundy) / this.divy;
  this.sizez = (this.higherBoundz - this.lowerBoundz) / this.divz;
};

CTM.ReaderRAW = function(){
};

CTM.ReaderRAW.prototype.read = function(stream, body){
  this.readIndices(stream, body.indices);
  this.readVertices(stream, body.vertices);
  
  if (body.normals){
    this.readNormals(stream, body.normals);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderRAW.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readArrayInt32(indices);
};

CTM.ReaderRAW.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readArrayFloat32(vertices);
};

CTM.ReaderRAW.prototype.readNormals = function(stream, normals){
  stream.readInt32(); //magic "NORM"
  stream.readArrayFloat32(normals);
};

CTM.ReaderRAW.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();
    stream.readArrayFloat32(uvMaps[i].uv);
  }
};

CTM.ReaderRAW.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();
    stream.readArrayFloat32(attrMaps[i].attr);
  }
};

CTM.ReaderMG1 = function(){
};

CTM.ReaderMG1.prototype.read = function(stream, body){
  this.readIndices(stream, body.indices);
  this.readVertices(stream, body.vertices);
  
  if (body.normals){
    this.readNormals(stream, body.normals);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderMG1.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readInt32(); //packed size
  
  var interleaved = new CTM.InterleavedStream(indices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  CTM.restoreIndices(indices, indices.length);
};

CTM.ReaderMG1.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readInt32(); //packed size
  
  var interleaved = new CTM.InterleavedStream(vertices, 1);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readNormals = function(stream, normals){
  stream.readInt32(); //magic "NORM"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(normals, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
};

CTM.ReaderMG1.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();
    
    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

CTM.ReaderMG1.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();
    
    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  }
};

CTM.ReaderMG2 = function(){
};

CTM.ReaderMG2.prototype.read = function(stream, body){
  this.MG2Header = new CTM.FileMG2Header(stream);
  
  this.readVertices(stream, body.vertices);
  this.readIndices(stream, body.indices);
  
  if (body.normals){
    this.readNormals(stream, body);
  }
  if (body.uvMaps){
    this.readUVMaps(stream, body.uvMaps);
  }
  if (body.attrMaps){
    this.readAttrMaps(stream, body.attrMaps);
  }
};

CTM.ReaderMG2.prototype.readVertices = function(stream, vertices){
  stream.readInt32(); //magic "VERT"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(vertices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  
  var gridIndices = this.readGridIndices(stream, vertices);
  
  CTM.restoreVertices(vertices, this.MG2Header, gridIndices, this.MG2Header.vertexPrecision);
};

CTM.ReaderMG2.prototype.readGridIndices = function(stream, vertices){
  stream.readInt32(); //magic "GIDX"
  stream.readInt32(); //packed size
  
  var gridIndices = new Uint32Array(vertices.length / 3);
  
  var interleaved = new CTM.InterleavedStream(gridIndices, 1);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
  
  CTM.restoreGridIndices(gridIndices, gridIndices.length);
  
  return gridIndices;
};

CTM.ReaderMG2.prototype.readIndices = function(stream, indices){
  stream.readInt32(); //magic "INDX"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(indices, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  CTM.restoreIndices(indices, indices.length);
};

CTM.ReaderMG2.prototype.readNormals = function(stream, body){
  stream.readInt32(); //magic "NORM"
  stream.readInt32(); //packed size

  var interleaved = new CTM.InterleavedStream(body.normals, 3);
  LZMA.decompress(stream, stream, interleaved, interleaved.data.length);

  var smooth = CTM.calcSmoothNormals(body.indices, body.vertices);

  CTM.restoreNormals(body.normals, smooth, this.MG2Header.normalPrecision);
};

CTM.ReaderMG2.prototype.readUVMaps = function(stream, uvMaps){
  var i = 0;
  for (; i < uvMaps.length; ++ i){
    stream.readInt32(); //magic "TEXC"

    uvMaps[i].name = stream.readString();
    uvMaps[i].filename = stream.readString();
    
    var precision = stream.readFloat32();
    
    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(uvMaps[i].uv, 2);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
    
    CTM.restoreMap(uvMaps[i].uv, 2, precision);
  }
};

CTM.ReaderMG2.prototype.readAttrMaps = function(stream, attrMaps){
  var i = 0;
  for (; i < attrMaps.length; ++ i){
    stream.readInt32(); //magic "ATTR"

    attrMaps[i].name = stream.readString();
    
    var precision = stream.readFloat32();
    
    stream.readInt32(); //packed size

    var interleaved = new CTM.InterleavedStream(attrMaps[i].attr, 4);
    LZMA.decompress(stream, stream, interleaved, interleaved.data.length);
    
    CTM.restoreMap(attrMaps[i].attr, 4, precision);
  }
};

CTM.restoreIndices = function(indices, len){
  var i = 3;
  if (len > 0){
    indices[2] += indices[0];
  }
  for (; i < len; i += 3){
    indices[i] += indices[i - 3];
    
    if (indices[i] === indices[i - 3]){
      indices[i + 1] += indices[i - 2];
    }else{
      indices[i + 1] += indices[i];
    }

    indices[i + 2] += indices[i];
  }
};

CTM.restoreGridIndices = function(gridIndices, len){
  var i = 1;
  for (; i < len; ++ i){
    gridIndices[i] += gridIndices[i - 1];
  }
};

CTM.restoreVertices = function(vertices, grid, gridIndices, precision){
  var gridIdx, delta, x, y, z,
      intVertices = new Uint32Array(vertices.buffer, vertices.byteOffset, vertices.length),
      ydiv = grid.divx, zdiv = ydiv * grid.divy,
      prevGridIdx = 0x7fffffff, prevDelta = 0,
      i = 0, j = 0, len = gridIndices.length;

  for (; i < len; j += 3){
    x = gridIdx = gridIndices[i ++];
    
    z = ~~(x / zdiv);
    x -= ~~(z * zdiv);
    y = ~~(x / ydiv);
    x -= ~~(y * ydiv);

    delta = intVertices[j];
    if (gridIdx === prevGridIdx){
      delta += prevDelta;
    }

    vertices[j]     = grid.lowerBoundx +
      x * grid.sizex + precision * delta;
    vertices[j + 1] = grid.lowerBoundy +
      y * grid.sizey + precision * intVertices[j + 1];
    vertices[j + 2] = grid.lowerBoundz +
      z * grid.sizez + precision * intVertices[j + 2];

    prevGridIdx = gridIdx;
    prevDelta = delta;
  }
};

CTM.restoreNormals = function(normals, smooth, precision){
  var ro, phi, theta, sinPhi,
      nx, ny, nz, by, bz, len,
      intNormals = new Uint32Array(normals.buffer, normals.byteOffset, normals.length),
      i = 0, k = normals.length,
      PI_DIV_2 = 3.141592653589793238462643 * 0.5;

  for (; i < k; i += 3){
    ro = intNormals[i] * precision;
    phi = intNormals[i + 1];

    if (phi === 0){
      normals[i]     = smooth[i]     * ro;
      normals[i + 1] = smooth[i + 1] * ro;
      normals[i + 2] = smooth[i + 2] * ro;
    }else{
      
      if (phi <= 4){
        theta = (intNormals[i + 2] - 2) * PI_DIV_2;
      }else{
        theta = ( (intNormals[i + 2] * 4 / phi) - 2) * PI_DIV_2;
      }
      
      phi *= precision * PI_DIV_2;
      sinPhi = ro * Math.sin(phi);

      nx = sinPhi * Math.cos(theta);
      ny = sinPhi * Math.sin(theta);
      nz = ro * Math.cos(phi);

      bz = smooth[i + 1];
      by = smooth[i] - smooth[i + 2];

      len = Math.sqrt(2 * bz * bz + by * by);
      if (len > 1e-20){
        by /= len;
        bz /= len;
      }

      normals[i]     = smooth[i]     * nz +
        (smooth[i + 1] * bz - smooth[i + 2] * by) * ny - bz * nx;
      normals[i + 1] = smooth[i + 1] * nz -
        (smooth[i + 2]      + smooth[i]   ) * bz  * ny + by * nx;
      normals[i + 2] = smooth[i + 2] * nz +
        (smooth[i]     * by + smooth[i + 1] * bz) * ny + bz * nx;
    }
  }
};

CTM.restoreMap = function(map, count, precision){
  var delta, value,
      intMap = new Uint32Array(map.buffer, map.byteOffset, map.length),
      i = 0, j, len = map.length;

  for (; i < count; ++ i){
    delta = 0;

    for (j = i; j < len; j += count){
      value = intMap[j];
      
      delta += value & 1? -( (value + 1) >> 1): value >> 1;
      
      map[j] = delta * precision;
    }
  }
};

CTM.calcSmoothNormals = function(indices, vertices){
  var smooth = new Float32Array(vertices.length),
      indx, indy, indz, nx, ny, nz,
      v1x, v1y, v1z, v2x, v2y, v2z, len,
      i, k;

  for (i = 0, k = indices.length; i < k;){
    indx = indices[i ++] * 3;
    indy = indices[i ++] * 3;
    indz = indices[i ++] * 3;

    v1x = vertices[indy]     - vertices[indx];
    v2x = vertices[indz]     - vertices[indx];
    v1y = vertices[indy + 1] - vertices[indx + 1];
    v2y = vertices[indz + 1] - vertices[indx + 1];
    v1z = vertices[indy + 2] - vertices[indx + 2];
    v2z = vertices[indz + 2] - vertices[indx + 2];
    
    nx = v1y * v2z - v1z * v2y;
    ny = v1z * v2x - v1x * v2z;
    nz = v1x * v2y - v1y * v2x;
    
    len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 1e-10){
      nx /= len;
      ny /= len;
      nz /= len;
    }
    
    smooth[indx]     += nx;
    smooth[indx + 1] += ny;
    smooth[indx + 2] += nz;
    smooth[indy]     += nx;
    smooth[indy + 1] += ny;
    smooth[indy + 2] += nz;
    smooth[indz]     += nx;
    smooth[indz + 1] += ny;
    smooth[indz + 2] += nz;
  }

  for (i = 0, k = smooth.length; i < k; i += 3){
    len = Math.sqrt(smooth[i] * smooth[i] + 
      smooth[i + 1] * smooth[i + 1] +
      smooth[i + 2] * smooth[i + 2]);

    if(len > 1e-10){
      smooth[i]     /= len;
      smooth[i + 1] /= len;
      smooth[i + 2] /= len;
    }
  }

  return smooth;
};

CTM.isLittleEndian = (function(){
  var buffer = new ArrayBuffer(2),
      bytes = new Uint8Array(buffer),
      ints = new Uint16Array(buffer);

  bytes[0] = 1;

  return ints[0] === 1;
}());

CTM.InterleavedStream = function(data, count){
  this.data = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  this.offset = CTM.isLittleEndian? 3: 0;
  this.count = count * 4;
  this.len = this.data.length;
};

CTM.InterleavedStream.prototype.writeByte = function(value){
  this.data[this.offset] = value;
  
  this.offset += this.count;
  if (this.offset >= this.len){
  
    this.offset -= this.len - 4;
    if (this.offset >= this.count){
    
      this.offset -= this.count + (CTM.isLittleEndian? 1: -1);
    }
  }
};

CTM.Stream = function(data){
  this.data = data;
  this.offset = 0;
};

CTM.Stream.prototype.TWO_POW_MINUS23 = Math.pow(2, -23);

CTM.Stream.prototype.TWO_POW_MINUS126 = Math.pow(2, -126);

CTM.Stream.prototype.readByte = function(){
  return this.data.charCodeAt(this.offset ++) & 0xff;
};

CTM.Stream.prototype.readInt32 = function(){
  var i = this.readByte();
  i |= this.readByte() << 8;
  i |= this.readByte() << 16;
  return i | (this.readByte() << 24);
};

CTM.Stream.prototype.readFloat32 = function(){
  var m = this.readByte();
  m += this.readByte() << 8;

  var b1 = this.readByte();
  var b2 = this.readByte();

  m += (b1 & 0x7f) << 16; 
  var e = ( (b2 & 0x7f) << 1) | ( (b1 & 0x80) >>> 7);
  var s = b2 & 0x80? -1: 1;

  if (e === 255){
    return m !== 0? NaN: s * Infinity;
  }
  if (e > 0){
    return s * (1 + (m * this.TWO_POW_MINUS23) ) * Math.pow(2, e - 127);
  }
  if (m !== 0){
    return s * m * this.TWO_POW_MINUS126;
  }
  return s * 0;
};

CTM.Stream.prototype.readString = function(){
  var len = this.readInt32();

  this.offset += len;

  return this.data.substr(this.offset - len, len);
};

CTM.Stream.prototype.readArrayInt32 = function(array){
  var i = 0, len = array.length;
  
  while(i < len){
    array[i ++] = this.readInt32();
  }

  return array;
};

CTM.Stream.prototype.readArrayFloat32 = function(array){
  var i = 0, len = array.length;

  while(i < len){
    array[i ++] = this.readFloat32();
  }

  return array;
};
/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_wavefront.js
 * @author me@paulbrunt.co.uk
 */

(function(GLGE){
/**
* @class parses and displays a warefront object file with mtl material
* @param {string} uid the unique id for this object
* @augments GLGE.Object
*/
GLGE.OpenCTM=function(uid){
	this.multimaterials=[];
	this.materials={};
	this.instances=[];
	this.queue=[];
	this.idMaterials = [];//storaged name of material (string)
	GLGE.Object.call(this,uid);
	GLGE.Assets.registerAsset(this,uid);
}
GLGE.augment(GLGE.Object,GLGE.OpenCTM);
/**
* Gets the absolute path given an import path and the path it's relative to
* @param {string} path the path to get the absolute path for
* @param {string} relativeto the path the supplied path is relativeto
* @returns {string} absolute path
* @private
*/
GLGE.OpenCTM.prototype.getAbsolutePath=function(path,relativeto){
	if(path.substr(0,7)=="http://" || path.substr(0,7)=="file://"  || path.substr(0,7)=="https://"){
		return path;
	}
	else
	{
		if(!relativeto){
			relativeto=window.location.href;
		}
		if(relativeto.indexOf("?")>0){
			relativeto=relativeto.substr(0,relativeto.indexOf("?"));
		}
		//find the path compoents
		var bits=relativeto.split("/");
		var domain=bits[2];
		var proto=bits[0];
		var initpath=[];
		for(var i=3;i<bits.length-1;i++){
			initpath.push(bits[i]);
		}
		//relative to domain
		if(path.substr(0,1)=="/"){
			initpath=[];
		}
		var locpath=path.split("/");
		for(i=0;i<locpath.length;i++){
			if(locpath[i]=="..") initpath.pop();
				else if(locpath[i]!="") initpath.push(locpath[i]);
		}
		return proto+"//"+domain+"/"+initpath.join("/");
	}
};


/**
* loads a resource from a url
* @param {string} url the url of the resource to load
* @param {string} relativeTo the url to load relative to
* @param {function} callback thefunction to call once the file is loaded
* @private
*/
GLGE.OpenCTM.prototype.loadFile=function(url,relativeTo,callback){
	this.loading=true;
	if(!callback) callback=this.loaded;
	if(!relativeTo && this.relativeTo) relativeTo=this.relativeTo;
	url=this.getAbsolutePath(url,relativeTo);
	if(!this.relativeTo) this.relativeTo=url;
	var req = new XMLHttpRequest();
	var that=this;
	if(req) {
		req.overrideMimeType("text/plain; charset=x-user-defined");
		req.onreadystatechange = function() {
			if(this.readyState  == 4)
			{
				if(this.status  == 200 || this.status==0){
					that.loading=false;
					callback.call(that,url,this.responseText);
				}else{ 
					GLGE.error("Error loading Document: "+url+" status "+this.status);
				}
			}
		};
		req.open("GET", url, true);
		req.send("");
	}	
}
/**
* loads a wavefront ojvect from a given url
* @param {DOM Element} url the url to retrieve
* @param {string} relativeTo optional the path the url is relative to
*/
GLGE.OpenCTM.prototype.setSrc=function(url,relativeTo){
	this.src=this.getAbsolutePath(url,relativeTo);
	this.loadFile(this.src,relativeTo);
};
/**
* loads a resource from a url
* @param {string} url the url of the resource loaded
* @param {string} objfile the loaded file
* @private
*/
GLGE.OpenCTM.prototype.loaded=function(url,openctmfile){
	var stream = new CTM.Stream(openctmfile);
	var file = new CTM.File(stream);
	this.parseMesh(file);
	this.fireEvent("loaded",{});	
};
/**
* Parses the mesh
* @private
*/
GLGE.OpenCTM.prototype.parseMesh=function(file){
	var positions = file.body.vertices;
	var normals = file.body.normals || [];
	var uv = file.body.uvMaps ? file.body.uvMaps[0].uv : [];
	var faces = file.body.indices || [];
	
	if (positions.length/3>65024) {
		var newPositions=[];
		var newNormals=[];
		var newUVs=[];
		for (var i=0; i<faces.length; i++) {
			newPositions.push(positions[faces[i]*3],positions[faces[i]*3+1],positions[faces[i]*3+2]);
			if(normals.length>0) newNormals.push(normals[faces[i]*3],normals[faces[i]*3+1],normals[faces[i]*3+2]);
			if(uv.length>0) newUVs.push(uv[faces[i]*2],uv[faces[i]*2+1]);
		}
		positions=newPositions;
		normals=newNormals;
		uv=newUVs;
		faces=[];
	}
	
	var mesh=new GLGE.Mesh;
	mesh.setPositions(positions);
	if(normals.length>0) mesh.setNormals(normals);
	if(uv.length>0) mesh.setUV(uv);
	if(faces.length>0) mesh.setFaces(faces);	
	this.setMesh(mesh);
};

/**
* Parses the dom element and creates a texture
* @param {domelement} ele the element to create the objects from
* @private
*/
GLGE.Document.prototype.getOpenCTM=function(ele){
	if(!ele.object){
		var rel=this.getAbsolutePath(this.rootURL,null);
		ele.object=new GLGE[this.classString(ele.tagName)];
		//ele.object.setSrc(this.getAbsolutePath(ele.getAttribute("src"),rel));
		ele.object.setSrc(ele.getAttribute("src"),rel);
		ele.removeAttribute("src");
		this.setProperties(ele);
	}
	return ele.object;
}

GLGE.Scene.prototype.addOpenCTM=GLGE.Scene.prototype.addObject;
})(GLGE);

/*
GLGE WebGL Graphics Engine
Copyright (c) 2011, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_physicsext.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){


GLGE.Scene.prototype.physicsGravity=[0,0,-9.8,0];

/**
* retrives the phsyics assets from the scene
* @returns {array} the physics assets
*/
GLGE.Scene.prototype.getPhysicsNodes=function(ret){
	if(!ret) ret=[];
	if(this.jigLibObj) ret.push(this);
	if(this.children){
		for(var i=0;i<this.children.length;i++){
			GLGE.Scene.prototype.getPhysicsNodes.call(this.children[i],ret);
		}
	}
	return ret;
}

/**
* Picks within the physics system
* @param {number} x screen x coord
* @param {number} y screen y coord
* @param {object} self optionally don't pick self
* @returns picking result
*/
GLGE.Scene.prototype.physicsPick=function(x,y,self){
	if(!this.physicsSystem) this.physicsTick(0,true); //make sure the physics is set up
	var ray=this.makeRay(x,y);
	if(!ray) return;
	
	var cs=this.physicsSystem.getCollisionSystem();
	var seg=new jigLib.JSegment(ray.origin,GLGE.scaleVec3(ray.coord,-1000));
	var out={};
	if(cs.segmentIntersect(out, seg, self ? self.jigLibObj : null)){
		return {object:out.rigidBody.GLGE,normal:out.normal,distance:out.frac*1000,position:out.position};
	}else{
		return false;
	}
}

/**
* Picks a single objectwithin the physics system
* @param {number} x screen x coord
* @param {number} y screen y coord
* @param {object} self  the object to perform the pick on
* @returns picking result
*/
GLGE.Scene.prototype.physicsPickObject=function(x,y,self){
	if(!this.physicsSystem) this.physicsTick(0,true); //make sure the physics is set up
	var ray=this.makeRay(x,y);
	if(!ray) return;
	
	var cs=self.jigLibObj;
	var seg=new jigLib.JSegment(ray.origin,GLGE.scaleVec3(ray.coord,-1000));
	var out={};
	if(cs.segmentIntersect(out, seg)){
		return {normal:out.normal,distance:out.frac*1000,position:out.position};
	}else{
		return false;
	}
}

/**
* Does and intesection test on a given segment
* @param {array} start starting position of segment
* @param {array} delta the segment delta
* @returns segment test result object {object,normal,distance,position}
*/
GLGE.Scene.prototype.segmentTest=function(start, delta,self){
	if(!this.physicsSystem || !this.physicsSystem._collisionSystem) return false;
	
	var seg=new jigLib.JSegment(start,delta);
	var out={};
	
	if(this.physicsSystem._collisionSystem.segmentIntersect(out,seg, self ? self.jigLibObj : null)){
		var length=Math.sqrt(delta[0]*delta[0]+delta[1]*delta[1]+delta[2]*delta[2]);
		return {object:out.rigidBody.GLGE,normal:out.normal,distance:out.frac*length,position:out.position};
	}
	return false
	
}


/**
* Integrate the phsyics system
* @param {number} dt the delta time to integrate for
*/
GLGE.Scene.prototype.physicsTick=function(dt,noIntegrate){
	var objects=this.getPhysicsNodes();
	if(!this.physicsSystem){
		//create the physics system
		this.physicsSystem=jigLib.PhysicsSystem.getInstance();
		//this.physicsSystem.setCollisionSystem(true,-1000,-1000,-1000,2000,1000,2000,1,1,1);
		this.physicsSystem.setGravity(this.physicsGravity);
		for(var i=0;i<objects.length;i++){
			if(objects[i].jigLibObj) this.physicsSystem.addBody(objects[i].jigLibObj);
		}
		var that=this;
		this.addEventListener("childAdded",function(data){
			if(data.obj.jigLibObj) that.physicsSystem.addBody(data.obj.jigLibObj);
		});
		this.addEventListener("childRemoved",function(data){
			if(data.obj.jigLibObj) that.physicsSystem.removeBody(data.obj.jigLibObj);
		});
	}
	for(var i=0;i<objects.length;i++){
		if(objects[i].jigLibObj) {
			objects[i].preProcess(dt);
		}
	}
	if(!noIntegrate) this.physicsSystem.integrate(dt);
}


/**
* Sets the gravity of the physics system
* @param {number} gravity the gravity to apply to the physics system
*/
GLGE.Scene.prototype.setGravity=function(gravity){
	this.physicsGravity=gravity;
	if(this.physicsSystem){
		this.physicsSystem.setGravity(gravity);
	}
	return this;
}
/**
* Gets the gravity of the physics system
* @returns {number}
*/
GLGE.Scene.prototype.getGravity=function(gravity){
	return this.physicsSystem.getGravity(gravity);
}

GLGE.Group.prototype.addPhysicsPlane=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addPhysicsBox=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addPhysicsSphere=GLGE.Group.prototype.addChild;
GLGE.Group.prototype.addPhysicsMesh=GLGE.Group.prototype.addChild;
GLGE.Scene.prototype.addPhysicsPlane=GLGE.Group.prototype.addChild;
GLGE.Scene.prototype.addPhysicsBox=GLGE.Group.prototype.addChild;
GLGE.Scene.prototype.addPhysicsSphere=GLGE.Group.prototype.addChild;
GLGE.Scene.prototype.addPhysicsMesh=GLGE.Group.prototype.addChild;

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_physicsabstract.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){



/**
* @class An abstract class used when constructing jiglib rigidbodies
* @augments GLGE.Group
*/
GLGE.PhysicsAbstract=function(uid){
	this.children=[];
}
GLGE.augment(GLGE.Group,GLGE.PhysicsAbstract);

/**
* Enumeration for copy of rotation and location
**/
GLGE.PHYSICS_ALL=1;
/**
* Enumeration for copy of location
**/
GLGE.PHYSICS_LOC=2;
	
GLGE.PhysicsAbstract.prototype.physicsType=GLGE.PHYSICS_ALL;
GLGE.PhysicsAbstract.prototype.sync=true;


/**
* Sets the physics type either GLGE.PHYSICS_ALL or GLGE.PHYSICS_LOC
* @param {number} value the enumerations for physics type
**/
GLGE.PhysicsAbstract.prototype.setType=function(value){
	this.physicsType=value;
	return this;
}

/**
* Gets the physics type either GLGE.PHYSICS_ALL or GLGE.PHYSICS_LOC
**/
GLGE.PhysicsAbstract.prototype.getType=function(value){
	return this.physicsType;
}

/**
* function run before proceeding with the physics sim
*/
GLGE.PhysicsAbstract.prototype.preProcess=function(dt){
	if(this.sync){
		//update the oriantation and position within jiglib
		var matrix=this.getModelMatrix();
		this.jigLibObj.moveTo([matrix[3],matrix[7],matrix[11],0]);
		if(this.physicsType==1){
			var sx=Math.sqrt(matrix[0]*matrix[0]+matrix[1]*matrix[1]+matrix[2]*matrix[2]);
			var sy=Math.sqrt(matrix[4]*matrix[4]+matrix[5]*matrix[5]+matrix[6]*matrix[6]);
			var sz=Math.sqrt(matrix[8]*matrix[8]+matrix[9]*matrix[9]+matrix[10]*matrix[10]);
			this.jigLibObj.setOrientation(new jigLib.Matrix3D([matrix[0]/sx,matrix[1]/sx,matrix[2]/sx,0,matrix[4]/sy,matrix[5]/sy,matrix[6]/sy,0,matrix[8]/sz,matrix[9]/sz,matrix[10]/sz,0,0,0,0,1]));
		}
		this.sync=false;
	}
}

/**
* get_transform gets the transform matrix
* @type jigLib.Matrix3D
* @private
**/
GLGE.PhysicsAbstract.prototype.get_transform=function(){
	return new jigLib.Matrix3D(this.getModelMatrix());
}

/**
* Updates the model matrix and flag physics system to sync
* @private
*/
GLGE.PhysicsAbstract.prototype.updateMatrix=function(){
	this.globalMatrix=null;
	this.sync=true;
	GLGE.Placeable.prototype.updateMatrix.call(this);
}

/**
* Gets the model matrix to transform the model within the world
*/
GLGE.PhysicsAbstract.prototype.getModelMatrix=function(){
	if(this.globalMatrix) return this.globalMatrix;
	return GLGE.Placeable.prototype.getModelMatrix.call(this);
}
	
/**
* set_transform sets the transform matrix
* @param {Matrix3D} value
* @private
**/
GLGE.PhysicsAbstract.prototype.set_transform=function(value){
	value=value.glmatrix;
	var matrix=[value[0],value[1],value[2],value[3],value[4],value[5],value[6],value[7],value[8],value[9],value[10],value[11],value[12],value[13],value[14],value[15]];
	this.locX=value[3];
	this.locY=value[7];
	this.locZ=value[11];
	matrix=GLGE.mulMat4(matrix,this.getScaleMatrix());
	if(this.physicsType!=1){
		var M=this.getModelMatrix();
		matrix[0]=M[0];
		matrix[1]=M[1];
		matrix[2]=M[2];
		matrix[4]=M[4];
		matrix[5]=M[5];
		matrix[6]=M[6];
		matrix[8]=M[8];
		matrix[9]=M[9];
		matrix[10]=M[10];
	}
	this.globalMatrix=matrix;
	if(this.children){
		for(var i=0;i<this.children.length;i++){
			this.children[i].updateMatrix();
		}
	}
	return this;
}

/**
* Sets the velocity of the physics body
* @param {array} value The velocity to set
*/
GLGE.PhysicsAbstract.prototype.setVelocity=function(value,local){
	if(!this.getMovable()) GLGE.error("Cannot set velocity on static object");
	this.jigLibObj.setVelocity(value,local);
	return this;
}
/**
* Sets the x velocity of the physics body
* @param {number} value The x velocity to set
*/
GLGE.PhysicsAbstract.prototype.setVelocityX=function(value){
	if(!this.getMovable()) GLGE.error("Cannot set velocity on static object");
	var vel=this.jigLibObj.getVelocity([0,0,0]);
	vel[0]=+value;
	this.jigLibObj.setVelocity(vel);
	return this;
}
/**
* Sets the y velocity of the physics body
* @param {number} value The y velocity to set
*/
GLGE.PhysicsAbstract.prototype.setVelocityY=function(value){
	if(!this.getMovable()) GLGE.error("Cannot set velocity on static object");
	var vel=this.jigLibObj.getVelocity([0,0,0]);
	vel[1]=+value;
	this.jigLibObj.setVelocity(vel);
	return this;
}
/**
* Sets the z velocity of the physics body
* @param {number} value The z velocity to set
*/
GLGE.PhysicsAbstract.prototype.setVelocityZ=function(value){
	if(!this.getMovable()) GLGE.error("Cannot set velocity on static object");
	var vel=this.jigLibObj.getVelocity([0,0,0]);
	vel[2]=+value;
	this.jigLibObj.setVelocity(vel);
	return this;
}
/**
* Gets the velocity of the physics body
* @returns {array} The velocity to set
*/
GLGE.PhysicsAbstract.prototype.getVelocity=function(){
	return this.jigLibObj.getVelocity([0,0,0]);
}
/**
* Gets the x velocity of the physics body
* @returns {number} The x velocity to set
*/
GLGE.PhysicsAbstract.prototype.getVelocityX=function(){
	return this.jigLibObj.getVelocity([0,0,0])[0];
}
/**
* Gets the y velocity of the physics body
* @returns {number} The y velocity to set
*/
GLGE.PhysicsAbstract.prototype.getVelocityY=function(){
	return this.jigLibObj.getVelocity([0,0,0])[1];
}
/**
* Gets the z velocity of the physics body
* @returns {number} The z velocity to set
*/
GLGE.PhysicsAbstract.prototype.getVelocityZ=function(){
	return this.jigLibObj.getVelocity([0,0,0])[2];
}

/**
* Sets the angular velocity of the physics body
* @param {array} value The velocity to set
*/
GLGE.PhysicsAbstract.prototype.setAngularVelocity=function(value){
	if(!this.getMovable()) GLGE.error("Cannot set velocity on static object");
	this.jigLibObj.setAngVel(value);
	return this;
}
/**
* Sets the x-axis angular velocity of the physics body
* @param {number} value The x velocity to set
*/
GLGE.PhysicsAbstract.prototype.setAngularVelocityX=function(value){
	if(!this.getMovable()) GLGE.error("Cannot set velocity on static object");
	var vel=this.jigLibObj.getAngVel();
	vel[0]=+value;
	this.jigLibObj.setAngVel(vel);
	return this;
}
/**
* Sets the y-axis angular velocity of the physics body
* @param {number} value The y velocity to set
*/
GLGE.PhysicsAbstract.prototype.setAngularVelocityY=function(value){
	if(!this.getMovable()) GLGE.error("Cannot set velocity on static object");
	var vel=this.jigLibObj.getAngVel();
	vel[1]=+value;
	this.jigLibObj.setAngVel(vel);
	return this;
}
/**
* Sets the z-axis angular velocity of the physics body
* @param {number} value The z velocity to set
*/
GLGE.PhysicsAbstract.prototype.setAngularVelocityZ=function(value){
	if(!this.getMovable()) GLGE.error("Cannot set velocity on static object");
	var vel=this.jigLibObj.getAngVel();
	vel[2]=+value;
	this.jigLibObj.setAngVel(vel);
	return this;
}
/**
* Gets the angular velocity of the physics body
* @returns {array} The velocity to set
*/
GLGE.PhysicsAbstract.prototype.getAngularVelocity=function(){
	return this.jigLibObj.getAngVel();
}
/**
* Gets the x-axis angular velocity of the physics body
* @returns {number} The x velocity to set
*/
GLGE.PhysicsAbstract.prototype.getAngularVelocityX=function(){
	return this.jigLibObj.getAngVel()[0];
}
/**
* Gets the y-axis angular velocity of the physics body
* @returns {number} The y velocity to set
*/
GLGE.PhysicsAbstract.prototype.getAngularVelocityY=function(){
	return this.jigLibObj.getAngVel()[1];
}
/**
* Gets the z-axis angular velocity of the physics body
* @returns {number} The z velocity to set
*/
GLGE.PhysicsAbstract.prototype.getAngularVelocityZ=function(){
	return this.jigLibObj.getAngVel()[2];
}
/**
* Sets the movable flag for the object
* @param {boolean} value The movable flag
*/
GLGE.PhysicsAbstract.prototype.setMovable=function(value){
	this.jigLibObj.set_movable(value);
	return this;
}
/**
* Gets the movable flag for the object
* @returns {boolean} The movable flag
*/
GLGE.PhysicsAbstract.prototype.getMovable=function(){
	return this.jigLibObj.get_movable();
}

/**
* Sets the friction for the object
* @param {number} value The friction 0-1
*/
GLGE.PhysicsAbstract.prototype.setFriction=function(value){
	this.jigLibObj.set_friction(value);
	return this;
}
/**
* Gets the friction for the object
* @returns {number} The friction 
*/
GLGE.PhysicsAbstract.prototype.getFriction=function(){
	return this.jigLibObj.get_friction();
}


/**
* Sets the mass for the object
* @param {number} value The mass
*/
GLGE.PhysicsAbstract.prototype.setMass=function(value){
	this.jigLibObj.set_mass(value);
	return this;
}

/**
* Gets the mass for the object
* @returns {number} The mass 
*/
GLGE.PhysicsAbstract.prototype.getMass=function(){
	return this.jigLibObj.get_mass();
}


/**
* Sets the restitution for the object
* @param {number} value The restitution 0-1
*/
GLGE.PhysicsAbstract.prototype.setRestitution=function(value){
	this.jigLibObj.set_restitution(value);
	return this;
}
/**
* Gets the restitution for the object
* @returns {number} The restitution 
*/
GLGE.PhysicsAbstract.prototype.getRestitution=function(){
	return this.jigLibObj.get_restitution();
}

/**
* Add forces in the body coordinate frame
* @param {array} f force expressed as a 3D vector
* @param {array} p position of origin of the force expressed as a 3D vector 
**/
GLGE.PhysicsAbstract.prototype.addBodyForce=function(f, p){
	this.jigLibObj.addBodyForce(f,p);
	return this;
}

/**
* Add forces in the world coordinate frame
* @param {array} f force expressed as a 3D vector
* @param {array} p position of origin of the force expressed as a 3D vector 
**/
GLGE.PhysicsAbstract.prototype.addWorldForce=function(f, p){
	this.jigLibObj.addWorldForce(f,p);
	return this;
}

/**
* Add torque in the world coordinate frame
* @param {array} t torque expressed as a 3D vector 
**/
GLGE.PhysicsAbstract.prototype.addWorldTorque=function(t){
	this.jigLibObj.addWorldTorque(t);
	return this;
}

/**
* Add torque in the body coordinate frame
* @param {array} t torque expressed as a 3D vector 
**/
GLGE.PhysicsAbstract.prototype.addBodyTorque=function(t){
	this.jigLibObj.addBodyTorque(t);
	return this;
}
/**
* Sets the linear velocity damping
* @param {array} damping 3D vector for linear damping
**/
GLGE.PhysicsAbstract.prototype.setLinearVelocityDamping=function(v){
	this.jigLibObj.set_linVelocityDamping(v);
	return this;
}

/**
* Gets the rotational velocity Damping
* @returns 3D vector for rotational damping
**/
GLGE.PhysicsAbstract.prototype.getRotationalVelocityDamping=function(v){
	return this.jigLibObj.get_rotVelocityDamping();
}

/**
* Gets the linear velocity damping
* @returns 3D vector for linear damping
**/
GLGE.PhysicsAbstract.prototype.getLinearVelocityDamping=function(v){
	return this.jigLibObj.get_linVelocityDamping();
}

/**
* Sets the rotational velocity Damping
* @param {array} damping 3D vector for rotational damping
**/
GLGE.PhysicsAbstract.prototype.setRotationalVelocityDamping=function(v){
	this.jigLibObj.set_rotVelocityDamping(v);
	return this;
}


/**
* Remove active force and torque
**/
GLGE.PhysicsAbstract.prototype.clearForces=function(){
	this.jigLibObj.clearForces();
	return this;
}




})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_physicssphere.js
 * @author me@paulbrunt.co.uk
 */

(function(GLGE){

/**
* @class A wrapping class for jiglib spheres
* @augments GLGE.PhysicsAbstract
*/
GLGE.PhysicsBox=function(uid){
	this.jigLibObj=new jigLib.JBox(this,this.width,this.height,this.depth);
	this.jigLibObj.GLGE=this;
	this.jigLibObj.addEventListener(jigLib.JCollisionEvent.COLLISION, function(event){this.GLGE.fireEvent("collision",{obj:event.collisionBody.GLGE,impulse:event.collisionImpulse})});
	GLGE.PhysicsAbstract.call(this,uid);
}
GLGE.augment(GLGE.PhysicsAbstract,GLGE.PhysicsBox);

GLGE.PhysicsBox.prototype.width=1;
GLGE.PhysicsBox.prototype.height=1;
GLGE.PhysicsBox.prototype.depth=1;

GLGE.PhysicsBox.prototype.className="PhysicsBox";
/**
* Sets the width of the box
* @param {number} value The width to set
*/
GLGE.PhysicsBox.prototype.setWidth=function(value){
	this.width=value;
	var sides=this.jigLibObj.get_sideLengths();
	sides[0]=+value
	this.jigLibObj.set_sideLengths(sides);
	return this;
}
/**
* Sets the height of the box
* @param {number} value The height to set
*/
GLGE.PhysicsBox.prototype.setHeight=function(value){
	this.height=value;
	var sides=this.jigLibObj.get_sideLengths();
	sides[1]=+value
	this.jigLibObj.set_sideLengths(sides);
	return this;
}

/**
* Sets the height of the box
* @param {number} value The depth to set
*/
GLGE.PhysicsBox.prototype.setDepth=function(value){
	this.depth=value;
	var sides=this.jigLibObj.get_sideLengths();
	sides[2]=+value
	this.jigLibObj.set_sideLengths(sides);
	return this;
}

/**
* Gets the width of the box
* @returns {number} The width to set
*/
GLGE.PhysicsBox.prototype.getWidth=function(){
	return this.jigLibObj.get_sideLengths()[0];
}

/**
* Gets the height of the box
* @returns {number} The height to set
*/
GLGE.PhysicsBox.prototype.getHeight=function(){
	return this.jigLibObj.get_sideLengths()[1];
}

/**
* Gets the depth of the box
* @returns {number} The depth to set
*/
GLGE.PhysicsBox.prototype.getDepth=function(){
	return this.jigLibObj.get_sideLengths()[2];
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_physicsmesh.js
 * @author me@paulbrunt.co.uk
 */

(function(GLGE){

/**
* @class A wrapping class for jiglib triangle mesh
* @augments GLGE.PhysicsAbstract
*/
GLGE.PhysicsMesh=function(uid){
	this.jigLibObj=new jigLib.JTriangleMesh(null, 100, 0.1);
	this.jigLibObj.GLGE=this;
	this.jigLibObj.addEventListener(jigLib.JCollisionEvent.COLLISION, function(event){this.GLGE.fireEvent("collision",{obj:event.collisionBody.GLGE,impulse:event.collisionImpulse})});
	this.dirty=true;
	this.addEventListener("matrixUpdate",this.makeDirty);
	this.addEventListener("childMatrixUpdate",this.makeDirty);
	this.addEventListener("childAdded",this.makeDirty);
	this.addEventListener("childRemoved",this.makeDirty);
	
	GLGE.PhysicsAbstract.call(this,uid);
}
GLGE.augment(GLGE.PhysicsAbstract,GLGE.PhysicsMesh);


GLGE.PhysicsMesh.prototype.className="PhysicsMesh";
/**
* Forces and update of the triangle mesh
*/
GLGE.PhysicsMesh.prototype.forceUpdate=function(){
	this.dirty=true;
	return this;
}

/**
* flag to regenerate trimesh and redo octtree
* @private
*/
GLGE.PhysicsMesh.prototype.makeDirty=function(e){
	this.dirty=true;
}
/**
* called before a system intergrate
* @private
*/
GLGE.PhysicsMesh.prototype.preProcess=function(){
	//recreate mesh and build octree
	if(this.dirty){
		var triangles=this.getTriangles();
		this.jigLibObj.createMesh(triangles.verts, triangles.faces);
		this.dirty=false;
	}
}
/**
* Creates the jiglib triangle arrays from the containing objects
* @private
*/
GLGE.PhysicsMesh.prototype.getTriangles=function(){
	var objs=this.getObjects();
	var verts=[];
	var faces=[];
	for(var i=0;i<objs.length;i++){
		if(objs[i].multimaterials){
			var matrix=objs[i].getModelMatrix();
			for(var j=0;j<objs[i].multimaterials.length;j++){
				var mesh=objs[i].multimaterials[j].getMesh();
				var vertcnt=verts.length;
				if(mesh){
					for(var k=0;k<mesh.positions.length;k=k+3){
						var vert=[mesh.positions[k],mesh.positions[k+1],mesh.positions[k+2],1];
						var v=GLGE.mulMat4Vec4(matrix,vert);
						verts.push([v[0],v[1],v[2],1]);
					}
					var mfaces=mesh.faces.data
					if(mfaces){
						var len=mfaces.length;
						len=((len/3)|0)*3;
						for(var k=0;k<len;k=k+3){
							faces.push([+mfaces[k]+vertcnt,+mfaces[k+1]+vertcnt,+mfaces[k+2]+vertcnt]);
						}
					}else{
						for(var k=0;k<mesh.positions.length/3;k=k+3){
							faces.push([k+vertcnt,k+1+vertcnt,k+2+vertcnt]);
						}
					}
				}
			}
		}
	}
	
	return {verts:verts,faces:faces};
}


})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_physicssphere.js
 * @author me@paulbrunt.co.uk
 */

(function(GLGE){

GLGE.PHYSICS_XAXIS=[1,0,0,0];
GLGE.PHYSICS_YAXIS=[0,1,0,0];
GLGE.PHYSICS_ZAXIS=[0,0,1,0];
GLGE.PHYSICS_NEGXAXIS=[-1,0,0,0];
GLGE.PHYSICS_NEGYAXIS=[0,-1,0,0];
GLGE.PHYSICS_NEGZAXIS=[0,0,-1,0];
/**
* @class A wrapping class for jiglib spheres
* @augments GLGE.PhysicsAbstract
*/
GLGE.PhysicsPlane=function(uid){
	this.jigLibObj=new jigLib.JPlane(this,this.normal,this.distance);
	this.jigLibObj.GLGE=this;
	this.jigLibObj.addEventListener(jigLib.JCollisionEvent.COLLISION, function(event){this.GLGE.fireEvent("collision",{obj:event.collisionBody.GLGE,impulse:event.collisionImpulse})});
	GLGE.PhysicsAbstract.call(this,uid);
}
GLGE.augment(GLGE.PhysicsAbstract,GLGE.PhysicsPlane);

GLGE.PhysicsPlane.prototype.normal=[0,0,1,0];
GLGE.PhysicsPlane.prototype.distance=0;

GLGE.PhysicsPlane.prototype.className="PhysicsPlane";
/**
* Sets the normal of the plane
* @param {number} value The normal to set
*/
GLGE.PhysicsPlane.prototype.setNormal=function(value){
	this.normal=value;
	this.jigLibObj.set_normal(value);
	return this;
}
/**
* Sets the distance of the plane
* @param {number} value The distance to set
*/
GLGE.PhysicsPlane.prototype.setDistance=function(value){
	this.distance=value;
	this.jigLibObj.set_distance(value);
	return this;
}

/**
* Gets the normal of the plane
* @returns {number} The current normal
*/
GLGE.PhysicsPlane.prototype.getNormal=function(){
	return this.jigLibObj.get_normal();
}

/**
* Gets the distance of the plane
* @returns {number} The current distance
*/
GLGE.PhysicsPlane.prototype.getDistance=function(){
	return this.jigLibObj.get_distance();
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_physicssphere.js
 * @author me@paulbrunt.co.uk
 */

(function(GLGE){

/**
* @class A wrapping class for jiglib spheres
* @augments GLGE.PhysicsAbstract
*/
GLGE.PhysicsSphere=function(uid){
	this.jigLibObj=new jigLib.JSphere(this,this.radius);
	this.jigLibObj.GLGE=this;
	this.jigLibObj.addEventListener(jigLib.JCollisionEvent.COLLISION, function(event){this.GLGE.fireEvent("collision",{obj:event.collisionBody.GLGE,impulse:event.collisionImpulse})});
	GLGE.PhysicsAbstract.call(this,uid);
}
GLGE.augment(GLGE.PhysicsAbstract,GLGE.PhysicsSphere);

GLGE.PhysicsSphere.prototype.radius=1;

GLGE.PhysicsSphere.prototype.className="PhysicsSphere";
/**
* Sets the radius of the sphere
* @param {number} value The radius to set
*/
GLGE.PhysicsSphere.prototype.setRadius=function(value){
	this.physicsRadius=+value;
	this.jigLibObj.set_radius(+value);
	return this;
}

/**
* Gets the radius of the sphere
* @returns {number} The radius to set
*/
GLGE.PhysicsSphere.prototype.getRadius=function(value){
	return this.jigLibObj.get_radius();
}

})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2011, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_constraintpoint.js
 * @author me@paulbrunt.co.uk
 */


(function(GLGE){

/**
* @class A wrapping class for jiglib constraint point
* @augments GLGE.QuickNotation
* @augments GLGE.JSONLoader
*/
GLGE.PhysicsConstraintPoint=function(){
}
GLGE.augment(GLGE.QuickNotation,GLGE.PhysicsConstraintPoint);
GLGE.augment(GLGE.JSONLoader,GLGE.PhysicsConstraintPoint);

GLGE.PhysicsConstraintPoint.constraint=null;
GLGE.PhysicsConstraintPoint.prototype.className="PhysicsConstraintPoint";


/**
* Sets the first body to use with this constraint
* @param {GLGE.PhysicsAbstract} body1 The first body
*/
GLGE.PhysicsConstraintPoint.prototype.setBody1=function(body1){
	this.body1=body1;
	this.updateConstraint();
	return this;
}
/**
* Sets the second body to use with this constraint
* @param {GLGE.PhysicsAbstract} body2 The second body
*/
GLGE.PhysicsConstraintPoint.prototype.setBody2=function(body2){
	this.body2=body2;
	this.updateConstraint();
	return this;
}
/**
* Sets the constraing point on the first body
* @param {array} bodypos1 The first body constraint point
*/
GLGE.PhysicsConstraintPoint.prototype.setBodyPos1=function(bodypos1){
	if(typeof(bodypos1)=="string") bodypos1=bodypos1.split(",");
	this.bodypos1=[parseFloat(bodypos1[0]),parseFloat(bodypos1[1]),parseFloat(bodypos1[2])];
	this.updateConstraint();
	return this;
}
/**
* Sets the constraing point on the second body
* @param {array} bodypos2 The second body constraint point
*/
GLGE.PhysicsConstraintPoint.prototype.setBodyPos2=function(bodypos2){
	if(typeof(bodypos2)=="string") bodypos2=bodypos2.split(",");
	this.bodypos2=[parseFloat(bodypos2[0]),parseFloat(bodypos2[1]),parseFloat(bodypos2[2])];
	this.updateConstraint();
	return this;
}

/**
* Updates the jiglib constraint
* @private
*/
GLGE.PhysicsConstraintPoint.prototype.updateConstraint=function(){
	if(this.body1 && this.body2 && this.bodypos1 && this.bodypos2){
		if(this.constraint){
			if(this.parent && this.parent.physicsSystem) this.parent.physicsSystem.removeConstraint(this.constraint);
			this.body1.removeConstraint(this.constraint);
			this.body2.removeConstraint(this.constraint);
		}
		this.constraint=new jigLib.JConstraintPoint(this.body1.jigLibObj,this.bodypos1,this.body2.jigLibObj,this.bodypos2);
		if(this.parent && this.parent.physicsSystem) this.parent.physicsSystem.addConstraint(this.constraint);
	}
}

/**
* Add a new physics constraint to the scene
* @param {GLGE.PhysicsConstraintPoint} constraint The constraint to add to the scene
*/
GLGE.Scene.prototype.addPhysicsConstraintPoint=function(constraint){
	if(!this.constraints) this.constraints=[];
	this.constraints.push(constraint);
	if(this.physicsSystem) this.physicsSystem.addConstraint(constraint.constraint);
	return this;
}

/**
* Removes a physics constraint to the scene
* @param {GLGE.PhysicsConstraintPoint} constraint The constraint to remove from the scene
*/
GLGE.Scene.prototype.removePhysicsConstraintPoint=function(constraint){
	if(!this.constraints) this.constraints=[];
	if(this.constraints.indexOf(constraint)>-1){
		this.constraints.push(constraint);
		if(this.physicsSystem) this.physicsSystem.removeConstraint(constraint.constraint);
	}
	return this;
}


})(GLGE);/*
GLGE WebGL Graphics Engine
Copyright (c) 2010, Paul Brunt
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of GLGE nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL PAUL BRUNT BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

/**
 * @fileOverview
 * @name glge_physicscar.js
 * @author me@paulbrunt.co.uk
 */
 (function(GLGE){
 
/**
* @class Physics Car class
* @augments GLGE.PhysicsBox
* @see GLGE.PhysicsWheel
*/
GLGE.PhysicsCar=function(uid){
	GLGE.PhysicsBox.call(this,uid);
	this.wheels=[];
	this.setRotationalVelocityDamping([0.1,0.6,0.1]);
	this.setLinearVelocityDamping([0.996,0.92,0.996]);
	return this;
}
GLGE.augment(GLGE.PhysicsBox,GLGE.PhysicsCar);
GLGE.PhysicsCar.prototype.className="PhysicsCar";
GLGE.Group.prototype.addPhysicsCar=GLGE.Group.prototype.addChild;
GLGE.Scene.prototype.addPhysicsCar=GLGE.Group.prototype.addChild;
/**
* Applies a driving force to the car
* @param {number} force the item driving force to apply to each powered wheel
*/
GLGE.PhysicsCar.prototype.drive=function(force){
	for(var i=0;i<this.wheels.length;i++){
		var wheel=this.wheels[i];
		if(wheel.powered) wheel.drive(force);
	}
	return this;
}
/**
* Applies a brake to the car
* @param {number} brake the level of braking
*/
GLGE.PhysicsCar.prototype.brake=function(brake){
	for(var i=0;i<this.wheels.length;i++){
		if(this.wheels[i].powered) this.wheels[i].brake(brake);
	}
	return this;
}
/**
* Adds a wheel to the car
* @param {GLGE.PhysicsWheel} wheel a wheel to add to the car
*/
GLGE.PhysicsCar.prototype.addPhysicsWheel=function(wheel){
	this.wheels.push(wheel);
	return GLGE.PhysicsBox.prototype.addChild.call(this,wheel);
}
/**
* Removes a wheel from the car
* @param {GLGE.PhysicsWheel} wheel a wheel to remove
*/
GLGE.PhysicsCar.prototype.removeWheel=function(wheel){
	var idx=this.wheels.indexOf(wheel);
	if(idx>-1) this.wheels.splice(idx,1);
	return GLGE.PhsyicsBox.prototype.addChild.call(this,wheel);
}
/**
* does the physics stuff
* @private
*/
GLGE.PhysicsCar.prototype.getScene=function(){
	var child=this;
	while(child.parent) child=child.parent;
	return child;
}
/**
* does the physics stuff
* @private
*/
GLGE.PhysicsCar.prototype.preProcess=function(dt){
	var scene=this.getScene();
	var velocity=this.getVelocity();
	var carMass=this.getMass();
	var wheels=this.wheels
	for(var i=0;i<wheels.length;i++){
		var wheel=wheels[i];
		var mat=wheel.getModelMatrix();
		var tangent=GLGE.toUnitVec3([mat[2],mat[6],mat[10]]);
		var up=GLGE.toUnitVec3([mat[1],mat[5],mat[9]]);
		var forward=GLGE.toUnitVec3([mat[0],mat[4],mat[8]]);
		var position=[mat[3],mat[7],mat[11]];
			
		var wheelRadius=wheel.radius;
		var travel=wheel.travel;
		var spring=wheel.spring;
		var sideFriction=wheel.sideFriction;
		var frontFriction=wheel.frontFriction;
			
		var springForce=0;
		var result=scene.segmentTest(position,GLGE.scaleVec3(up,-travel-wheelRadius),this);
		if(result){
			var distanceToFloor=result.distance-wheelRadius;
			if(distanceToFloor<travel){
				springForce=(travel-distanceToFloor)/travel*spring; 
				this.addWorldForce(GLGE.scaleVec3(up,springForce),position);
				wheel.innerGroup.setLocY(wheelRadius-result.distance);
			}
			//turning force
			//var sideForce=springForce*sideFriction; //although correct having a varible side force makes things very difficult to control
			var sideForce=sideFriction;
			var dot=GLGE.scaleVec3(tangent,-GLGE.dotVec3(tangent,velocity)*sideForce);
			this.addWorldForce(dot,position);
		}else{
			wheel.innerGroup.setLocY(-travel);
		}

		var maxForwardForce=springForce*frontFriction; //frictional force
		var maxdw=(maxForwardForce*dt*dt)/wheelRadius;
		var dw=0;
			
		//do the wheel turn
		if(wheel.oldPos){
			var delta=GLGE.dotVec3(GLGE.subVec3(position,wheel.oldPos),forward)/wheelRadius;
			var dw=delta/dt-wheel.angVel;
			if(dw<-maxdw) dw=-maxdw;
			if(dw>maxdw) dw=maxdw;
		}
		if(wheel.driveForce){
			var drive=wheel.driveForce*(1-wheel.braking);
			if(drive<-maxForwardForce) drive=maxForwardForce;
			if(drive>maxForwardForce) drive=maxForwardForce;
			this.addWorldForce(GLGE.scaleVec3(forward,drive),position);
			dw+=(wheel.driveForce/carMass*dt)/wheelRadius;
		}
		if(wheel.braking){
			var frontVel=GLGE.dotVec3(velocity,forward);
			var braking=-wheel.braking*frontVel/dt
			if(braking<-maxForwardForce) braking=-maxForwardForce;
			if(braking>maxForwardForce) braking=maxForwardForce;
			this.addWorldForce(GLGE.scaleVec3(forward,braking),position);
		}
			
		wheel.angVel+=dw;
		if(wheel.brake) wheel.angVel*=(1-wheel.braking);
		wheel.innerGroup.setRotZ(wheel.innerGroup.getRotZ()-wheel.angVel*dt);
		wheel.angVel*=0.995;
		wheel.oldPos=position;
			
	}
	
	GLGE.PhysicsBox.prototype.preProcess.call(this,dt);

}


/**
* @class physics wheel class used with PhysicsCar class 
* @augments GLGE.Group
* @see GLGE.PhysicsBox
*/
GLGE.PhysicsWheel=function(uid){
	GLGE.Group.call(this,uid);
	this.innerGroup=new GLGE.Group;
	GLGE.Group.prototype.addChild.call(this,this.innerGroup);
	return this;
}
GLGE.augment(GLGE.Group,GLGE.PhysicsWheel);
GLGE.PhysicsWheel.prototype.radius=1;
GLGE.PhysicsWheel.prototype.travel=0.75;
GLGE.PhysicsWheel.prototype.angVel=0;
GLGE.PhysicsWheel.prototype.spring=90;
GLGE.PhysicsWheel.prototype.braking=0;
GLGE.PhysicsWheel.prototype.driveForce=0;
GLGE.PhysicsWheel.prototype.powered=false;
GLGE.PhysicsWheel.prototype.sideFriction=3; //sideways friction co-efficient
GLGE.PhysicsWheel.prototype.frontFriction=3; //front friction force
GLGE.PhysicsWheel.prototype.className="PhysicsWheel";

/**
* Adds a child to the wheel container
* @param {object} child a GLGE object to represent the wheel
*/
GLGE.PhysicsWheel.prototype.addChild=function(child){
	return this.innerGroup.addChild(child);
}
/**
* Removes a child to the wheel container
* @param {object} child a GLGE object to represent the wheel
*/
GLGE.PhysicsWheel.prototype.removeChild=function(child){
	return this.innerGroup.removeChild(child);
}
GLGE.PhysicsWheel.prototype.addGroup=GLGE.PhysicsWheel.prototype.addChild;
GLGE.PhysicsWheel.prototype.addCollada=GLGE.PhysicsWheel.prototype.addChild;
GLGE.PhysicsWheel.prototype.addObject=GLGE.PhysicsWheel.prototype.addChild;
GLGE.PhysicsWheel.prototype.addMD2=GLGE.PhysicsWheel.prototype.addChild;
GLGE.PhysicsWheel.prototype.addMD3=GLGE.PhysicsWheel.prototype.addChild;
GLGE.PhysicsWheel.prototype.addWavefront=GLGE.PhysicsWheel.prototype.addChild;


/**
* Sets the wheel to be a powered wheel
* @param {boolean} powered flag indicateding if wheel is powered
*/
GLGE.PhysicsWheel.prototype.setPowered=function(powered){
	this.powered=powered;
	return this;
}

/**
* Sets the wheel Radius
* @param {number} radius the wheel radius
*/
GLGE.PhysicsWheel.prototype.setRadius=function(radius){
	this.radius=radius;
	return this;
}
/**
* Sets the  suspension spring distance
* @param {number} radius the wheel radius
*/
GLGE.PhysicsWheel.prototype.setSpring=function(spring){
	this.spring=spring;
	return this;
}
/**
* Sets the suspension travel distance
* @param {number} travel the suspension travel
*/
GLGE.PhysicsWheel.prototype.setTravel=function(travel){
	this.travel=travel;
	return this;
}
/**
* Sets the front friction coefficient
* @param {number} friction the front fricition coefficient
*/
GLGE.PhysicsWheel.prototype.setFrontFriction=function(friction){
	this.frontFriction=friction;
	return this;
}
/**
* Sets the side friction coefficient
* @param {number} friction the side fricition coefficient
*/
GLGE.PhysicsWheel.prototype.setSideFriction=function(friction){
	this.sideFriction=friction;
	return this;
}
/**
* Sets the wheel Rotation
* @param {number} rotation the rotation of the wheel
*/
GLGE.PhysicsWheel.prototype.setWheelRotation=function(rotation){
	this.setRotY(rotation);
	return this;
}
/**
* Gets the wheel Rotation
* @returns the wheel roation in radians
*/
GLGE.PhysicsWheel.prototype.getWheelRotation=function(rotation){
	return this.getRotY();
}
/**
* Gets the wheel Radius
* @returns the wheel radius
*/
GLGE.PhysicsWheel.prototype.getRadius=function(){
	return this.radius;
}
/**
* Gets the suspension spring
* @returns the wheel radius
*/
GLGE.PhysicsWheel.prototype.getSpring=function(){
	return this.spring;
}
/**
* Gets the suspension travel distance
* @returns the suspension travel
*/
GLGE.PhysicsWheel.prototype.getTravel=function(){
	return this.travel;
}
/**
* Gets the front friction coefficient
* @returns the front fricition coefficient
*/
GLGE.PhysicsWheel.prototype.getFrontFriction=function(){
	return this.frontFriction;
}
/**
* Gets the side friction coefficient
* @returns the side fricition coefficient
*/
GLGE.PhysicsWheel.prototype.getSideFriction=function(){
	return this.sideFriction;
}

/**
* Sets a driving force for the wheel
* @param {number} force the driving force in N
*/
GLGE.PhysicsWheel.prototype.drive=function(force){
	this.driveForce=force;
	return this;
}
/**
* Sets the braking level
* @param {number} brake 0-1 value indicating the level of braking
*/
GLGE.PhysicsWheel.prototype.brake=function(brake){
	this.braking=brake;
	return this;
}

})(GLGE);/*
Copyright (c) 2011 Martin Ruenz

Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @fileOverview Base class for preloaders. Enables the handling of multiple files.
 * @name glge_filepreloader.js
 * @author seamonkey@uni-koblenz.de
 */


(function(GLGE){




/**
* @class FilePreloader class
* @augments GLGE.Events
*/
GLGE.FilePreloader=function(){
	this.files=[];
}

GLGE.augment(GLGE.Events,GLGE.FilePreloader);

GLGE.FilePreloader.prototype.loadedBytes=0;
GLGE.FilePreloader.prototype.totalBytes=0;
GLGE.FilePreloader.prototype.numLoadedFiles=0;
GLGE.FilePreloader.prototype.numTotalFiles=0;
GLGE.FilePreloader.prototype.sizesCount=0;		/** @description Specifies how many file sizes has been collected */
GLGE.FilePreloader.prototype.progress=0; 		/** @description 0 - 100 */
GLGE.FilePreloader.prototype.files=null; 		/** @description List of files. file: {	"url":url,"loaded":fileloaded,"size":filesize,"bytesLoaded":loadedSize,
											"type":'xml'/'image',"callback":called when loaded,"content":content, "preloader":GLGE.FilePreloader} */
/**
* Add a file which has to be loaded
* @param {string} url 		The url of the file.
* @param {string} type 		Defines the type of the requested file. "image" or "xml"
* @param {function} [callback] 	Call this function when the file is loaded and pass the loaded content.
* @public
*/
GLGE.FilePreloader.prototype.addFile=function(url, type, callback){
	//if(this.files.indexOf(url) != -1) return;
	
	this.files.push({"url":url,"loaded":false,"size":-1,"bytesLoaded":0,"type":type,"callback":callback,"content":null,"preloader":this});
	this.numTotalFiles++;
}

/**
* Same as addFile. But instead of creating a new file object use an existing one.
* @param {object} file	The file to add.
* @public
*/
GLGE.FilePreloader.prototype.addFileRef=function(file){
	//if(this.files.indexOf(url) != -1) return;
	
	this.files.push(file);
	this.numTotalFiles++;
}

/**
* This function accumulates the size of all files. When done it triggers loadFiles(). It has to be called for each file.
* @param {object} file	Current file.
* @private
*/
GLGE.FilePreloader.prototype.accumulateFileSize=function(file)
{
	var req = new XMLHttpRequest();
	req.preloader = this;
	req.active = true;
	req.file = file;
	req.overrideMimeType("text/xml");
	req.onreadystatechange = function() {
		if(this.readyState  > 1 && req.active)
		{
			this.active = false;

			this.file.size = parseFloat(this.getResponseHeader('Content-length'));
			this.preloader.totalBytes += this.file.size;
			
			if(++this.preloader.sizesCount >= this.preloader.files.length) // are all file sizes collected?
				this.preloader.loadFiles();
			
			this.abort();
			this.onreadystatechange = null;
		}
	};
	req.open("GET", file.url, true);
	req.send("");
}

/**
* Start loading
* @public
*/
GLGE.FilePreloader.prototype.start=function(){
	for(i in this.files)
		this.accumulateFileSize(this.files[i]);
}

/**
* Load files. Assumes that the file sizes have been accumulated.
* @private
*/
GLGE.FilePreloader.prototype.loadFiles=function(){
	
	for(i in this.files){
		var file = this.files[i];
		if(file.type == "image")
		{
			// only update the preloader, when the file is completely loaded (no ajax)
			
			var image = new Image();
			file.content = image;
			var that = this;
			image.file = file;
			image.onload = function(){ that.fileLoaded(this.file, this.file.size); } 
			image.src=file.url;
		}else{
			// update the preloader each 0.1 seconds (ajax)
			
			var req = new XMLHttpRequest();
			req.overrideMimeType("text/xml");
			req.preloader = this;
			req.file = file;
			
			var updateTrigger = setInterval (function ()
			{
				if (req.readyState == 3)
				{
					// TODO: Check if the file reference is always correct
					var stepBytes = req.responseText.length - file.bytesLoaded;
					file.bytesLoaded = req.responseText.length;
					req.preloader.update(stepBytes);
				}
				
			}, 100);
			
			req.onreadystatechange = function() {
				if(this.readyState  >= 4)
				{	
					clearInterval(updateTrigger);
					this.file.content = this.responseXML;
					
					var stepBytes = this.responseText.length - this.file.bytesLoaded;
					
					this.preloader.update(stepBytes);
					this.preloader.fileLoaded(this.file, stepBytes);
				}
			};
			
			req.open("GET", file.url, true);
			req.send();
				
		}
	}
}

/**
 * This functions updates the progress.
 * @param {number} stepBytes	Amount of bytes that have been loaded since the last call. 
 * @private
 */
GLGE.FilePreloader.prototype.update=function(stepBytes){
	this.loadedBytes += stepBytes;
	this.progress = (100.0 * this.loadedBytes) / this.totalBytes;

	this.fireEvent("progress", {"progress":this.progress, "stepBytes":stepBytes, "loadedBytes":this.loadedBytes, "totalBytes":this.totalBytes, "loadedFiles": this.numLoadedFiles, "totalFiles": this.numTotalFiles}); 
}

/**
 * Called when a file has been loaded. This function triggers an event and updates the state.
 * @param {object} file		The file that has been loaded.
 * @param {number} stepBytes	Amount of bytes that have been loaded since the last call. 
 * @private
 */
GLGE.FilePreloader.prototype.fileLoaded=function(file, stepBytes){

	this.numLoadedFiles++;
	
	// update file
	file.loaded = true;
	file.bytesLoaded = file.size;	
	
	// update progress
	if(this.numLoadedFiles >= this.files.length){
		this.progress = 100;
		this.fireEvent("downloadComplete", {"file":file,"stepBytes":stepBytes});
	}else{
		this.update(stepBytes);
	}
	
	// events
	this.fireEvent("fileLoaded", {"file":file,"stepBytes":stepBytes});
	if(file.callback) file.callback(file);
}

/**
 * This function returns a list (an array) of all loaded files.
 * @public
 */
GLGE.FilePreloader.prototype.getLoadedFiles=function(){
	var result = [];
	for(i in this.files)
		if(this.files[i].loaded)
			result.push(this.files[i]);
	return result;
}

/**
 * This function returns information about one file.
 * @param {string} url	The url of the file.
 * @public
 */
GLGE.FilePreloader.prototype.getFile=function(url){
	for(i in this.files)
		if(this.files[i].url==url)
			return this.files[i];
	return -1;
}


})(GLGE);
/*
Copyright (c) 2011 Martin Ruenz

Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @fileOverview
 * @name glge_documentpreloader.js
 * @author seamonkey@uni-koblenz.de
 */


(function(GLGE){




/**
* @class Document preloader class
* @augments GLGE.Events
*/
GLGE.DocumentPreloader=function(doc, args){

	
	// create image preloader
	this.imagePreloader = new GLGE.FilePreloader();
	
	this.document = doc;
	

	if(args.XMLQuota)
		this.XMLQuota = args.XMLQuota;
	else
		this.XMLQuota = 0.2; // 20% XML, 80% images
	
	this.imageQuota = 1-this.XMLQuota;
		
	// Passing the size of all xml files will improve the accuracy of the preloader. Alternative: Pass the number of xml files (approximation)
	if(args.XMLBytes)
		this.XMLBytes = args.XMLBytes;
	else if(args.numXMLFiles)
		this.numXMLFiles = args.numXMLFiles;
	else
		this.numXMLFiles = 3; //TODO necessary?
}

GLGE.augment(GLGE.Events,GLGE.DocumentPreloader);

GLGE.DocumentPreloader.prototype.progress = 0;

GLGE.DocumentPreloader.prototype.imageQuota = 0;	// size quota of images (Textures) [0..1]
GLGE.DocumentPreloader.prototype.XMLQuota = 0; 		// size quota XML (Documents) [0..1]

GLGE.DocumentPreloader.prototype.XMLBytes = -1; 	// XML size in bytes (for higher accuracy)
GLGE.DocumentPreloader.prototype.totalBytes = -1; 	// XML size in bytes (highest accuracy)
GLGE.DocumentPreloader.prototype.loadedBytes=0;

GLGE.DocumentPreloader.prototype.numXMLFiles = 3;	// default value

GLGE.DocumentPreloader.prototype.state = 0; 		// 0: not yet started, 1: loading XML, 2: loading images, 3: completed
GLGE.DocumentPreloader.prototype.imagePreloader = null; // GLGE.Peloader
GLGE.DocumentPreloader.prototype.document = null;	// GLGE.Document

/**
 * Add an image, which should be loaded by the preloader.
 * @param {string} url	Url of the image.
 */
GLGE.DocumentPreloader.prototype.addImage=function(url){
	this.imagePreloader.addFile(url, "image");
}

/**
 * Start loading all images in all xml files. Assumes that XML-files have finished loading.
 */
GLGE.DocumentPreloader.prototype.loadImages=function(){

	this.changeState(2);
	
	if(this.progress < this.XMLQuota * 100.0) this.progress = this.XMLQuota * 100.0; // correct progress.

	var that = this;
	this.imagePreloader.addEventListener("progress", function(args){that.updateProgress.call(that, args);});
	this.imagePreloader.addEventListener("downloadComplete", function(args){that.finish.call(that, args);});
	this.imagePreloader.addEventListener("fileLoaded", function(args){that.fireEvent("fileLoaded", args.file);});
	this.imagePreloader.start();
}

/**
 * Update preloader progress.
 * @param {object} args		Progress information. 
 *				<br />args.stepBytes describes how many bytes have been loaded since the last update.
 */
GLGE.DocumentPreloader.prototype.updateProgress=function(args){

	if(this.state < 2){ // loading xml

		if(this.XMLBytes > 0){ // high accuracy
			//if(!args.stepBytes) args.stepBytes = 0; 
			this.loadedBytes += args.stepBytes;
			this.progress = this.XMLQuota * 100.0 * this.loadedBytes / this.XMLBytes;
		}
		else{ // low accuracy
			this.progress += this.XMLQuota * 100.0 / this.numXMLFiles;
			if(this.progress > this.XMLQuota * 100) this.progress = this.XMLQuota * 100;
		}
	}
	else{ // loading images
		this.progress = this.XMLQuota * 100 + this.imageQuota * this.imagePreloader.progress;
	}
	this.fireEvent("progress", {"progress":this.progress, "stepBytes":args.stepBytes, "loadedBytes":args.loadedBytes, "totalBytes":args.totalBytes, "loadedFiles": args.loadedFiles, "totalFiles": args.totalFiles});
}

/**
 * This function loads a XML-file. Assumes that loading images hasn't yet begun.
 * @param {string} url	Url of the XML-file.
 */
GLGE.DocumentPreloader.prototype.loadXMLFile=function(url){

	this.changeState(1);

	var xmlPreloader = new GLGE.FilePreloader();
	xmlPreloader.addFile(url, "xml");
	
	var that = this;
	
	if(this.XMLBytes > 0) xmlPreloader.addEventListener("progress", function(arg){that.updateProgress.call(that, arg);}); // high accuracy
	else xmlPreloader.addEventListener("downloadComplete", function(arg){that.updateProgress.call(that, arg);}); // low accuracy

	var doc = this.document;
	xmlPreloader.addEventListener("fileLoaded", function(args){ 
			args.file.content.getElementById=doc.getElementById; 
			doc.loaded(args.file.url,args.file.content);
			that.fireEvent("fileLoaded", args.file);
		});	
	
	xmlPreloader.start();
}

/**
 * Sets the state of the document preloader.
 * @param {number} newState	New state
 */
GLGE.DocumentPreloader.prototype.changeState = function(newState) {
	//if(this.state > newState) GLGE.warning("GLGE.DocumentPreloader.prototype.changeState: The new state is lower than the old.");
	this.state = newState;
	this.fireEvent("stateChange", newState);
}

/**
 * Called when the document preloader loaded all files.
 * @param {object} event	Event parameter. Not used at all.
 */
GLGE.DocumentPreloader.prototype.finish=function(event){
	this.changeState(3);
	this.progress = 100;
	this.fireEvent("downloadComplete");		
}

})(GLGE);
/*
Copyright (c) 2011 Martin Ruenz

Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @fileOverview
 * @name widget.js
 * @author seamonkey@uni-koblenz.de
 */

(function(GLGE){
if(typeof(GLGE.GUI) == "undefined"){
	/**
	* @namespace Holds the functionality of the GUI
	*/
	GLGE.GUI = {};
}
(function(GUI){




/**
 * Replace as much gui-objects as possible, with those provided by the library
 */
GUI.useLibrary = function(library){
	if((library == "jQuery") && jQuery) {  
	
		// progressbar
		GUI.Progressbar.prototype.setValue = function(value){$(this.domRoot).progressbar({'value': value });}
		GUI.Progressbar.prototype.init = function(){ $(this.domRoot).progressbar({value: 0 }); }	
	}
	// TODO: Support for more libraries and widgets
}


/**
 * @class Widget	Widgets are gui objects like progressbars or sliders
 */
GUI.Widget = function(){
	this.domRoot = document.createElement('div');
	this.domRoot.setAttribute('class','glge-gui-widget-root');
	
	this.init();
}
GUI.Widget.prototype.domRoot = null;

GUI.Widget.prototype.init = function(){};


/**
 * @class Progressbar	A progressbar widget
 */
GUI.Progressbar = function(){
	// call super constructor
	this.baseclass.call(this);
	
	this.domRoot.className += ' glge-gui-progressbar';
}
GUI.Progressbar.prototype.value = 0;

/**
 * Set the progress value
 * @param {number} value	progress value
 */
GUI.Progressbar.prototype.setValue = function(value){
	this.value = value;
}

GLGE.augment(GUI.Widget,GUI.Progressbar);


})(GLGE.GUI);})(GLGE);
/*
Copyright (c) 2011 Martin Ruenz

Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @fileOverview
 * @name gadget.js
 * @author seamonkey@uni-koblenz.de
 */

(function(GLGE){
if(typeof(GLGE.GUI) == "undefined"){
	/**
	* @namespace Holds the functionality of the GUI
	*/
	GLGE.GUI = {};
}
(function(GUI){

/**
 * @class Gadget	Gadgets are more complex widgets. One could think of them as windows. They may contain widgets.
 */
GUI.Gadget=function(){

	// setup new DOM-Object
	
	// root
	this.domGadgetRoot = document.createElement('div');
	this.domGadgetRoot.setAttribute('class','glge-gui-gadget-root');
	this.domGadgetRoot.style.position = 'absolute';
	this.domGadgetRoot.style.top = '0px';

	// Outer Wrapper
	this.domGadgetOuterWrapper = document.createElement('div');
	this.domGadgetOuterWrapper.setAttribute('class','glge-gui-gadget-OuterWrapper');
	this.domGadgetOuterWrapper.style.position = 'relative';
	this.domGadgetRoot.appendChild(this.domGadgetOuterWrapper);
	
	// Inner Wrapper
	this.domGadgetInnerWrapper = document.createElement('div');
	this.domGadgetInnerWrapper.setAttribute('class','glge-gui-gadget-InnerWrapper');
	this.domGadgetInnerWrapper.style.position = 'relative';	
	this.domGadgetOuterWrapper.appendChild(this.domGadgetInnerWrapper);
	
	// object	
	this.domGadgetObject = document.createElement('div');
	this.domGadgetObject.setAttribute('class','glge-gui-gadget');
	this.domGadgetObject.style.position = 'relative';
	this.domGadgetInnerWrapper.appendChild(this.domGadgetObject);
	
	// footer
	this.domGadgetFooter = document.createElement('div');
	this.domGadgetFooter.setAttribute('class','glge-gui-gadget-footer');
	this.domGadgetFooter.style.clear = 'both';
	this.domGadgetRoot.appendChild(this.domGadgetFooter);
	
	// variables

	this.position = {};
	this.position.x = 'middle';
	this.position.y = 'middle';
	
	this.updatePosition();
}


GUI.Gadget.prototype.domGadgetRoot = null; // div: attached to dom
GUI.Gadget.prototype.domGadgetOuterWrapper = null; // div: wrapper for css (vertical align)
GUI.Gadget.prototype.domGadgetInnerWrapper = null; // div: wrapper for css (horizontal align)
GUI.Gadget.prototype.domGadgetObject = null; // div: actual gadget
GUI.Gadget.prototype.domGadgetFooter = null; // div: footer
GUI.Gadget.prototype.domGadgetParent = null; // parent object, already in dom
GUI.Gadget.prototype.position = null; // position.x, position.y

/**
 * This function sets the position of the gadget
 * @param {object} position	position.x, possible values: "left", "middle", "right", number<br /> 
 *				position.y, possible values: "top", "middle", "bottom", number
 */
GUI.Gadget.prototype.setPosition = function(position){
	if(position){
		if(position.x)
			this.position.x = position.x;
		if(position.y)
			this.position.y = position.y;
	}
	this.updatePosition();
}

/**
 * This function changes css attributes in order to position the gadget
 * @param {object} position	position.x, possible values: "left", "middle", "right"<br /> 
 *				position.y, possible values: "top", "middle", "bottom"
 */
 // TODO: Possibility to set the position absolute (e.g. x= 15, y=20)
GUI.Gadget.prototype.updatePosition = function(){

	if(!this.domGadgetParent) return;
	
	var parentPosition = '';
	if(document.defaultView && document.defaultView.getComputedStyle)
		parentPosition = document.defaultView.getComputedStyle(this.domGadgetParent,null).getPropertyValue('position');
	else if (this.domGadgetParent.currentStyle)
		parentPosition = this.domGadgetParent.currentStyle['position'];

	if(parentPosition == 'absolute'){
	
		this.domGadgetRoot.style.width = '100%';
		this.domGadgetRoot.style.height = '100%';
		this.domGadgetRoot.style.display = 'table';
		
		this.domGadgetOuterWrapper.style.display = 'table-cell';
	
		if(this.position.y == "top"){
			this.domGadgetOuterWrapper.style.verticalAlign = 'top';
		}
		else if(this.position.y == "middle"){
			this.domGadgetOuterWrapper.style.verticalAlign = 'middle';
		}
		else if(this.position.y == "bottom"){
			this.domGadgetOuterWrapper.style.verticalAlign = 'bottom';
		}
	
		if(this.position.x == "left"){
	
			this.domGadgetInnerWrapper.style.cssFloat = 'left';
			this.domGadgetInnerWrapper.style.left = '0px';
		
			this.domGadgetObject.style.cssFloat = 'left';
			this.domGadgetObject.style.left = '0px';
		}
		else if(this.position.x == "middle"){
	
			this.domGadgetInnerWrapper.style.cssFloat = 'right';
			this.domGadgetInnerWrapper.style.right = '50%';
		
			this.domGadgetObject.style.cssFloat = 'left';
			this.domGadgetObject.style.right = '-50%';
		}
		else if(this.position.x == "right"){
	
			this.domGadgetInnerWrapper.style.cssFloat = 'right';
			this.domGadgetInnerWrapper.style.right = '0px';
		
			this.domGadgetObject.style.cssFloat = 'right';
			this.domGadgetObject.style.right = '0px';
		}
	}else{ // TODO: css would be much better!

		if(this.position.y == "top"){
			this.domGadgetRoot.style.top = this.domGadgetParent.offsetTop;
		}
		else if(this.position.y == "middle"){
			this.domGadgetRoot.style.top = this.domGadgetParent.offsetTop + this.domGadgetParent.offsetHeight / 2 - this.domGadgetRoot.offsetHeight / 2;
		}
		else if(this.position.y == "bottom"){
			this.domGadgetRoot.style.top = this.domGadgetParent.offsetTop + this.domGadgetParent.offsetHeight - this.domGadgetRoot.offsetHeight;
		}
	
		if(this.position.x == "left"){
			this.domGadgetRoot.style.left = this.domGadgetParent.offsetLeft;
		}
		else if(this.position.x == "middle"){
			this.domGadgetRoot.style.left = this.domGadgetParent.offsetLeft + this.domGadgetParent.offsetWidth / 2 - this.domGadgetRoot.offsetWidth / 2;
		}
		else if(this.position.x == "right"){
			this.domGadgetRoot.style.left = this.domGadgetParent.offsetLeft + this.domGadgetParent.offsetWidth - this.domGadgetRoot.offsetWidth;
		}
	}
}

/**
 * Add Gadget to DOM
 * @param {object} element	Parent element of the gadget
 * @param {object} [position]	position.x, possible values: "left", "middle", "right"<br /> 
 *				position.y, possible values: "top", "middle", "bottom"
 */
GUI.Gadget.prototype.addToDOM = function(element, position){

	this.domGadgetParent = element;
	
	// add gadget to the document
	this.domGadgetParent.appendChild(this.domGadgetRoot);	
	
	this.setPosition(position);
}


})(GLGE.GUI);})(GLGE);
/*
Copyright (c) 2011 Martin Ruenz

Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
*/

/**
 * @fileOverview
 * @name preloader_gadget.js
 * @author seamonkey@uni-koblenz.de
 */

(function(GLGE){
(function(GUI){

/**
* @class Preloader gadget
* @augments GLGE.GUI.Gadget
*/
GUI.Preloader=function(){
	// call super constructor
	this.baseclass.call(this);
	
	this.domGadgetObject.innerHTML = "<h1>Loading</h1>";
	this.domGadgetObject.className += ' glge-gui-gadget-preloader';
		
	// progress bar
	this.progressBar = new GUI.Progressbar();
	this.domGadgetObject.appendChild(this.progressBar.domRoot);
	
	this.domPercentageLabel = document.createElement('div');
	this.domPercentageLabel.setAttribute('class','glge-gui-gadget-preloader-percentage');
	this.domPercentageLabel.innerHTML = "<div style='float:left;'>0%</div><div style='float:right;'>100%</div></div>";
	this.domGadgetObject.appendChild(this.domPercentageLabel);
	
	// information box
	this.domInfoBox = document.createElement('div');
	this.domInfoBox.setAttribute('class','glge-gui-gadget-preloader-info');
	this.domInfoBox.setAttribute('style','clear:both;');
	this.domGadgetObject.appendChild(this.domInfoBox);
	
	// state label
	this.domStateLabel = document.createElement('div');
	this.domInfoBox.appendChild(this.domStateLabel);
	
	// bytes label
	this.domBytesLabel = document.createElement('div');
	this.domInfoBox.appendChild(this.domBytesLabel);
	
	// files label
	this.domFilesLabel = document.createElement('div');
	this.domInfoBox.appendChild(this.domFilesLabel);
	
	// last file label
	this.domLastFileLabel = document.createElement('div');
	this.domInfoBox.appendChild(this.domLastFileLabel);
}

GUI.Preloader.prototype.progressBar = null;
GUI.Preloader.prototype.documentLoader = null;
GUI.Preloader.prototype.domInfoBox = null;
GUI.Preloader.prototype.domStateLabel = null;
GUI.Preloader.prototype.domBytesLabel = null;
GUI.Preloader.prototype.domFilesLabel = null;
GUI.Preloader.prototype.domLastFileLabel = null;
GUI.Preloader.prototype.domPercentageLabel = null;


/**
 * Combine the preloader gadget with an actual preloader
 * @param {GLGE.DocumentPreloader} docLoader	preloader
 */ 
GUI.Preloader.prototype.setDocumentLoader = function(docLoader){
	
	this.documentLoader = docLoader;
	
	// add listeners
	var that = this;
	this.documentLoader.addEventListener("downloadComplete", function(args){that.complete(args);});
	this.documentLoader.addEventListener("progress", function(args){that.progress(args);});
	this.documentLoader.addEventListener("stateChange", function(args){that.stateChange(args);});
	this.documentLoader.addEventListener("fileLoaded", function(args){that.fileLoaded(args);});
}

/**
 * Add preloader-gadget to DOM. Creates the content of the DOM-object (domGadgetObject).
 * @param {object} element			Parent element of the gadget
 * @param {string|object} [position]		Gadget position
 */ 
GUI.Preloader.prototype.addToDOM = function(element, position){

	// update labels
	this.stateChange(this.documentLoader.state);
	this.progress({progress:0, loadedBytes:0, loadedFiles:0, totalFiles:0, totalBytes: 0});
	this.fileLoaded({});
	
	this.baseclass.addToDOM.call(this, element, position)
}

/**
 * Called on progress
 */
GUI.Preloader.prototype.progress = function(args){
	//this.domProgressBar.progressbar({value: args.progress });
	this.progressBar.setValue(args.progress);
	this.domBytesLabel.innerHTML = args.loadedBytes + " of " + args.totalBytes + " Bytes loaded";
	this.domFilesLabel.innerHTML = args.loadedFiles + " of " + args.totalFiles + " Files loaded";
}

/**
 * Called when the preloader finished loading
 */
GUI.Preloader.prototype.complete = function(args){
	//this.domProgressBar.progressbar({value: 100 });
	this.progressBar.setValue(100);
	var that = this;
	setTimeout ( function(){that.domGadgetRoot.parentNode.removeChild(that.domGadgetRoot)}, 300);
	
}

/**
 * Called when the preloader changed it's state
 */
GUI.Preloader.prototype.stateChange = function(args){
	switch(args)
	{
		case 0:
		case 1: this.domStateLabel.innerHTML = "Step 1 of 2: Loading XML"; break;
		case 2:
		case 3: this.domStateLabel.innerHTML = "Step 2 of 2: Loading Textures"; break;
	}
}

/**
 * Called when a file has been loaded
 */
GUI.Preloader.prototype.fileLoaded = function(args){
	if(args.url){
		var path = args.url;
		
		// use only 40 letters
		if(path.length > 40){
			path = path.slice(-37);
			path = "..." + path;
		}
		this.domLastFileLabel.innerHTML = "Last file loaded: \"" + path + "\"";
	}
	else 
		if(this.domLastFileLabel.innerHTML == "") this.domLastFileLabel.innerHTML = "Last file loaded: <i>none</i>";
}

GLGE.augment(GUI.Gadget,GUI.Preloader);

})(GLGE.GUI);})(GLGE);
