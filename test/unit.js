var apm = require('../index.js');

// apm.attach('console');
apm.attach('rabbit',{ channel: 'node-apm', host:'amqp://localhost'});
// start tracking
setInterval(function(){
	apm.meter('test').mark();
},1000);