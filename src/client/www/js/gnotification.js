var gnotification = {};

(function () {
	
	var onNewMessage;
	
	function listen (onNewMessageHandler) {
		if ( onNewMessage ) {
			iris.log('gnotification was listening before')
			return;
		}
		
		onNewMessage = onNewMessageHandler;
		window.plugins.pushNotification.register(
			successHandler,
			errorHandler, {
				"senderID": geosharecfg.gcm.senderId, // This is the Google project ID you need to obtain by registering your application for GCM
				"ecb":"onNotificationGCM"
			}
		);
			
		iris.log('*** Listening to pushNotifications ...');
	}
	function successHandler (result) {
		iris.log('*** successHandler = ' + result);

	}
	function errorHandler (error) {
		iris.log('*** errorHandler = ' + error);
	}

	function onNotificationGCM (e) {
		iris.log('*** onNotificationGCM = ' + e.event);
		switch (e.event) {
			case 'registered':
				if (e.regid.length > 0) {
					//your GCM push server needs to know the regID before it can push to this device
					//you can store the regID for later use here
					iris.log('regID received = ' + e.regid);
					localStorage.regid = e.regid;
					iris.resource(iris.path.resource.app).sendGcmId(e.regid);
				}
				break;
			case 'message':	

				iris.log( 'message = ' + JSON.stringify(e, null, 2) );

				onNewMessage(e.payload)
/*
{
   "payload": {
     "user": {
       "email": "bill.woods@intelygenz.com",
       "location": {
        "type": "Point",
        "coordinates": [
           -3.750127,
          40.2341438
        ]
       }
     }
   },
   "from": "193156067209",
   "collapse_key": "near_contact",
   "foreground": false,
   "event": "message"
}
*/


				break;
			case 'error':
				iris.log('error = ' + e.msg);
				break;
			default:
				iris.log('An unknown GCM event has occurred.' + JSON.stringify(e, null, 2));
				break;
		}

	}

	// Exposes onNotificationGCM callback
    window.onNotificationGCM = onNotificationGCM;

    gnotification.listen = listen;

})();
