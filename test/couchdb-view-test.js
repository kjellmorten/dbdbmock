import test from 'ava'
import sinon from 'sinon'

import DbdbCouch from '../lib/couchdb'

function setupData (db) {
  const view = [
    {id: 'src1', type: 'source', name: 'Source 1', url: 'http://source1.com',
      _key: ['2015-05-23T00:00:00.000Z', 'src1']},
    {id: 'src2', type: 'source', name: 'Source 2', url: 'http://source2.com',
      _key: ['2015-05-24T00:00:00.000Z', 'src2']}
  ]
  Object.freeze(view)
  Object.freeze(view[0])
  Object.freeze(view[1])
  db.data.set('view:fns:sources', view)
  return view
}

function setupFilterData (db) {
  const view = [
    {id: 'ent1', type: 'entry', title: 'Entry 1', url: 'http://source2.com/ent1',
      source: 'src2', _key: ['src2', 'ent1']},
    {id: 'ent2', type: 'entry', title: 'Entry 2', url: 'http://source2.com/ent2',
      source: 'src2', _key: ['src2', 'ent2']},
    {id: 'ent3', type: 'entry', title: 'Entry 3', url: 'http://source1.com/ent3',
      source: 'src1', _key: ['src1', 'ent3']}
  ]
  db.data.set('view:fns:entries_by_source', view)
  return view
}

function setupStringKeyData (db) {
  const view = [
    {id: 'ent3', type: 'entry', title: 'Entry 3', url: 'http://source1.com/ent3',
      source: 'src1', _key: 'src1'},
    {id: 'ent1', type: 'entry', title: 'Entry 1', url: 'http://source2.com/ent1',
      source: 'src2', _key: 'src2'},
    {id: 'ent2', type: 'entry', title: 'Entry 2', url: 'http://source2.com/ent2',
      source: 'src2', _key: 'src2'}
  ]
  db.data.set('view:fns:entries_by_source', view)
  return view
}

function setupObjectKeyData (db) {
  const view = [
    {id: 'ent3', type: 'entry', title: 'Entry 3', url: 'http://source1.com/ent3',
      source: 'src1', _key: {id: 'src1'}},
    {id: 'ent1', type: 'entry', title: 'Entry 1', url: 'http://source2.com/ent1',
      source: 'src2', _key: {id: 'src2'}},
    {id: 'ent2', type: 'entry', title: 'Entry 2', url: 'http://source2.com/ent2',
      source: 'src2', _key: {id: 'src2'}}
  ]
  db.data.set('view:fns:entries_by_source', view)
  return view
}

function setupFilterAndKeyData (db) {
  const view = [
    {id: 'ent1', type: 'entry', title: 'Entry 1', url: 'http://source2.com/ent1',
      source: 'src2', _key: ['account1', 'feed1', '2015-05-23T00:00:00.000Z', 'ent1']},
    {id: 'ent2', type: 'entry', title: 'Entry 2', url: 'http://source2.com/ent2',
      source: 'src2', _key: ['account2', 'feed2', '2015-05-24T00:00:00.000Z', 'ent2']},
    {id: 'ent3', type: 'entry', title: 'Entry 3', url: 'http://source1.com/ent3',
      source: 'src1', _key: ['account2', 'feed3', '2015-05-24T00:00:00.000Z', 'ent3']}
  ]
  db.data.set('view:fns:entries_by_feed', view)
  return view
}

// Tests

test('db.getView should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.getView, 'function')
})

test('db.getView should return items', (t) => {
  const db = new DbdbCouch()
  setupData(db)

  return db.getView('fns:sources')

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(obj[0].id, 'src1')
    t.is(obj[0].type, 'source')
    t.is(obj[0].name, 'Source 1')
  })
})

test('db.getView should return items in reversed order', (t) => {
  const db = new DbdbCouch()
  const view = setupData(db)

  return db.getView('fns:sources', {desc: true})

  .then((ret) => {
    t.is(ret.length, 2)
    t.deepEqual(ret[0], view[1])
  })
})

test('db.getView should return items in reversed order through old signature', (t) => {
  const db = new DbdbCouch()
  const view = setupData(db)

  return db.getView('fns:sources', true)

  .then((ret) => {
    t.is(ret.length, 2)
    t.deepEqual(ret[0], view[1])
  })
})

test('db.getView should return paged view', (t) => {
  const db = new DbdbCouch()
  setupData(db)

  return db.getView('fns:sources', {max: 1})

  .then((ret) => {
    t.is(ret.length, 1)
    t.is(ret[0].id, 'src1')
  })
})

test('db.getView should return second page', (t) => {
  const db = new DbdbCouch()
  setupData(db)

  return db.getView('fns:sources', {max: 1, first: 1})

  .then((obj) => {
    t.is(obj.length, 1)
    t.is(obj[0].id, 'src2')
  })
})

