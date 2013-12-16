var logger = require('../util/logger')(__filename),
		check = require('validator').check,
		util = require('util'),
		mongodb = require('../util/mongodb'),
		async = require('async');

//
// Privacy indexes
//

function privacyIndexes(callback) {
	async.parallel([], function(err) {
		
		if (err) {
			return callback(err);
		}

		logger.info("All privacy indexes have been ensured");

		if (callback) {
			callback();
		}
	});
}

privacyIndexes();


function Privacy() {
}

Privacy.prototype.save = function(privacy, callback) {
	try {
		check(privacy._id, 'privacy._id').notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		db.collection('privacy').save(privacy, { safe : true }, callback);
	});
};

Privacy.prototype.reset = function(callback) {
	mongodb(function(err, db) {
		if (err)
			return callback(err, null);

		db.dropCollection('privacy', function(err, result) {
			if (err)
				return callback(err, null);

			privacyIndexes(callback);

		});
	});
};

Privacy.prototype.get = function(id, callback) {
	try {
		check(id).notNull();
	} catch (err) {
		return callback(err);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		db.collection('privacy').findOne({
			_id: id
		}, function(err, doc) {
			if (err){
				return callback(err, null);
			}

			logger.info('Found id="' + id + '" in "privacy" collection.');
			callback(null, doc);
		});

	});
};

Privacy.prototype.search = function(search, callback) {
	
	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}
		
		db.collection('privacy').find(search).toArray(function(err, col) {
			if (err){
				return callback(err, null);
			}

			callback(null, col);
		});

	});
};



Privacy.prototype.update = function(id, update, callback) {

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

		db.collection('privacy').findAndModify(query, sort, update, options, function(err, privacySaved) {
			if (err) {
				return callback(err, null);
			}

			logger.info('Privacy "' + privacySaved._id + '" was updated', update);
			callback(null, privacySaved);
		});
	});
}

Privacy.prototype.remove = function(userId, callback) {
	try {
		check(userId).notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		db.collection('privacy').remove({_id: userId}, function(err, result) {
			if (err) {
				return callback(err, null);
			}

			callback(null, result);
		});
	});
};

module.exports = new Privacy(); // This module returns the same privacy instance (Singleton)
