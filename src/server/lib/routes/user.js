var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		userManager = require('../manager/user'),
		sanitize = require('validator').sanitize,
		check = require('validator').check;

function addRoutes (app) {

	app.put('/user/me/shareMode', ensureAuth, updateShareMode);
	app.put('/user/me/gcm-id', ensureAuth, changeGcmId);

	logger.info('User routes added');
}

function updateShareMode (req, res) {
	var shareMode = req.body.shareMode;

	userManager.updateShareMode(req.user, shareMode, function(err, user) {

		if ( err ) {
			logger.error(err);
			return res.send(500);
		}

		res.json(user);
	});
}

function changeGcmId (req, res) {
	var gcmId = req.body.gcmId;

	userManager.updateGcmId(req.user, gcmId, function(err, result) {

		if ( err ) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status:200});
	});
}

module = module.exports = addRoutes;
