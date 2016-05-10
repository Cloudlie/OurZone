/**
 * Module dependencies.
 */
'use strict';

var config = require('../lib/config')();
var wrap = require('co-monk');
var monk = require('monk');
var db = monk(config.mongoUrl);

var parse = require('co-body');
var render = require('../lib/render');

var posts = wrap(db.get('posts'));

// And now... the route definitions
module.exports = function(app, route) {
    // get request
    app.use(route.get('/index', index));
    app.use(route.get('/', index));
    app.use(route.get('/income', list));
    app.use(route.get('/income/edit', edit));
    app.use(route.get('/income/:id/edit', edit));

    // post request
    app.use(route.post('/income/', update));
    app.use(route.post('/income/:id', update));
    app.use(route.get('/income/:id/delete', remove));
  }
  /**
   *Post Index
   */
function* index() {
  var postList = yield posts.find({});
  this.body = yield render('index', {
    posts: postList,
    loginUser: this.session.loginUser
  });
}

/**
 * Post listing.
 */
function* list() {
  var postList = yield posts.find({});
  var incomeTotal = 0;
  for (var i = postList.length - 1; i >= 0; i--) {
    postList[i].type = parseInt(postList[i].type, 10) === 0 ? "orange" : "cloudlie";
    postList[i].total = parseFloat(postList[i].salary) +
      parseFloat(postList[i].accumulationFund) +
      parseFloat(postList[i].mealAllowance) +
      parseFloat(postList[i].holidayCosts) +
      parseFloat(postList[i].liCai) +
      parseFloat(postList[i].other);
    incomeTotal += postList[i].total;
  };

  this.body = yield render('income/list', {
    posts: postList,
    incomeTotal: incomeTotal
  });
};

/**
 * Show creation form.
 */
function* add() {
  this.body = yield render('income/new');
};

/**
 * Show post :id.
 */
function* show(id) {
  var post = yield posts.findOne({
    _id: id
  });
  if (!post) this.throw(404, 'invalid post id');
  this.body = yield render('income/show', {
    post: post
  });
};

/**
 * Create a post.
 */
function* create() {
  var post = yield parse(this);
  post.created_at = new Date;

  yield posts.insert(post);
  this.redirect('/');
};

/**
 * Show edit form
 */
function* edit(id) {
  var types = [{
    id: 0,
    name: "orange"
  }, {
    id: 1,
    name: "cloudlie"
  }];

  var defaultValue = {
    salary: 6000,
    accumulationFund: 720,
    mealAllowance: 400,
    holidayCosts: 200,
    liCai: 0,
    other: 0
  }

  if (typeof id === "string") {

    var post = yield posts.findOne({
      _id: id
    });
    this.body = yield render('income/edit', {
      types: types,
      post: post,
      defaultValue: defaultValue
    });

  } else {

    this.body = yield render('income/edit', {
      types: types,
      defaultValue: defaultValue
    });

  }



};

/**
 * Update post
 */
function* update(id) {
  var post = yield parse(this);
  var date = new Date;

  if (typeof id === "string") {
    post.update_at = date
    yield posts.updateById(id, post);
  } else {
    post.created_at = date;
    post.update_at = date;

    yield posts.insert(post);
  }

  this.redirect('/income');
};

/**
 * Remove post
 */
function* remove(id) {
  yield posts.remove({
    _id: id
  });
  this.redirect('/income');
};