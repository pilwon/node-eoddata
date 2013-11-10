/*
 * lib/util.js
 */

'use strict';

function logCallback(err) {
  if (err) { return console.error(err); }
  var args = Array.prototype.slice.call(arguments, 1);
  console.log(JSON.stringify(args, null, 2));
}

// Public API
exports.logCallback = logCallback;
