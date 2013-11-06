var logger = require('../util/logger')(__filename),
		check = require('validator').check,
		util = require('util'),
		mongodb = require('../util/mongodb'),
		async = require('async');

//
// Event indexes
//

function statusIndex(next) {
	mongodb(function(err, db) {
		if (err) {
			throw err;
		}

		db.collection('event').ensureIndex({
			"status": 1
		}, {
			w: 1,
			expireAfterSeconds: 0
		},
		function(err, result) {
			if (err) {
				throw err;
			}

			next();
		}
		);
	});

}

function locationIndex(next) {
	mongodb(function(err, db) {
		if (err) {
			throw err;
		}

		db.collection('event').ensureIndex({
			"location": "2dsphere"
		},
		function(err, result) {
			if (err) {
				throw err;
			}

			next();
		}
		);
	});
}

function userIndex(next) {
	mongodb(function(err, db) {
		if (err) {
			throw err;
		}

		db.collection('event').ensureIndex({
			"user": 1
		}, {
			w: 1
		},
		function(err, result) {
			if (err) {
				throw err;
			}

			next();
		}
		);
	});
}

function eventIndexes(callback) {
	async.parallel([userIndex, statusIndex, locationIndex], function(err) {
		if (err) {
			return logger.error(err);
		}
		
		logger.info("All event indexes have been ensured");

		if (callback) {
			callback();
		}
	});
}

eventIndexes();

function Event() {
}

Event.prototype.save = function(user, events, callback) {
	try {
		check(user._id, 'user._id').notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		async.each(events, function(event, callback) {
			
			
			db.collection('event').save({
				_id: event.id,
				user: user._id,
				summary: event.summary,
				start: event.start && event.start.dateTime,
				end: event.end && event.end.dateTime,
				address: event.address,
				formatted_address: event.formatted_address,
				calendar: event.idCalendar,
				location: {
					type: 'Point',
					coordinates: [
						event.location.lng,
						event.location.lat
					]
				},
				status: new Date(event.end.dateTime)
			},
			{safe: true}, callback);
		}, function(err) {
			if (err) {
				callback(err);
			} else if (callback) {
				callback();
			}
		});
	});
};

Event.prototype.reset = function(callback) {
	mongodb(function(err, db) {
		if (err)
			return callback(err, null);

		db.dropCollection('event', function(err, result) {
			if (err)
				return callback(err, null);

			eventIndexes(callback);

		});
	});
};

Event.prototype.remove = function(userId, callback) {
	try {
		check(userId).notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		db.collection('event').remove({user: userId}, function(err, result) {
			if (err) {
				return callback(err, null);
			}

			callback(null, result);
		});
	});
};

module.exports = new Event(); // This module returns the same event instance (Singleton)