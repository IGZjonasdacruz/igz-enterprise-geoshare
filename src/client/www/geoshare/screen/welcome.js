iris.screen(function(self) {

	var userRes = iris.resource(iris.path.resource.user);

	self.create = function() {
		self.tmpl(iris.path.welcome.html);

		showStatus('Initializing...');
		googleapi.getToken().done(onGetToken).fail(onGetTokenFail);

		// self.get('logout_btn').on('click', logout);

		self.ui('map', iris.path.ui.map.js).get().hide();

		window.onorientationchange = function () {
			//Need at least 800 milliseconds, TODO find a best solution...
			setTimeout(resize, 1000);
		}
	};

	function resize () {
		iris.log('On resize');
		iris.notify('resize');
	}

	function showStatus (msg) {
		self.get('loader').show();
		self.get('status').text(msg);
	}

	function hideStatus () {
		self.get('loader').hide();
		self.get('status').text('');
	}

	// function logout (e) {
	// 	self.get('logout_btn').hide();
	// 	self.ui('map').reset();
	// 	googleapi.logout();

	// 	showStatus('Logging...');
	// 	googleapi.getToken().done(onGetToken).fail(onGetTokenFail);
	// }

	function onGetToken(data) {
		iris.log('ACCESS TOKEN = ' + data.access_token);
		// self.get('logout_btn').show();

		showStatus('Sending location...');
		sendLocation();
	}

	function onGetTokenFail(e) {
		iris.log('GET ACCESS TOKEN ERROR ' + e);
		showStatus('Logging...');

		googleapi.authorize().done(onGetToken).fail(function(data) {
			self.get('login_error').html(data.error);
		});
	}

	function sendLocation() {
		navigator.geolocation.getCurrentPosition(onGetPosition, onGetPositionError, {enableHighAccuracy: true});
	}

	function onGetPosition (position) {
		var pos = position.coords;
		iris.log('lat = ' + pos.latitude + ', lng=' + pos.longitude);

		userRes.sendLocation(pos.latitude, pos.longitude).then(function(user) {
			showStatus('Finding nearest users...')
			// TODO show user information, image and name
			return userRes.getNearestContacts();
		}).done(function(contacts) {
			hideStatus();

			iris.log('All neareat user found =' + contacts.length);
			self.ui('map').render(pos, contacts);
		}).fail(function(e) {
			// TODO show error?
			iris.log('ERROR sendLocation code: ' + e.code + '\n' + 'message: ' + e.message + '\n');
		});

	}

	function onGetPositionError (error) {
		// TODO show error?
		iris.log('ERROR sendLocation code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
	}

}, iris.path.welcome.js);
