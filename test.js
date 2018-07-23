const test = require('tape');
const makeMockCallbag = require('callbag-mock');
const latest = require('.');

test('it emits the latest from listenable when downstream source asks', t => {
  const listenable = makeMockCallbag(true);
  const pullable = latest(listenable);
  const sink = makeMockCallbag();

  pullable(0, sink);

  listenable.emit(1, 'foo');
  listenable.emit(1, 'bar');
  sink.emit(1);
  listenable.emit(1, 'baz');
  sink.emit(1);
  listenable.emit(1, 'bin');

  t.deepEqual(
    sink.getReceivedData(),
    ['bar', 'baz'],
    'sink gets only what it asks for'
  );

  t.end();
});

test('it terminates the listenable if terminated from downstream', t => {
  const listenable = makeMockCallbag(true);
  const pullable = latest(listenable);
  const sink = makeMockCallbag();

  pullable(0, sink);

  sink.emit(2);

  t.ok(!listenable.checkConnection(),'listenable is terminated');

  t.end();
});

test('it terminates downstream if listenable terminates', t => {

  const listenable = makeMockCallbag(true);
  const pullable = latest(listenable);
  const sink = makeMockCallbag();

  pullable(0, sink);

  listenable.emit(1, 'foo');
  listenable.emit(2, 'error');

  t.ok(!sink.checkConnection(),'listenable is terminated');

  t.end();
});

test('it replies nothing if we havent gotten any latest data', t => {
  const listenable = makeMockCallbag(true);
  const pullable = latest(listenable);
  const sink = makeMockCallbag();

  pullable(0, sink);

  sink.emit(1);
  listenable.emit(1, 'foo');
  listenable.emit(1, 'bar');
  sink.emit(1);

  t.deepEqual(
    sink.getReceivedData(),
    ['bar'],
    'sink only gets reply when there is data to get'
  );

  t.end();
});
