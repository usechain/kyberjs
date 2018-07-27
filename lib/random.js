const BN = require("bn.js");
const constants = require("./constants");

/**
 * module: random
 */

/**
 * bits choses a random Uint8Array with a maximum bitlength
 * If exact is `true`, chose Uint8Array with *exactly* that bitlenght not less
 *
 * @param {number} bitlen - Bitlength
 * @param {boolean} exact
 * @param {function} callback - to generate random Uint8Array of given length
 * @returns {Uint8Array}
 */
function bits(bitlen, exact, callback) {
  let b = callback((bitlen + 7) >> 3);
  // console.log("b b:",b)
  let highbits = bitlen & 7;
  if (highbits != 0) {
    b[0] &= ~(0xff << highbits);
  }

  if (exact) {
    if (highbits !== 0) {
      b[0] |= 1 << (highbits - 1);
    } else {
      b[0] |= 0x80;
    }
  }
    // console.log("e b:",b)
    // console.log("Uint8Array.from(b):",Uint8Array.from(b))
  return Uint8Array.from(b);
}

/**
 * int choses a random uniform Uint8Array less than given modulus
 *
 * @param {BN.jsObject} mod - modulus
 * @param {function} callback - to generate a random byte array
 * @returns {Uint8Array}
 */
function int(mod, callback) {
  let bitlength = mod.bitLength();
  let i;
  var k=0;
  while (k<1) {
    k++
    const bytes = bits(bitlength, false, callback);

    i = new BN(bytes);

    if (i.cmp(constants.zeroBN) > 0 && i.cmp(mod) < 0) {
      return bytes;
    }
  }
  throw new Error("bytes is empty")
}

module.exports = {
  bits,
  int
};
