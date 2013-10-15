
var winston = require('winston'),
    config = require('./config').LOGGER,
    _ = require('underscore');

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
      level: config.LEVEL || 'warn',
      metadata: config.METADATA
    })
  );

}

if ( config.CONSOLE_TRANSPORT ) {
  transports.push( new winston.transports.Console({colorize:true}) );
}

var logger = new winston.Logger({
  transports : transports,
  exitOnError: false
});


function createLogger ( filename ) {
  var defaultMeta = {};

  if ( filename ) {
    defaultMeta.file = filename.replace(process.cwd(), '');
  }

  return {
    info : function (msg, meta) {
      logger.info(msg, _.extend({}, defaultMeta, meta));
    },
    warn : function (msg, meta) {
      logger.warn(msg, _.extend({}, defaultMeta, meta));
    },
    error : function (msg, meta) {
      logger.error(msg, _.extend({}, defaultMeta, meta));
    },
    transports : transports
  };
};

module.exports = createLogger;
