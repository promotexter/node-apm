var _ = require('lodash');
var Measured   = require('measured');

// var Transport = require('./utils/transport.js');

var util      = require('util');
var APM = {};

APM.debugMode = false;
APM._started = false;
APM._var     = {
	'counters' : {},
	'metrics' : {},
	'histograms' : {},
	'meters' : {}
};



/* Rabbit endpoint */
var Rabbit      = require('./lib/rabbit');
var rabbit = {};




APM.AVAILABLE_AGG_TYPES  = ['avg', 'min', 'max', 'sum', 'none'];
APM.AVAILABLE_MEASUREMENTS = [
  'min',
  'max',
  'sum',
  'count',
  'variance',
  'mean',
  'stddev',
  'median',
  'p75',
  'p95',
  'p99',
  'p999'
];
APM.default_aggregation     = 'avg';

function getValue(value) {
  if (typeof(value) == 'function')
    return value();
  return value;
}

/**
 * Data that will be sent to Keymetrics
 */
function cookData(data) {
  var cooked_data = {};


  
  _.each(data, function(probe_array,probe_type){
  	// console.log(probe_type);
  	// measure type
  	// Object.keys(probe_array).forEach(function(data) {

  	_.each(probe_array, function(data, probe_name){

  		// console.log(probe_type, probe_name, data);

  		if(!cooked_data[probe_type])
  			cooked_data[probe_type] = {};

	    cooked_data[probe_type][probe_name] = {
	      value: getValue(data.value)
	    };

	    /**
	     * Attach aggregation mode
	     */
	    if (data.agg_type &&
	        data.agg_type != 'none')
	      cooked_data[probe_type][probe_name].agg_type = data.agg_type;

	    /**
	     * Attach Alert configuration
	     */
	    if (data.alert)
	      cooked_data[probe_type][probe_name].alert = data.alert.serialize();
	    else
	      cooked_data[probe_type][probe_name].alert = {};
	});
  });
  return cooked_data;
};

/**
 * Tick system for Alerts
 */
function checkIssues(data) {
  Object.keys(data).forEach(function(probe_name) {
    if (typeof(data[probe_name].alert) !== 'undefined') {
      data[probe_name].alert.tick(getValue(data[probe_name].value));
    }
  });
};

function attachAlert(opts, conf) {
  /**
   * pm2 set module-name:probes:probe_name:value    20
   * pm2 set module-name:probes:probe_name:mode     'threshold-avg'
   * pm2 set module-name:probes:probe_name:cmp      '<'
   * pm2 set module-name:probes:probe_name:interval 20
   */
  var alert_opts = {};

  if (opts.alert)
    alert_opts = opts.alert;

  if (conf &&
      conf.probes &&
      conf.probes[opts.name]) {
    // Default mode
    if (!alert_opts.mode) alert_opts.mode = 'threshold';
    alert_opts = util._extend(alert_opts, conf.probes[opts.name]);
  }

  if (alert_opts && alert_opts.mode == 'none') return false;

  if (Object.keys(alert_opts).length > 0 && APM._alert_activated == true) {
    APM._var[opts.name].alert = new Alert(alert_opts, {name : opts.name});
  }
}

