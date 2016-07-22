const uuid = require('uuid')
const dataStore = new Map()

const matchFilter = (key, filter) =>
  (key && filter) && (filter.reduce((prev, item, index) => prev && item === key[index], true))

  /**
   * Mock adapter for Dbdb. Imitates the couchdb implementation.
   * Direct manipulation of data store is available through the .data property,
   * both as a static property and on class instances. If globalStorage on the
   * config param is set to true, the data property on instances and class
   * (static) will use the same data storage. Else each instance will have a
   * seperate data storage.
   * The data param will initialize the data storage with keys and values given
   * as an Array of 2-element Arrays with key-value pairs. Only applied when
   * globalStorage is false.
   * ```
   * new DbdbCouch({globalStorage: false}, [['doc1', {id: 'doc1'}], ...])
   * ```
   * @constructor
   * @param {object} config - Config object
   * @param {object} data - Initial data array of arrays of keys and values for dataStore
   */
class DbdbCouch {

  constructor (config = {}, data = null) {
    this.config = Object.assign({}, config)
    this.dbType = DbdbCouch.dbType
    this.isMock = DbdbCouch.isMock
    this.data = (config.globalStorage) ? dataStore : new Map(data)
  }

  static get dbType () {
    return 'couchdb'
  }

  static get isMock () {
    return true
  }

  static get data () {
    return dataStore
  }

  /**
   * Does nothing.
   * @returns {Promise} A promise for null
   */
  connect () {
    return Promise.resolve(null)
  }

  /**
   * Does nothing.
   */
  disconnect () {
  }

  /**
   * Gets an object from the data store with the given id.
   * @param {string} docid - Document id
   * @returns {Promise} Promise of the object
   */
  get (docid) {
    return new Promise((resolve, reject) => {
      if (docid) {
        if (Array.isArray(docid)) {
          // Get several documents
          const docs = docid.map((id) => this.data.get(id) || null)
          resolve(docs)
        } else {
          // Get one document
          const doc = this.data.get(docid)
          if (doc) {
            if (doc instanceof Error) {
              // Reject with Error (for mocking errors)
              reject(doc)
            } else {
              // Resolve doc
              resolve(doc)
            }
          } else {
            // Doc doesn't exist
            const e = new Error('Could not get ' + docid + '. ')
            e.name = 'NotFoundError'
            reject(e)
          }
        }
      } else {
        // No document id
        reject(new Error('Missing document id'))
      }
    })
  }

  /**
   * Gets results of a view from the data store.
   * Views are store with key 'view:{ddoc}:{view}'.
   * Supports paged views when a pageSize is set, otherwise all objects
   * will be fetched.
   * @param {string} view - Id of view. In CouchDb, this is in the format <ddoc>_<view>
   * @param {object} options - Query options. filter, pageSize, and pageStart
   * @returns {Promise} Promise of json from view
   */
  getView (id, options = {}) {
    return new Promise((resolve, reject) => {
      if (typeof options === 'boolean') {
        options = Object.assign({desc: options}, arguments[2])
      }

      options = Object.assign({pageStart: 0, pageSize: null, desc: false}, options)

      // Get items
      const viewItems = this.data.get(`view:${id}`) || []
      if (viewItems instanceof Error) {
        reject(viewItems) // Reject if error - for mockin errors
      }
      let items = viewItems.map((item) => Object.assign({}, item))

      // Filter
      if (options.filter) {
        items = items.filter((el) => matchFilter(el._key, options.filter.split('/')))
      }

      // Reverse on descend
      if (options.desc) {
        // Reverse order
        items = items.slice()
        items.reverse()
      }

      // Paging
      let pageStart = options.pageStart
      if (options.pageSize) {
        if (isNaN(pageStart)) {
          // Get index of element with given key
          pageStart = items.findIndex((element, index, array) => {
            return (element._key && (JSON.stringify(element._key) === JSON.stringify(pageStart)))
          })
          // Start with index after
          pageStart++
        }
        // Get paged portion of array
        items = items.slice(pageStart, pageStart + options.pageSize)
      }

      // Return items
      resolve(items)
    })
  }

  /**
   * Inserts an object into the data store.
   * Generates an id for the object if none exist.
   * @param {Object} doc - Document object
   * @returns {Promise} Promise of object
   */
  insert (doc) {
    return new Promise((resolve, reject) => {
      if (!doc) {
        reject(new Error('Missing document object'))
      } else {
        // Clone doc
        doc = Object.assign({}, doc)

        // Generate id if one does not exist
        if (!doc.id) {
          doc.id = uuid.v4()
        }

        if (this.data.has(doc.id)) {
          // A doc with this id already exists
          const err = new Error('Document update conflict')
          err.name = 'ConflictError'
          reject(err)
        } else {
          // Insert doc and resolve it
          this.data.set(doc.id, doc)
          resolve(doc)
        }
      }
    })
  }

  /**
   * Updates an object in the data store. Retrieves the existing object
   * from with updated values.
   * @param {Object} doc - Document object
   * @returns {Promise} Promise of object
   */
  update (doc) {
    return new Promise((resolve, reject) => {
      if (!doc) {
        reject(new Error('Missing document object'))
      } else {
        this.get(doc.id)
        .then((olddoc) => {
          const newdoc = Object.assign({}, olddoc, doc, {createdAt: olddoc.createdAt})
          this.data.set(doc.id, newdoc)
          resolve(newdoc)
        }, reject)
      }
    })
  }

  /**
   * Deletes a document in the database.
   * @param {Object} doc - Document object to delete
   * @returns {Promise} Promise of document object with the new revision
   */
  delete (docid) {
    return new Promise((resolve, reject) => {
      if (docid) {
        if (this.data.has(docid)) {
          this.data.delete(docid)
          resolve({id: docid, _deleted: true})
        } else {
          const error = new Error(`Could not delete doc ${docid}.`)
          error.name = 'NotFoundError'
          reject(error)
        }
      } else {
        reject(new Error('Missing doc id'))
      }
    })
  }

  /**
   * Inserts many objects into the data store.
   * Generates new ids for the objects without id.
   * @param {Array} docs - Array of objects
   * @returns {Promise} Promise of an array of objects
   */
  insertMany (docs) {
    return new Promise((resolve, reject) => {
      if (!docs) {
        reject(new Error('Missing documents array'))
      } else {
        resolve(Promise.all(
          docs.map((doc) => this.insert(doc)
            .catch((err) => Object.assign({_error: 'conflict', _reason: err.message}, doc)))
        ))
      }
    })
  }

  /**
   * Deletes many objects from the data store.
   * @param {Array} docs - Array of objects
   * @returns {Promise} Promise of an array of objects
   */
  deleteMany (docs) {
    return new Promise((resolve, reject) => {
      const ret = []
      docs.forEach((doc) => {
        this.data.delete(doc.id)
        ret.push(Object.assign({}, doc))
      })
      resolve(ret)
    })
  }

}

module.exports = DbdbCouch
