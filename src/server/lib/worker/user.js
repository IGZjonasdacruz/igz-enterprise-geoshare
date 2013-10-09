
var userDao = require('../dao/user');

function UserWorker () {}

UserWorker.prototype.saveLocation = function (user, lat, lon, callback) {
  userDao.saveLocation(user.id, user.email, [lat, lon], callback);
};

module = module.exports = new UserWorker();
