var logger = require('../util/logger')(__filename),
		check = require('validator').check,
		util = require('util'),
		mongodb = require('../util/mongodb'),
		async = require('async');


//
// User indexes
//

function statusIndex(next) {
	mongodb(function(err, db) {
		if (err) {
			throw err;
		}

		db.collection('user').ensureIndex({
			"status": 1
		}, {
			w: 1,
			expireAfterSeconds: 3600
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

		db.collection('user').ensureIndex({
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

function nearestUsersIndex(next) {
	mongodb(function(err, db) {
		if (err) {
			throw err;
		}

		db.collection('user').ensureIndex({
			"location": "2dsphere", "domain": 1
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

function userIndexes(callback) {
	async.parallel([statusIndex, locationIndex, nearestUsersIndex], function(err) {

		if (err) {
			return callback(err);
		}

		logger.info("All user indexes have been ensured");

		if (callback) {
			callback();
		}
	});
}

userIndexes();


function User() {
}

User.prototype.save = function(user, callback) {
	try {
		check(user._id, 'user._id').notNull();
		check(user.email, 'user.email').isEmail();
		check(user.domain, 'user.domain').notEmpty();
		check(user.location.coordinates[0], 'user.location.coordinates[0]').isFloat();
		check(user.location.coordinates[1], 'user.location.coordinates[1]').isFloat();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		user.status = new Date();
		db.collection('user').save(user, {safe: true}, callback);
	});
};

User.prototype.reset = function(callback) {
	mongodb(function(err, db) {
		if (err)
			return callback(err, null);

		db.dropCollection('user', function(err, result) {
			if (err)
				return callback(err, null);

			userIndexes(callback);

		});
	});
};

User.prototype.get = function(id, callback) {
	try {
		check(id).notNull();
	} catch (err) {
		return callback(err);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		db.collection('user').findOne({
			_id: id
		}, function(err, doc) {
			if (err) {
				return callback(err, null);
			}

			logger.info('Found id="' + id + '" in "user" collection.');
			callback(null, doc);
		});

	});
};

User.prototype.nearestContacts = function(user, contacts, callback) {
	try {
		check(user._id).notNull();
		check(user.location.coordinates[0], 'user.location.coordinates[0]').isFloat();
		check(user.location.coordinates[1], 'user.location.coordinates[1]').isFloat();
	} catch (e) {
		return callback(e, null);
	}

	mongodb(function(err, db) {

		var search = {
			location: {
				$near: {$geometry: user.location},
				$maxDistance: 1000000
			},
			_id: {$in: contacts}
		};

		db.collection('user').find(search, {limit: 20}).toArray(callback);
	});
};

User.prototype.update = function(id, update, callback) {

	try {
		check(id).notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		var query = {_id: id};
		var sort = null;
		var options = {
			new : true, // set to true if you want to return the modified object rather than the original
			upsert: true // Atomically inserts the document if no documents matched.
		};

		db.collection('user').findAndModify(query, sort, update, options, function(err, userSaved) {
			if (err) {
				return callback(err, null);
			}

			logger.info('User "' + userSaved._id + '" was updated', update);
			callback(null, userSaved);
		});
	});
}

User.prototype.remove = function(userId, callback) {
	try {
		check(userId).notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		db.collection('user').remove({_id: userId}, function(err, result) {
			if (err) {
				return callback(err, null);
			}

			callback(null, result);
		});
	});
};

module.exports = new User(); // This module returns the same user instance (Singleton)
