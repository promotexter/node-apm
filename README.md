
# node-apm
An nodejs application monitoring tool that tracks metrics and reports it to a central server

## To install:

    npm install promotexter/node-apm

## To use:

    var apm = require('node-apm');

    // display data in console (default:false)
    apm.debugMode = true;
    

    var probe = apm.probe();
    var meter = probe.meter({  name      : 'req/sec' });

    http.createServer(function(req, res) {
      meter.mark();
      res.end('Thanks');
    }).listen(3000);

    console.log(apm.toJSON());


## To use with Rabbit Endpoint:

	var apm = require('node-apm');
	apm.attach('rabbit', 
                          { 
                             host : 'aqpm://localhost',  
                             [channel : 'node-apm',]
                             [type : 'type-app',]
                             [source : 'source-localhost',]
                             [expiration : 0,]
                          });

  var probe = apm.probe();
  var counter = probe.counter({  name      : 'total requests' });

	http.createServer(function(req, res) {
      counter.inc();
      res.end('Thanks');
    }).listen(3000);


    
### to do document other methods