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
 * Logs an error.
 *
 * @param error - The error to print.
 */
utils.error = function (error) {
  if (typeof error === 'string') {
    return console.error(error);
  }

  var
    errParams = [
      'code',
      'status',
      'name',
      'message',
      'stack'
    ];

  utils.forEach(errParams, function (index, param) {
    /*jslint unparam: true*/
    if (error && error[param]) {
      console.error(error[param]);
    }
  });
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

  obj1 = obj1 || {};
  obj1 = JSON.parse(JSON.stringify(obj1));

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
 * @param callback(errors) - The function to be called once the required number of
 * syncCalls have been made.  If any errors were reported they are passed as
 * an array to the callback.
 * @returns {Function} - The function to be called that will decrement the
 * syncCalls.  Accepts an argument as error.  Should be called without an arg
 * to signify success.
 */
// TODO test error handling, and invalid inputs
utils.syncBarrier = function (syncCalls, callback) {
  if (syncCalls < 0) {
    throw new Error('Invalid number of syncCalls');
  }
  if (syncCalls === 0) {
    return callback();
  }
  var errors = [];
  return function (err) {
    if (err !== undefined) {
      errors.push(err);
    }
    syncCalls -= 1;
    if (syncCalls === 0 && callback) {
      errors = errors.length ? errors : undefined;  // If no errors returned undefined rather than empty string.
      callback(errors);
    }
  };
};

/**
 * Call the callback once the named mutex is obtained.  Must call the function
 * passed as an argument in the callback to release the mutex.
 *
 * @param {string} mutexName - The name of the mutex to lock.
 * @param {function} callback(done) - The stuff to do once mutex is acquired.  Must call the
 * done function when done with the mutex.
 */
utils.getMutex = (function () {
  var
    id = 0,
    mutexesInUse = {},
    mutexWaitLists = {},
    getMutexWaitId = function () {
      id += 1;
      return id;
    };
  return function (mutexName, callback) {
    // assign id and add to list
    var reqId = getMutexWaitId();
    mutexWaitLists[mutexName] = mutexWaitLists[mutexName] || [];
    mutexWaitLists[mutexName].push(reqId);

    // Now wait for turn
    utils.doWhen(
      function () {
        return (mutexWaitLists[mutexName][0] === reqId && !mutexesInUse[mutexName]);
      },
      function () {
        // Got the mutex, call callback with mutex release function
        mutexesInUse[mutexName] = true;
        callback(function () {
          mutexWaitLists[mutexName].splice(0, 1);
          mutexesInUse[mutexName] = false;
          if (mutexWaitLists[mutexName].length === 0) {
            delete mutexWaitLists[mutexName];
            delete mutexesInUse[mutexName];
          }
        });
      }
    );
  };
}());

utils.doWhen = function (cond, callback) {
  var interval = setInterval(function () {
    if (cond()) {
      clearInterval(interval);
      callback();
    }
  }, 0);
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
    var script = window.document.createElement('script');
    script.async = false;
    script.innerHTML = '{{content}}';
    window.document.body.appendChild(script);
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
    var script = window.document.createElement('script');
    script.async = false;
    script.src = '{{url}}';
    window.document.body.appendChild(script);
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
 * @param {object} obj - The object or array you wish to iterate through
 * @param callback(index, array[index]) - called for each iteration
 */
// TODO Test
utils.forEach = function (obj, callback) {
  var
    key;

  key = Object.prototype.toString.call(obj);
  if (key === '[object Array]') {
    for (key = 0; key < obj.length; key += 1) {
      callback(key, obj[key]);
    }
  } else if (key === '[object Object]') {
    for (key in obj) {
      if (obj.hasOwnProperty(key)) {
        callback(key, obj[key]);
      }
    }
  }
};

/**
 * Iterates through all the params of all the objects.
 * (Eg. All params in all objects in an array in an object param)
 *
 * @param {object} object - The object or array you wish to iterate through
 * @param callback(index, array[index]) - called for each iteration
 */
utils.forEachRecursive = function (object, callback) {
  var
    key;

  key = Object.prototype.toString.call(object);
  if (key === '[object Array]' || key === '[object Object]') {
    utils.forEach(object, function (index, value) {
      callback(index, value);
      utils.forEachRecursive(value, callback);
    });
  }
};

module.exports = utils;
