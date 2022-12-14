/* global ol */

var selectStyle =
[
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: 'white',
        width:  5
      })
    }),
    new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: [0, 153, 255, 1],
        width: 3
      })
    })
  ];

var defaultStyle=	new ol.style.Style({
	    stroke: new ol.style.Stroke({
		width: 6,
		color: [0xff,0xff,0xff,0.01]
	    })
	})
;

var selectedIds=[]

var osmids=[] //ret.map(d=>d.osm_id)

var roadLayer=
    new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
	    format: new ol.format.GeoJSON(),
	    tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
	    tilePixelRatio: 16,
	    url: '/infraVector/{z}/{x}/{y}.json'
	})
	,style:
	function(f, resolution) {
	//             if (selectedIds.indexOf(f.getId())!=-1 ) 
        //        return selectStyle;

	    
             if(ways[f.getProperties().osm_id])
	 	 return selectStyle;	
	
	     return  defaultStyle ;
      }
    });

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

var searchResults= new ol.Collection();


// not really needed for infra-projects but we keep it just in case 
var searchSource = new ol.source.Vector();

var searchLayer = new ol.layer.Vector({
    source: searchSource,
    style: 	new ol.style.Style({
	    stroke: new ol.style.Stroke({
		width: 6,
		color: [255, 255, 0, 0.5]
	    })
    })
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
		searchLayer,
		roadLayer
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
    document.getElementById('coords').innerHTML=(Math.round(lonlat[1]*10000)/10000)+", "+(Math.round(lonlat[0]*10000)/10000);

  var selectedFeature = map.forEachFeatureAtPixel(e.pixel, function(f) {
    return f;
  });
    if(selectedFeature){
	if(ways[selectedFeature.getProperties().osm_id] && e.originalEvent.shiftKey ){
	   delete ways[selectedFeature.getProperties().osm_id]
	   setCurrentText();
        } else{
	  if(!e.originalEvent.shiftKey){
		oldways=ways;
		ways={}
		document.getElementById("undo").disabled=oldways.length>0;
	     }
	     else
		document.getElementById("undo").disabled=true;

 	  ways[selectedFeature.getProperties().osm_id]=selectedFeature.getProperties();
	  setCurrentText(selectedFeature);	
	}
	
	resetSelected();
	Object.keys(ways).forEach(s=>treatSelect(ways[s]));
	
	makeMessage();	
    }
    roadLayer.getSource().changed();
}, undefined, function(l) { return l == roadLayer; });

var undoSelection=function(){
    ways=oldways;
    resetSelected();				
    Object.keys(ways).forEach(s=>treatSelect(ways[s]));
    makeMessage();	
    document.getElementById("undo").disabled=true;	
    roadLayer.getSource().changed();
}

var resetSelected=function(){
	segments={};
	roads={};
	other=0;
}

var makeMessage=function(){
    	var log= ""+Object.keys(ways).length;
	if(document.getElementById('text'))
	 document.getElementById('text').innerHTML=
	    Object.keys(segments).reduce(function(partial, key){
		return partial+ ' '+key+':'+Object.keys(segments[key]).length;
	    }, log);
	
	//if(document.querySelector('button[id="save"]'))
    //enableSave(true);
}

/*var selectClick = new ol.interaction.Select({
    condition: ol.events.condition.click
});

*/
//map.addInteraction(selectClick);


var selected=[];
var segments={};
var ways={};
var oldways;
var roads={};
var other=0;

var treatSelect= function(rdprop){
    var ref= rdprop.ref;
    if(!ref)
	ref=rdprop.name;
    if(!ref)
	ref=rdprop.osm_id.toString();
    var x=segments[ref];
    if(!x){
	segments[ref]={};
    }
    segments[ref][rdprop.osm_id]=rdprop.len?rdprop.len:1;
    ways[rdprop.osm_id]=rdprop;
    if(!rdprop.ref && ! rdprop.name)
	other++;
    else
	roads[ref]=1;
};

