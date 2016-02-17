'use strict';

const test = require('blue-tape');

const DbdbCouch = require('../lib/couchdb');

// Tests

test('DbdbCouch', (t) => {
  t.equal(typeof DbdbCouch, 'function', 'should be a function');
  t.end();
});

test('DbdbCouch.dbType', (t) => {
  t.equal(DbdbCouch.dbType, 'couchdb', 'should be "couchdb"');
  t.end();
});

test('DbdbCouch.isMock', (t) => {
  t.ok(DbdbCouch.isMock, 'should be true');
  t.end();
});

test('DbdbCouch.data', (t) => {
  t.ok(DbdbCouch.data instanceof Map, 'should be a Map');
  t.end();
});

// Tests -- database connection

test('db.connect', (t) => {
  let db = new DbdbCouch();

  t.equal(typeof db.connect, 'function', 'should exist');
  t.end();
});

test('db.connect return', function (t) {
  let db = new DbdbCouch();

  return db.connect()

  .then((conn) => {
    t.equal(typeof conn, 'object', 'should return null');

    db.disconnect();
  });
});

test('db.disconnect', function (t) {
  let db = new DbdbCouch();

  t.equal(typeof db.disconnect, 'function', 'should exist');
  t.end();
});
