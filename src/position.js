var jsc = require("jsverify");

function norm(pos) {
  return Math.abs(pos.x) + Math.abs(pos.y);
}

var env = {
  pos: jsc.record({
    x: jsc.integer,
    y: jsc.integer,
  }),
};

describe("norm", function () {
  jsc.property("non negative", "pos", env, function (p) {
    return norm(p) >= 0;
  });
});
