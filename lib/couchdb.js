'use strict';

const uuid = require('uuid');

const DbdbCouch = function (config) {
  this.config = config;
  this.dbType = DbdbCouch.dbType;
  this.isMock = DbdbCouch.isMock;
};

DbdbCouch.dbType = 'couchdb';
DbdbCouch.isMock = true;
let data = DbdbCouch.data = new Map();

DbdbCouch.prototype = {

  /**
   * Does nothing.
   * @returns {Promise} A promise for null
   */
  connect: function () {
    return Promise.resolve(null);
  },

  /**
   * Does nothing.
   */
  disconnect: function () {
  },

  /**
   * Gets an object from the data store with the given id.
   * @param {string} docid - Document id
   * @returns {Promise} Promise of the object
   */
  get: function (docid) {
    return new Promise((resolve, reject) => {
      if (docid) {
        let doc = data.get(docid);
        if (doc) {
          // Return doc
          resolve(doc);
        } else {
          // Doc doesn't exist
          let e = new Error('Could not get ' + docid + '. ');
          e.name = 'NotFoundError';
          reject(e);
        }
      } else {
        // No document id
        reject(new Error('Missing document id'));
      }
    });
  },

  /**
   * Gets results of a view from the data store.
   * Views are store with key 'view:{ddoc}:{view}'.
   * Supports paged views when a pageSize is set, otherwise all objects
   * will be fetched.
   * @param {string} view - Id of view. In CouchDb, this is in the format <ddoc>_<view>
   * @param {boolean} descend - Orders descending if true
   * @param {object} options - Query options. filter, pageSize, and pageStart
   * @param {number} pageSize - Number of documents to fetch as one page
   * @param {number/string} pageStart - The page number to start from or last key from the page before
   * @returns {Promise} Promise of json from view
   */
  getView: function (view, descend, options, pageSize, pageStart) {
    return new Promise((resolve, reject) => {
      if (typeof descend === 'string') {
        // Called with old signature
        view = `${view}:${descend}`;
        descend = options;
        options = {};
      }
      options = options || {};
      pageSize = pageSize || options.pageSize;
      pageStart = pageStart || options.pageStart;

      // Get items
      let items = data.get(`view:${view}`) || [];

      // Filter
      if (options.filter) {
        items = items.filter((el) => (el.key && el.key[0] === options.filter));
      }

      // Reverse on descend
      if (descend) {
        // Reverse order
        items = items.slice();
        items.reverse();
      }

      // Paging
      if (pageSize) {
        pageStart = pageStart || 0;
        if (isNaN(pageStart)) {
          // Get index of element with given key
          pageStart = items.findIndex((element, index, array) => {
            return (element._key && (JSON.stringify(element._key) === JSON.stringify(pageStart)));
          });
          // Start with index after
          pageStart++;
        }
        // Get paged portion of array
        items = items.slice(pageStart, pageStart + pageSize);
      }

      // Return items
      resolve(items);
    });
  },

  /**
   * Inserts an object into the data store.
   * Generates an id for the object if none exist.
   * @param {Object} doc - Document object
   * @returns {Promise} Promise of object
   */
  insert: function (doc) {
    return new Promise((resolve, reject) => {
      if (!doc) {
        reject(new Error('Missing document object'));
      } else {
        // Store
        if (!doc.id) {
          doc.id = uuid.v4();
        }
        data.set(doc.id, doc);

        // Return
        resolve(doc);
      }
    });
  },

  /**
   * Updates an object in the data store. Retrieves the existing object
   * from with updated values.
   * @param {Object} doc - Document object
   * @returns {Promise} Promise of object
   */
  update: function (doc) {
    return new Promise((resolve, reject) => {
      if (!doc) {
        reject(new Error('Missing document object'));
      } else {
        this.get(doc.id)
        .then((olddoc) => {
          for (let key of Object.keys(doc)) {
            if (key !== 'createdAt') {
              olddoc[key] = doc[key];
            }
          }
          data.set(doc.id, olddoc);
          resolve(olddoc);
        }, reject);
      }
    });
  },

  /**
   * Inserts many objects into the data store.
   * Generates new ids for the objects without id.
   * @param {Array} docs - Array of objects
   * @returns {Promise} Promise of an array of objects
   */
  insertMany: function (docs) {
    return new Promise((resolve, reject) => {
      if (!docs) {
        reject(new Error('Missing documents array'));
      } else {
        let ps = docs.map((doc) => this.insert(doc));
        resolve(Promise.all(ps));
      }
    });
  },

  /**
   * Deletes many objects from the data store.
   * @param {Array} docs - Array of objects
   * @returns {Promise} Promise of an array of objects
   */
  deleteMany: function (docs) {
    return new Promise((resolve, reject) => {
      docs.forEach((doc) => {
        data.delete(doc.id);
      });
      resolve(docs);
    });
  }

};

module.exports = DbdbCouch;
