const test = require('tape');
const makeMockCallbag = require('callbag-mock');
const latest = require('./index');

test('it emits the latest from listenable when downstream source asks', t => {
  let history = [];
  const report = (name,dir,t,d) => t !== 0 && d !== undefined && history.push([name,dir,t,d]);

  const listenable = makeMockCallbag('source', true);
  const pullable = latest(listenable);
  const sink = makeMockCallbag('sink', report);

  pullable(0, sink);

  listenable.emit(1, 'foo');
  listenable.emit(1, 'bar');
  sink.emit(1);
  listenable.emit(1, 'baz');
  sink.emit(1);
  listenable.emit(1, 'bin');

  t.deepEqual(history, [
    ['sink', 'body', 1, 'bar'],
    ['sink', 'body', 1, 'baz'],
  ], 'sink gets only what it asks for');

  t.end();
});

test('it terminates the listenable if terminated from downstream', t => {
  let history = [];
  const report = (name,dir,t,d) => t !== 0 && history.push([name,dir,t,d]);

  const listenable = makeMockCallbag('source', report, true);
  const pullable = latest(listenable);
  const sink = makeMockCallbag('sink', report);

  pullable(0, sink);

  sink.emit(2);

  t.deepEqual(history, [
    ['source', 'talkback', 2, undefined],
  ], 'listenable is terminated');

  t.end();
});

test('it terminates downstream if listenable terminates', t => {
  let history = [];
  const report = (name,dir,t,d) => t !== 0 && d !== undefined && history.push([name,dir,t,d]);

  const listenable = makeMockCallbag('source', true);
  const pullable = latest(listenable);
  const sink = makeMockCallbag('sink', report);

  pullable(0, sink);

  listenable.emit(1, 'foo');
  listenable.emit(2, 'error');

  t.deepEqual(history, [
    ['sink', 'body', 2, 'error'],
  ], 'sink receives termination event');

  t.end();
});

test('it replies nothing if we havent gotten any latest data', t => {
  let history = [];
  const report = (name,dir,t,d) => t !== 0 && !(t===1 && d===0) && history.push([name,dir,t,d]);

  const listenable = makeMockCallbag('source', true);
  const pullable = latest(listenable);
  const sink = makeMockCallbag('sink', report);

  pullable(0, sink);

  sink.emit(1);
  listenable.emit(1, 'foo');
  listenable.emit(1, 'bar');
  sink.emit(1);

  t.deepEqual(history, [
    ['sink', 'body', 1, 'bar']
  ], 'sink only gets reply when there is data to get');

  t.end();
});
