/* global ol */

var zoom = 7;
var center = [25, 46];
var rotation = 0;

if (window.location.hash !== '') {
  // try to restore center, zoom-level and rotation from the URL                                                                                                                                                   
  var hash = window.location.hash.replace('#map=', '');
  var parts = hash.split('/');
  if (parts.length>=3) {
    zoom = parseInt(parts[0], 10);
    center = [
      parseFloat(parts[2]),
      parseFloat(parts[1])
    ];
    rotation= 0;
    if(parts.length===4)
        rotation = parseFloat(parts[3]);
  }
}

var yellow= new ol.style.Style({
    stroke: new ol.style.Stroke({
	width: 5,
	color: [0xff,0xff,0,0.2]
    })
});

var nospeed=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: 2,
	    color: [0xff,0,0,0.8]
	})
    });

var nosurface=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: 2,
	    color: [0, 0xff,0, 1]
	})
    });

var noNothing=new ol.style.Style({
    stroke: new ol.style.Stroke({
	    width: 2,
	    lineDash:[10,10],
	    color: [0, 0xff,0,1]
	})
    });

var styleFunction = function(feature, resolution) {
    return feature.getProperties().maxspeed?(feature.getProperties().surface?[yellow]:[nosurface]):(feature.getProperties().surface?[nospeed]:[nospeed, noNothing]);
};

var roads=
	new ol.layer.Vector({
	    source: new ol.source.TileVector({
		format: new ol.format.GeoJSON(),
		tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
		tilePixelRatio: 16,
		url: '/roads/{z}/{x}/{y}.json'
		
	    }),
	    style: styleFunction
	});


var speed=	new ol.layer.Vector({
    source: new ol.source.TileVector({
	format: new ol.format.GeoJSON(),
	tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
	tilePixelRatio: 16,
	url: '/speed/{z}/{x}/{y}.json'	
    }),
    style: styleFunction
});


var selectClick = new ol.interaction.Select({
    condition: ol.events.condition.click
});

var mapnik= new ol.layer.Tile({
    source: new ol.source.OSM({
	url:'http://a.tile.thunderforest.com/landscape/{z}/{x}/{y}.png'
//	url:'http://a.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png'
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});

var map = new ol.Map({
    layers: [
	mapnik,
	roads
//,
//	roads
	
    ],
    target: 'map',
    view: new ol.View({
	center: ol.proj.fromLonLat(center),
	zoom: zoom,
	minZoom:7,
	maxZoom:17
    })
});

map.addInteraction(selectClick);

selectClick.on('select', function(event){
    document.getElementById('text').innerHTML=selectClick.getFeatures().getArray().map(function(rd){
	return rd.getProperties().highway +' <a href=\"http://openstreetmap.org/way/'+rd.getProperties().osm_id+'\" target="OSM">'+(rd.getProperties().ref?rd.getProperties().ref:(rd.getProperties().name?rd.getProperties().name:rd.getProperties().osm_id))
	    +"</a> [<a href=\"http://openstreetmap.org/edit?way="+rd.getProperties().osm_id+"\" target=\"OSMEdit\">edit-id</a>] "
	    +"</a> [<a href=\"http://openstreetmap.org/edit?editor=potlatch2&way="+rd.getProperties().osm_id+"\" target=\"OSMEdit\">edit-potlach</a>]"
	    +" maxspeed: "
	    +rd.getProperties().maxspeed
	    +", surface: "+rd.getProperties().surface;
	
    }).join(", ");
});


var shouldUpdate = true;
var view = map.getView();
var updatePermalink = function() {
  if (!shouldUpdate) {
    // do not update the URL when the view was changed in the 'popstate' handler                                                                                                                                   
    shouldUpdate = true;
    return;
  }

  var center = ol.proj.toLonLat(view.getCenter());
  var hash = '#map=' +
      view.getZoom() + '/' +
      Math.round(center[1] * 1000) / 1000 + '/' +
      Math.round(center[0] * 1000) / 1000 + '/' +
      view.getRotation();
  var state = {
    zoom: view.getZoom(),
    center: view.getCenter(),
    rotation: view.getRotation()
  };
  window.history.pushState(state, 'map', hash);
};

map.on('moveend', updatePermalink);

// restore the view state when navigating through the history, see                                                                                                                                                 
// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate                                                                                                                                 
window.addEventListener('popstate', function(event) {
  if (event.state === null) {
    return;
  }
  map.getView().setCenter(ol.proj.fromLonLat(event.state.center));
  map.getView().setZoom(event.state.zoom);
  map.getView().setRotation(event.state.rotation);
  shouldUpdate = false;
});










