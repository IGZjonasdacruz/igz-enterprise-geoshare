
iris.path = {
	welcome : { js: "screen/welcome.js", html: "screen/welcome.html" }
};


$(window.document).ready(
	function () {
		iris.baseUri("geoshare/");
		iris.welcome(iris.path.welcome.js);
	}
);
