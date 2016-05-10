'use strict';

var config = require('../lib/config')();
var wrap = require('co-monk');
var monk = require('monk');
var db = monk(config.mongoUrl);

var parse = require('co-body');
var render = require('../lib/render');

var users = wrap(db.get('users'));

module.exports = function(app, route) {
	// get repuest
	app.use(route.get('/account/login', indexLogin));
	app.use(route.get('/account/reg', indexReg));

	// post request
	app.use(route.post('/account/login', login));
	app.use(route.post('/account/reg', reg));
}

// login index
function* indexLogin() {
	this.body = yield render('/account/login');
}

// request login page
function* login() {

	var loginUser = yield parse(this);

	var user = yield users.findOne({
		userName: loginUser.username,
		password: loginUser.password
	});

	if (user && user.isEnable) {
		this.redirect('/');
	} else {
		this.body = yield render('/account/login', {
			user: loginUser,
			errmsg: "用户名或密码错误。"
		});
	}
}

// request reg page
function* indexReg() {
	this.body = yield render('/account/reg');
}

function* reg() {
	var regUser = yield parse(this);
	var userInfo = {};
	var user = yield users.findOne({
		userName: regUser.username
	});
	if (user && user.isEnable) {
		this.body = yield render('/account/reg', {
			errmsg: "当前用户名已存在，请重新注册。"
		});
	} else {

		var date = new Date;

		userInfo.userName = regUser.username;
		userInfo.password = regUser.password;
		userInfo.isEnable = true;
		userInfo.isDelete = false;
		userInfo.create_at = date;
		userInfo.update_at = date;

		yield users.insert(userInfo);

		this.redirect('/');
	}
}