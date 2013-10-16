
var userDao = require('../dao/user'),
		assert = require('assert');

function UserManager () {}

UserManager.prototype.saveLocation = function (user, lat, lng, callback) {
	userDao.saveLocation(user, lat, lng, callback);
};

UserManager.prototype.myNearestContacts = function (user, callback) {
	userDao.myNearestContacts(user, callback);  
};

UserManager.prototype.changeGcmId = function (user, gcmId, callback) {
	userDao.changeGcmId(user, gcmId, callback);
}

module = module.exports = new UserManager();
