var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		userDao = require('../dao/user'),
		sanitize = require('validator').sanitize,
		check = require('validator').check,
		calendar = require('../util/calendar');

function addRoutes(app) {

	app.put('/user/me/shareMode', ensureAuth, updateShareMode);
	app.put('/user/me/gcm-id', ensureAuth, changeGcmId);
	app.get('/user/me/calendars', ensureAuth, calendars);
	app.get('/user/me/upcomingEvents', ensureAuth, upcomingEvents);

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

function calendars(req, res) {
	calendar.calendars(req.user.accessToken, function(err, json) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}

		res.json({result: json});
	});

}

function upcomingEvents(req, res) {
	if (req.query['calendarId']) {
		calendar.upcomingEventsFromCalendar(req.user.accessToken, req.query['calendarId'], function(err, json) {

			if (err) {
				logger.error(err);
				return res.send(500);
			}

			res.json({result: json});
		});
	} else {
		calendar.allUpcomingEvents(req.user.accessToken, function(err, json) {

			if (err) {
				logger.error(err);
				return res.send(500);
			}

			res.json({result: json});
		});
	}

}

module = module.exports = addRoutes;
