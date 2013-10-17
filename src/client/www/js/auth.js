window.onload = function() {
	var accessToken = getURLParameter('access_token');
	alert(accessToken)
	alert(window.location)
};

function getURLParameter(name) {
	return decodeURI(
			(RegExp(name + '=' + '(.+?)(&|$)').exec(window.location) || [, null])[1]
			);
}