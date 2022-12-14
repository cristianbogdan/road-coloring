/* global ol */

var mapnik= new ol.layer.Tile({
    title:"Calitatea drumurilor",
    source: new ol.source.OSM({
	url:'/infraGraphic/{z}/{x}/{y}.png'
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});

var landscape=  new ol.layer.Tile({
    title: 'Landscape',
    type: 'base',
    source: new ol.source.OSM({
	url:'https://a.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey='+thunderforestKey
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});


var nav= new MapBrowserNav();

var map = new ol.Map({
    layers: [
	   new ol.layer.Group({
                'title': 'Base maps',
                layers: [
		    landscape
		]
	   }),
	new ol.layer.Group({
            'title': 'Overlays',
	    layers: [
		mapnik,
//		searchLayer,
//		roadLayer
	    ]})
    ],
    target: 'map',
    view: new ol.View({
	center: ol.proj.fromLonLat(nav.center),
	zoom: nav.zoom,
	rotation:nav.rotation,
	minZoom:7,
	maxZoom:18
    })
});

    var layerSwitcher = new ol.control.LayerSwitcher({
        tipLabel: 'Légende' // Optional label for button
    });
    map.addControl(layerSwitcher);

nav.attachTo(map);


map.on('singleclick', function(e) {
    var lonlat=ol.proj.transform(e.coordinate, 'EPSG:3857', 'EPSG:4326');
//    document.getElementById('coords').innerHTML=(Math.round(lonlat[1]*10000)/10000)+", "+(Math.round(lonlat[0]*10000)/10000);

/*  var selectedFeature = map.forEachFeatureAtPixel(e.pixel, function(f) {
    return f;
  });*/
}, undefined, function(l) { return l == roadLayer; });

