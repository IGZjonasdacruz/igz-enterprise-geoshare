var logger = require('../util/logger')(__filename),
		async = require('async')
eventDao = require('../dao/event'),
		gPlusDao = require('../dao/gplus'),
		geo = require('../util/geo'),
		time = require('../util/time'),
		util = require('../util/util');


function userEvents(user, callback) {
	eventDao.get({
		user: user._id
	}, function(err, userEvents) {
		callback(err, userEvents);
	});
}


function userContacts(user, callback) {
	gPlusDao.get(user._id, function(err, contacts) {
		callback(err, contacts.contacts);
	});
}

function contactEvents(contacts, callback) {
	contacts = contacts || [];
	eventDao.get({
		user: {
			$in: contacts
		}
	}, function(err, contactEvents) {
		callback(err, contactEvents);
	});
}

function filterFurureEvents(userEvents, contactEvents) {

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
	return nearUsers;
}


function futureNearestContacts(user, callback) {

	logger.info('Searching future contacts for the user ' + user.name + " ...");

	async.waterfall([
		function(callback) {
			userEvents(user, callback);
		},
		function(userEvents, callback) {
			logger.info('Found  ' + userEvents.length + ' future events for the user ' + user.name);
			userContacts(user, function(err, contacts) {
				callback(err, userEvents, contacts);
			});
		},
		function(userEvents, contacts, callback) {
			logger.info('Found  ' + contactEvents.length + ' future events of the contacts of the user ' + user.name);
			contactEvents(contacts, function(err, contactEvents) {
				callback(err, userEvents, contacts, contactEvents);
			});
		}
	], function(err, userEvents, contacts, contactEvents) {
		logger.info('Found  ' + contacts.length + ' contacts for the user ' + user.name);
		
		if (err) {
			return callback(err);
		}

		var nearUsers = filterFurureEvents(userEvents, contactEvents);

		logger.info('Found  ' + nearUsers.length + ' near future contacts for the user ' + user.name);

		callback(null, {
			nearUsers: nearUsers,
			debug: {
				userEvents: userEvents,
				contacts: contacts,
				contactEvents: contactEvents
			}
		});
	});
}

module.exports = {
	futureNearestContacts: futureNearestContacts
};