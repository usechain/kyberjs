/**
 * Created by zhouhh on 2018/7/24.
 * Copyright 2018-2020 Usechain.net
 */
"use strict";

const BN = require("bn.js");
var hash = require('hash.js');
var pre;
try {
    pre = require('./secp256k1pre');
} catch (e) {
    pre = undefined;
}

module.exports = {
    k256: {
    name: "secp256k1",
    bitSize: 256,
    gx: new BN(
        "79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798",//55066263022277343669578718895168534326250603453777594175500187360389116729240L
        16
    ),
    gy: new BN(
        "483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8",//32670510020758816978083085130507043184471273380659243275938904335757337482424L
        16
    ),
    p: new BN(
      "fffffffffffffffffffffffffffffffffffffffffffffffffffffffefffffc2f",
      16
      //default "be" big endian,"le": little endian
    ),
    // -3 mod p
    a: 0,
    b: 7,
    n: new BN(
      "fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141",
      16
      //"le"
    ),
    h: 1,

      //maybe should be le
    beta: new BN(
        "7ae96a2b657c07106e64479eac3434e99cf0497512f58995c1396c28719501ee",
        16
    ),
    lambda: new BN(
        "5363ad4cc05c30e0a5261c028812645a122e22ea20816678df02967c1b23bd72",
        16
    ),
    basis: [
      {
          a: '3086d221a7d46bcde86c90e49284eb15',
          b: '-e4437ed6010e88286f547fa90abfe4c3'
      },
      {
          a: '114ca50f7a8e2f3f657c1108d9d44cfd8',
          b: '3086d221a7d46bcde86c90e49284eb15'
      }
    ],

    gRed: false,
    g: [
      '79be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798',
      '483ada7726a3c4655da4fbfc0e1108a8fd17b448a68554199c47d08ffb10d4b8',
      pre
    ]

  }
};
