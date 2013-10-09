
var winston = require('winston'),
    config = require('./config').LOGGER;

var transports = [];

if ( config.SOCKET ) {
  //
  // Requiring `winston-zeromq-elasticsearch` will expose 
  // `winston.transports.ZeroMQElasticSearch`
  //
  require('winston-zeromq-elasticsearch').ZeroMQElasticSearch;

  transports.push(
    new winston.transports.ZeroMQElasticSearch({
      socketAddress: config.SOCKET,
      level: config.LEVEL || 'warn'
    })
  );

}

if ( config.CONSOLE_TRANSPORT ) {
  transports.push( new winston.transports.Console() );
}

var logger = new winston.Logger({
  transports : transports,
  exitOnError: false
});


function createLogger ( prefix ) {
  
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

module.exports = createLogger;
