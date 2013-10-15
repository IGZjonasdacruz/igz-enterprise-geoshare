var gcm = require('node-gcm');

// create a message with default values
var message = new gcm.Message();

// or with object values
var message = new gcm.Message({
    collapseKey: 'demo',
    delayWhileIdle: true,
    timeToLive: 3,
    data: {
        key1: 'message1',
        key2: 'message2'
    }
});

var sender = new gcm.Sender('AIzaSyAMeLUEGnoNKTOd7dazquZW4IAQ9UMx8QM');
var registrationIds = [];

// At least one required
registrationIds.push('APA91bFBa_nYmU6JnbzOYMJTe8B4z9CKBynVaqAWniYvJ-1l2XO_KZdv0fFoTe4P8E-W4MEKO2ehXWkZy8qviWAlLvV8b21jmzJdWkrd3AjUQhG82-za3q1z5QOr_O-ACu9s6FdFvAxo');

/**
 * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
 */
console.log('Ok lets go!');
sender.send(message, registrationIds, 4, function (err, result) {
    console.log(result);
});
