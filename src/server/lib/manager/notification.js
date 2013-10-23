var userDao = require('../dao/user.js'),
	gcm = require('node-gcm'),
	config = require('../util/config').GCM,
	logger = require('../util/logger')(__filename);

const SEND_MAX_RETRIES = 4;

var sender = new gcm.Sender( config.API_KEY );


function sendToNearestContacts (user) {
	userDao.myNearestContacts(user, function (err, users) {
		if ( err ) {
			logger.error(err);
			return;
		}

		if ( !users || users.length == 0 ) {
			logger.info('There are not near contacts');
			return;
		}

		logger.info('Near contacts=' + users.length);

		var registrationIds = [], gcmId;
		for ( var f = 0, F = users.length; f < F; f++ ) {
			gcmId = users[f].gcmId;
			if ( gcmId ) {
				registrationIds.push(gcmId);
			}
		}

		if ( registrationIds.length === 0 ) {
			logger.info('There are not contacts with GCM id, PUSH notifications will be not sended');
			return;
		}

		logger.info('Sending GCM PUSH notifications to ' + registrationIds.length + ' contacts...');

		var message = new gcm.Message({
			collapseKey: 'near_contact',
			delayWhileIdle: true,
			timeToLive: 3,
			data: { user : user }
		});
		
		// Parameters: message-literal, registrationIds-array, retries-number, callback-function
		sender.send(message, registrationIds, SEND_MAX_RETRIES, function (err, result) {
				logger.info('PUSH sent', result);
		});
	});
}

module.exports = {
	sendToNearestContacts : sendToNearestContacts
}
