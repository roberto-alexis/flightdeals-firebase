/**
 * Utility methods
 */
'use strict';

/**
 * @return the same text but with trailing or leading invisible characters
 */
exports.trimInvisibleCharacters = function(text) {
  if (!text) {
    return null;
  }
  return text.replace(/[\n\r\t]+/g, '');
};
