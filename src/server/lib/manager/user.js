
var userDao = require('../dao/user'),
		notification = require('./notification.js'),
		assert = require('assert');

function UserManager () {}

UserManager.prototype.saveLocation = function (user, lat, lng, callback) {
	userDao.saveLocation(user, lat, lng, callback);

	// Find the nearest contacts and send a notification to them
	notification.sendToNearestContacts(user);
};

UserManager.prototype.myNearestContacts = function (user, callback) {
	userDao.myNearestContacts(user, callback);  
};

UserManager.prototype.changeGcmId = function (user, gcmId, callback) {
	userDao.changeGcmId(user, gcmId, callback);
}

module = module.exports = new UserManager();
