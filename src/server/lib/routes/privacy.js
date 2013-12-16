var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		privacyDao = require('../dao/privacy'),
		sanitize = require('validator').sanitize,
		check = require('validator').check

function addRoutes(app) {

	app.put('/privacy', ensureAuth, updatePrivacy);

	logger.info('Privacy routes added');
}

function updatePrivacy(req, res) {
	var update = {
		$set: {privacy: req.body.privacy || 'all'}
	};

	privacyDao.update(req.user._id, update, function(err, data) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status: 200, privacy: data.privacy});
	});
}

module = module.exports = addRoutes;
