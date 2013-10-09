
var winston = require('winston');


const LOGGER_SOCKET_ADDRESS = 'tcp://ec2-54-217-125-174.eu-west-1.compute.amazonaws.com:9700',
      LOGGER_METADATA = {
        project: 'igz-enterprise-geolocation'
      };


//
// Requiring `winston-zeromq-elasticsearch` will expose 
// `winston.transports.ZeroMQElasticSearch`
//
require('winston-zeromq-elasticsearch').ZeroMQElasticSearch;

var logger = new winston.Logger({
  transports : [
    new winston.transports.Console(),
    new winston.transports.ZeroMQElasticSearch({
      socketAddress: LOGGER_SOCKET_ADDRESS,
      level: 'warn'
    })
  ],
  exitOnError: false
});

module.exports = function (prefix) {
  
  if ( prefix !== undefined ) {
    prefix = '[' + prefix.replace(process.cwd(), '') + '] ';
  } else {
    prefix = '';
  }

  return {
    info : function (msg) {
      logger.info(prefix + msg, LOGGER_METADATA);
    },
    warn : function (msg) {
      logger.warn(prefix + msg, LOGGER_METADATA);
    },
    error : function (msg) {
      logger.error(prefix + msg, LOGGER_METADATA);
    }
  };
};
