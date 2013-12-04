var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		userDao = require('../dao/user'),
		sanitize = require('validator').sanitize,
		check = require('validator').check,
		calendar = require('../util/calendar'),
		user = require('../util/user');

function addRoutes(app) {

	app.put('/user/me/shareMode', ensureAuth, updateShareMode);
	app.put('/user/me/gcm-id', ensureAuth, changeGcmId);
	app.put('/user/me/futureNearestContacts', ensureAuth, futureNearestContacts);
	app.get('/user/me/events', ensureAuth, userEvents);
	app.get('/user/me/contactEvents', ensureAuth, contactEvents);

	logger.info('User routes added');
}

function updateShareMode(req, res) {
	var update = {
		$set: {shareMode: req.body.shareMode || 'all'}
	};

	userDao.update(req.user._id, update, function(err, user) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status: 200});
	});
}

function changeGcmId(req, res) {
	var gcmId = req.body.gcmId;

	try {
		check(gcmId).notEmpty();
	} catch (err) {
		return callback(err, null);
	}

	var update = {
		$set: {gcmId: gcmId}
	};

	userDao.update(req.user._id, update, function(err, result) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status: 200});
	});
}

function calendars(req, res) {
	calendar.calendars(req.user.accessToken, function(err, json) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}

		res.json({result: json});
	});

}

function futureNearestContacts(req, res) {
	user.futureNearestContacts(req.user, req.body.event, function(err, result) {
		if (err) {
			logger.error(err);
			return res.send(500);
		}
		res.json(result);
	});

}

function userEvents(req, res) {
	user.userEvents(req.user, function(err, result) {
		if (err) {
			logger.error(err);
			return res.send(500);
		}
		res.json(result);
	});

}

function contactEvents(req, res) {
	user.contactEvents(req.user, function(err, result) {
		if (err) {
			logger.error(err);
			return res.send(500);
		}
		res.json(result);
	});

}

module = module.exports = addRoutes;
