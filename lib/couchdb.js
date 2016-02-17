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
