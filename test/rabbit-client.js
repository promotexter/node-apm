var context = require('rabbit.js').createContext();
context.on('ready', function() {
  var pub = context.socket('PUB'), sub = context.socket('SUB');
  sub.pipe(process.stdout);
  sub.connect('probe', function() {
  });
});