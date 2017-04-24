(function() {
	var perfHub = $.connection.perfHub;

	$.connection.hub.logging = true;
	$.connection.hub.start();


	perfHub.client.newMessage = function(message) {
		model.addMessage(message);
	};

	perfHub.client.newCounters = function(results) {
		model.addCounters(results);
	};

	var ChartEntry = function(name) {
		var self = this;

		self.name = name;
		self.chart = new SmoothieChart({ millisPerPixel: 50, labels: { fontSize: 15 } });
		self.timeSeries = new TimeSeries();
		self.chart.addTimeSeries(self.timeSeries, {lineWidth:3,strokeStyle:"#00ff00"});
	};

	ChartEntry.prototype = {
		addValue: function(value) {
			var self = this;

			self.timeSeries.append(new Date().getTime(), value);
		},

		start: function() {
			var self = this;

			self.canvas = document.getElementById(self.name);
			self.chart.streamTo(self.canvas);
		}
	};

	// properties of a 'class'
	var Model = function() {
		var self = this;

		self.message = ko.observable("");
		self.messages = ko.observableArray();
		self.counters = ko.observableArray();
	};

	// behaviour of a 'class'
	Model.prototype = {
		sendMessage: function() {
			var self = this;

			// extract message
			perfHub.server.send(self.message());
			// clean message as its value has just been sent to a server
			self.message("");
		},

		addMessage: function(someString) {
			var self = this;
			// why not to do this way: self.message(someString); ?
			self.messages.push(someString);
		},

		addCounters: function(newCounters) {
			var self = this;
			//self.counters.arrayPushAll(newCounters);

			$.each(newCounters, function(index, updateCounter) {
				var entry = ko.utils.arrayFirst(self.counters(), function(aCounter) {
							return aCounter.name === updateCounter.name;
				});
				if (!entry) {
					entry = new ChartEntry(updateCounter.name);
					self.counters.push(entry);
					entry.start();
				}
				entry.addValue(updateCounter.value);
			});
		}
	};

	var model = new Model();
	$(function() {
		ko.applyBindings(model);
	});
}())