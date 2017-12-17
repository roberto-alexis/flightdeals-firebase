const MockOutputProcessor = require('./MockOutputProcessor');

const output = new MockOutputProcessor();
output.pushDeal({foo1: 'bar1'});
output.pushDeal({foo2: 'bar2'});
output.pushError({foo3: 'bar3'});
output.success();
