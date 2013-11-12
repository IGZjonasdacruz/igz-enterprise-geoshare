var logger = require('../util/logger')(__filename),
		async = require('async'),
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
	gPlusDao.get(user._id, function(err, contact) {
		callback(err, contact.contacts);
	});
}

function contactsInfo(contacts, callback) {
	gPlusDao.find({
		_id: {
			$in: contacts
		}
	},
	{
		name: 1,
		profile: 1,
		email: 1,
		locale: 1,
		photo: 1
	}
	, callback);
}

function getContactEvents(contacts, callback) {
	contacts = contacts || [];
	eventDao.get({
		user: {
			$in: contacts
		}
	}, function(err, contactEvents) {
		callback(err, contactEvents);
	});
}

function filterFutureEvents(userEvents, contactEvents, callback) {

	var nearUsers = [];
	try {
		userEvents.forEach(function(userEvent) {
			contactEvents.forEach(function(contactEvent) {
				var distance = geo.distance(userEvent.location.coordinates, contactEvent.location.coordinates);
				var interval = time.overlay([userEvent.start, userEvent.end], [contactEvent.start, contactEvent.end]);

				if (interval.overlay && distance < 30000) {
					var nearUser = {
						id: contactEvent.user,
						location: contactEvent.location,
						location_me: userEvent.location,
						distance: distance,
						overlappingTime: interval,
						time: {
							start: contactEvent.start,
							end: contactEvent.end
						},
						time_me: {
							start: userEvent.start,
							end: userEvent.end
						}
					};

					nearUsers.push(nearUser);
				}

			});
		});
		callback(null, nearUsers);
	} catch (e) {
		callback(e, null);
	}

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
			logger.info('Found  ' + contacts.length + ' contacts of the user ' + user.name);
			getContactEvents(contacts, function(err, contactEvents) {
				callback(err, userEvents, contacts, contactEvents);
			});
		},
		function(userEvents, contacts, contactEvents, callback) {
			logger.info('Found  ' + contactEvents.length + ' contact events for the user ' + user.name);

			filterFutureEvents(userEvents, contactEvents, function(err, nearEvents) {
				callback(err, userEvents, contacts, contactEvents, nearEvents);
			});
		},
		function(userEvents, contacts, contactEvents, nearEvents, callback) {
			logger.info('Found  ' + nearEvents.length + ' near future events for the user ' + user.name);

			var nearContacts = [];

			nearEvents.forEach(function(nearEvent) {
				nearContacts.push(nearEvent.id);
			});

			contactsInfo(nearContacts, function(err, contacts) {
				nearEvents.forEach(function(nearEvent) {
					for (var i = 0; i < contacts.length; i++) {
						var contact = contacts[i];
						if (contact._id === nearEvent.id) {
							for (var key in contact) {
								if (key !== '_id') {
									nearEvent[key] = contact[key];
								}
							}
							break;
						}
					}
					callback(err, userEvents, contacts, contactEvents, nearEvents);
				});
			});
		}
	], function(err, userEvents, contacts, contactEvents, nearEvents) {
		if (err) {
			return callback(err);
		}

		callback(null, nearEvents);
	});
}

module.exports = {
	futureNearestContacts: futureNearestContacts
};