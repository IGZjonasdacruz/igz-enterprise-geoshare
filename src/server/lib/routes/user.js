var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		userDao = require('../dao/user'),
		sanitize = require('validator').sanitize,
		check = require('validator').check;

function addRoutes (app) {

	app.put('/user/me/shareMode', ensureAuth, updateShareMode);
	app.put('/user/me/gcm-id', ensureAuth, changeGcmId);

	logger.info('User routes added');
}

function updateShareMode (req, res) {
	var update = {
		$set: { shareMode: req.body.shareMode || 'all' }
	};

	userDao.update(req.user._id, update, function(err, user) {

		if ( err ) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status:200});
	});
}

function changeGcmId (req, res) {
	var gcmId = req.body.gcmId;

	try {
		check(gcmId).notEmpty();
	} catch (err) {
		return callback(err, null);
	}

	var update = {
		$set: { gcmId: gcmId }
	};

	userDao.update(req.user._id, update, function(err, result) {

		if ( err ) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status:200});
	});
}

module = module.exports = addRoutes;
