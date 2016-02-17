'use strict';

const test = require('blue-tape');

const DbdbCouch = require('../lib/couchdb');

function teardownData() {
  DbdbCouch.data.clear();
}

// Tests -- get document

test('db.get', (t) => {
  let db = new DbdbCouch();

  t.equal(typeof db.get, 'function', 'should exist');
  t.end();
});

test('db.get return', (t) => {
  let doc1 = {
    id: 'doc1',
    type: 'entry',
    title: 'The title'
  };
  DbdbCouch.data.set('doc1', doc1);
  let db = new DbdbCouch();

  return db.get('doc1')

  .then((obj) => {
    t.equal(typeof obj, 'object', 'should be an object');
    t.equal(obj.id, 'doc1', 'should have id');
    t.equal(obj.type, 'entry', 'should have type');
    t.equal(obj.title, 'The title', 'should have title');

    teardownData();
  });
});

test('db.get exception for non-existing document', (t) => {
  t.plan(3);
  let db = new DbdbCouch();

  return db.get('doc2')

  .catch((err) => {
    t.ok(err instanceof Error, 'should be Error');
    t.equal(typeof err.message, 'string', 'should have message');
    t.equal(err.name, 'NotFoundError', 'should have name');
  });
});

test('db.get exception for missing docid', (t) => {
  t.plan(1);
  let db = new DbdbCouch();

  return db.get()

  .catch((err) => {
    t.ok(err instanceof Error, 'should be Error');
  });
});

// Tests -- insert document

test('db.insert', (t) => {
  let db = new DbdbCouch();

  t.equal(typeof db.insert, 'function', 'should exist');
  t.end();
});

test('db.insert insert new document', (t) => {
  t.plan(2);
  let doc = {
    id: 'doc2',
    type: 'entry',
    title: 'New title'
  };
  let db = new DbdbCouch();

  return db.insert(doc)

  .then((obj) => {
    t.equal(obj, doc, 'should return new document');

    return db.get('doc2').then((newdoc) => {
      t.equal(newdoc, doc, 'should be in data store');

      teardownData();
    });
  });
});

test('db.insert insert and get id from database', (t) => {
  let doc = { type: 'entry' };
  let db = new DbdbCouch();

  return db.insert(doc)

  .then((obj) => {
    t.equal(typeof obj.id, 'string', 'should return new id');

    teardownData();
  });
});

test('db.insert exception for missing document object', (t) => {
  t.plan(1);
  let db = new DbdbCouch();

  return db.insert()

  .catch((err) => {
    t.ok(err instanceof Error, 'should be Error');
  });
});

// Tests -- update

test('db.update', (t) => {
  let db = new DbdbCouch();

  t.equal(typeof db.update, 'function', 'should exist');
  t.end();
});

test('db.update update document', (t) => {
  let olddoc = {
    id: 'doc1',
    type: 'entry',
    title: 'A title',
    descr: 'Not set in update',
    createdAt: '2015-05-23'
  };
  DbdbCouch.data.set('doc1', olddoc);
  let newdoc = {
    id: 'doc1',
    type: 'entry',
    title: 'A brand new title',
    createdAt: '2015-06-01'
  };
  let db = new DbdbCouch();

  return db.update(newdoc)

  .then((obj) => {
    t.equal(obj.id, 'doc1', 'should return id');
    t.equal(obj.type, 'entry', 'should return type');
    t.equal(obj.title, 'A brand new title', 'should return title');
    t.equal(obj.descr, 'Not set in update', 'should return descr');
    t.equal(obj.createdAt, '2015-05-23', 'should keep old createdAt');

    return db.get('doc1')
    .then((newobj) => {
      t.deepEqual(newobj, obj, 'should be in data store');

      teardownData();
    });
  });
});

test('db.update exception for missing document object', (t) => {
  t.plan(1);
  let db = new DbdbCouch();

  return db.update()

  .catch((err) => {
    t.ok(err instanceof Error, 'should be Error');
  });
});

test('db.update exception for missing id', (t) => {
  t.plan(1);
  let doc = { type: 'entry' };
  let db = new DbdbCouch();

  return db.update(doc)

  .catch((err) => {
    t.ok(err instanceof Error, 'should be Error');
  });
});
