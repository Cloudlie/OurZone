/**
 * Module dependencies.
 */
'use strict';

var superagent = require('superagent');
var superagentCharset = require('superagent-charset')
var cheerio = require('cheerio');
var config = require('../lib/config')();
var wrap = require('co-monk');
var monk = require('monk');
var db = monk(config.mongoUrl);

var parse = require('co-body');
var render = require('../lib/render');
var iconv = require('iconv-lite');

var appledcc_catalogs = wrap(db.get('appledcc_catalog'));
var caolius = wrap(db.get('caoliu'));

// And now... the route definitions
module.exports = function(app, route) {
	// get request
	app.use(route.get('/reptile/getAppled_cc', getAppled_cc));
	app.use(route.get('/reptile', appledList));
	app.use(route.get('/reptile/tool', tool));
	app.use(route.get('/reptile/appledcc_catalog/list', appledList));

	app.use(route.get('/reptile/caoliu/list/:name', caoliuList))
	app.use(route.get('/reptile/getCaoliu', getCaoliu));
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
function* appledList() {
	var infoes = yield appledcc_catalogs.find({}, {
		sort: {
			create_at: 1
		}
	});
	for (var i = 0; i < infoes.length; i++) {
		infoes[i].count = i + 1;
	}

	this.body = yield render('reptile/appled_cc/list', {
		infoes: infoes
	});
}

/**
 * request list page
 */
function* caoliuList(title) {

	var infoes = yield caolius.find({
		title: new RegExp(title),type:4
	}, {
		sort: {
			create_at: 1
		}
	});
	for (var i = 0; i < infoes.length; i++) {
		infoes[i].count = i + 1;
	}

	this.body = yield render('reptile/caoliu/list', {
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
		saveAppled_cc(infos, 0);

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


function saveAppled_cc(infos, i) {
	appledcc_catalogs.insert(infos[i], function(err, doc) {
		if (!err && infos.length > i) {
			saveAppled_cc(infos, ++i)
				//console.log("save success!" + i);
		}
	});
}


function* getCaoliu() {
	console.log("he/reptile/getAppled_cc");
	var infos = [];
	var pageIndex = 1
	var url = "http://www.t66y.com/thread0806.php?fid=5&search=&page=";
	//1:      "http://www.t66y.com/thread0806.php?fid=2&search=&page=";
	//2:       http://www.t66y.com/thread0806.php?fid=15&search=&page=
	//3:       http://www.t66y.com/thread0806.php?fid=4&search=&page=
	//4:       http://www.t66y.com/thread0806.php?fid=5&search=&page=
	reptileCaolius(url, pageIndex, 4, infos);
	console.log(infos.length);

	this.body = infos;
}

function reptileCaolius(url, pageIndex, type, infos) {

	if (parseInt(pageIndex, 10) >= 100) {
		saveCaoliu(infos, 0);

	} else {
		console.log(url + pageIndex);
		superagent = superagentCharset(superagent);
		superagent
			.get(url + pageIndex)
			.charset('gb2312')
			.end(function(err, res) {
				console.log(err);

				//console.log("res");
				if (!err && res) {
					//console.log(res.headers['content-type'])
					//console.log(res.text);//iconv.decode(new Buffer(res.text, "utf8"), 'gbk'));
					//赋值给reptile.text，就会触发回调
					//that.text = res.text
					var $ = cheerio.load(res.text, {
						decodeEntities: false
					});
					var _title = $("#ajaxtable tbody tr.tr3.t_one");

					var caoliu_catalog = {};
					//1:亞洲無碼原創區 ,2:亞洲有碼原創區 ,3:歐美原創區 ,4:動漫原創區 

					//console.log(_title.length);

					_title.each(function(index, item) {
						var $item = $(item);
						//console.log($item.text())
						caoliu_catalog = {};
						//if ($item.text().indexOf('报价') > -1) {
						caoliu_catalog.title = $item.find("td h3 a").text();
						caoliu_catalog.hot = $item.find("td.tal.f10.y-style").text();
						caoliu_catalog.type = type;
						console.log(infos.length + " : " + caoliu_catalog.title);
						caoliu_catalog.href = $item.find("td h3 a").attr("href");
						caoliu_catalog.source = url + (pageIndex);
						caoliu_catalog.author = $item.find("td.tal a.bl").text();
						caoliu_catalog.authorUrl = $item.find("td.tal a.bl").attr("href");
						caoliu_catalog.pubtime = $item.find("td.tal a.f10").text();
						caoliu_catalog.create_at = caoliu_catalog.update_at = new Date;
						//}
						//console.log(applecc_catalog);
						infos.push(caoliu_catalog);
					})
					pageIndex = parseInt(pageIndex, 10) + 1;
					reptileCaolius(url, pageIndex, type, infos);
				} else {
					reptileCaolius(url, pageIndex, type, infos);
				}
			})
	}
}

function saveCaoliu(infos, i) {
	caolius.insert(infos[i], function(err, doc) {
		if (!err && infos.length > i) {
			saveCaoliu(infos, ++i)
				//console.log("save success!" + i);
		}
	});
}