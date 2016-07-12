import test from 'ava'

import DbdbCouch from '../lib/couchdb'

function setupData () {
  let view = [
    {id: 'src1', type: 'source', name: 'Source 1', url: 'http://source1.com',
      _key: [ '2015-05-23T00:00:00.000Z', 'src1' ]},
    {id: 'src2', type: 'source', name: 'Source 2', url: 'http://source2.com',
      _key: [ '2015-05-24T00:00:00.000Z', 'src2' ]}
  ]
  DbdbCouch.data.set('view:fns:sources', view)
  return view
}

function setupFnsEntriesBySource () {
  let view = [
    { id: 'ent1', type: 'entry', title: 'Entry 1', url: 'http://source2.com/ent1',
      source: 'src2', _key: [ 'src2', 'ent1' ] },
    { id: 'ent2', type: 'entry', title: 'Entry 2', url: 'http://source2.com/ent2',
      source: 'src2', _key: [ 'src2', 'ent2' ] },
    { id: 'ent3', type: 'entry', title: 'Entry 3', url: 'http://source1.com/ent3',
      source: 'src1', _key: [ 'src1', 'ent3' ] }
  ]
  DbdbCouch.data.set('view:fns:entries_by_source', view)
  return view
}

function teardownData () {
  DbdbCouch.data.clear()
}

// Tests

test('db.getView should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.getView, 'function')
})

test.serial('db.getView should return items', (t) => {
  setupData()
  const db = new DbdbCouch()

  return db.getView('fns:sources')

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(obj[0].id, 'src1')
    t.is(obj[0].type, 'source')
    t.is(obj[0].name, 'Source 1')

    teardownData()
  })
})

test.serial('db.getView should return items with old signature', (t) => {
  const view = setupData()
  const db = new DbdbCouch()

  return db.getView('fns', 'sources')

  .then((obj) => {
    t.is(obj, view)

    teardownData()
  })
})

test.serial('db.getView should return items in reversed order', (t) => {
  const view = setupData()
  const db = new DbdbCouch()

  return db.getView('fns:sources', {desc: true})

  .then((ret) => {
    t.is(ret.length, 2)
    t.is(ret[0], view[1])

    teardownData()
  })
})

test.serial('db.getView should return items in reversed order through old signature', (t) => {
  const view = setupData()
  const db = new DbdbCouch()

  return db.getView('fns:sources', true)

  .then((ret) => {
    t.is(ret.length, 2)
    t.is(ret[0], view[1])

    teardownData()
  })
})

test.serial('db.getView should return paged view', (t) => {
  setupData()
  const db = new DbdbCouch()

  return db.getView('fns:sources', {pageSize: 1})

  .then((ret) => {
    t.is(ret.length, 1)
    t.is(ret[0].id, 'src1')

    teardownData()
  })
})

test.serial('db.getView should return second page', (t) => {
  setupData()
  const db = new DbdbCouch()

  return db.getView('fns:sources', {pageSize: 1, pageStart: 1})

  .then((obj) => {
    t.is(obj.length, 1)
    t.is(obj[0].id, 'src2')

    teardownData()
  })
})

test.serial('db.getView should start after specific key', (t) => {
  setupData()
  const db = new DbdbCouch()

  return db.getView('fns:sources', {pageSize: 1, pageStart: [ '2015-05-23T00:00:00.000Z', 'src1' ]})

  .then((obj) => {
    t.is(obj.length, 1)
    t.is(obj[0].id, 'src2')

    teardownData()
  })
})

test.serial('db.getView should filter results by key', (t) => {
  setupFnsEntriesBySource()
  const db = new DbdbCouch()

  return db.getView('fns:entries_by_source', {filter: 'src2'})

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 2)
    t.is(obj[0].id, 'ent1')
    t.is(obj[0].source, 'src2')
    t.is(obj[1].id, 'ent2')
    t.is(obj[1].source, 'src2')

    teardownData()
  })
})

test.serial('db.getView should filter results by two level key', (t) => {
  setupFnsEntriesBySource()
  const db = new DbdbCouch()

  return db.getView('fns:entries_by_source', {filter: 'src2/ent2'})

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 1)
    t.is(obj[0].id, 'ent2')

    teardownData()
  })
})

test.serial('db.getView should return empty array', (t) => {
  const db = new DbdbCouch()

  return db.getView('fns:sources')

  .then((obj) => {
    t.true(Array.isArray(obj))
    t.is(obj.length, 0)
  })
})
