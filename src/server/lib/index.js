var express = require('express'),
		passport = require('passport'),
		auth = require('./routes/auth'),
		geo = require('./routes/user'),
		logger = require('./util/logger')(__filename),
		fs = require('fs'),
		expressWinston = require('express-winston'),
		config = require('./util/config');


//
// Configure app
//
var app = express();
app.use(express.bodyParser());
app.use(passport.initialize());

// express-winston logger makes sense BEFORE the router.
app.use(expressWinston.logger({transports: logger.transports}));

app.use(app.router);

app.use(express.static(__dirname + '/../public'));

// express-winston errorLogger makes sense AFTER the router.
app.use(expressWinston.errorLogger({transports: logger.transports}));


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
