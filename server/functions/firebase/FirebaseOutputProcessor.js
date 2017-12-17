/**
 * FirebaseOutputProcessor class.
 * Firebase implementation of the BaseOutputProcessor. It registeres the results
 * of the scraping to Firebase DB.
 */
'use strict';

const BaseOutputProcessor = require('../parsers/BaseOutputProcessor');
const inherit = require('../common/component-inherit');
const dbModel = require('./firebase-datamodel');

/**
 * Constructor
 * @param source Parse "Source" object that is the source of the information
 * being processed.
 */
const FirebaseOutputProcessor = module.exports = function(sourceKey, admin) {
  BaseOutputProcessor.call(this);
  this.sourceKey = sourceKey;
  this.admin = admin;
};

inherit(FirebaseOutputProcessor, BaseOutputProcessor);

/**
 * Saves all accumulated deals (see 'pushDeal' for the format of the deal object)
 * @private
 * @return {Promise} that will be fulfilled when all deals have been saved.
 */
FirebaseOutputProcessor.prototype._saveDeals = function() {
  const promises = [];
  this.deals.forEach((deal) => {
    const hash = dbModel.encodeKey(deal.id);
    const db = this.admin.database();
    return db
      .ref(`/post-hashes/${hash}`)
      .once('value')
      .then(function(snapshot) {
        var exists = (snapshot.val() !== null);
        if (exists) {
          // This is duplicate. Ignoring.
          return null;
        }
        return db
          .ref('/posts')
          .push()
          .set(deal);
      })
      .then(function() {
        return db
          .ref(`/post-hashes/${hash}`)
          .set(true);
      })
      .catch(function(err) {
        console.error(err);
      });
  });
  return Promise.all(promises);
};

/**
 * Increments a Firebase counter by an increment
 * @returns {Promise.<TResult>}
 * @private
 */
FirebaseOutputProcessor.prototype._increment = function(ref, inc) {
  return ref.transaction(count => (count || 0) + inc);
  //return ref.once().then(count => ref.set(count + inc));
}

/**
 * See {@link BaseOutputProcessor#success}
 * @returns {Promise.<TResult>}
 */
FirebaseOutputProcessor.prototype.success = function() {
  const self = this;
  const sourceRef = this.admin.database().ref(`/sources/${self.sourceKey}`);
  const promises = [];
  promises.push(this._saveDeals());
  promises.push(this._increment(sourceRef.child('execs'), 1));
  promises.push(this._increment(sourceRef.child('successfulExecs'), 1));
  promises.push(this._increment(sourceRef.child('successfulRecords'), self.numOkRecords));
  promises.push(this._increment(sourceRef.child('errorRecords'), self.numErrorRecords));
  promises.push(sourceRef.update({
    lastExecTime: Date.now(),
    lastSuccessTime: Date.now()
  }));
  return Promise.all(promises);
};

/**
 * See {@link BaseOutputProcessor#error}
 * @returns {Promise.<TResult>}
 */
FirebaseOutputProcessor.prototype.error = function(errorMessage) {
  console.log("Execution results: error: " + errorMessage);
  const self = this;
  const sourceRef = this.admin.database().ref(`/sources/${self.sourceKey}`);
  const promises = [];
  promises.push(this._increment(sourceRef.child('execs'), 1));
  promises.push(this._increment(sourceRef.child('errorExecs'), 1));
  promises.push(sourceRef.child('lastError').set(errorMessage));
  promises.push(sourceRef.update({
    lastExecTime: Date.now(),
    lastErrorTime: Date.now()
  }));
  return Promise.all(promises);
};