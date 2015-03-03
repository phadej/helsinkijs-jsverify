"use strict";

var _ = require("lodash");
var jsc = require("jsverify");

function sort(arr) {
  var examples = [
    [[],     []],
    [[1],    [1]],
    [[1, 2], [1, 2]],
    [[2, 1], [1, 2]]
  ];

  for (var i = 0; i < examples.length; i++) {
    if (_.isEqual(arr, examples[i][0])) return examples[i][1];
  }
  return [];
}

function count(arr, el) {
  return arr.filter(function (x) {
	return x === el;
  }).length;
}

describe("sort", function () {
  jsc.property("preserves length", "array integer", function (arr) {
    return arr.length === sort(arr).length;
  });

  jsc.property("preserves elements", "array integer", function (arr) {
    var sorted = sort(arr);
    return _.every(arr, function (el) {
      return count(arr, el) == count(sorted, el);
    });
  });

  jsc.property("is projection", "array integer", function (arr) {
    var sorted = sort(arr);
    return _.isEqual(sorted, sort(sorted));
  });
});
