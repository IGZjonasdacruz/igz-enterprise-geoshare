var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		privacyDao = require('../dao/privacy'),
		calendar = require('../util/calendar'),
		sanitize = require('validator').sanitize,
		check = require('validator').check

function addRoutes(app) {

	app.put('/privacy', ensureAuth, updatePrivacy);
	app.get('/privacy/calendars', ensureAuth, getCalendars);

	logger.info('Privacy routes added');
}

function updatePrivacy(req, res) {
	var update = {
		$set: req.body.privacy
	};

	privacyDao.update(req.user._id, update, function(err, data) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}

		res.json({status: 200, privacy: data});
	});
}

function getCalendars(req, res) {
	privacyDao.get(req.user._id, function(err, data) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}
		
		var privacyCalendars = data.calendars;

		calendar.calendars(req.user, function(err, calendars) {

			if (err) {
				logger.error(err);
				return res.send(500);
			}
			
			if (privacyCalendars) {
				privacyCalendars.forEach(function(privacyCalendar) {
					if (calendars) {
						calendars.forEach(function (calendar) {
							calendar.privacy = privacyCalendar === calendar.id;
						});
					}
				});
			}

			res.json({status: 200, calendars: calendars});
		});
	});
}

module = module.exports = addRoutes;
