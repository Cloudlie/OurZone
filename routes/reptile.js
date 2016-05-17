/**
 * Module dependencies.
 */
'use strict';

var superagent = require('superagent');
var cheerio = require('cheerio');
var config = require('../lib/config')();
var wrap = require('co-monk');
var monk = require('monk');
var db = monk(config.mongoUrl);

var parse = require('co-body');
var render = require('../lib/render');

var appledcc_catalogs = wrap(db.get('appledcc_catalog'));

// And now... the route definitions
module.exports = function(app, route) {
	// get request
	app.use(route.get('/reptile/getAppled_cc', getAppled_cc));
	app.use(route.get('/reptile', list));
	app.use(route.get('/reptile/tool', tool));
	app.use(route.get('/reptile/list', list));
}

/**
 * request tool page
 */
function* tool() {
	this.body = yield render("reptile/appled_cc/tool");
}

/**
 * request list page
 */
function* list() {
	var infoes = yield appledcc_catalogs.find({},{sort: {create_at: 1}});
	for (var i = 0; i < infoes.length; i++) {
		infoes[i].count = i + 1;
	}

	this.body = yield render('reptile/appled_cc/list', {
		infoes: infoes
	});
}


/**
 * start reptile appled.cc
 */
function* getAppled_cc() {
	console.log("/reptile/getAppled_cc");
	var infos = [];
	var pageIndex = 1
	var url = "http://appled.cc/board/price/page/";
	reptileAppled_cc(url, pageIndex, infos);
	console.log(infos.length);

	// for (var i = infos.length - 1; i >= 0; i--) {
	// 	console.log(infos[i]);
	// 	appledcc_catalogs.insert(infos[i]);
	// };

	this.body = infos;
}

function reptileAppled_cc(url, pageIndex, infos) {
	//console.log(infos.length);

	//setTimeout(function() {
	if (parseInt(pageIndex, 10) >= 42) {
		save(infos, 0);

	} else {
		console.log(url + pageIndex);
		superagent
			.get(url + pageIndex)
			.withCredentials()
			.end(function(err, res) {

				if (res) {

					//赋值给reptile.text，就会触发回调
					//that.text = res.text
					var $ = cheerio.load(res.text);
					var _title = $("#icnt .clearfix .threads .title a");

					var applecc_catalog = {};

					console.log(_title.length);

					_title.each(function(index, item) {
						var $item = $(item);
						//console.log($item.text())
						applecc_catalog = {};
						//if ($item.text().indexOf('报价') > -1) {
						applecc_catalog.title = $item.text();
						applecc_catalog.href = $item.attr("href");
						applecc_catalog.source = url + (pageIndex);
						applecc_catalog.author = $item.parent().parent().find(".name").text();
						applecc_catalog.pubtime = $item.parent().parent().find(".pubtime").text();
						applecc_catalog.create_at = applecc_catalog.update_at = new Date;
						//}
						//console.log(applecc_catalog);
						infos.push(applecc_catalog);
					})
					pageIndex = parseInt(pageIndex, 10) + 1;
					reptileAppled_cc(url, pageIndex, infos);
				}
			})
	}
} //, 100);


function save(infos, i) {
	appledcc_catalogs.insert(infos[i], function(err, doc) {
		if (!err && infos.length > i) {
			save(infos, ++i)
				//console.log("save success!" + i);
		}
	});
}