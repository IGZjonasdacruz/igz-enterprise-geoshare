(function () {
	
	geosharecfg.gcm.listenGCMNotifications = listenGCMNotifications;
	
    // Exposes onNotificationGCM callback
    geosharecfg.gcm.onNotificationGCM = onNotificationGCM;
	
	var afterRegistered = null;
	
    function listenGCMNotifications (callback) {
        var pushNotification = window.plugins.pushNotification;
			
		afterRegistered = callback;
		
        pushNotification.register(
            successHandler,
            errorHandler, {
                "senderID": geosharecfg.gcm.senderId, // This is the Google project ID you need to obtain by registering your application for GCM
                "ecb":"geosharecfg.gcm.onNotificationGCM"
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
					geosharecfg.gcm.regid = e.regid;
					if (typeof afterRegistered === 'function') {
						afterRegistered();
					}
                }
                break;
            case 'message':

                iris.log( 'message = ' + JSON.stringify(e, null, 2) );

                break;
            case 'error':
                iris.log('error = ' + e.msg);
                break;
            default:
                iris.log('An unknown GCM event has occurred.' + JSON.stringify(e, null, 2));
                break;
        }

    }

})();
