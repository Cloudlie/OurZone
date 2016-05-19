/**
 * Module dependencies.
 */
var parse = require('co-body');
var render = require('./lib/render');

// Set up monk
var monk = require('monk');
var wrap = require('co-monk');
var db = monk('localhost:27017/ourZone');

// Wrap monk in generator goodness
var posts = wrap(db.get('posts'));

// And now... the route definitions

/**
 *Post Index
 */
module.exports.index = function* index() {
  var postList = yield posts.find({});
  this.body = yield render('index', {
    posts: postList
  });
}

/**
 * Post listing.
 */
module.exports.list = function* list() {
  var postList = yield posts.find({});
  for (var i = postList.length - 1; i >= 0; i--) {
    postList[i].type = parseInt(postList[i].type, 10) === 0 ? "orange" : "cloudlie";
    postList[i].total = parseFloat(postList[i].salary) +
      parseFloat(postList[i].accumulationFund) +
      parseFloat(postList[i].mealAllowance) +
      parseFloat(postList[i].holidayCosts) +
      parseFloat(postList[i].liCai) +
      parseFloat(postList[i].other);
  };

  this.body = yield render('income/list', {
    posts: postList
  });
};

/**
 * Show creation form.
 */
module.exports.add = function* add() {
  this.body = yield render('income/new');
};

/**
 * Show post :id.
 */
module.exports.show = function* show(id) {
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
module.exports.create = function* create() {
  var post = yield parse(this);
  post.created_at = new Date;

  yield posts.insert(post);
  this.redirect('/');
};

/**
 * Show edit form
 */
module.exports.edit = function* edit(id) {
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

  console.log(defaultValue);
  console.log(typeof id)
  if (typeof id === "string") {

    console.log(0);
    var post = yield posts.findOne({
      _id: id
    });
    this.body = yield render('income/edit', {
      types: types,
      post: post,
      defaultValue: defaultValue
    });

  } else {

    console.log(1);
    this.body = yield render('income/edit', {
      types: types,
      defaultValue: defaultValue
    });

  }



};

/**
 * Update post
 */
module.exports.update = function* update(id) {
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

  this.redirect('/');
};

/**
 * Remove post
 */
module.exports.remove = function* remove(id) {
  yield posts.remove({
    _id: id
  });
  this.redirect('/');
};