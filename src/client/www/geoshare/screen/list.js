iris.screen(function(self) {

	var appRes = iris.resource(iris.path.resource.app);

	self.create = function() {
		self.tmpl(iris.path.screen.list.html);
		
		self.load(self.get("now_btn"), self.get("future_btn"), appRes.nearestContacts());
		
		self.get("now_btn").click(function() {
			self.load(self.get("now_btn"), self.get("future_btn"), appRes.nearestContacts());
		});

		self.get("future_btn").click(function() {
			jQuery.when(appRes.futureNearestContacts()).then(
					function(contacts) {
						self.load(self.get("future_btn"), self.get("now_btn"), contacts, true);
					},
					function(err) {
						iris.log('Error during retrieving contacts', err);
					}
			);
		});

		self.render();
	};

	self.load = function(active, inactive, contacts, isFuture) {
		self.reset();
		self.ui("contacts", iris.path.ui.list.js, {contacts: contacts, isFuture: isFuture || false});
		active.addClass('active');
		inactive.removeClass('active');
	};

	self.render = function() {

	};

	self.reset = function() {
		self.destroyUIs('contacts');
		return self;
	};

}, iris.path.screen.list.js);
