const parse = require('../parsers/parse-rss');
const OutputProcessor = require('./MockOutputProcessor');

const output = new OutputProcessor();

parse(
  {
    rssUrl: 'https://api.rss2json.com/v1/api.json?rss_url=http%3A%2F%2Ffaredealalert.com%2Ffeed'
  },
  output
).then(() => {
  console.log('Success');
}).catch(error => {
  console.log('Error: ' + error);
});