
iris.path = {
	screen: {
		welcome: {js: 'screen/welcome.js', html: 'screen/welcome.html'},
		list: {js: 'screen/list.js', html: 'screen/list.html'},
		map: {js: 'screen/map.js', html: 'screen/map.html'}
	},
	ui: {
		list: {js: 'ui/list.js', html: 'ui/list.html'},
		list_item: {js: 'ui/list_item.js', html: 'ui/list_item.html'},
		notify: {js: 'ui/notify.js', html: 'ui/notify.html'},
		notify_item: {js: 'ui/notify_item.js', html: 'ui/notify_item.html'},
		shareMode: {js: 'ui/shareMode.js', html: 'ui/shareMode.html'},
		shareMode_item: {js: 'ui/shareMode_item.js', html: 'ui/shareMode_item.html'},
		hangout: {js: 'ui/hangout.js', html: 'ui/hangout.html'}
	},
	resource: {
		app: 'resource/application.js'
	}
};

iris.locale(
		"en", {
	dayNames: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
	monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
	dateFormat: "m/d/Y h:i:s",
	currency: {
		formatPos: "s n",
		formatNeg: "(s n)",
		decimal: ".",
		thousand: ",",
		precision: 2,
		symbol: "$"
	},
	number: {
		decimal: ".",
		thousand: ",",
		precision: 0
	}
}
);

iris.locale(
		"es", {
	dayNames: ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
	monthNames: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
	dateFormat: "d/m/Y H:i:s",
	currency: {
		formatPos: "n",
		formatNeg: "-n",
		decimal: ",",
		thousand: ".",
		precision: 2
	}
}
);

iris.locale('en');

iris.Resource.prototype.ajax = function(method, path, params) {

	var deferred = $.Deferred();
	var self = this;

	googleapi.getToken().done(function(data) {

		var base_uri = self.setting('base_uri') || geosharecfg.base_uri;
		var url = base_uri + path;

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
		}).done(function(data) {
			deferred.resolve(data);
		}).fail(function(jqXHR, textStatus, errorThrown) {
			var err = '[iris.Resource.ajax] ERROR[' + jqXHR.status + '] textStatus[' + textStatus + '] errorThrown[' + errorThrown + ']';
			iris.log(err);

			deferred.reject(err);

			iris.notify(iris.RESOURCE_ERROR, {request: jqXHR, status: textStatus, error: errorThrown});
		});

	}).fail(function(err) {
		iris.log('[iris.Resource.ajax] get access_token ERROR[' + err + ']');
		deferred.reject(err);
	});

	return deferred.promise();
};

function onReady() {
	iris.noCache('file://', 'localhost');
	iris.enableLog('file://', 'localhost');
	iris.baseUri('geoshare/');

	iris.on(iris.RESOURCE_ERROR, function(request, textStatus, errorThrown) {
		iris.notify('notify', {msg: '<strong>Sorry</strong>, an unexpected error has occurred! Please, try again later...', type: 'danger'});
		iris.log("resource error", request, textStatus, errorThrown);
	});

	window.onorientationchange = function() {
		//Need at least 800 milliseconds
		setTimeout(function resize() {
			iris.log('On resize');
			iris.notify('resize');
		}, 1000);
	}

	if (geoshare.isBrowser) {
		var hash = document.location.hash;
		if (hash && hash.indexOf('#at=') == 0) {
			var accessToken = hash.substr(4);
			localStorage.access_token = accessToken;
			document.location.hash = '#';
		} else {
			googleapi.reset();
			return document.location.href = 'http://localhost:3000/login';
		}
	}

	iris.welcome(iris.path.screen.welcome.js);

	document.addEventListener("backbutton", function() {
		if (!document.location.hash) {
			// Only shows exit confirm in welcome screen
			showExitConfirm();
		} else {
			history.back();
		}
	}, false);
}

function showExitConfirm() {
	navigator.notification.confirm(
			'Do you really want to exit?', // message
			exitFromApp,
			'Exit', // title
			'Cancel,OK' // buttonLabels
			);
}

function exitFromApp(buttonIndex) {
	if (buttonIndex == 2) {
		navigator.app.exitApp();
	}
}


//
// Exposes global geoshare object
//
var geoshare = {
	isBrowser: location.href.indexOf('http://') === 0
};

$(document).on(geoshare.isBrowser ? 'ready' : 'deviceready', onReady);