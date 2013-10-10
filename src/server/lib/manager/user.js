
var userDao = require('../dao/user'),
    assert = require('assert');

function UserManager () {}

UserManager.prototype.saveLocation = function (user, lat, lon, callback) {
  userDao.saveLocation(user, lat, lon, callback);
};

UserManager.prototype.myNearestContacts = function (user, callback) {
	userDao.myNearestContacts(user, callback);	
};

module = module.exports = new UserManager();
