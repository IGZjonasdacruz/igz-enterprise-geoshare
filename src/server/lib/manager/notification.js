var gcm = require('node-gcm'),
	config = require('../util/config').GCM,
	logger = require('../util/logger')(__filename);

const SEND_MAX_RETRIES = 4;

var sender = new gcm.Sender( config.API_KEY );

function sendToNearestContacts (user) {
	// Important! require here to avoid circular dependencies: http://selfcontained.us/2012/05/08/node-js-circular-dependencies/
	require('./user').nearestContacts(user, function (err, users) {
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


		/**
		 * GCM only allows a maximum of 4 different collapse keys to be used by the GCM server per device at any given time
		 *  
		 *  --
		 *   
		 * The Time to Live (TTL) feature lets the sender specify the maximum lifespan of a message using the 
		 * time_to_live parameter in the send request. The value of this parameter must be a duration 
		 * from 0 to 2,419,200 seconds, and it corresponds to the maximum period of time for which GCM will 
		 * store and try to deliver the message.
		 */
		var message = new gcm.Message({
			collapseKey: 'near_contact',
			delayWhileIdle: true,  // Wait for device to become active before sending.
			timeToLive: 600, // Time in seconds to keep message queued if device offline.
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
