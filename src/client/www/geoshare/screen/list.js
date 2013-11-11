iris.screen(function(self) {

	var appRes = iris.resource(iris.path.resource.app);

	self.create = function() {
		self.tmpl(iris.path.screen.list.html);

		self.ui("contacts", iris.path.ui.list.js);
		self.get("now_btn").click(function() {
			$(this).addClass('active');
			self.get("future_btn").removeClass('active');
		});

		self.get("future_btn").click(function() {
			$(this).addClass('active');
			self.get("now_btn").removeClass('active');
			jQuery.when(appRes.futureNearestContacts()).then(
					function(futureNearestContacts) {
						self.reset();
					},
					function (err) {
						iris.log('Error during futureNearestContacts retrieving', err);
					}
			);
		});

		self.render();


	};

	self.render = function() {

	};

	self.reset = function() {
		self.destroyUIs('contacts');
		return self;
	};

}, iris.path.screen.list.js);
