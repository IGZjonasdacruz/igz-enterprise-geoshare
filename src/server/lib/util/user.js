var logger = require('../util/logger')(__filename),
		async = require('async'),
		eventDao = require('../dao/event'),
		gPlusDao = require('../dao/gplus'),
		geo = require('../util/geo'),
		time = require('../util/time'),
		util = require('../util/util'),
		ObjectID = require('mongodb').ObjectID;


function userEvents(user, event, callback) {

	var search = {
		user: user._id
	};

	if (event) {
		search['_id'] = new ObjectID(event);
	}

	eventDao.get(search, function(err, userEvents) {
		callback(err, userEvents);
	});
}


function samePlace(place1, place2) {
	return place1.lat === place2.lat && place1.lgn === place2.lgn;
}

function reduceOverlappingTimeEvents(events) {
	for (var i = events.length - 1; i >= 1; i--) {
		for (var j = i - 1; j >= 0; j--) {
			if (events[i].user === events[j].user && samePlace(events[i].location, events[j].location)) {
				var interval = time.overlay([events[i].start.dateTime, events[i].end.dateTime], [events[j].start.dateTime, events[j].end.dateTime], 0);
				if (interval.overlay) {
					events[j].start.dateTime = Math.min(events[i].start.dateTime, events[j].start.dateTime);
					events[j].end.dateTime = Math.max(events[i].end.dateTime, events[j].end.dateTime);
					events[j].events = events[j].events.concat(events[i].events);
					events.splice(i, 1);
					break;
				}
			}
		}
	}
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
						formatted_address: userEvent.formatted_address,
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

function contactEvents(user, cbk) {

	logger.info('Searching contacts for the user ' + user.name + " ...");

	async.waterfall([
		function(callback) {
			userContacts(user, function(err, contacts) {
				callback(err, contacts);
			});
		},
		function(contacts, callback) {
			logger.info('Found  ' + contacts.length + ' contacts of the user ' + user.name);
			getContactEvents(contacts, function(err, contactEvents) {
				callback(err, contacts, contactEvents);
			});
		},
		function(contactIds, contactEvents, callback) {
			logger.info('Found  ' + contactEvents.length + ' contacts events for the user ' + user.name);

			contactsInfo(contactIds, function(err, contacts) {
				contactEvents.forEach(function(contactEvent) {
					for (var i = 0; i < contacts.length; i++) {
						var contact = contacts[i];
						if (contact._id === contactEvent.user) {
							for (var key in contact) {
								contactEvent[key] = contact[key];
							}
							break;
						}
					}

				});
				callback(err, contactEvents);
			});
		}
	], function(err, contactEvents) {
		if (err) {
			return cbk(err);
		}

		cbk(null, contactEvents);
	});
}


function futureNearestContacts(user, event, cbk) {

	logger.info('Searching future contacts for the user ' + user.name + " ...");

	async.waterfall([
		function(callback) {
			userEvents(user, event, callback);
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
			logger.info('There are ' + contactEvents.length + ' contact events for the user ' + user.name + ' after the reduction');

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
								nearEvent[key] = contact[key];
							}
							break;
						}
					}

				});
				callback(err, userEvents, contacts, contactEvents, nearEvents);
			});
		}
	], function(err, userEvents, contacts, contactEvents, nearEvents) {
		if (err) {
			return cbk(err);
		}

		cbk(null, nearEvents);
	});
}

module.exports = {
	futureNearestContacts: futureNearestContacts,
	reduceOverlappingTimeEvents: reduceOverlappingTimeEvents,
	userEvents: function(user, callback) {
		userEvents(user, undefined, callback);
	},
	contactEvents: contactEvents
};