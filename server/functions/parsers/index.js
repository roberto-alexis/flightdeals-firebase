/**
 * Main scrapping entry-point
 */
'use strict'

const parseRSS = require('./parse-rss');

/**
 * Dictionary with all possible parsers. Each of them
 * implements a single method: parse(params, outputProcessor)
 * where 'params' are the parameters for this parser
 * and 'outputProcessor' is a {OutputProcessor} instance.
 */
const parserFunctionsByType = {
  "rss": parseRSS
};

/**
 * Process the provided list of sources using the provided output processor
 * @param sources
 * @param OutputProcessor output processor class to use
 * @return Promise fulfilled when all sources have been parsed
 */
exports.parse = function(sources, admin, OutputProcessor) {
  const promises = sources.map(source => {
    const outputProcessor = new OutputProcessor(source.key, admin);
    const parseFunc = parserFunctionsByType[source.type];
    return parseFunc(source.params, outputProcessor);
  });
  return Promise.all(promises);
};