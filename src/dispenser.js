"use strict";

var Bluebird = require("bluebird");

function Dispenser() {
  this.counter = 0;
}

function randTimeout() {
  return Math.floor((Math.random() * 10) + 1);
}

function read(d) {
  return new Bluebird(function (resolve) {
    setTimeout(function () {
      resolve(d.counter);
    }, 0);
  });
}

function write(d, value) {
  return new Bluebird(function (resolve) {
    setTimeout(function () {
      d.counter = value;
      resolve();
    }, randTimeout());
  });
}

Dispenser.prototype.reset = function () {
  var that = this;
  return new Bluebird(function (resolve) {
    setTimeout(function () {
      that.counter = 0;
      resolve("ok");
    }, randTimeout());
  });
}

Dispenser.prototype.take = function () {
  var d = this;
  return read(d).then(function (value) {
    return write(d, value + 1).then(function () {
      return value;
    });
  });
}

Dispenser.prototype.takeSynchronized = function () {
  var d = this;
  return new Bluebird(function (resolve) {
    setTimeout(function () {
      var res = d.counter;
      d.counter += 1;
      resolve(res);
    }, randTimeout());
  });
}



module.exports = Dispenser;
