/**
 * Makes a subclass inherit from superclass
 * @param a Subclass
 * @param b Superclass
 */
module.exports = function(a, b){
  var fn = function(){};
  fn.prototype = b.prototype;
  a.prototype = new fn;
  a.prototype.constructor = a;
};