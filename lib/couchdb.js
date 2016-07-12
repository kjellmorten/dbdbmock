const uuid = require('uuid')

const dataStore = new Map()

const matchFilter = (key, filter) =>
  (key && filter) && (filter.reduce((prev, item, index) => prev && item === key[index], true))

class DbdbCouch {

  constructor (config) {
    this.config = config
    this.dbType = DbdbCouch.dbType
    this.isMock = DbdbCouch.isMock
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
        let doc = dataStore.get(docid)
        if (doc) {
          // Return doc
          resolve(doc)
        } else {
          // Doc doesn't exist
          let e = new Error('Could not get ' + docid + '. ')
          e.name = 'NotFoundError'
          reject(e)
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
      if (typeof options === 'string') {
        // Called with old signature
        id = `${id}:${options}`
        options = {}
        if (arguments[2]) {
          options.desc = arguments[2]
        }
      } else if (typeof options === 'boolean') {
        options = Object.assign({desc: options}, arguments[2])
      }

      options = Object.assign({pageStart: 0, pageSize: null, desc: false}, options)

      // Get items
      let items = dataStore.get(`view:${id}`) || []

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
        // Store
        if (!doc.id) {
          doc.id = uuid.v4()
        }
        dataStore.set(doc.id, doc)

        // Return
        resolve(doc)
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
          for (let key of Object.keys(doc)) {
            if (key !== 'createdAt') {
              olddoc[key] = doc[key]
            }
          }
          dataStore.set(doc.id, olddoc)
          resolve(olddoc)
        }, reject)
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
        let ps = docs.map((doc) => this.insert(doc))
        resolve(Promise.all(ps))
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
      docs.forEach((doc) => {
        dataStore.delete(doc.id)
      })
      resolve(docs)
    })
  }

}

module.exports = DbdbCouch
