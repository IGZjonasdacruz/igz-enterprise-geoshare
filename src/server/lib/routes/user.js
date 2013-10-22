var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		userManager = require('../manager/user'),
		sanitize = require('validator').sanitize,
		check = require('validator').check,
		request = require('request');

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
	var regid = sanitize(req.body.regid).xss();
	
	req.user.regid = regid;

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

		res.send(200, result);
	});
}

function logout (req, res) {
	
	//
	//TODO Remove|Expire DB user
	//

	request({
		url : 'https://accounts.google.com/o/oauth2/revoke?token=' + req.user.accessToken,
		method: "GET",
	}, function (err, response, body) {
		res.send(200, {status: 200});
	});
}

module = module.exports = addRoutes;
