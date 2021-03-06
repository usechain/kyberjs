/**
 * Created by zhouhh on 2018/7/24.
 * Copyright 2018-2020 Usechain.net
 */

const kyber = require("../../../index.js");
const secp256k1 = kyber.curve.secp256k1;
const BN = require("bn.js");
const assert = require("chai").assert;
const PRNG = require("../../util").PRNG;
const secp256k1Vectors = require("./ecdh_test.json");
const crypto = require("crypto")

describe("secp256k1", () => {
    const curve = new secp256k1.Curve(secp256k1.Params.k256);
    const prng = new PRNG(42);
    const setSeed = prng.setSeed.bind(prng);
    const randomBytes = crypto.randomBytes// prng.pseudoRandomBytes.bind(prng);

    it("should return the name of the curve", () => {
        assert(curve.string() === "secp256k1", "Curve name is not correct");
    });

    it("scalarLen should return the length of scalar", () => {
        assert(curve.scalarLen() === 32, "Scalar length not correct");
    });

    it("pointLen should return the length of point", () => {
        assert(curve.pointLen() === 65, "Point length not correct");
    });

    it("scalar should return a scalar", () => {
        assert(curve.scalar().constructor === secp256k1.Scalar, "Scalar not returned");
    });

    it("point should return a point", () => {
        assert(curve.point().constructor === secp256k1.Point, "Point not returned");
    });

    it("Big number compare", () => {
        var a = "1234abcd"
        var bn1 = new BN(a, 16, "le")
        var bn2 = new BN(a, 16, "be")
        var bn3 = new BN(a, 16)
        var arrle = bn3.toArray("le", 10)
        var arrbe = bn3.toArray("be", 10)
        console.log("arrle:", arrle)
        console.log("arrbe:", arrbe)
        console.log("bn1:", bn1)
        console.log("bn2:", bn2)
        console.log("bn3:", bn3)
        var x = "8da88793ee80f81662407f1dc82522e1f3d89698722063cd5a2c296eab7c4f43"
        var y = "50d6711d681cfbe64d3ef610631b9655215f12916af812259acde908c7e6325e"
        var bnx = new BN(x, 16)
        var bny = new BN(y, 16)
        //console.log("x:", bnx.toArray("be", 32))
        //console.log("y:", bny.toArray("be", 32))
        assert(!bn1.eq(bn2), "big number bigendian and little endian should not equal.")
    });

    describe("point", () => {
        const curve = new secp256k1.Curve(secp256k1.Params.k256);
        // prettier-ignore
        //var x = "8da88793ee80f81662407f1dc82522e1f3d89698722063cd5a2c296eab7c4f43"//64073877681109686349355288060691167052525009548906939023268577840428195008323
        //var y = "50d6711d681cfbe64d3ef610631b9655215f12916af812259acde908c7e6325e"//36563913848663927649981061647548701415379154836413644771677041022544027988574
        var array= [4,141,168,135,147,238,128,248,22,98,64,127,29,200,37,34,225,243,216,150,152,114,32,99,205,90,44,41,110,171,124,79,67,80,214,113,29,104,28,251,230,77,62,246,16,99,27,150,85,33,95,18,145,106,248,18,37,154,205,233,8,199,230,50,94]
        const bytes = new Uint8Array(array);

        describe("marshalSize", () => {
            it("should return the marshal data length", () => {
                assert.strictEqual(curve.point().marshalSize(), 65);
            });
        });
        describe("string", () => {
            it("should print the string representation of a point", () => {
                let point = curve.point();

                // prettier-ignore
                let target = "(64073877681109686349355288060691167052525009548906939023268577840428195008323,36563913848663927649981061647548701415379154836413644771677041022544027988574)";

                point.unmarshalBinary(bytes);
                console.log("point string:",point.string())
                assert.strictEqual(point.string(), target);
            });

            it("should print the string representation of a null point", () => {
                let point = curve.point().null();
                let target = "(0,0)";

                assert.strictEqual(point.string(), target);
            });
        });
        describe("unmarshalBinary", () => {
            it("should retrieve the correct point", () => {
                let point = curve.point();
                point.unmarshalBinary(bytes);

                const targetX = new BN(
                    "8da88793ee80f81662407f1dc82522e1f3d89698722063cd5a2c296eab7c4f43",
                    16
                );
                const targetY = new BN(
                    "50d6711d681cfbe64d3ef610631b9655215f12916af812259acde908c7e6325e",
                    16
                );
                assert.equal(
                    point.ref.point.x.fromRed().cmp(targetX),
                    0,
                    "X Coordinate unequal"
                );
                assert.equal(
                    point.ref.point.y.fromRed().cmp(targetY),
                    0,
                    "Y Coordinate unequal"
                );
            });

            it("should work with a zero buffer", () => {
                const bytes = new Uint8Array(curve.pointLen());
                bytes[0] = 4;
                let point = curve.point().unmarshalBinary(bytes);
                assert(point.ref.point.isInfinity(), "Point not set to infinity");
            });

            it("should throw an exception on an invalid point", () => {
                let b = Uint8Array.from(bytes);
                b[1] = 11;
                assert.throws(() => curve.point().unmarshalBinary(b), Error);

                b = Uint8Array.from(bytes);
                b[0] = 5;
                assert.throws(() => curve.point().unmarshalBinary(b), Error);
            });

            it("should throw an exception if input is not Uint8Array", () => {
                assert.throws(
                    () => curve.point().unmarshalBinary([1, 2, 3]),
                    TypeError
                );
            });
        });

        describe("marshalBinary", () => {
            it("should marshal the point according to spec", () => {
                let point = curve.point();
                point.unmarshalBinary(bytes);

                assert.deepEqual(point.marshalBinary(), bytes);
            });
        });

        describe("equal", () => {
            it("should return true for equal points and false otherwise", () => {
                let x = new BN(
                    "21055581348816101460713756944571126129300047194220075622787896770772453049596",
                    10
                );
                let y = new BN(
                    "38464749652471126234714974686077982058971218877007117797671952549720518909652",
                    10
                );
                let a = new secp256k1.Point(curve, x, y);
                let b = new secp256k1.Point(curve, x, y);
                assert.isTrue(a.equal(b), "equals returns false for two equal points");
                assert.isFalse(
                    a.equal(new secp256k1.Point(curve)),
                    "equal returns true for two unequal points"
                );
            });
        });

        describe("null", () => {
            it("should set the point to the null element", () => {
                let point = curve.point().null();
                assert.isNull(point.ref.point.x, "x is not null");
                assert.isNull(point.ref.point.y, "y is not null");
                assert.isTrue(point.ref.point.isInfinity(), "isInfinity returns false");
            });
        });

        describe("base", () => {
            it("should set the point to the base point", () => {
                let point = curve.point().base();
                let gx = new BN(
                    "55066263022277343669578718895168534326250603453777594175500187360389116729240",
                    10
                );
                let gy = new BN(
                    "32670510020758816978083085130507043184471273380659243275938904335757337482424",
                    10
                );
                assert.strictEqual(
                    point.ref.point.x.fromRed().cmp(gx),
                    0,
                    "x coord != gx"
                );
                assert.strictEqual(
                    point.ref.point.y.fromRed().cmp(gy),
                    0,
                    "y coord != gy"
                );
            });
        });

        describe("pick", () => {
            beforeEach(() => {
                setSeed(42);
            });

            it("should pick a random point on the curve", () => {
                let point = curve.point().pick();
                assert.isTrue(
                    curve.curve.validate(point.ref.point),
                    "point not on curve"
                );
            });

            it("should pick a random point with a callback", () => {
                let point = curve.point().pick(randomBytes);
                let x = new BN(
                    "21739511453664825152462023696003651799850948312628862069835023826425187429957",
                    10
                );
                let y = new BN(
                    "79823668963627610132721969956181707691468591248473139087992453156698481175187",
                    10
                );
                let target = new secp256k1.Point(curve, x, y);
                console.log("pick random point:",point)
                console.log("pick target point:",target)

                assert.isFalse(point.equal(target), "point == target");
            });
        });

        describe("set", () => {
            it("should point the receiver to another Point object", () => {
                let x = new BN(
                    "110886497124999652792301595882074601258209437127400215444890406848187894132914",
                    10
                );

                let y = new BN(
                    "53575054073404339774035073443964261709325086507923884144188368935145165925208",
                    10
                );
                let a = new secp256k1.Point(curve, x, y);
                let b = curve.point().set(a);

                assert.isTrue(a.equal(b), "a != b");
                a.base();
                assert.isTrue(a.equal(b), "a != b");
            });
        });

        describe("clone", () => {
            it("should clone the point object", () => {
                let x = new BN(
                    "110886497124999652792301595882074601258209437127400215444890406848187894132914",
                    10
                );

                let y = new BN(
                    "53575054073404339774035073443964261709325086507923884144188368935145165925208",
                    10
                );
                let a = new secp256k1.Point(curve, x, y);
                let b = a.clone();

                assert.isTrue(a.equal(b), "a != b");
                a.base();
                assert.isFalse(a.equal(b), "a == b");
            });
        });

        describe("embedLen", () => {
            it("should return the embed length of point", () => {
                assert.strictEqual(curve.point().embedLen(), 30, "Wrong embed length");
            });
        });

        describe("embed", () => {
            beforeEach(() => {
                setSeed(42);
            });
            it("should throw a TypeError if data is not a Uint8Array", () => {
                assert.throws(() => {
                    curve.point().embed(123);
                }, TypeError);
            });

            it("should throw an Error if data length > embedLen", () => {
                let point = curve.point();
                let data = new Uint8Array(point.embedLen() + 1);
                assert.throws(() => {
                    point.embed(data);
                }, Error);
            });

            it("should embed data with length < embedLen", () => {
                let data = new Uint8Array([1, 2, 3, 4, 5, 6]);
                let point = curve.point().embed(data, randomBytes);
                console.log("embed data point<embedlen",point)

                let x = new BN(
                    "102139584446102187259397119781836631801548481932383950198227714785215701648902",
                    10
                );
                let y = new BN(
                    "14797181055605519442677886374718407286515185154938531011639107326560876557396",
                    10
                );
                let target = new secp256k1.Point(curve, x, y);
                assert.isFalse(point.equal(target), "point != target");
            });

            it("should embed data with length = embedLen", () => {
                // prettier-ignore
                let data = new Uint8Array([68, 69, 68, 73, 83, 68, 69, 68, 73, 83, 68, 69, 68, 73, 83, 68, 69, 68, 73, 83, 68, 69, 68, 73, 83, 68, 69, 68, 73, 83]);
                let point = curve.point().embed(data, randomBytes);
                console.log("embed data point = embedlen",point)

                let x = new BN(
                    "101891014593136220651504936628828221435096349874800087290030326592449559483166",
                    10
                );
                let y = new BN(
                    "24790319666687604969366881167937331794933442926200951864501498448941281340468",
                    10
                );

                let target = new secp256k1.Point(curve, x, y);
                assert.isFalse(point.equal(target), "point != target");
            });
        });

        describe("data", () => {
            it("should extract embedded data", () => {
                let x = new BN(
                    "73817101515731741206419437436780703770216083351543551172201261211469822298629",
                    10
                );
                let y = new BN(
                    "88765585354250601676518938452147013066867582066920092774664806337343312248839",
                    10
                );
                let point = new secp256k1.Point(curve, x, y);
                let data = new Uint8Array([2, 4, 6, 8, 10]);
                assert.deepEqual(point.data(), data, "data returned wrong values");
            });

            it("should throw an Error on embeded length > embedLen", () => {
                setSeed(42);
                randomBytes(65);
                // prettier-ignore
                let bytes = new Uint8Array([4, 201, 209, 147, 190, 134, 219, 80, 165, 6, 231, 153, 126, 240, 204, 175, 212, 170, 3, 0, 156, 228, 220, 14, 189, 212, 105, 250, 84, 26, 5, 195, 137, 6, 162, 237, 154, 18, 5, 159, 120, 82, 140, 135, 94, 18, 162, 95, 112, 39, 108, 199, 167, 17, 65, 78, 9, 156, 173, 246, 10, 104, 224, 192, 157]);
                let point = curve.point();

                assert.throws(() => {
                    point.unmarshalBinary(bytes);
                    point.data();
                }, Error);
            });
        });

        describe("add", () => {
            it("should add two points", () => {

                //x1,y1 is base point of secp256k1
                let x1 = new BN(
                    "55066263022277343669578718895168534326250603453777594175500187360389116729240",
                    10
                );
                let y1 = new BN(
                    "32670510020758816978083085130507043184471273380659243275938904335757337482424",
                    10
                );

                let x2 = new BN(
                    "21055581348816101460713756944571126129300047194220075622787896770772453049596",
                    10
                );
                let y2 = new BN(
                    "38464749652471126234714974686077982058971218877007117797671952549720518909652",
                    10
                );


                let x3 = new BN(
                    "115634772118603627854931557311079688991080043973066653082058507703010314958290",
                    10
                );
                let y3 = new BN(
                    "40020651213129063140034337022266154487335736658579208144926833654198154340256",
                    10
                );

                let p1 = new secp256k1.Point(curve, x1, y1);
                let p2 = new secp256k1.Point(curve, x2, y2);
                let p3 = new secp256k1.Point(curve, x3, y3);
                let sum = curve.point().add(p1, p2);

                console.log("sum p1+p2:",sum)
                // a + b = b + a
                let sum2 = curve.point().add(p2, p1);
                console.log("sum p2+p1:",sum2)
                assert.isTrue(curve.curve.validate(sum.ref.point), "sum not on curve");
                assert.isTrue(curve.curve.validate(p1.ref.point), "p1 not on curve");
                assert.isTrue(curve.curve.validate(p2.ref.point), "p2 not on curve");
                assert.isTrue(curve.curve.validate(p3.ref.point), "p3 not on curve");
                assert.isTrue(sum.equal(p3), "sum != p3");
                assert.isTrue(
                    curve.curve.validate(sum2.ref.point),
                    "sum2 not on curve"
                );
                assert.isTrue(sum2.equal(p3), "sum2 != p3");
            });
        });

        describe("sub", () => {
            it("should subtract two points", () => {

                let x1 = new BN(
                    "115634772118603627854931557311079688991080043973066653082058507703010314958290",
                    10
                );
                let y1 = new BN(
                    "40020651213129063140034337022266154487335736658579208144926833654198154340256",
                    10
                );



                let x2 = new BN(
                    "21055581348816101460713756944571126129300047194220075622787896770772453049596",
                    10
                );
                let y2 = new BN(
                    "38464749652471126234714974686077982058971218877007117797671952549720518909652",
                    10
                );

                //x3,y3 is base of secp256k1
                let x3 = new BN(
                    "55066263022277343669578718895168534326250603453777594175500187360389116729240",
                    10
                );
                let y3 = new BN(
                    "32670510020758816978083085130507043184471273380659243275938904335757337482424",
                    10
                );


                let p1 = new secp256k1.Point(curve, x1, y1);
                let p2 = new secp256k1.Point(curve, x2, y2);
                let p3 = new secp256k1.Point(curve, x3, y3);
                let diff = curve.point().sub(p1, p2);

                assert.isTrue(
                    curve.curve.validate(diff.ref.point),
                    "diff not on curve"
                );
                assert.isTrue(diff.equal(p3), "diff != p3");
            });
        });

        describe("neg", () => {
            it("should negate a point", () => {
                let x1 = new BN(
                    "115634772118603627854931557311079688991080043973066653082058507703010314958290",
                    10
                );
                let y1 = new BN(
                    "40020651213129063140034337022266154487335736658579208144926833654198154340256",
                    10
                );



                let x2 = new BN(
                    "115634772118603627854931557311079688991080043973066653082058507703010314958290",
                    10
                );
                let y2 = new BN(
                    "75771438024187132283536647986421753365934248007061355894530750353710680331407",
                    10
                );

                let p1 = new secp256k1.Point(curve, x1, y1);
                let p2 = new secp256k1.Point(curve, x2, y2);
                let neg = curve.point().neg(p1);
                let neg2 = curve.point().neg(p2);
                console.log("neg:",neg)
                console.log("neg2:",neg2)

                assert.isTrue(curve.curve.validate(neg.ref.point), "neg not on curve");
                assert.isTrue(neg.equal(p2), "neg != p2");
                assert.isTrue(neg2.equal(p1), "neg2 != p1");
            });

            it("should negate null point", () => {
                let nullPoint = curve.point().null();
                let negNull = curve.point().neg(nullPoint);

                assert.isTrue(negNull.equal(nullPoint), "negNull != nullPoint");
            });
        });

        describe("mul", () => {
            it("should multiply p by scalar s", () => {
                let x1 = new BN(
                    "115634772118603627854931557311079688991080043973066653082058507703010314958290",
                    10
                );
                let y1 = new BN(
                    "40020651213129063140034337022266154487335736658579208144926833654198154340256",
                    10
                );



                let x2 = new BN(
                    "12534853645077843913548151005510324832553188404143433059567092267706758510291",
                    10
                );
                let y2 = new BN(
                    "50571477668206612289906948813998600591648071335551395699473016044673265317210",
                    10
                );

                let p1 = new secp256k1.Point(curve, x1, y1);
                let buf = new Uint8Array([5, 10]);
                let s = curve.scalar().setBytes(buf);
                let prod = curve.point().mul(s, p1);
                let p2 = new secp256k1.Point(curve, x2, y2);
                console.log("prod:",prod)
                assert.isTrue(
                    curve.curve.validate(prod.ref.point),
                    "prod not on curve"
                );
                assert.isTrue(prod.equal(p2), "prod != p2");
            });

            it("should multiply with base point if no point is passed", () => {
                let base = curve.point().base();
                let three = new Uint8Array([3]);
                let threeScalar = curve.scalar().setBytes(three);
                let target = curve.point().mul(threeScalar, base);
                let threeBase = curve.point().mul(threeScalar);

                assert.isTrue(
                    curve.curve.validate(threeBase.ref.point),
                    "threeBase not on curve"
                );
                assert.isTrue(threeBase.equal(target), "target != threeBase");
            });
        });
    });

    describe("scalar", () => {
        // prettier-ignore
        let b1 = new Uint8Array([101, 216, 110, 23, 127, 7, 203, 250, 206, 170, 55, 91, 97, 239, 222, 159, 41, 250, 129, 187, 12, 123, 159, 163, 77, 28, 249, 174, 217, 114, 252, 171]);
        // prettier-ignore
        let b2 = new Uint8Array([88, 146, 91, 18, 158, 90, 102, 25, 82, 85, 219, 232, 60, 253, 138, 65, 183, 2, 157, 218, 70, 58, 193, 179, 212, 232, 104, 98, 125, 202, 176, 9]);

        describe("setBytes", () => {
            it("should set the scalar reading bytes from big endian array", () => {
                let bytes = new Uint8Array([2, 4, 8, 10]);
                let s = curve.scalar().setBytes(bytes);
                let target = new BN("0204080a", 16);
                assert.strictEqual(s.ref.arr.fromRed().cmp(target), 0);
            });

            it("should throw TypeError when b is not Uint8Array", () => {
                assert.throws(() => {
                    curve.scalar().setBytes(1234);
                }, TypeError);
            });

            it("should reduce to number to mod N", () => {
                // prettier-ignore
                let bytes = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
                let s = curve.scalar().setBytes(bytes);
                let target = new BN(
                    "14551231950b75fc4402da1732fc9bebe",
                    16
                );

                console.log("reduce s:",s)
                console.log("reduce:",s.ref.arr.fromRed())

                assert.strictEqual(s.ref.arr.fromRed().cmp(target), 0);
            });
        });

        describe("equal", () => {
            it("should return true for equal scalars and false otherwise", () => {
                let bytes = new Uint8Array([241, 51, 4]);
                let s1 = curve.scalar().setBytes(bytes);
                let s2 = curve.scalar().setBytes(bytes);

                assert.isTrue(s1.equal(s2), "s1 != s2");
                assert.isFalse(s1.equal(curve.scalar(), "s1 == 0"));
            });
        });

        describe("zero", () => {
            it("should set the scalar to 0", () => {
                let s = curve.scalar().zero();
                let target = new BN(0, 16);
                assert.strictEqual(s.ref.arr.fromRed().cmp(target), 0);
            });
        });

        describe("set", () => {
            it("should make the receiver point to a scalar", () => {
                let bytes = new Uint8Array([1, 2, 4, 52]);
                let s1 = curve.scalar().setBytes(bytes);
                let s2 = curve.scalar().set(s1);
                let zero = curve.scalar().zero();

                assert.isTrue(s1.equal(s2), "s1 != s2");
                s1.zero();
                assert.isTrue(s1.equal(s2), "s1 != s2");
                assert.isTrue(s1.equal(zero), "s1 != 0");
            });
        });

        describe("clone", () => {
            it("should clone a scalar", () => {
                let bytes = new Uint8Array([1, 2, 4, 52]);
                let s1 = curve.scalar().setBytes(bytes);
                let s2 = s1.clone();

                assert.isTrue(s1.equal(s2), "s1 != s2");
                s1.zero();
                assert.isFalse(s1.equal(s2), "s1 == s2");
            });
        });

        describe("setInt64", () => {
        });

        describe("add", () => {
            it("should add two scalars", () => {
                let s1 = curve.scalar().setBytes(b1);
                let s2 = curve.scalar().setBytes(b2);
                let sum = curve.scalar().add(s1, s2);

                // prettier-ignore
                let target = new Uint8Array([190, 106, 201, 42, 29, 98, 50, 20, 33, 0, 19, 67, 158, 237, 104, 224, 224, 253, 31, 149, 82, 182, 97, 87, 34, 5, 98, 17, 87, 61, 172, 180]);
                let s3 = curve.scalar().setBytes(target);

                assert.isTrue(sum.equal(s3), "sum != s3");
            });
        });

        describe("sub", () => {
            it("should subtract two scalars", () => {
                let b1 = new Uint8Array([1, 2, 3, 4]);
                let b2 = new Uint8Array([5, 6, 7, 8]);
                let s1 = curve.scalar().setBytes(b1);
                let s2 = curve.scalar().setBytes(b2);
                let diff = curve.scalar().sub(s1, s2);

                console.log("subtract two scalars:s1:",s1)
                console.log("subtract two scalars:s2:",s2)
                console.log("subtract two scalars:diff:",diff)
                var d="fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8ccc323d3d"
                var x=new BN(d,16)
                var a=x.toArray("be", 32)
                //console.log("arr:",a)
                // prettier-ignore
                let target = new Uint8Array([255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,254,186,174,220,230,175,72,160,59,191,210,94,140,204,50,61,61]);
                let s3 = curve.scalar().setBytes(target);
                console.log("subtract two scalars:s3:",s3)
                assert.isTrue(diff.equal(s3), "diff != s3");
            });
        });

        describe("neg", () => {
            it("should negate a point", () => {
                let s1 = curve.scalar().setBytes(b1);
                let neg = curve.scalar().neg(s1);
                console.log("should negate a point s1:",s1)//65d86e177f07cbfaceaa375b61efde9f29fa81bb0c7b9fa34d1cf9aed972fcab
                console.log("neg:",neg)
                var d="9a2791e880f834053155c8a49e10215f90b45b2ba2cd009872b564ddf6c34496"
                var x=new BN(d,16)
                var a=x.toArray("be", 32)
                //console.log("arr:",a)
                // prettier-ignore
                let target = new Uint8Array([154,39,145,232,128,248,52,5,49,85,200,164,158,16,33,95,144,180,91,43,162,205,0,152,114,181,100,221,246,195,68,150]);
                let s2 = curve.scalar().setBytes(target);

                assert.isTrue(neg.equal(s2), "neg != s2");
            });
        });

        describe("bytes", () => {
            it("should return the bytes in big-endian representation", () => {
                let s1 = curve.scalar().setBytes(b1);
                let bytes = s1.bytes();

                assert.deepEqual(b1, bytes);
            });
        });

        describe("one", () => {
            let one = curve.scalar().one();

            it("should set the scalar to one", () => {
                let bytes = one.bytes();
                let target = new Uint8Array([1]);
                assert.deepEqual(target, bytes);
            });
        });

        describe("mul", () => {
            it("should multiply two scalars", () => {
                let s1 = curve.scalar().setBytes(b1);
                let s2 = curve.scalar().setBytes(b2);
                let prod = curve.scalar().mul(s1, s2);
                console.log("should multiply two scalars s1:",s1)//65d86e177f07cbfaceaa375b61efde9f29fa81bb0c7b9fa34d1cf9aed972fcab
                console.log("should multiply two scalars s2:",s2)//58925b129e5a66195255dbe83cfd8a41b7029dda463ac1b3d4e868627dcab009
                console.log("prod:",prod)
                var d="36e48d6f7a8c446f2e7bd9e266dd1f7fee27ad65675dd39bdaafabc74e14a5ad"
                var x=new BN(d,16)
                var a=x.toArray("be", 32)
                //console.log("arr:",a)
                // prettier-ignore
                let target = new Uint8Array([54,228,141,111,122,140,68,111,46,123,217,226,102,221,31,127,238,39,173,101,103,93,211,155,218,175,171,199,78,20,165,173]);
                let s3 = curve.scalar().setBytes(target);

                assert.isTrue(prod.equal(s3), "mul != s3");
            });
        });

        describe("div", () => {
            it("should divide two scalars", () => {
                let s1 = curve.scalar().setBytes(b1);
                let s2 = curve.scalar().setBytes(b2);
                let quotient = curve.scalar().div(s1, s2);
                console.log("should divide two scalars s1:",s1)//65d86e177f07cbfaceaa375b61efde9f29fa81bb0c7b9fa34d1cf9aed972fcab
                console.log("should divide two scalars s2:",s2)//58925b129e5a66195255dbe83cfd8a41b7029dda463ac1b3d4e868627dcab009
                console.log("quotient:",quotient)
                var d="cc8878daf805883b8552b28d3cb8c67fb602fc292e6dd671c008c356bb747be9"
                var x=new BN(d,16)
                var a=x.toArray("be", 32)
                //console.log("arr:",a)
                // prettier-ignore
                let target = new Uint8Array([204,136,120,218,248,5,136,59,133,82,178,141,60,184,198,127,182,2,252,41,46,109,214,113,192,8,195,86,187,116,123,233]);
                let s3 = curve.scalar().setBytes(target);

                assert.isTrue(quotient.equal(s3), "quotient != s3");
            });
        });
        describe("inv", () => {
            it("should compute the inverse modulo n of scalar,模逆元", () => {
                let s1 = curve.scalar().setBytes(b1);
                let inv = curve.scalar().inv(s1);
                console.log("should compute the inverse modulo n of scalar s1:",s1)//65d86e177f07cbfaceaa375b61efde9f29fa81bb0c7b9fa34d1cf9aed972fcab
                console.log("inv:",inv)
                var d="b199ece4e4692143ff03e09f875f0e7499560c97564df478c496399ba0fb9fca"
                var x=new BN(d,16)
                var a=x.toArray("be", 32)
                //console.log("arr:",a)
                // prettier-ignore
                let target = new Uint8Array([177,153,236,228,228,105,33,67,255,3,224,159,135,95,14,116,153,86,12,151,86,77,244,120,196,150,57,155,160,251,159,202]);
                let s2 = curve.scalar().setBytes(target);

                assert.isTrue(inv.equal(s2), "inv != s2");
            });
        });

        describe("pick", () => {
            it("should pick a random scalar", () => {
                setSeed(42);
                let s1 = curve.scalar().pick(randomBytes);

                // prettier-ignore
                let bytes = new Uint8Array([225, 208, 244, 196, 143, 183, 151, 13, 179, 199, 181, 81, 189, 241, 253, 227, 46, 34, 167, 212, 41, 112, 79, 126, 170, 10, 139, 193, 110, 187, 30, 231]);
                let target = curve.scalar().setBytes(bytes);

                assert.isFalse(s1.equal(target));
            });
        });

        describe("marshalBinary", () => {
            it("should return the marshalled representation of scalar", () => {
                let s1 = curve.scalar().setBytes(b1);
                let m = s1.marshalBinary();

                assert.deepEqual(m, b1);
            });
        });

        describe("unmarshalBinary", () => {
            it("should convert marshalled representation to scalar", () => {
                let s1 = curve.scalar();
                s1.unmarshalBinary(b1);
                let bytes = s1.bytes();

                assert.deepEqual(bytes, b1);
            });

            it("should throw an error if input is not Uint8Array", () => {
                let s1 = curve.scalar();
                assert.throws(() => {
                    s1.unmarshalBinary(123);
                }, TypeError);
            });

            it("should throw an error if input > q", () => {
                let s1 = curve.scalar();
                // prettier-ignore
                let bytes = new Uint8Array([255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255, 255]);
                assert.throws(() => {
                    s1.unmarshalBinary(bytes);
                }, Error);
            });

            it("should throw an error if input size > marshalSize", () => {
                let s1 = curve.scalar();
                let data = new Uint8Array(s1.marshalSize() + 1);
                assert.throws(() => {
                    s1.unmarshalBinary(data);
                }, Error);
            });
        });

        describe("string", () => {
            it("should print the string representation of a scalar", () => {
                let s1 = curve.scalar().setBytes(b1);
                // prettier-ignore
                let target = "65d86e177f07cbfaceaa375b61efde9f29fa81bb0c7b9fa34d1cf9aed972fcab";
                assert.strictEqual(s1.string(), target);
            });

            // TODO: discrepency
            // xit("should print the string representation of zero scalar", () => {
            //     let s1 = curve.scalar().zero();
            //     let target = "";
            //     assert.strictEqual(s1.string(), target);
            // });

            it("should print the string representation of one scalar", () => {
                let s1 = curve.scalar().one();
                let target = "01";
                assert.strictEqual(s1.string(), target);
            });
        });
    });

    it("should work with  Test Vectors", () => {

        for (let i = 0; i < secp256k1Vectors.length; i++) {
            let testVector = secp256k1Vectors[i];
            let X = new BN(testVector.X, 16);
            let Y = new BN(testVector.Y, 16);
            let privKey = new BN(testVector.Private, 16);


            let key = curve.scalar().setBytes(Uint8Array.from(privKey.toArray()));
            let pubKey = new secp256k1.Point(curve, X, Y);

            assert.isTrue(
                curve.curve.validate(pubKey.ref.point),
                "PubKey not on curve"
            );

        }
    });
});
