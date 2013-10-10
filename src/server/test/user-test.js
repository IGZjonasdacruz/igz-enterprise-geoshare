var vows = require('vows'),
    assert = require('assert'),
    sanitize = require('validator').sanitize;

var VALID_USER = {
  id:'09477529074259',
  email:'testuser@test.com',
  domain: 'test.com'
};

var lat = sanitize("40.421431").toFloat();
var lng = sanitize("-3.705434").toFloat();

var userManager = require('../lib/manager/user');
var userDao = require('../lib/dao/user');

vows.describe('manager/user.js').addBatch({
  '(saveLocation) Invalid params.': {
    topic: function () {
      userManager.saveLocation(undefined, undefined, undefined, this.callback);
    },
    'Invalid parameters' : function (err, userDB) {
      assert(err);
      assert.equal(userDB, null);
    }
  },
  '(saveLocation) Invalid position param.': {
    topic: function () {
      userManager.saveLocation(VALID_USER, 1, 'string', this.callback);
    },
    'Invalid position param' : function (err, userDB) {
      assert(err);
      assert.equal(userDB, null);
    }
  },
  '(saveLocation) Valid position.' : {
    topic: function () {
      userManager.saveLocation(VALID_USER, lat, lng, this.callback);
    },
    'Check save callback' : function (err, userDB) {
      assert.equal(err, null);
      assert(userDB);
      
      assert.equal(userDB._id, VALID_USER.id, 'Saved user should have the same fields.');
      assert.equal(userDB.domain, VALID_USER.domain, 'Saved user should have the same fields.');
      assert.equal(userDB.email, VALID_USER.email, 'Saved user should have the same fields.');
      
      assert.equal(userDB.location.coordinates[0], lng, 'Saved user lng position should be the same.');
      assert.equal(userDB.location.coordinates[1], lat, 'Saved user lat position should be the same.');
      
    },
    'User saved correctly.' : {
      topic: function (userDB) {
        userDao.get(VALID_USER.id, this.callback);
      },
      'Checking user saved.' : function (err, userDB) {
        assert.equal(err, null);

        assert.equal(userDB._id, VALID_USER.id, 'Saved user should have the same fields.');
        assert.equal(userDB.domain, VALID_USER.domain, 'Saved user should have the same fields.');
        assert.equal(userDB.email, VALID_USER.email, 'Saved user should have the same fields.');
        
        assert.equal(userDB.location.coordinates[0], lng, 'Saved user lng position should be the same.');
        assert.equal(userDB.location.coordinates[1], lat, 'Saved user lat position should be the same.');
      }
    }
  }
}).export(module);
