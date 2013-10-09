
var userDao = require('../dao/user'),
    assert = require('assert');

function UserWorker () {}

UserWorker.prototype.saveLocation = function (user, lat, lon, callback) {
  assert(user);
  assert(user.id);
  assert(user.email);
  assert(lat);
  assert(lon);

  userDao.saveLocation(user.id, user.email, [lat, lon], callback);
};

module = module.exports = new UserWorker();
