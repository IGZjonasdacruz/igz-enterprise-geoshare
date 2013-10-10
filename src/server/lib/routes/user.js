var logger = require('../util/logger')(__filename),
    ensureAuth = require('../middleware/sec'),
    userManager = require('../manager/user'),
    sanitize = require('validator').sanitize;

function addRoutes (app) {

  app.post('/user/me/location', ensureAuth, myLocation);
  app.get('/user/contacts/location', ensureAuth, myNearestContacts);

  logger.info('User routes added');

}

function myLocation (req, res) {
  var lat = sanitize(req.body.latitude).toFloat();
  var lon = sanitize(req.body.longitude).toFloat();

  userManager.saveLocation(req.user, lat, lon, function(err, user) {

    if ( err ) {
      logger.error(err);
      return res.send(500);
    }

    res.json(user);
  });
}

function myNearestContacts (req, res) {
  userManager.myNearestContacts(req.user, function(err, result) {

    if ( err ) {
      logger.error(err);
      return res.send(500);
    }

    res.send(200, result);
  });
}

module = module.exports = addRoutes;
