var logger = require('../util/logger')(__filename),
    ensureAuth = require('../middleware/sec'),
    userWorker = require('../worker/user');

function addRoutes (app) {

  app.post('/user/me/location', ensureAuth, myLocation);

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

  userWorker.saveLocation(req.user, lat, lon, function(err) {

    if ( err ) {
      logger.error(err);
      res.send(500);
      return;
    }

    res.send(200);
  });
}


module = module.exports = addRoutes;
