import test from 'ava'

import DbdbCouch from '../lib/couchdb'

// Tests -- insert many

test('db.insertMany should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.insertMany, 'function')
})

test('db.insertMany should insert new documents', (t) => {
  let docs = [
    { type: 'entry', title: 'First title' },
    { type: 'entry', title: 'Second title' }
  ]
  const db = new DbdbCouch()

  return db.insertMany(docs)

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(typeof obj[0].id, 'string')
    t.is(obj[0].title, 'First title')
    t.is(typeof obj[1].id, 'string')
    t.is(obj[1].title, 'Second title')

    return db.get(obj[0].id).then((obj1) => {
      t.is(obj1.title, 'First title')
    })
  })
})

test('db.insertMany should return conflict error for existing ids', (t) => {
  let docs = [
    {id: 'doc1', title: 'First title'},
    {id: 'doc2', title: 'Second title'}
  ]
  const db = new DbdbCouch()
  db.data.set('doc1', {id: 'doc1', title: 'Old title'})

  return db.insertMany(docs)

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(obj[0].id, 'doc1')
    t.is(obj[0]._error, 'conflict')
    t.is(obj[0]._reason, 'Document update conflict')
    t.is(obj[0].title, 'First title')
    t.is(obj[1].id, 'doc2')
    t.falsy(obj[1]._error)
    t.falsy(obj[1]._reason)
  })
})

test('db.insertMany should not alter input objects', (t) => {
  let docs = [
    {id: 'doc1', title: 'First title'},
    {id: 'doc2', title: 'Second title'}
  ]
  Object.freeze(docs)
  Object.freeze(docs[0])
  Object.freeze(docs[1])
  const db = new DbdbCouch()

  return db.insertMany(docs)

  .then((obj) => {
    t.pass()
  })
})

test('db.insertMany should return clone of docs', (t) => {
  let docs = [
    {id: 'doc1', title: 'First title'},
    {id: 'doc2', title: 'Second title'}
  ]
  const db = new DbdbCouch()

  return db.insertMany(docs)

  .then((obj) => {
    t.not(obj[0], docs[0])
    t.not(obj[1], docs[1])
  })
})

test('db.insertMany should throw for missing docs', (t) => {
  const db = new DbdbCouch()

  return db.insertMany()

  .catch((err) => {
    t.true(err instanceof Error)
  })
})

test('db.insertMany should return empty array', (t) => {
  const db = new DbdbCouch()

  return db.insertMany([])

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 0)
  })
})

test('db.insertMany should user local storage', (t) => {
  let docs = [{ id: 'doc1', title: 'First title' }]
  const db = new DbdbCouch()

  return db.insertMany(docs)

  .then((obj) => {
    t.false(DbdbCouch.data.has('doc1'))
  })
})

// Tests -- delete many

test('db.deleteMany should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.deleteMany, 'function')
})

test('db.deleteMany should delete items', (t) => {
  const db = new DbdbCouch()
  const docs = [
    { id: 'ent1', type: 'entry', title: 'First title' },
    { id: 'ent2', type: 'entry', title: 'Second title' }
  ]
  db.data.set('ent1', docs[0])
  db.data.set('ent2', docs[1])

  return db.deleteMany(docs)

  .then((ret) => {
    t.is(db.data.size, 0)
    t.deepEqual(ret, docs)
  })
})

test('db.deleteMany should not alter input docs', (t) => {
  const db = new DbdbCouch()
  const docs = [{id: 'ent1'}, {id: 'ent2'}]
  Object.freeze(docs)
  Object.freeze(docs[0])
  Object.freeze(docs[1])

  return db.deleteMany(docs)

  .then((ret) => {
    t.pass()
  })
})

test('db.deleteMany should return clone of docs', (t) => {
  const db = new DbdbCouch()
  const docs = [{id: 'ent1'}, {id: 'ent2'}]

  return db.deleteMany(docs)

  .then((ret) => {
    t.not(ret[0], docs[0])
    t.not(ret[1], docs[1])
  })
})
