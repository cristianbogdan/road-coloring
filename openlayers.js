/* global ol */

var roads=
	new ol.layer.Vector({
	    source: new ol.source.TileVector({
		format: new ol.format.TopoJSON(),
		tileGrid: ol.tilegrid.createXYZ({maxZoom: 13}),
		tilePixelRatio: 16,
		url: 'http://standup.csc.kth.se:8081/roads/{z}/{x}/{y}.topojson'
		
	    }),
	    style:
	    new ol.style.Style({
		stroke: new ol.style.Stroke({
		    width: 8,
		    color: [0xff,0xff,0,0.3]
		})
	    })
		});

var selectClick = new ol.interaction.Select({
    condition: ol.events.condition.click
});

var mapnik= new ol.layer.Tile({
    source: new ol.source.OSM({
	url:'http://standup.csc.kth.se/tiles/{z}/{x}/{y}.png'
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});

var map = new ol.Map({
    layers: [
	mapnik,
	roads
    ],
    target: 'map',
    view: new ol.View({
	center: ol.proj.fromLonLat([25, 46]),
	zoom: 7,
	minZoom:7,
	maxZoom:17
    })
});

map.addInteraction(selectClick);

selectClick.on('select', function(){
    var segments={};
    var log= 'Total: '+selectClick.getFeatures().getLength();
    
    selectClick.getFeatures().forEach(function(rd){
	var x=segments[rd.getProperties().ref.trim()];
	if(!x){
	    segments[rd.getProperties().ref.trim()]={};
	}
	segments[rd.getProperties().ref.trim()][rd.getProperties().osm_id]=1;
    });

    document.getElementById('text').innerHTML=
	Object.keys(segments).reduce(function(partial, key){
	    return partial+ ' '+key+':'+Object.keys(segments[key]).length;
	}, log);
});
