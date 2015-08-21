
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

    describe("#getBody()", function () {
      describe("Non-POST request", function () {
        it("should pass 'null' to the callback", function () {
          var theCallback = this.sinon.spy();
          utils.getBody({method: 'Not POST'}, theCallback);
          (theCallback.args[0][0] === null).should.equal(true);
        });
      });
      describe("POST request", function () {
        beforeEach(function () {
          /*jslint debug:true*/
          vars.req = this.sinon.stub();
          vars.req.method = 'POST';
          vars.req.on = function () {};
        });

        describe("body buffering", function () {
          it("should destroy flooded connections", function () {

            vars.req.connection = {};
            vars.req.connection.destroy = this.sinon.spy();

            this.sinon.stub(vars.req, 'on', function (event, callback) {
              /*jslint unparam: true*/
              var floodData = 'flood';

              // Make a very long string.
              do {
                floodData = floodData + floodData;
              } while (floodData.length <= 1e6);

              callback(floodData);
            });

            // Send the very long string.
            /*jslint debug:true*/
            utils.getBody(vars.req, function () {});

            vars.req.connection.destroy.called.should.equal(true);
          });
        });
        describe("body complete", function () {
          it("should pass the body to the callback", function () {
            var eventsToHandlers = {},
              callback = this.sinon.spy(),
              reqData = 'some data';

            this.sinon.stub(vars.req, 'on', function (event, callback) {
              eventsToHandlers[event] = callback;
            });

            utils.getBody(vars.req, callback);
            eventsToHandlers.data(reqData);
            eventsToHandlers.end();

            callback.args[0][0].should.equal(reqData);
          });
        });
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
  });

}());