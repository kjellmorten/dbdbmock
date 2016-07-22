import test from 'ava'

import DbdbCouch from '../lib/couchdb'

test('should have delete function', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.delete, 'function')
})

test('should delete document', (t) => {
  const db = new DbdbCouch()
  db.data.set('doc1', {id: 'doc1', type: 'entry'})

  return db.delete('doc1')

  .then((ret) => {
    t.false(db.data.has('doc1'))
    t.deepEqual(ret, {
      id: 'doc1',
      _deleted: true
    })
  })
})

test('should reject for non-existing document', (t) => {
  const db = new DbdbCouch()

  return db.delete('doc0')

  .catch((err) => {
    t.true(err instanceof Error)
    t.is(typeof err.message, 'string')
    t.is(err.name, 'NotFoundError')
  })
})

test('db.get should reject for missing docid', (t) => {
  const db = new DbdbCouch()

  return db.delete()

  .catch((err) => {
    t.true(err instanceof Error)
    t.is(err.message, 'Missing doc id')
  })
})
