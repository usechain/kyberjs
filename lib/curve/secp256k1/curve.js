/**
 * Created by zhouhh on 2018/7/24.
 * Copyright 2018-2020 Usechain.net
 */
"use strict";

const Scalar = require("./scalar");
const Point = require("./point");
const crypto = require("crypto");
const elliptic = require("elliptic");
const BN = require("bn.js");
const group = require("../../index.js");

/**
 * @module curves/secp256k1/curve
 */

/**
 * Class Secp256k1 defines the weierstrass form of
 * elliptic curves.
 * secp256k1 defines by T =（p，a，b，G，n，h）
 * p = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE FFFFFC2F
 * p = 2**256-2**32-2**9-2**8-2**7-2**6-2**4-1
 * elliptic curve: y**2=x**3+ax+b
 * a=0,b=7
 * G(gx,gy):04 79BE667E F9DCBBAC 55A06295 CE870B07 029BFCDB 2DCE28D9 59F2815B 16F81798 483ADA77 26A3C465 5DA4FBFC 0E1108A8 FD17B448 A6855419 9C47D08F FB10D4B8
 * gx:0x79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798
 * gy:0x483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8
 * order of G:n = FFFFFFFF FFFFFFFF FFFFFFFF FFFFFFFE BAAEDCE6 AF48A03B BFD25E8C D0364141
 * h:01
 */
class Secp256k1 extends group.Group {
  /**
   * Create a new Weierstrass Curve
   *
   * @param {object} config - Curve configuration
   * @param {String} config.name - Curve name
   * @param {(String|Uint8Array|BN.jsObject)} config.p - Order of the underlying field. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.a - Curve Parameter a. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.b - Curve Parameter b. Little Endian if string or Uint8Array.
   * @param {(String|Uint8Array|BN.jsObject)} config.n - Order of the base point. Little Endian if string or Uint8Array
   * @param {(String|Uint8Array|BN.jsObject)} config.gx - x coordinate of the base point. Little Endian if string or Uint8Array
   * @param {(String|Uint8Array|BN.jsObject)} config.gy - y coordinate of the base point. Little Endian if string or Uint8Array
   * @param {number} config.bitSize - the size of the underlying field.
   */
  constructor(config) {
    super();
    let { name, bitSize,gx,gy, ...options } = config;
    this.name = name;
    options["g"] = [new BN(gx, 16, "le"), new BN(gy, 16, "le")];
    // for (let k in options) {
    //   if (k === "g") {
    //     continue;
    //   }
    //   options[k] = new BN(options[k], 16, "le");
    // }
    this.curve = new elliptic.curve.short(options);
    this.bitSize = bitSize;
    this.redN = BN.red(options.n);
  }

  /**
   * Returns the name of the curve
   *
   * @returns {string}
   */
  string() {
    return this.name;
  }

  _coordLen() {
    return (this.bitSize + 7) >> 3;
  }

  /**
   * Returns the size in bytes of a scalar
   *
   * @returns {number}
   */
  scalarLen() {
    return (this.curve.n.bitLength() + 7) >> 3;
  }

  /**
   * Returns the size in bytes of a point
   *
   * @returns {module:curves/secp256k1/scalar~Scalar}
   */
  scalar() {
    return new Scalar(this, this.redN);
  }

  /**
   * Returns the size in bytes of a point
   *
   * @returns {number}
   */
  pointLen() {
    // ANSI X9.62: 1 header byte plus 2 coords
    return this._coordLen() * 2 + 1;
  }

  /**
   * Returns a new Point
   *
   * @returns {module:curves/secp256k1/point~Point}
   */
  point() {
    return new Point(this);
  }
}

module.exports = Secp256k1;
