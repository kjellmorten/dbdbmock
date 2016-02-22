'use strict';

const test = require('tape');

const DbdbCouch = require('../lib/couchdb');

function setupData() {
  let view = [
    {id: 'src1', type: 'source', name: 'Source 1', url: 'http://source1.com',
      _key: [ '2015-05-23T00:00:00.000Z', 'src1' ]},
    {id: 'src2', type: 'source', name: 'Source 2', url: 'http://source2.com',
      _key: [ '2015-05-24T00:00:00.000Z', 'src2' ]}
  ];
  DbdbCouch.data.set('view:fns:sources', view);
  return view;
}

function setupFnsEntriesBySource() {
  let view = [
    { id: 'ent1', type: 'entry', title: 'Entry 1', url: 'http://source2.com/ent1',
      source: 'src2', _key: [ 'src2', '2015-05-23T00:00:00.000Z' ] },
    { id: 'ent2', type: 'entry', title: 'Entry 2', url: 'http://source2.com/ent2',
      source: 'src2', _key: [ 'src2', '2015-05-24T00:00:00.000Z' ] },
    { id: 'ent3', type: 'entry', title: 'Entry 3', url: 'http://source1.com/ent3',
      source: 'src1', _key: [ 'src1', '2015-05-25T00:00:00.000Z' ] }
  ];
  DbdbCouch.data.set('view:fns:entries_by_source', view);
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
  setupData();
  let db = new DbdbCouch();

  return db.getView('fns:sources')

  .then((obj) => {
    t.ok(Array.isArray(obj), 'should be array');
    t.equal(obj.length, 2, 'should have two items');
    t.equal(obj[0].id, 'src1', 'should have id');
    t.equal(obj[0].type, 'source', 'should have type');
    t.equal(obj[0].name, 'Source 1', 'should have name');

    teardownData();
  });
});

test('db.getView old signature', (t) => {
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

  return db.getView('fns:sources', true)

  .then((obj) => {
    t.equal(obj.length, 2, 'should return two items');
    t.equal(obj[0], view[1], 'should be reversed');

    teardownData();
  });
});

test('db.getView paged view', (t) => {
  setupData();
  let db = new DbdbCouch();

  return db.getView('fns:sources', false, {}, 1)

  .then((obj) => {
    t.equal(obj.length, 1, 'should have one item');
    t.equal(obj[0].id, 'src1', 'should have right id');

    teardownData();
  });
});

test('db.getView second page', (t) => {
  setupData();
  let db = new DbdbCouch();

  return db.getView('fns:sources', false, {}, 1, 1)

  .then((obj) => {
    t.equal(obj.length, 1, 'should have one item');
    t.equal(obj[0].id, 'src2', 'should have right id');

    teardownData();
  });
});

test('db.getView paged view through options', (t) => {
  setupData();
  let db = new DbdbCouch();

  return db.getView('fns:sources', false, {pageSize: 1})

  .then((obj) => {
    t.equal(obj.length, 1, 'should have one item');
    t.equal(obj[0].id, 'src1', 'should have right id');

    teardownData();
  });
});

test('db.getView second page through options', (t) => {
  setupData();
  let db = new DbdbCouch();

  return db.getView('fns:sources', false, {pageSize: 1, pageStart: 1})

  .then((obj) => {
    t.equal(obj.length, 1, 'should have one item');
    t.equal(obj[0].id, 'src2', 'should have right id');

    teardownData();
  });
});

test('db.getView start after specific key', (t) => {
  setupData();
  let db = new DbdbCouch();

  return db.getView('fns:sources', false, {}, 1, [ '2015-05-23T00:00:00.000Z', 'src1' ])

  .then((obj) => {
    t.equal(obj.length, 1, 'should return one item');
    t.equal(obj[0].id, 'src2', 'should have right id');

    teardownData();
  });
});

test('db.getView filter', (t) => {
  setupFnsEntriesBySource();
  let db = new DbdbCouch();

  return db.getView('fns:entries_by_source', false, {filter: 'src2'})

  .then((obj) => {
    t.ok(Array.isArray(obj), 'should be array');
    t.equal(obj.length, 2, 'should have two items');
    t.equal(obj[0].id, 'ent1', 'should get first first');
    t.equal(obj[0].source, 'src2', 'should get first source');
    t.equal(obj[1].id, 'ent2', 'should get second last');
    t.equal(obj[1].source, 'src2', 'should get second source');

    teardownData();
  });
});

test('db.getView no match', (t) => {
  let db = new DbdbCouch();

  return db.getView('fns:sources')

  .then((obj) => {
    t.ok(Array.isArray(obj), 'should return array');
    t.equal(obj.length, 0, 'should return no items');
  });
});
