# callbag-latest

[Callbag](https://github.com/callbag/callbag) operator that turns a listenable source into a pullable source, that emits the latest data (if any) from the listenable upon request.

Often useful in conjunction with [callbag-sample](https://github.com/staltz/callbag-sample).

`npm install callbag-latest`

## example

```js
const fromEvent = require('callbag-from-event');
const sample = require('callbag-sample');
const pipe = require('callbag-pipe');
const map = require('callbag-map');
const latest = require('callbag-latest');

const typeStream = pipe(
  fromEvent(inputField, "input"),
  map(e => e.target.value)
);

const submitActionStream = pipe(
  fromEvent(submitBtn, "click"),
  sample(latest(typeStream)), // turn click events to current value of input field
  map(v => ({type: "SUBMIT", value: v}))
);
```
