"use strict";

var Bluebird = require("bluebird");
var jsc = require("jsverify");
var _ = require("lodash");

var Dispencer = require("./dispenser.js");
var model = require("./model.js");

function sequentialTraverse(xs, f) {
  return Bluebird.reduce(xs, function (ys, x) {
    return f(x).then(function (y) {
      return ys.concat([y]);
    });
  }, []);
}

function sequentialTest(steps) {
  var d = new Dispencer();
  return sequentialTraverse(steps, function (step) {
    switch (step) {
      case "reset":
        return d.reset();
      case "take":
        return d.take();
    }
  });
}

module.exports = sequentialTest;

var exampleSteps = ["take", "take", "reset", "take", "take"];

var stepArb = jsc.elements(["take", "reset"]);

function predicate(steps) {
  var mod = model(steps);
  return sequentialTest(steps).then(function (seq) {
    return _.isEqual(seq, mod);
  });
}

var prop = jsc.forall(jsc.array(stepArb), predicate);
jsc.assert(prop, { quite: false });
