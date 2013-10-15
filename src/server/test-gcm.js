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
registrationIds.push('client1');

/**
 * Parameters: message-literal, registrationIds-array, No. of retries, callback-function
 */
console.log('Ok lets go!');
sender.send(message, registrationIds, 4, function (err, result) {
    console.log(result);
});
