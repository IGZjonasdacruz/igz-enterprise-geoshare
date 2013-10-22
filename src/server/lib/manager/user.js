
var userDao = require('../dao/user'),
		notification = require('./notification.js'),
		assert = require('assert'),
		logger = require('../util/logger')(__filename),
		request = require('request');

function UserManager () {}

UserManager.prototype.saveLocation = function (user, lat, lng, callback) {
	userDao.saveLocation(user, lat, lng, function (err, userDb) {
		if ( err ) {
			return callback(err);
		}
		
		callback(null, userDb);
		
		// Find the nearest contacts and send a notification to them
		notification.sendToNearestContacts(user, function (err, numUsers) {
			if ( err ) {
				logger.error(err);
			}
		});
	});

};

UserManager.prototype.myNearestContacts = function (user, callback) {
	userDao.myNearestContacts(user, callback);
};

UserManager.prototype.changeGcmId = function (user, gcmId, callback) {
	userDao.changeGcmId(user, gcmId, callback);
};

UserManager.prototype.logout = function (user, callback) {
	
	//
	//TODO Send PUSH to nearest contacts
	//

	request({
		url : 'https://accounts.google.com/o/oauth2/revoke?token=' + user.accessToken,
		method: "GET",
	}, function (err, response, body) {

		if ( err ) {
			return callback(err);
		}

		userDao.remove(user._id, callback);
	});
};

module = module.exports = new UserManager();
