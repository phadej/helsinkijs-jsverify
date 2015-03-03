"use strict";

var Bluebird = require("bluebird");
var jsc = require("jsverify");
var _ = require("lodash");

var Dispencer = require("./dispenser.js");
var model = require("./model.js");

/*
interleave :: [a] -> [a] -> [[a]]
interleave [] []         = [[]]
interleave [] x          = [x]
interleave x  []         = [x]
interleave (x:xs) (y:ys) =
  [ x : zs | zs <- interleave (y:ys) xs ] ++
  [ y : zs | zs <- interleave (x:xs) ys ]
*/
function interleave(xs, ys) {
  if (xs.length === 0) { return [ys]; }
  if (ys.length === 0) { return [xs]; }

  var xh = xs[0];
  var xt = xs.slice(1);

  var yh = ys[0];
  var yt = ys.slice(1);

  var xinter = interleave(ys, xt).map(function (res) { return [xh].concat(res); });
  var yinter = interleave(xs, yt).map(function (res) { return [yh].concat(res); });

  return xinter.concat(yinter);
}

function sequentialTraverse(xs, f) {
  return Bluebird.reduce(xs, function (ys, x) {
    return f(x).then(function (y) {
      return ys.concat([y]);
    });
  }, []);
}

function sequentialModelImpl(d, steps) {
  return sequentialTraverse(steps, function (step) {
    switch (step) {
      case "reset":
        return d.reset();
      case "take":
        return d.take();
    }
  });
}

function twoParallelModel(stepsA, stepsB) {
  var d = new Dispencer();
  var resultsA = sequentialModelImpl(d, stepsA);
  var resultsB = sequentialModelImpl(d, stepsB);
  return Bluebird.all([resultsA, resultsB]);
}

module.exports = twoParallelModel;

var exampleSteps = ["take", "take", "take"];

function predicate(stepsA, stepsB) {
  // console.log(stepsA, stepsB);
  var mods = interleave(stepsA, stepsB).map(model);
  return twoParallelModel(stepsA, stepsB).spread(function (parA, parB) {
    // console.log(parA, parB);
    var par = interleave(parA, parB);
    for (var i = 0; i < par.length; i++) {
      if (_.isEqual(par[i], mods[i])) {
        return true;
      }
    }
    return false;
  });
}

// predicate(["take", "take"], ["take"]);
var stepArb = jsc.elements(["take", "reset"]);
var prop = jsc.forall(jsc.nearray(stepArb), jsc.nearray(stepArb), predicate);
jsc.assert(prop, { quite: false });


// predicate(["take"], ["take", "take", "reset"]).then(console.log);
