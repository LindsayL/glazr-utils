/*jslint node:true*/
/*globals global, beforeEach, afterEach*/

module.exports = (function () {
  'use strict';

  beforeEach(function () {
    global.should = require('should');
    global.fse = require('fs-extra');
    global.path = require('path');
    global.sinon = require('sinon').sandbox.create();
  });

  afterEach(function () {
    global.sinon.restore();
  });

}());