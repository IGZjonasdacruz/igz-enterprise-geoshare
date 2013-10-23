iris.screen(function(self) {

	var userRes = iris.resource(iris.path.resource.user);

	self.create = function() {
		self.tmpl(iris.path.welcome.html);

		self.get('logout_btn').on('click', logout);
		self.get('login_btn').on('click', login);
		self.get('menu-list').on('click', showList);
		self.get('menu-map').on('click', showMap);

		showMenu(false);
		
		self.ui('list', iris.path.ui.list.js).get().hide();
		self.ui('map', iris.path.ui.map.js).get().hide();
		self.ui('notify', iris.path.ui.notify.js);

		window.onorientationchange = function() {
			//Need at least 800 milliseconds, TODO find a best solution...
			setTimeout(resize, 1000);
		}

		iris.on(iris.RESOURCE_ERROR, function(request, textStatus, errorThrown) {
			iris.notify('notify', {msg: '<strong>Sorry</strong>, an unexpected error has occurred! Please, try again later...', type: 'danger'});
			iris.log("resource error", request, textStatus, errorThrown);
		});

	};

	function resize() {
		iris.log('On resize');
		iris.notify('resize');
	}

	function showStatus(msg) {
		self.get('loader').show();
		self.get('status').text(msg);
	}

	function hideStatus() {
		self.get('loader').hide();
		self.get('status').text('');
	}

	function login() {
		self.get('login_box').hide();
		showStatus('Getting access...');
		googleapi.getToken().done(onGetToken).fail(onGetTokenFail);
	}

	function logout(e) {
		userRes.logout().done(function() {
			googleapi.reset();

			if (geoshare.isBrowser) {
				return document.location.href = 'http://localhost:3000/login';
			} else {
				self.get('logout_btn').hide();
				self.get('login_box').show();
				showMenu(false);
				userRes.reset();
				self.ui('map').reset().get().hide();
				self.ui('list').reset().get().hide();
			}

		});
	}

	function onGetToken(data) {
		iris.log('ACCESS TOKEN = ' + data.access_token);
		self.get('logout_btn').show();

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

	function onGetPosition(position) {
		var pos = position.coords;
		iris.log('lat = ' + pos.latitude + ', lng=' + pos.longitude);
		
		userRes.sendLocation(pos.latitude, pos.longitude).then(function(user) {	
			showStatus('Finding nearest users...');

			// TODO show user information, image and name
			userRes.getNearestContacts().done(function(users) {
				hideStatus();

				iris.log('All neareat user found =' + users.length);
				showMenu(true);
				self.ui('list').render();
				showList();
			});
		});
	}

	function onGetPositionError(error) {
		// TODO show error?
		iris.log('ERROR sendLocation code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
	}

	function showMenu(state) {
		self.get('menu').toggle(state);
		self.get('menu-list').addClass('active');
		self.get('menu-map').removeClass('active');
	}

	function showList() {
		self.get('menu-list').addClass('active');
		self.get('menu-map').removeClass('active');
		self.ui('map').hide();
		self.ui('list').show();
	}
	
	function showMap() {
		self.get('menu-map').addClass('active');
		self.get('menu-list').removeClass('active');
		self.ui('list').hide();
		self.ui('map').show().render(); // important! show first
	}

}, iris.path.welcome.js);