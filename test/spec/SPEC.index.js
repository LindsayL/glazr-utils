
/*jslint node:true*/
/*globals describe, it, before, beforeEach, after, afterEach, vars, path, fse*/

(function () {
  'use strict';

  require('../spec_helper');

  var
    should = require('should'),
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
      describe("undefined instead of objects", function () {
        it("should return first input objects", function () {
          var
            obj1 = {key3: 3, key4: 4},
            obj2 = undefined,
            expectedObj = {key3: 3, key4: 4},
            mergedObj = utils.merge(obj1, obj2);

          JSON.stringify(expectedObj).should.equal(JSON.stringify(mergedObj));
        });
        it("should return second input objects", function () {
          var
            obj1 = undefined,
            obj2 = {key3: 3, key4: 4},
            expectedObj = {key3: 3, key4: 4},
            mergedObj = utils.merge(obj1, obj2);

          JSON.stringify(expectedObj).should.equal(JSON.stringify(mergedObj));
        });
      });
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
      it('should call the callback immediately if the count is 0', function (done) {
        utils.syncBarrier(0, function (err) {
          should.not.exist(err);
          done();
        });
      });
      it('should not use callback until it has been called "n" number of times', function (done) {
        var count = 5,
          sem = utils.syncBarrier(count, function (err) {
            count.should.equal(0);
            should.not.exist(err);
            done();
          });
        while (count > 0) {
          count -= 1;
          sem();
        }
      });
    });

    describe('#doWhen', function () {
      it('should exist', function (done) {
        (!!utils.doWhen).should.equal(true);
        done();
      });
      it('should wait until the condition becomes true', function (done) {
        var
          waitingVar = false;
        utils.doWhen(function () {return waitingVar;}, function () {
          waitingVar.should.equal(true);
          done();
        });

        setTimeout(function () {
          waitingVar = true;
        }, 50);
      });
    });

    describe('#getMutex', function () {
      it('should exist', function (done) {
        (!!utils.getMutex).should.equal(true);
        done();
      });
      describe('mutex not in use', function () {
        it('should execute the callback immediately', function (done) {
          utils.getMutex('blah', function (releaseMutex) {
            releaseMutex();
            done();
          });
        });
      });
      describe('mutex is in use', function () {
        var
          mutexName = 'mutex',
          firstReleased = false,
          releaseMutex1;
        beforeEach(function (done) {
          utils.getMutex(mutexName, function (releaseMutex) {
            releaseMutex1 = function () {
              firstReleased = true;
              releaseMutex();
            };
            done();
          });
        });
        it('should execute the callback after releasing the first call', function (done) {
          utils.getMutex(mutexName, function (releaseMutex) {
            releaseMutex();
            firstReleased.should.equal(true);
            done();
          });
          releaseMutex1();
        });
      });
    });

  });

}());