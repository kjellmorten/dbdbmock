import test from 'ava'

import DbdbCouch from '../lib/couchdb'

function teardownData () {
  DbdbCouch.data.clear()
}

// Tests -- get document

test('db.get should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.get, 'function')
})

test('db.get should return doc', (t) => {
  const doc1 = {
    id: 'doc1',
    type: 'entry',
    title: 'The title'
  }
  DbdbCouch.data.set('doc1', doc1)
  const db = new DbdbCouch()

  return db.get('doc1')

  .then((obj) => {
    t.is(typeof obj, 'object')
    t.is(obj.id, 'doc1')
    t.is(obj.type, 'entry')
    t.is(obj.title, 'The title')

    teardownData()
  })
})

test('db.get should throw for non-existing document', (t) => {
  const db = new DbdbCouch()

  return db.get('doc2')

  .catch((err) => {
    t.true(err instanceof Error)
    t.is(typeof err.message, 'string')
    t.is(err.name, 'NotFoundError')
  })
})

test('db.get should throw for missing docid', (t) => {
  const db = new DbdbCouch()

  return db.get()

  .catch((err) => {
    t.true(err instanceof Error)
  })
})

// Tests -- insert document

test('db.insert should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.insert, 'function')
})

test.serial('db.insert should insert new document', (t) => {
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

      teardownData()
    })
  })
})

test('db.insert should insert and get id from database', (t) => {
  const doc = { type: 'entry' }
  const db = new DbdbCouch()

  return db.insert(doc)

  .then((obj) => {
    t.is(typeof obj.id, 'string')

    teardownData()
  })
})

test('db.insert should throw for missing document object', (t) => {
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
  const olddoc = {
    id: 'doc1',
    type: 'entry',
    title: 'A title',
    descr: 'Not set in update',
    createdAt: '2015-05-23'
  }
  DbdbCouch.data.set('doc1', olddoc)
  const newdoc = {
    id: 'doc1',
    type: 'entry',
    title: 'A brand new title',
    createdAt: '2015-06-01'
  }
  const db = new DbdbCouch()

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

      teardownData()
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
