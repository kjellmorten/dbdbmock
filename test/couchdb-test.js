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

test('DbdbCouch.data should be a Map', (t) => {
  t.is(DbdbCouch.data.constructor.name, 'Map')
})

test('should set db.config on creation', (t) => {
  const config = {}
  const db = new DbdbCouch(config)

  t.is(db.config, config)
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
