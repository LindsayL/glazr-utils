/*jslint unparam: true, stupid: true, nomen: true*/
/*globals global, beforeEach, afterEach, describe, __dirname*/

global.should = require('should');
global.fse = require('fs-extra');
global.path = require('path');
global.sinon = require('sinon');
// Create 'context' alias.
global.context = describe;
global.vars = {};

(function () {
  'use strict';
  var SpecHelper = function () { return this; },
    path = global.path,
    fse = global.fse,
    sinon = global.sinon,
    vars = global.vars;

  beforeEach(function () {
    vars.config = {
      get: function (symbol) {
        return {};
      }
    };

    this.sinon = sinon.sandbox.create();
  });

  afterEach(function () {
    this.sinon.restore();
    vars = {};
  });

  /**
   * Overwrite the current context map with the default. Used for testing changes to the context map.
   *
   * @param {string} templatePath - Path to the default context map.
   * @param {string} currentMapPath - Path to the target context map.
   * @param {doneCallback} callback
   */
  SpecHelper.prototype.resetContextMap = function (templatePath, currentMapPath, callback) {
    callback = callback || function () { return undefined; };
    fse.copy(templatePath, currentMapPath, function (err) {
      if (err) {
        console.log(err);
      }
      callback();
    });
  };

  module.exports = SpecHelper;
}());