import test from 'ava'

import DbdbCouch from '../lib/couchdb'

// Helpers

const doc1 = {id: 'doc1', type: 'entry', title: 'The title'}
const doc2 = {id: 'doc2', type: 'entry', title: 'Another title'}

// Tests -- get document

test('db.get should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.get, 'function')
})

test('db.get should return doc', (t) => {
  const db = new DbdbCouch()
  db.data.set('doc1', doc1)

  return db.get('doc1')

  .then((obj) => {
    t.is(typeof obj, 'object')
    t.is(obj.id, 'doc1')
    t.is(obj.type, 'entry')
    t.is(obj.title, 'The title')
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

test('db.get should return two docs', (t) => {
  const db = new DbdbCouch()
  db.data.set('doc1', doc1)
  db.data.set('doc2', doc2)

  return db.get(['doc1', 'doc2'])

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(obj[0].id, 'doc1')
    t.is(obj[0].type, 'entry')
    t.is(obj[0].title, 'The title')
    t.is(obj[1].id, 'doc2')
  })
})

test('db.get should return null for unknown doc', (t) => {
  const db = new DbdbCouch()
  db.data.set('doc1', doc1)
  db.data.set('doc2', doc2)

  return db.get(['doc1', 'doc3'])

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(obj[0].id, 'doc1')
    t.is(obj[0].type, 'entry')
    t.is(obj[0].title, 'The title')
    t.is(obj[1], null)
  })
})
