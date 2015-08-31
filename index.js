/*jslint node: true, todo: true*/
'use strict';

var utils = {};

/**
 * Conditionally logs messages dependant on mode (Dev/Prod/Test).
 *
 * @param {String} msg
 *
 * @returns {undefined}
 */
utils.log = function (msg) {
  // TODO if in devel mode
  console.log(msg);
};

/**
 * Checks if there is at least one matching entry between the two arrays.
 *
 * @param {Array} array1
 * @param {Array} array2
 * @returns {boolean} True if a match is found.
 */
utils.matchExists = function (array1, array2) {
  if (!array2) {
    return false;
  }
  var i;
  for (i = 0; i < array1.length; i += 1) {
    if (array2.indexOf(array1[i]) !== -1) {
      return true;
    }
  }
  return false;
};

/**
 * Recursively merges two objects.
 *
 * @param {Object} obj1 - Starting object, may have properties in common overwritten.
 * @param {Object} obj2 - Object whose properties will be added to obj1.
 *
 * @returns {Object} obj1 with all of obj2 properties.
 */
utils.merge = function (obj1, obj2) {
  var key;

  // Add obj2 properties
  for (key in obj2) {
    if (obj2.hasOwnProperty(key)) {
      try {
        if (obj2[key].constructor === Object) {
          // Recursive call
          obj1[key] = utils.merge(obj1[key], obj2[key]);
        } else {
          obj1[key] = obj2[key];
        }
      } catch (e) {
        obj1[key] = obj2[key];
      }
    }
  }

  return obj1;
};

/**
 * Implements a barrier that waits for a specified number of calls before
 * calling it's callback
 *
 * @param syncCalls - The number of calls before we can proceed.
 * @param callback(error) - The function to be called once the required number of
 * syncCalls have been made.  If any errors were reported they are passed as
 * an argument to the callback.
 * @returns {Function} - The function to be called that will decrement the
 * syncCalls.  Accepts an argument as error.  Should be called without an arg
 * to signify success.
 */
utils.syncBarrier = function(syncCalls, callback) {
  var errors = '';
  return function (err) {
    if (err) {
      errors += err;
    }
    syncCalls -= 1;
    if (syncCalls === 0 && callback) {
      callback(errors);
    }
  };
};

/**
 * Returns a string which contains an anonymous function invocation
 * where the anonymous function contains the contents of func.
 *
 * @type {Function}
 * @param {Function} func - A function whose contents will be stringified
 * @return {String} - Stringified function within a self-invoking closure
 *
 * Note: variables not declared and calculated within func will not
 * be evaluated.  (aka. the function should not accept arguments.)
 */
utils.functionToString = function (func) {
  return '(' + func + ')();';
};

/**
 * Callback used by utils.getBody
 * @callback getBody~success
 * @param {String} body
 */
module.exports = utils;
