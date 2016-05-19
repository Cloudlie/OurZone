'use strict';

var path = require('path');
var config = require('../lib/config')();
var wrap = require('co-monk');
var monk = require('monk');
var render = require('../lib/render');
var db = monk(config.mongoUrl);

var users = wrap(db.get('users'));

// 需要过滤的文件后缀
var filterSuffix = [
	'.ico', '.js', '.css',
	'.jpg', '.jpeg', '.png',
	'.gif'
];

var filterPath = [
	'/account/login',
	'/account/logout'
]

module.exports = function*(next) {
	// 不处理filterSuffix中包含的文件
	if (filterSuffix.indexOf(path.extname(this.request.url)) !== -1) {
		yield next;
	} else {
		var loginName = this.session.loginName;
		var url = this.request.url;

		if (this.request.url.toLocaleLowerCase().indexOf('/account/') > -1) {
			yield * next;
		} else {

			// 静态文件过滤
			if (loginName) {
				var user = yield users.findOne({
					userName: loginName
				});
				if (user && user.isEnable) {
					this.session.loginName = user.userName;
					this.session.loginUser = user;
				}
				yield * next;
			} else {
				this.redirect('/account/login');
			}
			// just let session record loginname before leave
			//this.session.loginUser = undefined;
		}
	}
};