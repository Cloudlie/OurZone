var BookLib_local = process.env.MONGOLAB_URI || "mongodb://localhost:27017/ourZone";
var BookLib_staging = process.env.MONGOLAB_URI || "mongodb://localhost:27017/ourZone";
var BookLib_prod = process.env.MONGOLAB_URI || "mongodb://localhost:27017/ourZone";


var config = {
	local: {
		mode: 'local',
		port: 3000,
		mongoUrl:  "localhost:27017/ourZone"
	},
	staging: {
		mode: 'staging',
		port: 3005,
		mongoUrl:  "localhost:27017/ourZone"
	},
	prod: {
		mode: 'prod',
		port: process.env.PORT || 3010,
		mongoUrl:  "localhost:27017/ourZone"
	},
}

module.exports = function(mode) {
	//return config[mode || process.argv[2] || 'local'] || config.local;
	return config.local;
};