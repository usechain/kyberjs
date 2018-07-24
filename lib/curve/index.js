"use strict";

const nist = require("./nist");
const secp256k1 = require("./secp256k1");
const edwards25519 = require("./edwards25519");

const mappings = {};
mappings["edwards25519"] = edwards25519.Curve;
mappings["p256"] = nist.Curve.bind(nist.Params.p256);
mappings["k256"] = secp256k1.Curve.bind(secp256k1.Params.k256);

/**
 * availableCurves returns all the curves currently implemented as an array of string
 *
 * @returns {Array} array of names of the curves
 */
function availableCurves() {
  return Object.keys(mappings);
}

/**
 * newCurve returns a new curve from its name. The name must be in the list returned by "availableCurves()".
 * It returns an undefined value if the name is not known.
 * @param {string} name the name of the curve
 * @returns {kyber.Group} a curve that implements the Group definition
 */
function newCurve(name) {
  if (!(name in mappings)) throw new Error("curve not known");
  console.log("curve name:",name)
  return new mappings[name]();

}

module.exports = {
  nist,
  edwards25519,
  secp256k1,
  availableCurves,
  newCurve
};
