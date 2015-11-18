
/*jslint node:true*/
/*globals describe, it, before, beforeEach, after, afterEach, sinon, path, fse*/

(function () {
  'use strict';

  require('../../support/spec_helper');

  var
    should = require('should'),
    utils = require('../../../index.js');

  describe("INTEGRATION.utils", function () {

    describe('#forEachRecursive(object, callback', function () {
      var
        object,
        indexConst = 'index',
        valueConst = 'value';
      describe('pass an object in an array', function () {
        beforeEach(function () {
          object = [{}];
          object[0][indexConst] = valueConst;
        });
        it('should call the callback on upper level params', function () {
          var
            called = false;
          utils.forEachRecursive(object, function (index, value) {
            /*jslint unparam:true*/
            if (index === 0 && JSON.stringify(value) === JSON.stringify(object[0])) {
              called = true;
            }
          });
          called.should.equal(true);
        });
        it('should call the callback on inner level params', function () {
          var
            called = false;
          utils.forEachRecursive(object, function (index, value) {
            /*jslint unparam:true*/
            if (index === indexConst && value === valueConst) {
              called = true;
            }
          });
          called.should.equal(true);
        });
      });
      describe('pass an array in an object', function () {
        beforeEach(function () {
          object = {};
          object[indexConst] = [valueConst];
        });
        it('should call the callback on upper level params', function () {
          var
            called = false;
          utils.forEachRecursive(object, function (index, value) {
            /*jslint unparam:true*/
            if (index === indexConst && JSON.stringify(value) === JSON.stringify(object[indexConst])) {
              called = true;
            }
          });
          called.should.equal(true);
        });
        it('should call the callback on inner level params', function () {
          var
            called = false;
          utils.forEachRecursive(object, function (index, value) {
            /*jslint unparam:true*/
            if (index === 0 && value === valueConst) {
              called = true;
            }
          });
          called.should.equal(true);
        });
      });
    });

  });

}());