iris.ui(function(self) {

	var appRes = iris.resource(iris.path.resource.app);
	var actual = 0;
	var items = [];
	var now = new Date().getTime();
	var minTime = now - 3 * 60 * 60 * 1000;
	var maxTime = now + 24 * 60 * 60 * 1000;

	self.create = function() {

		var me = appRes.me();

		self.tmpl(iris.path.ui.map_slider.html);

		items.push({
			text: 'now',
			time: now,
			data: me
		});

		jQuery.when(appRes.events().then(
				function(events) {
					events.forEach(function(event) {
						items.push({
							text: (new Date(event.start)).toLocaleTimeString(iris.locale()) + " " + (new Date(event.start)).toLocaleDateString(iris.locale()),
							time: event.start,
							data: event
						});
					});
				},
				function(err) {
					iris.log('Error during retrieving events', err);
				}
		).always(function() {
				self.render();
				self.get("next").click(function() {
					if (actual < items.length -1) {
						actual++;
						self.render();
					}
				});
				self.get("previous").click(function() {
					if (actual > 0) {
						actual--;
						self.render();
					}
				});
		}));
		
	};

	self.render = function() {
		if (items.length > 0 && actual < items.length) {
			self.get('progress-bar')
					.attr('aria-valuetransitiongoal', 100 * (items[actual].time - minTime) / (maxTime - minTime))
					.progressbar({'text': items[actual].text, display_text: 'fill'});

		}
		
		self.get("previous").toggleClass('disabled', actual <= 0);
		self.get("next").toggleClass('disabled', actual >= items.length - 1);
	};


}, iris.path.ui.map_slider.js);
