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
		if (err)
			return callback(err, null);

		db.collection('user').findOne({
			_id: id
		}, function(err, doc) {
			if (err)
				return callback(err, null);

			logger.info('Found id="' + id + '" in "user" collection.');
			callback(null, doc);
		});

	});
};

User.prototype.saveLocation = function(user, lat, lng, regid, callback) {
	try {
		check(user._id, 'user._id').notNull();
		check(user.email, 'user.email').isEmail();
		check(user.domain, 'user.domain').notEmpty();
		check(lat, 'lat').isFloat();
		check(lng, 'lng').isFloat();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		var query = {_id: user._id};

		var sort = null;

		var update = {
			$set: {
				email: user.email,
				domain: user.domain,
				photo: user.photo,
				name: user.name,
				location: {
					type: "Point",
					coordinates: [lng, lat]
				},
				status: new Date()
			}
		};
		
		if (regid) {
			update.$set.regid = regid;
		}

		var options = {
			new : true, // set to true if you want to return the modified object rather than the original
			upsert: true // Atomically inserts the document if no documents matched.
		};

		db.collection('user').findAndModify(query, sort, update, options, function(err, userSaved) {
			if (err) {
				return callback(err, null);
			}

			if (userSaved) {
				logger.info('[saveLocation] lat=' + userSaved.location.coordinates.lat + ', lng=' + userSaved.location.coordinates.lng + ' of ' + userSaved.email + ' saved');
				callback(null, userSaved);
			} else {
				var msg = '[saveLocation] No user[' + user._id + '] found!';
				logger.warn(msg);
				callback(new Error(msg), null);
			}

		});

	});
};

User.prototype.updateShareMode = function(user, shareMode, callback) {
	try {
		check(user._id, 'user._id').notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		var query = {_id: user._id};

		var sort = null;

		var update = {
			$set: {
				shareMode: shareMode || 'all'
			}
		};

		var options = {
			new : true, // set to true if you want to return the modified object rather than the original
			upsert: false // Atomically inserts the document if no documents matched.
		};

		db.collection('user').findAndModify(query, sort, update, options, function(err, userSaved) {
			if (err) {
				return callback(err, null);
			}

			if (userSaved) {
				logger.info('[updateShareMode] shareMode=' + userSaved.shareMode + ' updated');
				callback(null, userSaved);
			} else {
				var msg = '[updateShareMode] No user[' + user._id + '] found!';
				logger.warn(msg);
				callback(new Error(msg), null);
			}

		});

	});
};

User.prototype.myNearestContacts = function(user, callback) {

	try {
		check(user._id).notNull();
		check(user.domain).notEmpty();

	} catch (e) {
		return callback(e, null);
	}

	mongodb(function(err, db) {

		if (err) {
			return callback(err, null);
		}

		var search = {
			_id: user._id
		};

		var cfg = {
			fields: {
				location: 1
			}
		};

		db.collection('user').findOne(
				search,
				cfg,
				function(err, me) {
					if (err) {
						return callback(err, null);
					}

					if (!me) {
						logger.warn('No user found with id ' + user._id);
						return callback('No user found with id ' + user._id, null);
					}

					logger.info('Last location ' + JSON.stringify(me.location) + ' of ' + user._id + ' user retrieved');
					search = {
						_id: {
							$ne: user._id
						},
						domain: user.domain,
						location: {
							$near: {
								$geometry: me.location
							},
							$maxDistance: 1000000
						},
						shareMode: {
							$ne: 'none'
						}
					};

					fields = {
						email: 1,
						location: 1,
						_id: 1,
						gcmId: 1,
						name: 1,
						photo: 1,
						shareMode: 1
					};

					limit = {
						limit: 20
					};

					db.collection('user').find(search, {fields: fields, limit: limit}).toArray(
							function(err, contacts) {
								if (err) {
									return callback(err, null);
								}

								logger.info('Retrieved ' + contacts.length + ' nearest contacts of ' + user._id + ' user');
								callback(null, {me: me, contacts: contacts});
							}
					);
				}
		);
	});
};

User.prototype.changeGcmId = function(user, gcmId, callback) {

	try {
		check(user._id).notNull();
		check(gcmId).notEmpty();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		var query = {_id: user._id};
		var sort = null;
		var update = {$set: {gcmId: gcmId}};
		var options = {
			new : true, // set to true if you want to return the modified object rather than the original
			upsert: true // Atomically inserts the document if no documents matched.
		};

		db.collection('user').findAndModify(query, sort, update, options, function(err, userSaved) {
			if (err) {
				return callback(err, null);
			}

			logger.info('Saved gcm-id=' + userSaved.gcmId + ' for ' + userSaved._id);
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
