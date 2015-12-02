var util      	= require('util');
var Measured 	= require('measured');

var APM = {};

var endpoints = {};

/* Rabbit endpoint */
var Rabbit      = require('./lib/rabbit');
var rabbit = {};



// let's create the collection from node-measured 
APM = Measured.createCollection();

/**
*	attach an endpoint
*/
APM.attach = function(type, config)
{
	switch(type)
	{
		case 'console' : 

			endpoints['console'] = true;

			break;

		case 'rabbit' : 
			// console.log(config);
			rabbit = new Rabbit(config);

			rabbit.init(function(){
				endpoints['rabbit'] = true;	
			});

			break;

		default: 

			console.log("ERROR invalid type");

			return process.exit(1);
	}
}

setInterval(function(){

	// write to console
	if(endpoints['console'])
		console.log("[node-apm]\t", APM.toJSON());

	// write to rabbit
	if(endpoints['rabbit'])
		rabbit.log(APM.toJSON());

},1000);

module.exports = APM;