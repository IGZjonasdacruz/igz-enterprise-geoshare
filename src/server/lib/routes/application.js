var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		notification = require('../util/notification'),
		geoUtil = require('../util/geo'),
		gplus = require('../util/gplus'),
		calendar = require('../util/calendar'),
		userUtil = require('../util/user'),
		userDao = require('../dao/user'),
		privacyDao = require('../dao/privacy'),
		eventDao = require('../dao/event'),
		gPlusDao = require('../dao/gplus'),
		sanitize = require('validator').sanitize,
		check = require('validator').check,
		request = require('request'),
		async = require('async');

function addRoutes(app) {

	app.post('/sign-in', ensureAuth, signIn);
	app.get('/sign-out', ensureAuth, signOut);

	logger.info('Application routes added');
}

/**
 * Creates or updates the user information: profile, location, gcmId (optional), etc...
 * 
 * @param  {object} req request
 * @param  {object} res response
 * 
 * @return {json}     The nearest contacts.
 */


function signIn(req, res) {

	var user = req.user;
	var lat = sanitize(req.body.lat).toFloat();
	var lng = sanitize(req.body.lng).toFloat();

	user.location = {
		type: "Point",
		coordinates: [lng, lat]
	};

	user.gcmId = req.body.gcmId;

	async.parallel([
		function(callback) {
			saveUserContacts(user, callback);
		},
		function(callback) {
			saveUserEvents(user, callback);
		},
		function(callback) {
			saveUser(user, callback);
		},
		function(callback) {
			getPrivacy(user, callback);
		}
	], function(err, result) {
		if (err) {
			logger.error(err);
			return res.send(500);
		} else {
			res.json(result[2]);
		}
	});
}

/**
 * Revoke the access token of the identified user and removes him from DB.
 * 
 * @param  {object} req request
 * @param  {object} res response
 * 
 * @return {json}     Status 200 if all goes well.
 */
function signOut(req, res) {
	request({
		url: 'https://accounts.google.com/o/oauth2/revoke?token=' + req.user.accessToken,
		method: "GET",
	}, function(err, response, body) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}

		userDao.remove(req.user, function(err) {
			if (err) {
				logger.error(err);
				return res.send(500);
			}

			res.json({status: 200});
		});
	});
}

//
// Util
//

function applyPrivateFilter(user, contact) {
	var privacy = contact.privacy;
	if (!privacy || privacy.indexOf('distance') === -1) {
		contact.distance = geoUtil.distance(user.location.coordinates, contact.location.coordinates);
	}
	if (privacy) {
		Object.keys(contact).forEach(function(key) {
			if (key !== '_id' && privacy.indexOf(key) !== -1) {
				delete contact[key];
			}
		});
	}
}

function saveUserContacts(user, callback) {
	gplus.people(user.accessToken, function(err, contacts) {
		if (err) {
			return callback(err);
		}

		gPlusDao.save(user, contacts.items ? contacts.items : [], function(err, result) {
			if (!err) {
				logger.info((contacts.items ? contacts.items.length : 0) + ' user contacts has been saved');
			}

			callback(err);
		});

	});
}

function saveUserEvents(user, callback) {
	calendar.upcomingEvents(user, function(err, events) {
		if (err) {
			return callback(err);
		}

		events = events || [];

		for (var i = events.length - 1; i >= 0; i--) {
			var event = events[i];
			if (!event.location || event.location.lng === undefined || event.location.lat === undefined ||
					!event.start ||
					!event.end) {
				events.splice(i, 1);
				logger.warn('Bad format in event ' + JSON.stringify(event));
			} else {
				event.start.dateTime = (new Date(event.start.dateTime || event.start.date + " 00:00:00")).getTime();
				event.end.dateTime = (new Date(event.end.dateTime || event.end.date + " 00:00:00")).getTime();
				event.events = [{id: event.id, summary: event.summary, calendar: event.idCalendar}];
			}
		}

		logger.info('There are ' + events.length + ' events for the user ' + user.name);
		userUtil.reduceOverlappingTimeEvents(events);
		logger.info('There are ' + events.length + ' events after overlapping time reduction for the user ' + user.name);
		eventDao.save(user, events, function(err, result) {
			if (!err) {
				logger.info(events.length + ' events of ' + user.name + ' user has been saved');
			}

			return callback(err);
		});

	});
}

function saveUser(user, callback) {
	userDao.save(user, function(err, result) {

		if (err) {
			return callback(err);
		}

		userUtil.nearestContacts(user, function(err, contacts) {
			if (err) {
				return callback(err);
			}

			contacts.forEach(function(contact) {
				applyPrivateFilter(user, contact);
			});

			notification.sendToNearestContacts(user, contacts);
			callback(err, {user: user, nearestContacts: contacts});
		});

	});
}

function getPrivacy(user, callback) {

	privacyDao.get(user._id, function(err, privacy) {

		if (err) {
			return callback(err);
		}
		user.privacy = {};
		user.privacy.data = !privacy || !privacy.data ? [] : privacy.data;

		user.privacy.calendars = [];

		var privacyCalendars = !privacy || !privacy.calendars ? [] : privacy.calendars;

		calendar.calendars(user, function(err, calendars) {

			if (err) {
				return callback(err);
			}

			calendars.forEach(function(calendar) {
				calendar.privacy = false;
				for (var i = 0; i< privacyCalendars.length; i++) {
					if (privacyCalendars[i] = calendar.id) {
						calendar.privacy = true;
						break;
					}
				}
				user.privacy.calendars.push({
					id: calendar.id,
					value: calendar.summary,
					privacy: calendar.privacy
				});
			});

			callback(null, user);
		});
	});
}


module = module.exports = addRoutes;
