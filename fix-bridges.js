/*
bridges.js can be generated like
(echo "bridges=";psql -t -A -d gis -f bridges.sql;echo ";")>data/bridges.js 
*/

var request = require('sync-request');
require('./data/bridges.js');
require('../osm_account.js');

console.log(password);
var root= 'http://cristi5.ddns.net/mapedit/?username=';
bridges.forEach(function(road){
    var uri=root+username;
    uri+='&password='+password;
    uri+='&smoothness='+road.smoothness;
    uri+='&surface='+road.surface;
    uri+='&comment='+encodeURIComponent(road.ref+' smoothness fix');
    uri+='&surface_survey='+encodeURIComponent(road.surface_survey);
    road.ids.split(",").forEach(function(way){
	uri+='&way='+way;
    });
    console.log(uri);
    
    console.log(request('GET', uri).body.toString('utf-8'));
});

	
