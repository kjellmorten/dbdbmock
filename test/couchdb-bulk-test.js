'use strict';

const test = require('blue-tape');

const DbdbCouch = require('../lib/couchdb');

function teardownData() {
  DbdbCouch.data.clear();
}

// Tests -- insert many

test('db.insertMany', (t) => {
  let db = new DbdbCouch();

  t.equal(typeof db.insertMany, 'function', 'should exist');
  t.end();
});

test('db.insertMany new documents', (t) => {
  t.plan(7);
  let docs = [
    { type: 'entry', title: 'First title' },
    { type: 'entry', title: 'Second title' }
  ];
  let db = new DbdbCouch();

  return db.insertMany(docs)

  .then((obj) => {
    t.ok(Array.isArray(obj), 'should return array');
    t.equal(obj.length, 2, 'should return two items');
    t.equal(typeof obj[0].id, 'string', 'should return first id');
    t.equal(obj[0].title, 'First title', 'should return first title');
    t.equal(typeof obj[1].id, 'string', 'should return second id');
    t.equal(obj[1].title, 'Second title', 'should return second title');

    return db.get(obj[0].id)
    .then((obj1) => {
      t.equal(obj1.title, 'First title', 'should be in store');

      teardownData();
    });
  });
});

test('db.insertMany exception for missing docs', (t) => {
  t.plan(1);
  let db = new DbdbCouch();

  return db.insertMany()

  .catch((err) => {
    t.ok(err instanceof Error, 'should be an Error');
  });
});

test('db.insertMany no items', (t) => {
  let db = new DbdbCouch();

  return db.insertMany([])

  .then((obj) => {
    t.ok(Array.isArray(obj), 'should return array');
    t.equal(obj.length, 0, 'should return empty array');
  });
});

// Tests -- delete many

test('db.deleteMany', (t) => {
  let db = new DbdbCouch();

  t.equal(typeof db.deleteMany, 'function', 'should exist');
  t.end();
});

test('db.deleteMany mark as deleted', (t) => {
  let docs = [
    { id: 'ent1', type: 'entry', title: 'First title' },
    { id: 'ent2', type: 'entry', title: 'Second title' }
  ];
  DbdbCouch.data.set('ent1', docs[0]);
  DbdbCouch.data.set('ent2', docs[1]);
  let db = new DbdbCouch();

  return db.deleteMany(docs)

  .then((ret) => {
    t.equal(DbdbCouch.data.size, 0, 'should remove both items');
    t.equal(ret, docs, 'sould return removed docs');

    teardownData();
  });
});
