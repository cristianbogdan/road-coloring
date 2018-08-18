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

var selectedIds=[];

var roadLayer=
    new ol.layer.VectorTile({
	source: new ol.source.VectorTile({
	    format: new ol.format.GeoJSON(),
	    tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
	    tilePixelRatio: 16,
	    url: '/roads/{z}/{x}/{y}.json'
	})
	,style:
	function(f, resolution) {
            if (selectedIds.indexOf(f.getId())!=-1 ) {
          return selectStyle;
        }
        return  defaultStyle ;
      }
    });

var mapnik= new ol.layer.Tile({
    title:"Calitatea drumurilor",
    source: new ol.source.OSM({
	url:'/tiles/{z}/{x}/{y}.png'
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});

var landscape=  new ol.layer.Tile({
    title: 'Landscape',
    type: 'base',
    source: new ol.source.OSM({
	url:'http://a.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey='+thunderforestKey
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});

var searchResults= new ol.Collection();

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
  var selectedFeature = map.forEachFeatureAtPixel(e.pixel, function(f) {
    return f;
  });
    if(selectedFeature){
	var x;
	if((x=selectedIds.indexOf(selectedFeature.getId()))!=-1 && e.originalEvent.shiftKey)
	{
	    selectedIds.splice(x,1);
	    selected.splice(x,1);
	}
	else{
	    if(!e.originalEvent.shiftKey)
	    {
		selectedIds.length=0;
		selected.length=0;
	    }
	    selectedIds.push(selectedFeature.getId());
	    selected.push(selectedFeature);
	    
	}

	segments={};
	ways={};
	roads={};
	other=0;
	selected.forEach(treatSelect);
	
	var log= ""+selectedIds.length;
	if(document.getElementById('text'))
	    document.getElementById('text').innerHTML=
	    Object.keys(segments).reduce(function(partial, key){
		return partial+ ' '+key+':'+Object.keys(segments[key]).length;
	    }, log);
	
	//if(document.querySelector('button[id="save"]'))
	    enableSave(true);
    }
    roadLayer.getSource().changed();
}, undefined, function(l) { return l == roadLayer; });


var selectClick = new ol.interaction.Select({
    condition: ol.events.condition.click
});


//map.addInteraction(selectClick);

var selected=[];
var segments={};
var ways={};
var roads={};
var other=0;

var treatSelect= function(rd){
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
};

selectClick.on('select', function(e){
    if(selectClick.getFeatures().getLength()==0 && selected.length>0)
    {
	selectClick.getFeatures().extend(selected);
	return;
    }
    selected=selectClick.getFeatures().getArray().slice(0);
    
    segments={};
    ways={};
    roads={};
    other=0;
    
    selectClick.getFeatures().forEach(treatSelect);

    var log= selectClick.getFeatures().getLength().toString();
    
    document.getElementById('text').innerHTML=
	Object.keys(segments).reduce(function(partial, key){
	    return partial+ ' '+key+':'+Object.keys(segments[key]).length;
	}, log);

    if(document.querySelector('button[id="save"]'))
	enableSave(e.selected);
});


