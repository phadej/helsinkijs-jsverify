"use strict";

var Bluebird = require("bluebird");
var Dispencer = require("./dispenser.js");

var d = new Dispencer();
console.log(d.counter);

Bluebird.resolve(undefined)
  .then(function () { return d.take(); })
  .then(function (v) {
	console.log("Took:", v);
  })
  .then(function () { return d.take(); })
  .then(function (v) {
	console.log("Took:", v);
  })
  .then(function () { return d.reset(); })
  .then(function (v) {
	console.log("Took:", v);
  })
  .then(function () { return d.take(); })
  .then(function (v) {
	console.log("Took:", v);
  });
