var express = require('express'),
    auth = require('./auth'),
    geo = require('./geo'),
    logger = require('./logger')('index');

var app = express();

app.use(express.static(__dirname + '/../public'));
app.use(express.cookieParser());
app.use(express.bodyParser());
app.use(express.session({ secret: 'IGZ Google Contacts' }));

auth.init(app);

app.use(app.router);

app.get('/',
    auth.ensureLogin,
    function (req, res) {
      res.send('DisplayName: ' + req.user.name + '<br>' + 'accessToken: ' + req.user.accessToken);
    });
geo.init(app);

app.listen(3000, function () {
  logger.info('Application listening on http://localhost:3000')
});
