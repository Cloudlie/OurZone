
/**
 * Module dependencies.
 */
var serve = require('koa-static');
var logger = require('koa-logger');
var route = require('koa-route');
var koa = require('koa');
var app = module.exports = koa();

// middleware

app.use(logger());
app.use(serve(__dirname + '/resource'));

// route middleware
// get request
var routes = require('./routes/routes.js');
app.use(route.get('/index',routes.index));
app.use(route.get('/',routes.index));
app.use(route.get('/income', routes.list));
app.use(route.get('/income/edit', routes.edit));
app.use(route.get('/income/:id/edit', routes.edit));
app.use(route.get('/statistics/moneyStatistics',routes.moneyStatistics));
//app.use(route.get('/income/:id', routes.show));

//post request
app.use(route.post('/income/', routes.update));
app.use(route.post('/income/:id', routes.update));
app.use(route.get('/income/:id/delete', routes.remove));

var apiRoutes = require('./routes/apiRoutes');
app.use(route.get('/api/income/all',apiRoutes.incomeAll));

// listen
app.listen(3000);
console.log('listening on port 3000');