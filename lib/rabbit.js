module.exports = RabbitDriver;

var opts = {};

function RabbitDriver(opts) {
  opts = opts || {};

  this.channel 	= opts.channel || 'events';
  this.host 	= opts.host || 'amqp://localhost';
  this.expiration = opts.expiration || (1000 * 3600 * 3); // 3 hours default message expire time

  this._source   = opts.source || 'source-localhost';
  this._type     = opts.type || 'type-app';
}

var publisher = {};


RabbitDriver.prototype.init = function(callback) {
	
	var channel = this.channel;
	var host = this.host;
	var expiration = this.expiration;

	var context = require('rabbit.js').createContext(host);

	context.on('ready', function() {
	  
	  publisher = context.socket('PUB', { expiration : expiration });

	  publisher.connect(channel, function() {

	      console.log('pub connected',this.channel);

	      callback();
	  });
	});
};

RabbitDriver.prototype.cookData = function(data)
{
	// let's prep a rabbit spec message
	var message = {
		source : this._source,
		type : this._type,
		body : data
	};

	return message;	
}


RabbitDriver.prototype.log = function(data)
{
	publisher.write(JSON.stringify(this.cookData(data)) , 'utf8');
}