var apm = require('../index.js');

apm.attach('console');
apm.attach('rabbit',{ 
						channel: 'node-apm', 
						host:'amqp://localhost', 
						source: 'localhost', 
						type:'test-app'
					});
// start tracking
setInterval(function(){
	apm.meter('req/sec').mark();
},1000);

setInterval(function(){
	apm.meter('http/sec').mark();
},500);