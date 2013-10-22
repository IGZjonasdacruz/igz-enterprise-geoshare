var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		userManager = require('../manager/user'),
		sanitize = require('validator').sanitize,
		check = require('validator').check;

function addRoutes (app) {

	app.post('/user/me/location', ensureAuth, myLocation);
	app.put('/user/me/gcm-id', ensureAuth, changeGcmId);
	app.get('/user/contacts/location', ensureAuth, myNearestContacts);
	app.get('/user/logout', ensureAuth, logout);

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

function changeGcmId (req, res) {
	var gcmId = req.body.gcmId;

	userManager.changeGcmId(req.user, gcmId, function(err, result) {

		if ( err ) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status:200});
	});
}

function logout (req, res) {
	userManager.logout(req.user, function (err) {
		if ( err ) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status: 200});
	});	
}

module = module.exports = addRoutes;
