iris.screen(function(self) {

	var userRes = iris.resource(iris.path.resource.user);

	self.create = function() {
		self.tmpl(iris.path.welcome.html);

		googleapi.getToken().done(onGetToken).fail(onGetTokenFail);
	};

	function onGetToken (data) {
		iris.log("ACCESS TOKEN = " + data.access_token);
		
		self.get('status').text('Welcome user!\n\nSending location...\n\n');
		sendLocation();
	}

	function onGetTokenFail (e) {
		iris.log("GET ACCESS TOKEN ERROR " + e);
		self.get('status').text('Logging...');
		
		googleapi.authorize().done(onGetToken)
		.fail(function(data) {
			self.get('login_error').html(data.error);
		});
	}

	function sendLocation () {
		iris.log('Sending user location...');

		navigator.geolocation.getCurrentPosition( function (position) {
			self.get('status').text(self.get('status').text() + 'lat = ' + position.coords.latitude + ', lng=' + position.coords.longitude + '\n');

			userRes.sendLocation(position.coords.latitude, position.coords.longitude).done(function (data) {
				self.get('status').text(self.get('status').text() + '\nLocation sended.\n\n' + JSON.stringify(data,null,2));
			}).fail(function (e) {
				self.get('status').text(self.get('status').text() + '\nERROR -> Location send =' + e);
			})

		}, function onError(error) {
			iris.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');

		}, { enableHighAccuracy : true });

	}

}, iris.path.welcome.js);
