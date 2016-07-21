import test from 'ava'

import DbdbCouch from '../lib/couchdb'

// Tests -- insert document

test('db.insert should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.insert, 'function')
})

test('db.insert should insert new document', (t) => {
  const doc = {
    id: 'doc2',
    type: 'entry',
    title: 'New title'
  }
  const db = new DbdbCouch()

  return db.insert(doc)

  .then((obj) => {
    t.is(obj, doc)

    return db.get('doc2').then((newdoc) => {
      t.is(newdoc, doc)
    })
  })
})

test('db.insert should insert and get id from database', (t) => {
  const doc = { type: 'entry' }
  const db = new DbdbCouch()

  return db.insert(doc)

  .then((obj) => {
    t.is(typeof obj.id, 'string')
  })
})

test('db.insert should reject for missing document object', (t) => {
  const db = new DbdbCouch()

  return db.insert()

  .catch((err) => {
    t.true(err instanceof Error)
  })
})

// Tests -- update

test('db.update should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.update, 'function')
})

test('db.update should update document', (t) => {
  const db = new DbdbCouch()
  const olddoc = {
    id: 'doc1',
    type: 'entry',
    title: 'A title',
    descr: 'Not set in update',
    createdAt: '2015-05-23'
  }
  db.data.set('doc1', olddoc)
  const newdoc = {
    id: 'doc1',
    type: 'entry',
    title: 'A brand new title',
    createdAt: '2015-06-01'
  }

  return db.update(newdoc)

  .then((obj) => {
    t.is(obj.id, 'doc1')
    t.is(obj.type, 'entry')
    t.is(obj.title, 'A brand new title')
    t.is(obj.descr, 'Not set in update')
    t.is(obj.createdAt, '2015-05-23')

    return db.get('doc1')
    .then((newobj) => {
      t.deepEqual(newobj, obj)
    })
  })
})

test('db.update should throw for missing document object', (t) => {
  const db = new DbdbCouch()

  return db.update()

  .catch((err) => {
    t.true(err instanceof Error)
  })
})

test('db.update should throw for missing id', (t) => {
  const doc = { type: 'entry' }
  const db = new DbdbCouch()

  return db.update(doc)

  .catch((err) => {
    t.true(err instanceof Error)
  })
})
