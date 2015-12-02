module.exports = RabbitDriver;

function RabbitDriver(opts) {
  opts = opts || {};

  this.channel 	= opts.channel || 'events';
  this.host 	= opts.host || 'amqp://localhost';
}


var publisher = {};


RabbitDriver.prototype.init = function(callback) {
	
	var channel = this.channel;
	var host = this.host;

	var context = require('rabbit.js').createContext(host);

	context.on('ready', function() {
	  
	  publisher = context.socket('PUB');

	  publisher.connect(channel, function() {

	      console.log('pub connected',this.channel);

	      callback();
	  });
	});
};

RabbitDriver.prototype.log = function(data)
{
	publisher.write(JSON.stringify(data) , 'utf8');
}