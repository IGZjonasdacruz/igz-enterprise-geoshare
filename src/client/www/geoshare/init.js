
iris.path = {
	welcome : { js: 'screen/welcome.js', html: 'screen/welcome.html' },
	ui : {
		map : { js: 'ui/map.js', html: 'ui/map.html' },
	},
	resource : {
		user : 'resource/user.js'
	}
};

iris.Resource.prototype.ajax = function(method, path, params) {

	var deferred = $.Deferred();
	var self = this;

	googleapi.getToken().done(function(data) {
		
		var url = geosharecfg.base_uri + self.setting('path') + path;

		iris.log('[iris.Resource.ajax] method[' + method + '] url[' + url + '] access_token[' + data.access_token + ']');

		iris.ajax({
			url: url,
			type: method,
			data: params,
			cache: false,
			dataType: self.setting('type'),
			async: true,
			beforeSend: function(xhr) {
				xhr.setRequestHeader('Authorization', 'Bearer ' + data.access_token)
			}
		}).done(function (data) {
			deferred.resolve(data);
		}).fail(function (jqXHR, textStatus, errorThrown) {
			var err = '[iris.Resource.ajax] ERROR[' + jqXHR.status+ '] textStatus[' + textStatus + '] errorThrown[' + errorThrown + ']';
			iris.log(err);
			
			deferred.reject(err);

			iris.notify(iris.RESOURCE_ERROR, {request: jqXHR, status: textStatus, error: errorThrown});
		});

	}).fail(function (err) {
		iris.log('[iris.Resource.ajax] get access_token ERROR[' + err + ']');
		deferred.reject(err);
	});

	return deferred.promise();
};

function getURLParameter(name) {
	var value = RegExp(name + '=' + '(.+?)(&|$)').exec(location.search);
	if ( value ) {
		return decodeURIComponent(value[1]);
	} else {
		return null;
	}
};

function onReady () {
	iris.noCache('file://', 'localhost');
	iris.enableLog('file://', 'localhost');
	iris.baseUri('geoshare/');

	if ( geoshare.isBrowser ) {
		var accessToken = getURLParameter('at');
		if ( accessToken ) {
			localStorage.access_token = accessToken;
		} else {
			googleapi.reset();
			return document.location.href = 'http://localhost:3000/login';
		}
	}

	iris.welcome(iris.path.welcome.js);
}



//
// Exposes global geoshare object
//
var geoshare = {
	// config : {},
	isBrowser : location.href.indexOf('http://') === 0
};

$(document).on( geoshare.isBrowser ? 'ready' : 'deviceready', onReady);		
