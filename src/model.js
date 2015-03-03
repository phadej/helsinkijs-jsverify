"use strict";

var assert = require("assert");

function runModel(steps) {
  var counter = 0;
  var results = [];
  for (var i = 0; i < steps.length; i++) {
    switch (steps[i]) {
      case "take":
        results.push(counter);
        counter += 1;
        break;
      case "reset":
        results.push("ok");
        counter = 0;
    }
  }
  return results;
}

module.exports = runModel;
