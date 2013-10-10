var express = require('express'),
    passport = require('passport'),
    auth = require('./routes/auth'),
    geo = require('./routes/user'),
    logger = require('./util/logger')(__filename),
    fs = require('fs');

//
// Configure app
//
var app = express();
app.use(express.static(__dirname + '/../public'));
app.use(express.bodyParser());
app.use(passport.initialize());
app.use(app.router);

/*
app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});
app.configure('production', function(){
  app.use(express.errorHandler());
});
*/

//
// Routes
//
var basePath = __dirname + '/routes/';
fs.readdirSync(basePath).forEach(function(filename) {
  require(basePath + filename)(app);
});

//
// Init app
//
var port = process.env.PORT;
if ( !port ) {
  console.error('***ERROR*** you have to define the environment variable PORT "PORT=3000 node app"');
  return process.exit(1);
}

app.listen(port, function () {
  logger.info('Application listening on http://localhost:' + port);
});
