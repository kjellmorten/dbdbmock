import test from 'ava'

import {couchdb} from '../index'

test('couchdb should exist', (t) => {
  t.is(typeof couchdb, 'function')
  t.is(couchdb.dbType, 'couchdb')
})
