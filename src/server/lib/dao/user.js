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

function userIndexes (callback) {
	async.parallel([statusIndex, locationIndex], function() {
		
		logger.info("All user indexes have been ensured");
		
		if ( callback ) {
			callback();
		}
	});
}

userIndexes();


function User() {
}

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

User.prototype.saveLocation = function(user, lat, lng, callback) {
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
		if (err)
			return callback(err, null);

		var userUpdated = {
			_id: user._id,
			regid: user.regid,
			email: user.email,
			domain: user.domain,
			location: {
				type: "Point",
				coordinates: [lng, lat]
			},
			status: new Date()
		};
		db.collection('user').findAndModify({
			_id: user._id
		}, {},
						userUpdated, {
			"new": true,
			"upsert": true
		},
		function(err, result) {
			if (err)
				return callback(err, null);

			logger.info('Last location lat=' + lat + ', lng=' + lng + ' of ' + user.email + ' saved');
			callback(null, userUpdated);
		}
		);

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
			fields : {
				location: 1
			}
		};

		db.collection('user').findOne(
			search,
			cfg,
			function(err, result) {
				if (err) {
					return callback(err, null);
				}

				if ( !result ) {
					logger.warn('No user found with id ' + user._id);
					return callback('No user found with id ' + user._id, null);
				}
				
				logger.info('Last location ' + JSON.stringify(result.location) + ' of ' + user._id + ' user retrieved');
				search = {
					_id: {
						$ne: user._id
					},
					domain: user.domain,
					location: {
						$near: {
							$geometry: result.location
						},
						$maxDistance: 5000
					}
				};

				fields = {
					email: 1,
					location: 1,
					_id: 1
				};
				
				limit = {
					limit: 20
				};

				db.collection('user').find(search, {fields: fields, limit: limit}).toArray(
					function(err, result) {
						if (err) {
							return callback(err, null);
						}

						logger.info('Retrieved ' + result.length + ' nearest contacts of ' + user._id + ' user');
						callback(null, result);
					}
				);
			}
		);
	});
};

User.prototype.changeGcmId = function (user, gcmId, callback) {
	try {
		check(user._id).notNull();
		check(gcmId).notEmpty();
	} catch (err) {
		return callback(err, null);
	}


	mongodb(function(err, db) {
		if ( err ) {
			return callback(err, null);
		}

		db.collection('user').update({ _id : user._id }, { $set: {gcmId:gcmId} }, callback);
	});
}

module.exports = new User(); // This module returns the same user instance (Singleton)
