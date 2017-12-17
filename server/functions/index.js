/**
 * Firebase cloud functions
 */
'use strict';

const functions = require('firebase-functions');
const OutputProcessor = require('./firebase/FirebaseOutputProcessor');
const dataModel = require('./firebase/firebase-datamodel');
const parsers = require('./parsers');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

/**
 * Processes all sources, scrapping them, and writting the results to
 * Firebase. We subscribe to the 'minute-tick' cron job to get executed
 * every minute.
 */
exports.scrape = functions.pubsub.topic('minute-tick').onPublish(event => {
  return dataModel.getSources(admin).then(sources => {
    return parsers.parse(sources, admin, OutputProcessor);
  });
});
