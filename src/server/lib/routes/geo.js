var userDao = require('../dao/user'),
    logger = require('../util/logger')(__filename),
    ensureAuth = require('../middleware/sec');

function addRoutes (app) {

  app.get('/my_location', ensureAuth, myLocation);

  logger.info('Geo routes added');

}

function myLocation (req, res) {

  // Check parameters
  var lat = parseFloat(req.body.latitude);
  var lon = parseFloat(req.body.longitude);

  if ( !lat || !lon ) {
    res.send(400, 'latitude and longitude parameters are required');
    return;
  }

  // Save
  var user = req.user;
  userDao.saveLocation(user.id, user.email, [lat, lon]
  , function(err, result) {

    if ( err ) {
      logger.error(err);
      res.send(500);
      return;
    }

    res.send(200);
  });
}


module = module.exports = addRoutes;
