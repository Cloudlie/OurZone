/**
 * Module dependencies.
 */
var parse = require('co-body');
var render = require('../lib/render');

// Set up monk
var monk = require('monk');
var wrap = require('co-monk');
var db = monk('localhost:27017/ourZone');

// Wrap monk in generator goodness
var posts = wrap(db.get('posts'));

// And now... the route definitions

module.exports.incomeAll = function* incomeAll() {
	var postList = yield posts.find({});

	console.log(1);
	var result = {},
		orange = [],
		cloudlie = [],
		post = {},
		data = [{
			name: 'orange',
			value: orange,
			color: '#aad0db',
			line_width: 2
		}, {
			name: 'cloudlie',
			value: cloudlie,
			color: '#f68f70',
			line_width: 2
		}];

	result.labels = [];

	// create labels
	for (var i = 0; i <= postList.length - 1; i++) {
		post = postList[i];
		if (post.type === "0") {
			orange.push(post.salary);
		} else {
			cloudlie.push(post.salary);
		}

		if (result.labels.indexOf(post.time) === -1) {
			result.labels.push(post.time);
		}
	};

	result.data = data;
	console.log(2);
	this.body = result;
}