'use strict';

var config = require('../lib/config')();
var wrap = require('co-monk');
var monk = require('monk');
var db = monk(config.mongoUrl);

var parse = require('co-body');
var render = require('../lib/render');

var posts = wrap(db.get('posts'));

module.exports = function(app, route) {
	app.use(route.get('/statistics/moneyStatistics', moneyStatistics));
}

/**
 * show moneyStatistice
 */
function* moneyStatistics() {
  this.body = yield render('/statistics/moneyStatistics', {

  });
}