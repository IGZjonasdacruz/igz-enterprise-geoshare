
iris.path = {
	welcome : { js: 'screen/welcome.js', html: 'screen/welcome.html' },
	ui : {
		map : { js: 'ui/map.js', html: 'ui/map.html' },
	},
	resource : {
		user : 'resource/user.js'
	}
};

$(document).on('deviceready', function() {
	iris.noCache('file://');
	iris.enableLog('file://');
	iris.baseUri('geoshare/');
	iris.welcome(iris.path.welcome.js);
});

var BASE_URI = 'http://192.168.160.127:3000/';

iris.Resource.prototype.ajax = function(method, path, params) {

	var deferred = $.Deferred();
	var self = this;

	googleapi.getToken().done(function(data) {
		
		var url = BASE_URI + self.setting('path') + path;

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
