
/*jslint node:true*/
/*globals describe, it, before, beforeEach, after, afterEach, vars, path, fse*/

(function () {
  'use strict';

  require('../spec_helper');

  var
    utils = require('../../index.js');

  describe("utils", function () {
    describe("#log()", function () {
      it("should pass the message to #console.log()", function () {
        var logSpy = this.sinon.spy(),
          message = "some message";
        this.sinon.stub(console, 'log', logSpy);

        utils.log(message);
        logSpy.args[0][0].should.equal(message);
      });
    });

    describe("#functionToString()", function () {
      it("should surround the input function with self executing syntax", function () {
        /*jslint debug:true*/
        utils.functionToString(function () {}).should.equal("(function () {})();");
      });
      it("should return a string", function () {
        /*jslint debug:true*/
        var type = typeof (utils.functionToString(function () {}));
        type.should.equal('string');
      });
    });

    describe("#merge()", function () {
      describe("no common keys", function () {
        it("should return an object with all key-vals from both input objects", function () {
          var obj1 = {key1: 1, key2: 2},
            obj2 = {key3: 3, key4: 4},
            expectedObj = {key1: 1, key2: 2, key3: 3, key4: 4},
            mergedObj = utils.merge(obj1, obj2);

          JSON.stringify(expectedObj).should.equal(JSON.stringify(mergedObj));
        });
      });
      describe("common keys", function () {
        it("should overwrite the values in the first object", function () {
          var obj1 = {key1: 1, key2: 2},
            obj2 = {key2: 3333, key4: 4},
            expectedObj = {key1: 1, key2: 3333, key4: 4},
            mergedObj = utils.merge(obj1, obj2);

          JSON.stringify(expectedObj).should.equal(JSON.stringify(mergedObj));
        });
      });

      describe("nested objects", function () {
        it("should return an object with nested values intact", function () {
          var obj1 = {key1: 1, key2: 2},
            obj2 = {key3: {key4: 4, key5: {key6: 6}}},
            expectedObj = {key1: 1, key2: 2, key3: {key4: 4, key5: {key6: 6}}},
            mergedObj = utils.merge(obj1, obj2);

          JSON.stringify(expectedObj).should.equal(JSON.stringify(mergedObj));
        });
      });
    });

    describe('#syncBarrier', function () {
      it('should exist', function (done) {
        (!!utils.syncBarrier).should.equal(true);
        done();
      });
      it('should not use callback until it has been called "n" number of times', function (done) {
        var count = 5,
          sem = utils.syncBarrier(count, function () {
            count.should.equal(0);
            done();
          });
        do {
          count -= 1;
          sem();
        } while (count > 0);
      });
    });

  });

}());