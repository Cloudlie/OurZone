'use strict';

var config = require('../lib/config')();
var wrap = require('co-monk');
var monk = require('monk');
var db = monk(config.mongoUrl);

var parse = require('co-body');
var render = require('../lib/render');

var posts = wrap(db.get('posts'));

module.exports = function(app, route) {
  // get request
  app.use(route.get('/expend/list', function *() {
    var books = yield Book.find({});
    this.body = yield render('book/books.html', {'books': books});
  }));

}