/**
 * Mock implementation of BaseOutputProcessor for testing
 */
'use strict';

const BaseOutputProcessor = require('../parsers/BaseOutputProcessor');
const inherit = require('../common/component-inherit');

/**
 * Constructor
 */
const MockOutputProcessor = module.exports = function () {
  BaseOutputProcessor.call(this);
  this.finished = false;
  this.successful = false;
};

inherit(MockOutputProcessor, BaseOutputProcessor);

MockOutputProcessor.prototype._printReport = function () {
  console.log('Num ok record: ' + this.numOkRecords);
  console.log('Num error record: ' + this.numErrorRecords);
  console.log('Last error: ' + this.lastError);
}

MockOutputProcessor.prototype.success = function () {
  console.log('Output finished with success.');
  this._printReport();
  this.deals.forEach((entry) => {
    console.log('Saving deal: ' + JSON.stringify(entry))
  });
  this.finished = true;
  this.successful = true;
  return Promise.resolve();
};

MockOutputProcessor.prototype.error = function (message) {
  console.log("Execution results: error: " + message);
  this._printReport();
  this.finished = true;
  this.successful = false;
  return Promise.resolve();
};
