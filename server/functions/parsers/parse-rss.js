/**
 * RSS parser implementation. See
 */
const utils = require('../common/utils');
const rp = require('request-promise-native');

/**
 * Extracts the URL of the first image from a HTML text.
 * @param html HTML text to process
 * @returns a string with the URL of the image or null of no image was found
 */
function extractImageUrl(html) {
  var reg = /src=\"([^\"]*)\"/;
  var res = reg.exec(html);
  return res ? res[1] : null;
}

function secretflyingParser(entry) {
  var title = entry.title;

  var categories = entry.categories;
  // RIGHT NOW WE ONLY SUPPORT DEALS FROM NORTH AMERICA!!!!
  if (!categories || (
    categories.indexOf("Depart North America") < 0 &&
    categories.indexOf("Depart USA") < 0)
  ) {
    return null;
  }

  var fromToParser = /^(.*)\ TO\ (.*)/ig;
  var fromToParts = fromToParser.exec(title);
  if (!fromToParts || fromToParts.length < 3) {
    return null;
  }
  var fromPart = fromToParts[1];
  var toPart = fromToParts[2];

  var fromParser = /^(\*\*EXPIRED\*\* )?((MEGA POST\: )|(ERROR FARE\: )|(NON\-STOP\ ))?(FROM )?(.*)/ig;
  var fromParts = fromParser.exec(fromPart);

  var tags = [];
  if (fromParts && fromParts[1] && fromParts[1].trim() == '**EXPIRED**') {
    tags.push('gone');
  }
  if (fromParts && fromParts[2] && fromParts[2].trim() == 'ERROR FARE:') {
    tags.push('error-fare');
  }

  var summary = utils.trimInvisibleCharacters(entry.contentSnippet);
  var sellerParser = /^.*\ with\ ([^.|!]*)/g;
  var sellerParts = sellerParser.exec(summary);

  var toParser = /^(.*)(FOR|FROM).*((\$)|(\€)|(\£))(.*)(RETURN|ONE\-WAY).*/g;
  var toParts = toParser.exec(toPart);

  return {
    id: entry.guid,
    link: entry.link,
    title: entry.title,
    pubDate: new Date(entry.publishedDate),
    content: utils.trimInvisibleCharacters(entry.contentSnippet),
    contentHtml: entry.content,
    summary: summary,
    imageUrl: extractImageUrl(entry.content),
    price: toParts ? toParts[7] : null,
    to: toParts ? toParts[1] : null,
    from: fromParts ? fromParts[7] : null,
    seller: sellerParts ? sellerParts[1] : '',
    tags: tags,
    type: "flight"
  };
}

function flightDealParser(entry) {
  var contentSeparator = '\u003e\n\t';
  var titleParser = /^((\[FARE GONE\])\ )?(.*) – .*\$(.*): (.*) – (.*)\./g;
  var titleParts = titleParser.exec(entry.title);
  var tags = [];
  if (titleParts && titleParts[2] == '[FARE GONE]') {
    tags.push('gone');
  }
  return {
    id: entry.guid,
    link: entry.link,
    title: entry.title,
    pubDate: new Date(entry.publishedDate),
    content: entry.content.substr(entry.content.lastIndexOf(contentSeparator) + contentSeparator.length),
    contentHtml: entry.content,
    summary: utils.trimInvisibleCharacters(entry.contentSnippet),
    imageUrl: extractImageUrl(entry.content),
    price: titleParts ? titleParts[4] : null,
    from: titleParts ? titleParts[5] : null,
    to: titleParts ? titleParts[6] : null,
    seller: titleParts ? titleParts[3] : null,
    tags: tags,
    type: titleParts ? "flight" : "other"
  };
}

const rssPasers = {
  "theflightdeal.com": flightDealParser,
  "faredealalert.com": flightDealParser,
  "secretflying.com": secretflyingParser
};

/**
 * @returns domain of the url received by parameter without the www. prefix
 */
function getDomainFromUrl(url) {
  var domain;
  //find & remove protocol (http, ftp, etc.) and get domain
  if (url.indexOf("://") > -1) {
    domain = url.split('/')[2];
  }
  else {
    domain = url.split('/')[0];
  }

  //find & remove port number
  domain = domain.split(':')[0];
  //var domain = new URL(url).hostname;
  return domain.replace("www.", "");
}

/**
 * Parser that works over an RSS.
 * @param params
 * {
 *  rssUrl: Url where to send the requests to
 * }
 * @param output see 'outputProcessor.js'
 * @returns a promise
 */
module.exports = function (params, output) {
  console.log("RSS parsing with params: " + JSON.stringify(params));
  return rp({
    uri: params.uri,
    json: true,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }).then((data) => {
    try {
      data.items.forEach(entry => {
        try {
          const source = getDomainFromUrl(entry.link);
          const deal = rssPasers[source](entry);
          if (deal) {
            output.pushDeal(deal);
          }
        } catch (err) {
          output.pushError("Error " + err.message + " processing: " + JSON.stringify(entry));
        }
      });
      return output.success();
    } catch (err) {
      return output.error("Error " + err.message + " trying to process response");
    }
  }).catch(error => {
    return output.error("Unable to read feeds: Error: " + error);
  });
};