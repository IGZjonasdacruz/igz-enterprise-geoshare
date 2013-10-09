
var userDao = require('../dao/user');

function UserWorker () {}

UserWorker.prototype.saveLocation = function (user, lon, lat, callback) {
  userDao.saveLocation(user.id, user.email, this.getDomain(user), [lon, lat], callback);
};

UserWorker.prototype.myNearestContacts = function (user, callback) {
	var domain = this.getDomain(user);
	if (!domain) {
		callback("No domain found for the user " + user.email);	
	} else {
		userDao.myNearestContacts(user.id, domain, callback);	
	}
};

UserWorker.prototype.getDomain = function (user) {
	var match = user.email.match(/@(.+)/);
	if (!match) {
		return null;
	} else {
		return match[1];
	}	
}

module = module.exports = new UserWorker();
