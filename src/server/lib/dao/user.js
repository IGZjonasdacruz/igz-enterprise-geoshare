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

function userIndexes(callback) {
	async.parallel([statusIndex, locationIndex], function() {

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
		db.collection('user').save(user, { safe : true }, callback);
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
			if (err){
				return callback(err, null);
			}

			logger.info('Found id="' + id + '" in "user" collection.');
			callback(null, doc);
		});

	});
};

User.prototype.nearestContacts = function(user, callback) {
	try {
		check(user._id).notNull();
		check(user.domain).notEmpty();
		check(user.location.coordinates[0], 'user.location.coordinates[0]').isFloat();
		check(user.location.coordinates[1], 'user.location.coordinates[1]').isFloat();
	} catch (e) {
		return callback(e, null);
	}

	mongodb(function(err, db) {

		var search = {
			_id: { $ne: user._id },
			domain: user.domain,
			location: {
				$near: { $geometry: user.location },
				$maxDistance: 1000000
			},
			shareMode: { $ne: 'none' }
		};

		db.collection('user').find(search, { limit: 20 }).toArray(function(err, contacts) {
			if (err) {
				return callback(err, null);
			}

			logger.info('Retrieved ' + contacts.length + ' nearest contacts of ' + user._id + ' user');
			callback(null, {me: user, contacts: contacts});
		});
	});
};

User.prototype.updateGcmId = function(user, gcmId, callback) {

	try {
		check(gcmId).notEmpty();
	} catch (err) {
		return callback(err, null);
	}

	this.update(user, { $set: { gcmId: gcmId } }, callback);
}

User.prototype.updateShareMode = function(user, shareMode, callback) {
	this.update(user, { $set: { shareMode: shareMode || 'all' } }, callback);
};

User.prototype.update = function(user, update, callback) {

	try {
		check(user._id).notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		var query = {_id: user._id};
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
