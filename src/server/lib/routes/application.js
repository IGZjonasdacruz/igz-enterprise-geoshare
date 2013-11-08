var logger = require('../util/logger')(__filename),
		ensureAuth = require('../middleware/sec'),
		notification = require('../util/notification'),
		geoUtil = require('../util/geo'),
		gplus = require('../util/gplus'),
		calendar = require('../util/calendar'),
		userDao = require('../dao/user'),
		eventDao = require('../dao/event'),
		gPlusDao = require('../dao/gplus'),
		sanitize = require('validator').sanitize,
		check = require('validator').check,
		request = require('request');

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

	//This may take a while. We can end the request without having to wait to finish this operation.
	gplus.people(user.accessToken, function(err, contacts) {
		if (err) {
			return logger.error(err);
		}

		gPlusDao.save(user, contacts.items ? contacts.items : [], function(err, result) {
			if (err) {
				return logger.error(err);
			}
			logger.info( (contacts.items ? contacts.items.length : 0) + ' user contacts has been saved');
		});

	});

	//This may take a while. We can end the request without having to wait to finish this operation.
	calendar.upcomingEvents(user, function(err, events) {
		if (err) {
			return logger.error(err);
		}
		if (events && events.length) {
			for (var i = events.length - 1; i >= 0; i--) {
				var event = events[i];
				if (!event.location || event.location.lng === undefined || event.location.lat === undefined ||
						!event.start || event.start.dateTime === undefined ||
						!event.end || event.end.dateTime === undefined) {
					events.splice(i, 1);
					logger.warn('Bad format in event ' + JSON.stringify(event));
				}
			}

			eventDao.save(user, events, function(err, result) {
				if (err) {
					return logger.error(err);
				}
				logger.info(events.length + ' events of ' + user.name + ' user has been saved');
			});
		} else {
			logger.info('No valid events found for user ' + user.name);
		}
	}
	);
	userDao.save(user, function(err, result) {

		if (err) {
			logger.error(err);
			return res.send(500);
		}

		userDao.nearestContacts(user, function(err, contacts) {
			if (err) {
				logger.error(err);
				return res.send(500);
			}

			contacts.forEach(function(contact) {
				applyShareFilter(user, contact);
			});

			notification.sendToNearestContacts(user, contacts);
			res.json({user: user, nearestContacts: contacts});
		})

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

function applyShareFilter(user, contact) {
	var shareMode = contact.shareMode;
	if (shareMode) {
		Object.keys(contact).forEach(function(key) {
			if (key !== '_id' && shareMode.indexOf(key) === -1) {
				delete contact[key];
			}
		});
	}

	if (!shareMode || shareMode.indexOf('distance') !== -1) {
		contact.distance = geoUtil.distance(user.location.coordinates, contact.location.coordinates);
	}
}

module = module.exports = addRoutes;
