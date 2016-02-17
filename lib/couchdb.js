'use strict';

const DbdbCouch = function (config) {
};

DbdbCouch.dbType = 'couchdb';
DbdbCouch.isMock = true;

DbdbCouch.prototype = {

  connect: function () {
    return Promise.resolve(null);
  },

  disconnect: function () {
  }
};

module.exports = DbdbCouch;
