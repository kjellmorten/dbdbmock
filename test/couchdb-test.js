import test from 'ava'

import DbdbCouch from '../lib/couchdb'

// Tests

test('DbdbCouch should be a function', (t) => {
  t.is(typeof DbdbCouch, 'function')
})

test('DbdbCouch.dbType should be couchdb', (t) => {
  t.is(DbdbCouch.dbType, 'couchdb')
})

test('db.dbType should be couchdb', (t) => {
  const db = new DbdbCouch()

  t.is(db.dbType, 'couchdb')
})

test('DbdbCouch.isMock should be true', (t) => {
  t.true(DbdbCouch.isMock)
})

test('db.isMock should be true', (t) => {
  const db = new DbdbCouch()

  t.true(db.isMock)
})

test('should set db.config on creation', (t) => {
  const config = {}
  const db = new DbdbCouch(config)

  t.is(db.config, config)
})

// Data storage

test('db.data should be a Map', (t) => {
  const db = new DbdbCouch()

  t.truthy(db.data)
  t.is(db.data.constructor.name, 'Map')
})

test('db.data should be local to each instance', (t) => {
  const db1 = new DbdbCouch()
  const db2 = new DbdbCouch()

  db1.data.set('key1', 'value1')

  t.true(db1.data.has('key1'))
  t.false(db2.data.has('key1'))
})

test('db.data should be global when configured that way', (t) => {
  const db1 = new DbdbCouch({globalStorage: true})
  const db2 = new DbdbCouch({globalStorage: true})

  db1.data.set('key1', 'value1')

  t.true(db1.data.has('key1'))
  t.true(db2.data.has('key1'))
})

test('DbdbCouch.data should be a Map', (t) => {
  t.is(DbdbCouch.data.constructor.name, 'Map')
})

test('DbdbCouch.data should affect global storage', (t) => {
  const db = new DbdbCouch({globalStorage: true})

  DbdbCouch.data.set('key2', 'value2')

  t.true(db.data.has('key2'))
})

test('DbdbCouch.data should not affect local storage', (t) => {
  const db = new DbdbCouch({globalStorage: false})

  DbdbCouch.data.set('key2', 'value2')

  t.false(db.data.has('key2'))
})

// Tests -- database connection

test('db.connect should exist', (t) => {
  const db = new DbdbCouch()

  t.is(typeof db.connect, 'function')
})

test('db.connect should return object', function (t) {
  const db = new DbdbCouch()

  return db.connect()

  .then((conn) => {
    t.is(typeof conn, 'object')

    db.disconnect()
  })
})

test('db.disconnect should exist', function (t) {
  const db = new DbdbCouch()

  t.is(typeof db.disconnect, 'function')
})
