/**
 * Module dependencies.
 */
var koa = require('koa');
var path = require('path');
var fs = require('fs');
var views = require('co-views');
var serve = require('koa-static');
var route = require('koa-route');
var logger = require('koa-logger');
var jsonp = require('koa-jsonp');
var render = require('./lib/render');
var config = require('./lib/config')();
var app = module.exports = koa();

// middleware

app.use(logger());
app.use(serve(__dirname + '/resource'));

/******************************************************
 * Bootstrap routes/api
 * Scan all directory /routes and add to app
 ******************************************************/
var routeFile = null;
var routesPath = path.join(__dirname, 'routes');
fs.readdirSync(routesPath).forEach(function(file) {
	if (file[0] === '.') return;

	routeFile = require(routesPath + '/' + file);
	routeFile(app, route);
});


// listen
app.listen(3000);
console.log('listening on port 3000');