var googleapi = {
	config: geosharecfg.auth,
	authorize: function() {
		var deferred = $.Deferred();
		var options = googleapi.config;

		//Build the OAuth consent page URL
		var authUrl = 'https://accounts.google.com/o/oauth2/auth?' + $.param({
			client_id: options.client_id,
			redirect_uri: options.redirect_uri,
			response_type: 'code',
			scope: options.scope,
			access_type: 'offline'
		});

		//Open the OAuth consent page in the InAppBrowser
		var authWindow = window.open(authUrl, '_blank', 'location=no,toolbar=no');

		//The recommendation is to use the redirect_uri "urn:ietf:wg:oauth:2.0:oob"
		//which sets the authorization code in the browser's title. However, we can't
		//access the title of the InAppBrowser.
		//
		//Instead, we pass a bogus redirect_uri of "http://localhost", which means the
		//authorization code will get set in the url. We can access the url in the
		//loadstart and loadstop events. So if we bind the loadstart event, we can
		//find the authorization code and close the InAppBrowser after the user
		//has granted us access to their data.
		$(authWindow).on('loadstart', function(e) {
			var url = e.originalEvent.url;
			var code = /\?code=(.+)$/.exec(url);
			var error = /\?error=(.+)$/.exec(url);

			if (code || error) {
				//Always close the browser when match is found
				authWindow.close();
			}

			if (code) {
				//Exchange the authorization code for an access token
				$.post('https://accounts.google.com/o/oauth2/token', {
					code: code[1],
					client_id: options.client_id,
					client_secret: options.client_secret,
					redirect_uri: options.redirect_uri,
					grant_type: 'authorization_code'
				}).done(function(data) {
					googleapi.setToken(data);
					deferred.resolve(data);
				}).fail(function(response) {
					deferred.reject({
						type: 'exchange_code',
						error: response.responseJSON
					});
				});
			} else if (error) {
				//The user denied access to the app
				deferred.reject({
					type: 'user_denied_access',
					error: error[1]
				});
			}
		});

		return deferred.promise();
	},
	setToken: function(data) {
		console.log('New access token ' + JSON.stringify(data,null,2));

		localStorage.access_token = data.access_token;

		// The refresh_token only is sent once, after the user authorizes the application
		localStorage.refresh_token = data.refresh_token || localStorage.refresh_token;

		//Calculate exactly when the token will expire, then subtract
		//one minute to give ourselves a small buffer.
		var now = new Date().getTime();
		var expiresAt = now + parseInt(data.expires_in, 10) * 1000 - 60000;
		localStorage.expires_at = expiresAt;
	},
	getToken: function() {
		var options = googleapi.config;
		var deferred = $.Deferred();
		var now = new Date().getTime();

		if ( !localStorage.access_token ) {
			return googleapi.authorize();
		}

		if ( geoshare.isBrowser || now < localStorage.expires_at ) {
			console.log('Found a valid access token[' + localStorage.access_token + ']');

			//The token is still valid, so immediately return it from the cache
			deferred.resolve({
				access_token: localStorage.access_token
			});
		} else if ( localStorage.refresh_token ) {
			console.log('Found a expired access token, trying to refresh... refresh_token=' + localStorage.refresh_token);

			//The token is expired, but we can get a new one with a refresh token
			$.post('https://accounts.google.com/o/oauth2/token', {
				refresh_token: localStorage.refresh_token,
				client_id: options.client_id,
				client_secret: options.client_secret,
				grant_type: 'refresh_token'
			}).done(function(data) {
				console.log('Refresh token done.', data);
				googleapi.setToken(data);
				deferred.resolve(data);
			}).fail(function(response) {
				console.log('Refresh token fail.', response);
				googleapi.reset();
				deferred.reject({type: 'invalid_refresh_token', error: response.responseJSON});
			});
		} else {
			//We do not have any cached token information yet
			googleapi.reset();
			deferred.reject({type: 'no_refresh_token_saved'});
		}

		return deferred.promise();
	},
	reset : function () {
		// Only remove tokens from localStorage
		localStorage.removeItem('expires_at');
		localStorage.removeItem('access_token');
		localStorage.removeItem('refresh_token');
	}
};
