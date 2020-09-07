const Benchmark = require('benchmark')
const suite = new Benchmark.Suite;

const arr = [0,1,2,3,4,5,6,7,8,9]

// add tests
suite.add('let', function() {
  for(let i = 0, len = arr.length; i < len; i++) {
    arr[i]
  }
})
.add('var', function() {
  for(var i = 0, len = arr.length; i < len; i++) {
    arr[i]
  }
})
// add listeners
.on('cycle', function(event) {
  console.log(String(event.target));
})
.on('complete', function() {
  console.log('Fastest is ' + this.filter('fastest').map('name'));
})
.run()
