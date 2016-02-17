'use strict';

const test = require('tape');

const DbdbCouch = require('../lib/couchdb');

function setupData() {
  let view = [
    {id: 'src1', type: 'source', name: 'Src 1', url: 'http://source1.com',
      _key: [ '2015-05-23T00:00:00.000Z', 'src1' ]},
    {id: 'src2', type: 'source', name: 'Src 2', url: 'http://source2.com',
      _key: [ '2015-05-24T00:00:00.000Z', 'src2' ]}
  ];
  DbdbCouch.data.set('view:fns:sources', view);
  return view;
}

function teardownData() {
  DbdbCouch.data.clear();
}

// Tests

test('db.getView', (t) => {
  let db = new DbdbCouch();

  t.equal(typeof db.getView, 'function', 'should exist');
  t.end();
});

test('db.getView return', (t) => {
  let view = setupData();
  let db = new DbdbCouch();

  return db.getView('fns', 'sources')

  .then((obj) => {
    t.equal(obj, view, 'should return two sources');

    teardownData();
  });
});

test('db.getView reverse order', (t) => {
  let view = setupData();
  let db = new DbdbCouch();

  return db.getView('fns', 'sources', true)

  .then((obj) => {
    t.equal(obj.length, 2, 'should return two items');
    t.equal(obj[0], view[1], 'should be reversed');

    teardownData();
  });
});

test('db.getView paged view', (t) => {
  setupData();
  let db = new DbdbCouch();

  return db.getView('fns', 'sources', false, 1)

  .then((obj) => {
    t.equal(obj.length, 1, 'should have one item');
    t.equal(obj[0].id, 'src1', 'should have right id');

    teardownData();
  });
});

test('db.getView second page', (t) => {
  setupData();
  let db = new DbdbCouch();

  return db.getView('fns', 'sources', false, 1, 1)

  .then((obj) => {
    t.equal(obj.length, 1, 'should have one item');
    t.equal(obj[0].id, 'src2', 'should have right id');

    teardownData();
  });
});

test('db.getView start after specific key', (t) => {
  setupData();
  let db = new DbdbCouch();

  return db.getView('fns', 'sources', false, 1, [ '2015-05-23T00:00:00.000Z', 'src1' ])

  .then((obj) => {
    t.equal(obj.length, 1, 'should return one item');
    t.equal(obj[0].id, 'src2', 'should have right id');

    teardownData();
  });
});

test('db.getView no match', (t) => {
  let db = new DbdbCouch();

  return db.getView('fns', 'sources')

  .then((obj) => {
    t.ok(Array.isArray(obj), 'should return array');
    t.equal(obj.length, 0, 'should return no items');
  });
});
