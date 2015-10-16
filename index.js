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
// TODO test error handling, and invalid inputs
utils.syncBarrier = function(syncCalls, callback) {
  if (syncCalls < 0) {
    throw new Error('Invalid number of syncCalls');
  }
  if (syncCalls === 0) {
    return callback();
  }
  var errors = '';
  return function (err) {
    if (err) {
      errors += err;
    }
    syncCalls -= 1;
    if (syncCalls === 0 && callback) {
      errors = errors? errors:undefined;  // If no errors returned undefined rather than empty string.
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
 * Creates a string which contains a function that generates a script element
 * with innerHTML = 'content' and async = false, and appends to the body.
 *
 * @param {String} content - The javascript to put in innerHTML
 * @return {String} -  An anonymous function that when evaluated will append a
 * script tag to the body with innerHTML='content'.
 */
// TODO Test
utils.createCustomScript = function (content) {
  var func = this.functionToString(function () {
    /*jslint browser: true*/
    var script = document.createElement('script');
    script.async = false;
    script.innerHTML = '{{content}}';
    document.body.appendChild(script);
  });
  return func.replace('{{content}}', content);
};

/**
 * Creates a string which contains a function that generates a script element
 * with src = 'url' and async = false, and appends to the body.
 *
 * @param {String} url - source for script tag.
 * @return {String} -  An anonymous function that when evaluated will append a
 * script tag to the body with src='url'.
 */
// TODO Test
utils.createInjectScript = function (url) {
  var func = this.functionToString(function () {
    /*jslint browser: true*/
    var script = document.createElement('script');
    script.async = false;
    script.src = '{{url}}';
    document.body.appendChild(script);
  });
  return func.replace('{{url}}', url);
};

/**
 * Generates a string which contains an anonymous function which will inject
 * script tags for all the relUrls.  The script tags are synchronous, so the
 * order they are in the array is the order they will be loaded.
 *
 * @param {String} host - The url of the host for the required scripts.
 * (Eg. http://localhost:8347)
 * @param {Array} relUrls - An array of the relative urls for scripts.  They
 * should all be strings.  (Eg. ['/some.js', 'someOtherDependant.js'])
 * @return {String} - The function which appends all the requested scripts.
 */
// TODO Test
utils.createInjectScripts = function (host, relUrls) {
  var
    i,
    func = '';

  for (i = 0; i < relUrls.length; i += 1) {
    func += this.createInjectScript(host + relUrls[i]);
  }

  return func;
};

/**
 * Iterates through an array or params of an object
 *
 * @param object/array - The object or array you wish to iterate through
 * @param callback(index, array[index]) - called for each iteration
 */
// TODO Test
utils.forEach = function (object, callback) {
  var
    key;

  key = Object.prototype.toString.call(object);
  if (key === '[object Array]') {
    for (key = 0; key < object.length; key += 1) {
      callback(key, object[key]);
    }
  } else if (key === '[object Object]') {
    for (key in object) {
      if (object.hasOwnProperty(key)) {
        callback(key, object[key]);
      }
    }
  }
};

module.exports = utils;
