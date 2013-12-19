iris.screen(function(self) {

	var appRes = iris.resource(iris.path.resource.app);

	var timeInterval = null;

	self.create = function() {
		self.tmpl(iris.path.screen.welcome.html);

		self.get('logout_btn').on('click', logout);
		self.get('login_btn').on('click', onBtnLogin);
		self.get('refresh_btn').on('click', onBtnRefresh);


		self.screens("screens", [
			["map", iris.path.screen.map.js],
			["list", iris.path.screen.list.js]
		]);

		iris.on(iris.BEFORE_NAVIGATION, onBeforeNavigation);

		self.ui('notify', iris.path.ui.notify.js);

		self.get('privacy_info_btn').on('click', function(e) {
			var me = appRes.me();
			var data = [{id: 'name', value: 'Name'}, {id: 'email', value: 'Email'}, {id: 'photo', value: 'Photo'}, {id: 'distance', value: 'Distance'}, {id: 'location', value: 'Location'}];
			data.forEach(function(item) {
				item.privacy = me.privacy !== undefined && me.privacy.data !== 'none' && Array.isArray(me.privacy.data) && me.privacy.data.indexOf(item.id) !== -1;
			});
			showPrivacy(data, 'data');
			e.preventDefault();
		});
		
		self.get('privacy_calendars_btn').on('click', function(e) {
			var me = appRes.me();
			showPrivacy(me.privacy.calendars, 'calendars');
			e.preventDefault();
		});

		// collapse nav-bar on click
		self.get('navbar_items').find('a').on('click', function() {
			if (self.get('navbar_items').hasClass('in')) {
				self.get('collapse_nav_btn').click();
			}
		});

		if (localStorage.access_token) {
			login();
		} else {
			showLogin();
		}
	};

	function showLogin() {
		self.get('collapse_nav_btn').toggleClass('hidden', true);
		self.inflate({
			showMenu: false,
			showUserBox: false,
			showLogin: true
		});
	}

	function showPrivacy(data, type) {
		self.destroyUIs('privacy');
		var privacyUI = self.ui('privacy', iris.path.ui.privacy.js, {data: data, type: type, showStatus: showStatus, hideStatus: hideStatus});
		privacyUI.get().modal('toggle');
	}

	function onBeforeNavigation() {
		var hash = document.location.hash;
		self.inflate({showUserBox: (hash == '')});

		var $menu = self.get('menu');
		$('a', $menu).parent().removeClass('active');
		$('a[href="' + hash + '"]', $menu).parent().addClass('active');
	}

	function showStatus(msg) {
		self.get('loader').show();
		self.get('status').text(msg);
	}

	function hideStatus() {
		self.get('loader').hide();
		self.get('status').text('');
	}

	function onBtnLogin(e) {
		if (geoshare.isBrowser) {
			location.reload();
		} else {
			login();
		}
	}

	function onBtnRefresh(e) {
		login();
	}

	function login() {
		iris.notify('clearNotifications');

		self.inflate({
			showMenu: false,
			showUserBox: false,
			showLogin: false
		});
		showStatus('Getting access...');
		googleapi.getToken().done(onGetToken).fail(onGetTokenFail);
	}

	function logout(e) {
		iris.notify('clearNotifications');
		appRes.signOut().done(function() {
			googleapi.reset();
			showLogin();
		});
	}

	function onGetToken(data) {
		showStatus('Initializing');
		sendLocation();
	}

	function onGetTokenFail(e) {
		var msg;
		if (e.hasOwnProperty('type') && e.type === 'user_denied_access') {
			msg = 'Please authorize this application to start';
		} else {
			msg = 'Login error, please try again later...';
		}

		iris.notify('notify', {msg: msg, type: 'danger'});
		hideStatus();
		showLogin();
	}

	function sendLocation() {
		navigator.geolocation.getCurrentPosition(
				onGetPosition,
				onGetPositionError,
				{enableHighAccuracy: true}
		);
	}

	function onGetPosition(position) {
		var pos = position.coords;
		var timeRemaining = 3600;
		iris.log('lat = ' + pos.latitude + ', lng=' + pos.longitude);

		if (timeInterval !== null) {
			clearInterval(timeInterval);
		}

		appRes.signIn(pos.latitude, pos.longitude).done(function() {

			iris.locale(appRes.me().locale || 'en');
			hideStatus();
			self.get('collapse_nav_btn').toggleClass('hidden', false);

			self.inflate({
				user: appRes.me(),
				showMenu: true,
				showUserBox: true,
				showLogin: false,
				timeRemaining: timeRemaining
			});

			if (!geoshare.isBrowser) {
				gnotification.listen(function(data) {
					appRes.addNearContact(data);
				});
			}

			timeInterval = setInterval(function() {
				timeRemaining--;
				self.inflate({
					timeRemaining: timeRemaining
				});
			}, 1000);



		}).fail(onSignInFail);
	}

	function onSignInFail() {
		hideStatus();
		showLogin();
	}

	function onGetPositionError(error) {
		iris.notify('notify', {msg: 'Cannot get location', type: 'danger'});
		onSignInFail();
	}

}, iris.path.screen.welcome.js);
