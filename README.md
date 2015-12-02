
# node-apm
An nodejs application monitoring tool that tracks metrics and reports it to a central server

## To install:

    npm install promotexter/node-apm

## To use:

    var apm = require('node-apm');

	http.createServer(function(req, res) {
      apm.meter('requestsPerSecond').mark();
      res.end('Thanks');
    }).listen(3000);

    console.log(apm.toJSON());


## To use with Rabbit Endpoint:

	var apm = require('node-apm');
	apm.attachEndpoint('rabbitmq', 
                          { 
                             host : 'aqpm://localhost',  
                             [channel : 'node-apm',]
                             [reportFrequency : 990,]
                          });

	http.createServer(function(req, res) {
      apm.meter('requestsPerSecond').mark();
      res.end('Thanks');
    }).listen(3000);


    