test('db.getView should start with specific string key', (t) => {
  const db = new DbdbCouch()
  setupStringKeyData(db)

  return db.getView('fns:entries_by_source', {max: 1, firstKey: 'src2'})

  .then((obj) => {
    t.is(obj.length, 1)
    t.is(obj[0].id, 'ent1')
  })
})

test('db.getView should start with specific object key', (t) => {
  const db = new DbdbCouch()
  setupObjectKeyData(db)

  return db.getView('fns:entries_by_source', {max: 1, firstKey: {id: 'src2'}})

  .then((obj) => {
    t.is(obj.length, 1)
    t.is(obj[0].id, 'ent1')
  })
})

test('db.getView should start with specific array key', (t) => {
  const db = new DbdbCouch()
  setupData(db)

  return db.getView('fns:sources', {max: 1, firstKey: ['2015-05-24T00:00:00.000Z', 'src2']})

  .then((obj) => {
    t.is(obj.length, 1)
    t.is(obj[0].id, 'src2')
  })
})

test('db.getView should return empty results when key not found', (t) => {
  const db = new DbdbCouch()
  setupStringKeyData(db)

  return db.getView('fns:entries_by_source', {max: 1, firstKey: 'src3'})

  .then((obj) => {
    t.is(obj.length, 0)
  })
})

test('db.getView should filter results by string key', (t) => {
  const db = new DbdbCouch()
  setupStringKeyData(db)

  return db.getView('fns:entries_by_source', {filter: 'src2'})

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(obj[0].id, 'ent1')
    t.is(obj[0].source, 'src2')
    t.is(obj[1].id, 'ent2')
    t.is(obj[1].source, 'src2')
  })
})

test('db.getView should filter results by object key', (t) => {
  const db = new DbdbCouch()
  setupObjectKeyData(db)

  return db.getView('fns:entries_by_source', {filter: {id: 'src2'}})

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(obj[0].id, 'ent1')
    t.is(obj[0].source, 'src2')
    t.is(obj[1].id, 'ent2')
    t.is(obj[1].source, 'src2')
  })
})

test('db.getView should filter results by array key', (t) => {
  const db = new DbdbCouch()
  setupFilterData(db)

  return db.getView('fns:entries_by_source', {filter: ['src2']})

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(obj[0].id, 'ent1')
    t.is(obj[0].source, 'src2')
    t.is(obj[1].id, 'ent2')
    t.is(obj[1].source, 'src2')
  })
})

test('db.getView should filter results by two level key', (t) => {
  const db = new DbdbCouch()
  setupFilterData(db)

  return db.getView('fns:entries_by_source', {filter: ['src2', 'ent2']})

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 1)
    t.is(obj[0].id, 'ent2')
  })
})

test('db.getView should filter and start with specific key', (t) => {
  const db = new DbdbCouch()
  setupFilterAndKeyData(db)

  return db.getView('fns:entries_by_feed', {max: 1,
    filter: ['account2', 'feed2'], firstKey: ['2015-05-24T00:00:00.000Z', 'ent2']})

  .then((obj) => {
    t.is(obj.length, 1)
    t.is(obj[0].id, 'ent2')
  })
})

test('db.getView should warn when filtering by string and start with specific key', (t) => {
  const db = new DbdbCouch()
  sinon.stub(console, 'warn')

  return db.getView('fns:entries_by_feed', {max: 1,
    filter: 'account2', firstKey: ['2015-05-24T00:00:00.000Z', 'ent2']})

  .then((obj) => {
    t.true(console.warn.calledOnce)
    t.is(obj.length, 0)

    console.warn.restore()
  })
})

test('db.getView should not alter options object', (t) => {
  const db = new DbdbCouch()
  setupData(db)
  const options = {desc: true}
  Object.freeze(options)

  return db.getView('fns:sources', options)

  .then((ret) => {
    t.pass()
  })
})

test('db.getView should clone data in view', (t) => {
  const db = new DbdbCouch()
  const view = setupData(db)

  return db.getView('fns:sources')

  .then((ret) => {
    t.not(ret[0], view[0])
    t.not(ret[1], view[1])
  })
})

test('db.getView should return empty array on no results', (t) => {
  const db = new DbdbCouch()

  return db.getView('fns:sources')

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 0)
  })
})

test('db.getView should reject when view is Error', (t) => {
  t.plan(2)
  const db = new DbdbCouch()
  db.data.set('view:fns:sources', new Error('Some error'))

  return db.getView('fns:sources')

  .catch((err) => {
    t.truthy(err)
    t.is(err.message, 'Some error')
  })
})
