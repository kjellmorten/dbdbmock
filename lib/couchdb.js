'use strict';

const uuid = require('uuid');

const DbdbCouch = function (config) {
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
   * Gets a document from the database with the given id.
   * @param {string} docid - Document id
   * @returns {Promise} Promise of a document object as json
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
   * Gets results of a view from database.
   * Supports paged views when a pageSize is set, otherwise all documents
   * will be fetched.
   * @param {string} ddoc - Id of design document
   * @param {string} view - Id of view
   * @param {boolean} descend - Orders descending if true
   * @param {number} pageSize - Number of documents to fetch as one page
   * @param {number/string} pageStart - The page number to start from or last key from the page before
   * @returns {Promise} Promise of json from view
   */
  getView: function (ddoc, view, descend, pageSize, pageStart) {
    return new Promise((resolve, reject) => {
      let items = data.get(`view:${ddoc}:${view}`) || [];
      if (descend) {
        // Reverse order
        items = items.slice();
        items.reverse();
      }
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
      resolve(items);
    });
  },

  /**
   * Inserts a document into the database.
   * Use `update` when inserting an existing document, to get the correct
   * revision number first.
   * @param {Object} doc - Document object
   * @returns {Promise} Promise of document object with the new revision and id
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
   * Updates a document in the database. Retrieves the existing document
   * from database and updates the values, before storing in the database.
   * @param {Object} doc - Document object
   * @returns {Promise} Promise of document object with the new revision
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
  }
};

module.exports = DbdbCouch;
