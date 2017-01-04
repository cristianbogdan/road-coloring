/* global ol */

var roadLayer=
    new ol.layer.Vector({
	source: new ol.source.TileVector({
	    format: new ol.format.GeoJSON(),
	    tileGrid: ol.tilegrid.createXYZ({maxZoom: 14}),
	    tilePixelRatio: 16,
	    url: '/roads/{z}/{x}/{y}.json'
	})
	,style:
	new ol.style.Style({
	    stroke: new ol.style.Stroke({
		width: 4,
		color: [0xff,0xff,0,0.3]
	    })
	})
    });

var mapnik= new ol.layer.Tile({
    source: new ol.source.OSM({
	url:'/tiles/{z}/{x}/{y}.png'
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});

var landscape=  new ol.layer.Tile({
    source: new ol.source.OSM({
	url:'http://a.tile.thunderforest.com/landscape/{z}/{x}/{y}.png'
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});


var nav= new MapBrowserNav();

var map = new ol.Map({
    layers: [
	landscape,
	mapnik,
	roadLayer
    ],
    target: 'map',
    view: new ol.View({
	center: ol.proj.fromLonLat(nav.center),
	zoom: nav.zoom,
	rotation:nav.rotation,
	minZoom:7,
	maxZoom:17
    })
});

nav.attachTo(map);

var selectClick = new ol.interaction.Select({
    condition: ol.events.condition.click
});


map.addInteraction(selectClick);

var segments={};
var ways={};
var roads={};
var other=0;

selectClick.on('select', function(e){
    segments={};
    ways={};
    roads={};
    other=0;
    
    selectClick.getFeatures().forEach(function(rd){
	var ref= rd.getProperties().ref;
	if(!ref)
	    ref=rd.getProperties().name;
	if(!ref)
	    ref=rd.getProperties().osm_id.toString();
	var x=segments[ref];
	if(!x){
	    segments[ref]={};
	}
	segments[ref][rd.getProperties().osm_id]=1;
	ways[rd.getProperties().osm_id]=1;
	if(!rd.getProperties().ref && ! rd.getProperties().name)
	    other++;
	else
	    roads[ref]=1;
    });

    var log= selectClick.getFeatures().getLength().toString();
    
    document.getElementById('text').innerHTML=
	Object.keys(segments).reduce(function(partial, key){
	    return partial+ ' '+key+':'+Object.keys(segments[key]).length;
	}, log);

    if(document.querySelector('button[id="save"]'))
	enableSave(e.selected);
});


