var vows = require('vows'),
    assert = require('assert');



vows.describe('User Resource').addBatch({
    'saveLocation': {
        topic: require('../lib/worker/user'),

        'invalid params 1': function (userDao) {
          assert.throws(
            function() {
              userDao.saveLocation();
            }
          );
        },
        'invalid postion param': function (userDao) {
          assert.throws(
            function() {
              userDao.saveLocation({id:1,email:'test@test.com'}, 1);
            }
          );
        },
        'valid params': function (userDao) {
          userDao.saveLocation({id:1,email:'test@test.com'}, 1, 1, function () {
            // TODO Check if exists in DB
          });
        }
    }
}).export(module);

/*
var APIeasy = require('api-easy'),
      assert = require('assert');

var suite = APIeasy.describe('your/awesome/api');

suite.discuss('User resource, set position')
     .use('localhost', 3000)
     .setHeader('Content-Type', 'application/json')
     .post('/user/me/location')
      .expect(401)
     .export(module);
*/
