import test from 'ava'

import DbdbCouch from '../lib/couchdb'

function teardownData () {
  DbdbCouch.data.clear()
}

// Tests -- insert many

test('db.insertMany should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.insertMany, 'function')
})

test.serial('db.insertMany should insert new documents', (t) => {
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

      teardownData()
    })
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

// Tests -- delete many

test('db.deleteMany should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.deleteMany, 'function')
})

test.serial('db.deleteMany should mark items as deleted', (t) => {
  const docs = [
    { id: 'ent1', type: 'entry', title: 'First title' },
    { id: 'ent2', type: 'entry', title: 'Second title' }
  ]
  DbdbCouch.data.set('ent1', docs[0])
  DbdbCouch.data.set('ent2', docs[1])
  const db = new DbdbCouch()

  return db.deleteMany(docs)

  .then((ret) => {
    t.is(DbdbCouch.data.size, 0)
    t.is(ret, docs)

    teardownData()
  })
})
