# Property based testing

HelsinkiJS &mdash; 2015-03-26

[@phadej](https://twitter.com/phadej) &ndash; Oleg Grenrus &ndash; [http://oleg.fi](http://oleg.fi)

These slides are available at: [http://oleg.fi/slides/helsinkijs-jsverify](http://oleg.fi/slides/helsinkijs-jsverify/)

---

## Tests &mdash; Why we write tests?

---

## Tests &mdash; Why we write tests?

- verify correctness

---

## Tests &mdash; Why we write tests?

- verify correctness
- documentation

---

## Correctness

> In theoretical computer science, correctness of an algorithm is asserted when
> it is said that the algorithm is correct with respect to a [specification](http://en.wikipedia.org/wiki/Formal_specification).
> Functional correctness refers to the input-output behaviour of the algorithm
> (i.e., for each input it produces the expected output)

---

## Unit tests

```js
describe("uniq", function () {
  it("([1, 2, 1, 3, 1, 4]) == [1, 2, 3, 4]", function () {
    expect(_.uniq([1, 2, 1, 3, 1, 4])).to.deep.equal([1, 2, 3, 4]);
  });
}
```

---

## Underscore uniq (few days ago)

`_.uniq` - Produces a duplicate-free version of the array&hellip;

```js
_.uniq([1, 2, 1, 3, 1, 4]);
=> [1, 2, 3, 4]
```

---

## Underscore uniq (soon)

`_.uniq` - Produces a duplicate-free version of the array&hellip; In particular only the first occurence of each value is kept.

---

## TDD Example

### sort

![sort](sort.png)

---

## TDD: first iterations

```js
describe("sort", function () {
  it("empty array", function () {
    expect(sort([])).to.deep.equal([]);
  });

  it("works for singleton arrays", function () {
    expect(sort([1])).to.deep.equal([1]);
  });
});
```

---

## TDD: few steps later&hellip;

```js
describe("sort", function () {
  it("empty array", function () {
    expect(sort([])).to.deep.equal([]);
  });

  it("examples", function () {
    var examples = [
      [[],     []],
      [[1],    [1]],
      [[1, 2], [1, 2]],
      [[2, 1], [1, 2]]
    ];

    examples.forEach(function (ex) {
      expect(sort(ex[0])).to.deep.equal(ex[1]);
    });
  });
});
```

---

## TDD: the implementation

```js
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
```

---

## Properties

- *∀ arr, arr.length ≡ sort(arr).length*
- *∀ arr, el ∈ arr, count(arr, el) ≡ count(sort(arr), el)*
- *∀ arr, sort(sort(arr)) ≡ sort(arr)*

---

### Generative testing

```js
describe("sort", function () {
  it("generated", function () {
    for (var i = 0; i < 100; i++) {
      var arr = generateIntArray();
      var sorted = sort(arr);

      expect(sorted.length).to.equal(arr.length);
      _.every(arr, function (el) {
        expect(count(arr, el)).to.equal(count(sorted, el));
      });
      expect(sort(sorted)).to.deep.equal(sorted);
    }
  });
});
```

---

## JSVerify

![jsverify](jsverify.png)

---

## JSVerify

```js
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
```

---

## Test result

```
1) sort preserves length:
  Error: Failed after 3 tests and 3 shrinks. rngState: 039b0d3f624ec15a87;
    Counterexample: [0];
2) sort preserves elements:
  Error: Failed after 1 tests and 1 shrinks. rngState: 8f9178cb5a0f32ed46;
    Counterexample: [0];
```

---

## sort again

```js
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
* return []; // sort([0]) -> []
}
```

---

## Back to uniq

```js
jsc.property("uniq preserves elements", "array nat", function (arr) {
  var u = _.uniq(arr);
  return _.every(arr, function (el) {
    return _.contains(u, el);
  });
});

jsc.property("uniq doesn't create elements", "array nat", function (arr) {
  var u = _.uniq(arr);
  return _.every(u, function (el) {
    return _.contains(arr, el);
  });
});

jsc.property("uniq removes duplicates", "array nat", function (arr) {
  var u = _.uniq(arr);
  return _.every(u, function (el) {
    return count(el, u) === 0;
  });
});
```

---

## Using reference implementation:

```js
jsc.property("supersort and bubblesort agree",
  "array nat", function (arr) {
    return _.isEqual(supersort(arr), bubblesort(arr));
  });
```

```js
jsc.property("sort ∘ uniq and sortingUniq agree",
  "array nat", function (arr) {
    return _.isEqual(sort(uniq(arr)), sortingUniq(arr)) &&
           _.isEqual(uniq(sort(arr)), sortingUniq(arr));
  });
```


---

## Own data

```js
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
```

---

## Stateful systems

![dispenser](dispenser.jpg)

---

## Dispenser

```js
var stepArb = jsc.elements(["take", "reset"]);

function predicate(steps) {
  var mod = model(steps);
  return sequentialModel(steps).then(function (seq) {
    return _.isEqual(seq, mod);
  });
}

var prop = jsc.forall(jsc.array(stepArb), predicate);
jsc.assert(prop);
```

---

## Dispenser

```js
var stepArb = jsc.elements(["take", "reset"]);

function predicate(steps) {
* var mod = model(steps);
  return sequentialTest(steps).then(function (seq) {
    return _.isEqual(seq, mod);
  });
}

var prop = jsc.forall(jsc.array(stepArb), predicate);
jsc.assert(prop);
```

We can test against simple model.

---

```js
var stepArb = jsc.elements(["take", "reset"]);

function predicate(steps) {
  var mod = model(steps);
* return sequentialTest(steps).then(function (seq) {
    return _.isEqual(seq, mod);
  });
}

var prop = jsc.forall(jsc.array(stepArb), predicate);
jsc.assert(prop);
```

And jsverify supports Promises out-of-the box!

---

## Thanks
