/**
 * Provides access to different parts of the database. It abstracts
 * the rest of the application from how this data is obtained.
 */
'use strict';

const crypto = require('crypto');

/**
 * Returns the list of sources in the shape of:
 * {
 *  key: (string) source-key
 *  params: (object) source-params
 *  type: (string) source-type
 * }
 * @return Promise with array of sources
 */
exports.getSources = function(admin) {
  return admin.database().ref('/sources').once('value').then(snapshot => {
    const sources = snapshot.val();
    const res = [];
    for (var sourceKey in sources) {
      res.push({
        key: sourceKey,
        params: sources[sourceKey].params,
        type: sources[sourceKey].type
      })
    }
    return res;
  });
};

/**
 * @return an encoded version of the given key, safe to be used as a Firebase key
 */
exports.encodeKey = function(key) {
  return crypto.createHash('md5').update(key).digest('hex');
};
