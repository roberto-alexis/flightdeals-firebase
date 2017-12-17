/**
 * BaseOutputProcessor class.
 * Base class that allows processing the resources of a parser. Consumers should
 * call to any of the 'registerXXX' methods. Once the consumer is done processing
 * it should call 'success'. If something goes wrong, it should calls 'error'.
 *
 * Subclasses should implement 'success' and 'error'.
 */
'use strict';

/**
 * Constructor
 */
const BaseOutputProcessor = module.exports = function () {
  this.deals = [];
  this.lastError = null;
  this.numOkRecords = 0;
  this.numErrorRecords = 0;
};

/**
 * Adds an individual 'deal'
 * @param deal object with the following structure:
 * {
 *  id: unique identifier of this deal (used for de-dup)
 *  link: link to the post
 *  title: title of the post
 *  pubDate: date (in Javascript Date format) of the publication of the post
 *  content: text only content of the post
 *  contentHtml: html version of the post (this could be the same as 'content')
 *  summary: small snippet of the post
 *  imageUrl: [Optional] URL of an image related ot the post
 *  from: [Optional] array of cities listed as "from" in the offer
 *  to: [Optional] array of cities listed as "to" in the offer
 *  min_price: [Optional] minimum price of the offer
 *  max_price: [Optional] maximum price of the offer
 * }
 * @return this for chaining
 */
BaseOutputProcessor.prototype.pushDeal = function (deal) {
  this.deals.push(deal);
  this.numOkRecords++;
  return this;
};

/**
 * Adds an individual error to be processed. This error will
 * count towards the statistics but won't prevent the processor
 * from keep accepting more data.
 * @param error string containing the error message to append.
 */
BaseOutputProcessor.prototype.pushError = function (error) {
  console.error('Pushing error: ' + error.message, error);
  this.lastError = error;
  this.numErrorRecords++;
};

/**
 * Completes the data gathering, counting this as a successful
 * parse.
 * @return {Promise} that will be fulfilled when all the data
 * has been persisted.
 */
BaseOutputProcessor.prototype.success = function () {
  // Implemented in subclasses
  throw new Error('Not implemented');
};

/**
 * Completes the data gathering, counting this as a failed
 * parse.
 * @return a promise that will be fulfilled when all the data
 * has been persisted.
 */
BaseOutputProcessor.prototype.error = function () {
  // Implemented in subclasses
  throw new Error('Not implemented');
};