iris.screen(function(self) {

	var appRes = iris.resource(iris.path.resource.app);

	self.create = function() {
		self.tmpl(iris.path.screen.list.html);
		
		var lNow = Ladda.create(self.get('now_btn')[0]);
		var lFurure = Ladda.create(self.get('future_btn')[0]);
		
		self.load(appRes.nearestContacts());

		self.get("now_btn").click(function() {
			lNow.start();
			self.load(appRes.nearestContacts());
			lNow.stop();
		});

		self.get("events").find("a").click(function() {
			lFurure.start();
			jQuery.when(appRes[$(this).data("id")]()).then(
					function(contacts) {
						self.load(contacts);
					},
					function(err) {
						iris.log('Error during retrieving contacts', err);
					}
			).always(function() {
					lFurure.stop();
			});
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