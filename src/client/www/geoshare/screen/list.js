iris.screen(function(self) {

	var appRes = iris.resource(iris.path.resource.app);

	self.create = function() {
		self.tmpl(iris.path.screen.list.html);

		self.load(appRes.nearestContacts());

		self.get("now_btn").click(function() {
			self.load(appRes.nearestContacts());
		});

		self.get("events").find("a").click(function() {
			jQuery.when(appRes[$(this).data("id")]()).then(
					function(contacts) {
						self.load(contacts);
					},
					function(err) {
						iris.log('Error during retrieving contacts', err);
					}
			);
		});

		self.render();
	};

	self.load = function(contacts) {
		self.reset();
		self.ui("contacts", iris.path.ui.list.js, {contacts: contacts});
	};

	self.render = function() {

	};

	self.reset = function() {
		self.destroyUIs('contacts');
		return self;
	};

}, iris.path.screen.list.js);