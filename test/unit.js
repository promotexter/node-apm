var apm = require('../index.js');

// apm.debugMode = true;
apm.attachTransport('rabbit',{ 
						channel: 'node-apm', 
						host:'amqp://localhost', 
						source: 'localhost', 
						type:'test-app'
					});



var probe = apm.probe();

var meter = probe.meter({  name      : 'req/sec' });
var counter = probe.counter({  name      : 'total requests' });


setInterval(function(){
	meter.mark();
	counter.inc();
	// console.log(meter.toJSON());
},500);


// setInterval(function(){
// 	apm.counter('http/sec').inc();
// },500);

// setInterval(function(){
// 	apm.gauge('gauge');
// },500);