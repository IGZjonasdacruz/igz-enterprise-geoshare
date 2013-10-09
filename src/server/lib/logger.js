
var winston = require('winston'),
    config = require('./config').LOGGER;

//
// Requiring `winston-zeromq-elasticsearch` will expose 
// `winston.transports.ZeroMQElasticSearch`
//
require('winston-zeromq-elasticsearch').ZeroMQElasticSearch;

var transports = [
  new winston.transports.ZeroMQElasticSearch({
    socketAddress: config.SOCKET,
    level: config.LEVEL
  })
];

if ( config.CONSOLE_TRANSPORT ) {
  transports.push( new winston.transports.Console() );
}

var logger = new winston.Logger({
  transports : transports,
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
      logger.info(prefix + msg, config.METADATA);
    },
    warn : function (msg) {
      logger.warn(prefix + msg, config.METADATA);
    },
    error : function (msg) {
      logger.error(prefix + msg, config.METADATA);
    }
  };
};
