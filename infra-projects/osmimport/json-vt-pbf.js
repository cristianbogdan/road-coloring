// attempt to convert GeoJSON tiles to PBF. does not seem to work well so far
// meant to be invoked by json2pbf.sh 

var fs=require('fs')
var vtpbf = require('vt-pbf')
var geojsonVt = require('geojson-vt')

var orig = JSON.parse(fs.readFileSync(0))
var tileindex = geojsonVt(orig)
//console.error(tileindex.getTile(0,0,0));
var tile = tileindex.getTile(0,0,0)

// pass in an object mapping layername -> tile object
var buff = vtpbf.fromGeojsonVt({ 'geojsonLayer': tile ||{features:[]} })
fs.writeFileSync(1, buff)
