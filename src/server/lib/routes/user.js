var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		userDao = require('../dao/user'),
		eventDao = require('../dao/event'),
		gPlusDao = require('../dao/gplus'),
		sanitize = require('validator').sanitize,
		check = require('validator').check,
		calendar = require('../util/calendar'),
		geo = require('../util/geo'),
		time = require('../util/time'),
		async = require('async');

function addRoutes(app) {

	app.put('/user/me/shareMode', ensureAuth, updateShareMode);
	app.put('/user/me/gcm-id', ensureAuth, changeGcmId);
	app.get('/user/me/upcomingEvents', ensureAuth, upcomingEvents);
	app.get('/user/me/futureNearestContacts', ensureAuth, futureNearestContacts);

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

function upcomingEvents(req, res) {
	calendar.upcomingEvents(req.user, function(err, json) {
		if (err) {
			logger.error(err);
			return res.send(500);
		}

		res.json({result: json});
	});
}

function futureNearestContacts(req, res) {

	async.waterfall([
		function(callback) {
			eventDao.get({
				user: req.user._id
			}, function(err, userEvents) {
				callback(err, userEvents);
			});
		},
		function(userEvents, callback) {
			gPlusDao.get(req.user._id, function(err, contacts) {
				callback(err, userEvents, contacts.contacts);
			});
		},
		function(userEvents, contacts, callback) {
			contacts = contacts || [];
			eventDao.get({
				user: {
					$in: contacts
				}
			}, function(err, contactEvents) {
				callback(err, userEvents, contacts, contactEvents);
			});
		}
	], function(err, userEvents, contacts, contactEvents) {
		if (err) {
			logger.error(err);
			return res.send(500);
		}

		var nearUsers = [];

		userEvents.forEach(function(userEvent) {
			contactEvents.forEach(function(contactEvent) {
				var distance = geo.distance(userEvent.location.coordinates, contactEvent.location.coordinates);
				var interval = time.overlay([userEvent.start, userEvent.end], [contactEvent.start, contactEvent.end]);

				if (interval.duration) {
					var nearUser = {
						me: userEvent.user,
						contact: contactEvent.user,
						me_location: userEvent.location,
						contact_location: contactEvent.location,
						distance: distance,
						interval: interval,
						me_event: {
							start: userEvent.start,
							end: userEvent.end
						},
						contact_event: {
							start: contactEvent.start,
							end: contactEvent.end
						}
					};

					nearUsers.push(nearUser);
				}

			});
		});


		res.json({
			nearUsers: nearUsers,
			debug: {
				userEvents: userEvents,
				contacts: contacts,
				contactEvents: contactEvents
			}
		});
	});
}

module = module.exports = addRoutes;
