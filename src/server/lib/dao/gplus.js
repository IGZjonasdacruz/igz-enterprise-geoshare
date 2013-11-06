var logger = require('../util/logger')(__filename),
		check = require('validator').check,
		util = require('util'),
		mongodb = require('../util/mongodb'),
		async = require('async');

//
// GPlus indexes
//


function gPlusIndexes(callback) {
	async.parallel([], function(err) {
		if (err) {
			return logger.error(err);
		}

		logger.info("All gplus indexes have been ensured");

		if (callback) {
			callback();
		}
	});
}

gPlusIndexes();

function GPlus() {
}

GPlus.prototype.save = function(user, contacts, callback) {
	try {
		check(user._id, 'user._id').notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}


		db.collection('contacts').save({
			_id: user._id,
			contacts: contacts.items || [] 
		},
		{safe: true}, callback);
	});
};

GPlus.prototype.reset = function(callback) {
	mongodb(function(err, db) {
		if (err)
			return callback(err, null);

		db.dropCollection('contacts', function(err, result) {
			if (err)
				return callback(err, null);

			gPlusIndexes(callback);

		});
	});
};

GPlus.prototype.remove = function(userId, callback) {
	try {
		check(userId).notNull();
	} catch (err) {
		return callback(err, null);
	}

	mongodb(function(err, db) {
		if (err) {
			return callback(err, null);
		}

		db.collection('contacts').remove({_id: userId}, function(err, result) {
			if (err) {
				return callback(err, null);
			}

			callback(null, result);
		});
	});
};

module.exports = new GPlus(); // This module returns the same gPlus instance (Singleton)