var endpoints = {};
APM.attachTransport = function(type, config)
{
	switch(type)
	{
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

APM.probe = function() {
  var self = this;
  // Get module configuration to enable alerts
  if (this.getConf && this.getConf())
    APM._alert_activated = this.getConf().alert_enabled || true;
  else
    APM._alert_activated = false;

  if (APM._started == false) {
    APM._started = true;

    setInterval(function() {
      // Transport.send({
      //   type : 'axm:monitor',
      //   data : cookData(APM._var)
      // });
      // checkIssues(APM._var);

      
		// write to console
		if(APM.debugMode)
			console.log("[node-apm]\n", cookData(APM._var));

		// write to rabbit
		if(endpoints['rabbit'])
			rabbit.log( cookData(APM._var) );
    }, 990);
  }

  return {
    /**
     * This reflect data to keymetrics
     * pmx.transpose('prop name', fn)
     *
     * or
     *
     * pmx.transpose({
     *   name : 'variable name',
     *   data : function() { return value }
     * });
     */
    transpose : function(variable_name, reporter) {
      if (typeof variable_name === 'object') {
        reporter = variable_name.data;
        variable_name = variable_name.name;
      }

      if (typeof reporter !== 'function') {
        return console.error('[PMX] reporter is not a function');
      }

      APM._var[variable_name] = {
        value: reporter
      };
    },
    metric : function(opts) {
      var agg_type = opts.agg_type || APM.default_aggregation;

      if (!opts.name)
        return console.error('[APM][Metric] Name not defined');
      if (APM.AVAILABLE_AGG_TYPES.indexOf(agg_type) == -1)
        return console.error("[APM][Metric] Unknown agg_type: %s", agg_type);

      APM._var['metrics'][opts.name] = {
        value   : opts.value || 0,
        agg_type: agg_type
      };

      /**
       * Attach alert to: APM._var[opts.name].alert
       */
      if (self.getConf)
        attachAlert(opts, self.getConf());

      return {
        val : function() {
          var value = APM._var[opts.name].value;

          if (typeof(value) == 'function')
            value = value();

          return value;
        },
        set : function(dt) {
          APM._var['metrics'][opts.name].value = dt;
        }
      };
    },
    histogram : function(opts) {
      if (!opts.name)
        return console.error('[APM][Histogram] Name not defined');
      opts.measurement = opts.measurement || 'mean';
      opts.unit = opts.unit || '';
      var agg_type = opts.agg_type || APM.default_aggregation;

      if (APM.AVAILABLE_MEASUREMENTS.indexOf(opts.measurement) == -1)
        return console.error('[APM][Histogram] Measure type %s does not exists', opts.measurement);
      if (APM.AVAILABLE_AGG_TYPES.indexOf(agg_type) == -1)
        return console.error("[APM][Metric] Unknown agg_type: %s", agg_type);

      var histogram = new Measured.Histogram(opts);

      APM._var['histograms'][opts.name] = {
        value: function() { return (Math.round(histogram.val() * 100) / 100) + '' + opts.unit },
        agg_type: agg_type
      };

      /**
       * Attach alert to: APM._var[opts.name].alert
       */
      if (self.getConf)
        attachAlert(opts, self.getConf());

      return histogram;
    },
    meter : function(opts) {
      var agg_type = opts.agg_type || APM.default_aggregation;

      if (!opts.name)
        return console.error('[APM][Meter] Name not defined');
      if (APM.AVAILABLE_AGG_TYPES.indexOf(agg_type) == -1)
        return console.error("[APM][Metric] Unknown agg_type: %s", agg_type);

      opts.unit = opts.unit || '';

      var meter = new Measured.Meter(opts);

      APM._var['meters'][opts.name] = {
        value: function() { return meter.currentRate() + '' + opts.unit },
        agg_type: agg_type
      };

      /**
       * Attach alert to: APM._var[opts.name].alert
       */
      if (self.getConf)
        attachAlert(opts, self.getConf());

      return meter;
    },
    counter : function(opts) {
      var agg_type = opts.agg_type || APM.default_aggregation;

      if (!opts.name)
        return console.error('[APM][Counter] Name not defined');
      if (APM.AVAILABLE_AGG_TYPES.indexOf(agg_type) == -1)
        return console.error("[APM][Metric] Unknown agg_type: %s", agg_type);

      var counter = new Measured.Counter();

      APM._var['counters'][opts.name] = {
        value: function() { return counter.toJSON() },
        agg_type: agg_type
      };

      /**
       * Attach alert to: APM._var[opts.name].alert
       */
      if (self.getConf)
        attachAlert(opts, self.getConf());

      return counter;
    }
  }
};

module.exports = APM;
