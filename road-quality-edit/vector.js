/* global ol */
try { MAP_ROOT }catch(e) {
    MAP_ROOT="";
}

(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                         m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-38702438-2', 'auto');
ga('send', 'pageview');

var iconFeatures=[];

var points={};
function punctCritic(data){
    var columns={};
    data.feed.entry.forEach(function(e){
	var line= e.title.$t.substring(1);	

	if(line=="1")	{
	    columns[e.title.$t[0]]=e.content.$t.toLowerCase();
	    return;
	}

	if(!points[line])
	    points[line]={};
	
	points[line]=points[line] || {};
	points[line][columns[e.title.$t[0]]]=e.content.$t;
    });
    
    
    
    
    Object.keys(points).forEach(function(k){
	var pt= points[k];
	var crds= pt.coordonate.split(',');
	pt.geometry= new ol.geom.Point(ol.proj.transform([+(crds[1]), +(crds[0])], 'EPSG:4326',     
							 'EPSG:3857'));
	iconFeatures.push(new ol.Feature(pt));
    });
    
    
    
    var vectorSource = new ol.source.Vector({
	features: iconFeatures //add an array of features
    });
    
    var iconStyle = new ol.style.Style({
	image: new ol.style.Icon(/** @type {olx.style.IconOptions} */ ({
	    anchor: [0.5, 1],
	    //      anchorOrigin: 'bottomLeft',
	    //    anchorXUnits: 'pixels',
	    //    anchorYUnits: 'pixels',
	    opacity: 1,
	    scale:0.15,
	    src: MAP_ROOT+'/maps/images/pin.png'
	}))
    });
    
    
    var icons = new ol.layer.Vector({
	source: vectorSource,
	style: iconStyle
    });    
    map.addLayer(icons);
}




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


var wdth= 4;
var yellow= new ol.style.Style({
    stroke: new ol.style.Stroke({
	width: 5,
	color: [0xff,0xff,0,1]
    })
});

var transp= new ol.style.Style({
    stroke: new ol.style.Stroke({
	width: 20,
	color: [0xff,0xff,0xff,0.01]
    })
});

var blue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0,0,0xff, 1]
	})
});


var lightblue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x1e,0x90,0xff, 1]
	})
});

var red=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0xff,0,0, 1]
	})
});

var lightred=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0xf0,80,80, 1]
	})
});

var bridge=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth+3,
	    color: [0,0,0, 1]
	})
});

function cName(name){
return new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0,0,0xff, 1]
	})
	    ,text:new ol.style.Text({
		text:name
//,		textcolor:[0xff,0xff,0xff, 1]
	    })
    });
}

var proposed_highway=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x80,0x9b,0xc0, 1]
	})
    });


var gray=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: 3,
	    color: [0x78,0x78,0x78, 1]
	})
    });
var black=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: 3,
	    color: [0,0,0, 1]
	})
    });

var railDash=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: 1,
	    lineDash:[5,10],
	    color: [0xff,0xff,0xff, 1]
	})
    });

var whiteDash=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth-2,
	    lineDash:[10,10],
	    color: [0xff,0xff,0xff, 1]
	})
    });

var noNothing=new ol.style.Style({
    stroke: new ol.style.Stroke({
	    width: wdth,
	    lineDash:[10,10],
	    color: [0, 0xff,0,1]
	})
    });

var nextYear= ''+(new Date().getFullYear()+1);

var styleFunction = function(feature, resolution) {
    var p= feature.getProperties();
    var ret=function(p){
    if((p.highway =='motorway' || p.highway== 'motorway_link') && (p.construction || p.proposed))
	//if(p.construction && p.highway!='construction' || p.proposed && p.highway!='proposed')
	return [transp, blue];

    if(p.railway)
	return p.railway=='proposed'?[transp,gray, railDash]:[transp, black, railDash];

    var construction= (p.access=='no')?red:blue;
    if(p.construction&&p.opening_date>=nextYear || !p.opening_date)
	construction= (p.access=='no')?lightred:lightblue;
	
    return p.construction? p.access=='no'?[transp, construction, whiteDash]:[transp, construction, whiteDash]:p.proposed?[transp, proposed_highway, whiteDash]:p.access=='no'?[transp, red]:[transp, blue];
    }(p);
    if(resolution<150 && (p.bridge || p.tunnel))
	ret.splice(1, 0, bridge);
    if(resolution<150 && p.tunnel)
	ret.splice(-1,1);
     return ret;
};

var roads=
	new ol.layer.Vector({
	    source: new ol.source.Vector({
		format: new ol.format.GeoJSON(),
		tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
		tilePixelRatio: 16,
		url: MAP_ROOT+'/maps/data/motorways.json'
		
	    }),
	    style: styleFunction
	});

var roads_tiles=
	new ol.layer.Vector({
	    source: new ol.source.TileVector({
		format: new ol.format.GeoJSON(),
		tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
		tilePixelRatio: 16,
		url: MAP_ROOT+'/motorway/{z}/{x}/{y}.json'
		
	    }),
	    style: styleFunction
	});


var speed= new ol.layer.Vector({
    source: new ol.source.TileVector({
	format: new ol.format.GeoJSON(),
	tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
	tilePixelRatio: 16,
	url: 'https://standup.csc.kth.se:8081/speed/{z}/{x}/{y}.json'	
    }),
    style: styleFunction
});


var selectClick = new ol.interaction.Select({
    //condition: ol.events.condition.mouseOnly,
//    condition: ol.events.condition.click
});

var mapnik= new ol.layer.Tile({
    source: new ol.source.OSM({
	url:'https://a.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey='+thunderforestKey
//	url:'https://a.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png'
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});

var infra= new ol.layer.Tile({
    source: new ol.source.OSM({
	url:MAP_ROOT+'/infra/{z}/{x}/{y}.png'
	,crossOrigin:null
    })
    , tileOptions: {crossOriginKeyword: null} 
});

var map = new ol.Map({
    layers: [
	mapnik,
	roads,
	infra,
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

//map.addInteraction(selectClick);

selectClick.on('select', function(event){
    document.getElementById('text').innerHTML=selectClick.getFeatures().getArray().map(treatFeature).join(", ");
});


var popupElement = document.getElementById('popup');

var popup = new ol.Overlay({
    element: popupElement,
    positioning: 'bottom-center',
    stopEvent: false
});
map.addOverlay(popup);

var features;
var popupOn=false;

//if(!edit)
//    edit=false;

//if(!edit)
map.on('click', function(evt) {
    var lonlat=ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
    document.getElementById('text').innerHTML="<div align=center>"+(Math.round(lonlat[1]*10000)/10000)+", "+(Math.round(lonlat[0]*10000)/10000)+"</div>";

    if(evt.browserEvent.target.parentElement.className=='popover-content' ||
       evt.browserEvent.target.className=='popover-content'){
	$(popupElement).popover('hide');
	return;
    }
    
    features=[];
    map.forEachFeatureAtPixel(evt.pixel,
			      function(feature, layer) {
				  features.push(feature);
			      });
    if(features[0]){
	//	document.getElementById('text').innerHTML= treatFeature(features[0]);
	//    else
	//	document.getElementById('text').innerHTML="";
	//features.map(treatFeature).join(", ");
	

	$(popupElement).popover({
	    'placement': 'auto',
	    'html': true,
	    'content': function(){ return treatFeature(features[0]);},
	});
	popup.setPosition(evt.coordinate);
	$(popupElement).popover('show');
    } else {
	$(popupElement).popover('hide');
    }
});

/*
$('body').on('click', function (e) {
    if(popupOn && popupOn.event_.screenX==e.originalEvent.screenX && popupOn.event_.screenY==e.originalEvent.screenY)
	return;
    $(popupElement).popover('hide');
    popupOn=false;
});
*/

// change mouse cursor when over marker
/*
map.on('pointermove', function(e) {
    if (e.dragging) {
	$(popupElement).popover('destroy');
	return;
    }
    var pixel = map.getEventPixel(e.originalEvent);
    var hit = map.hasFeatureAtPixel(pixel);
    if(map.getTarget().style)
	map.getTarget().style.cursor = hit ? 'pointer' : '';
});
*/



function treatFeature(rd){
    var prop= rd.getProperties();
    if(prop.comentarii_problema){
	return '<b>'+prop.nume+'</b><br/>'
	+prop.comentarii_problema+'<br/><br/>'
	+prop.comentarii_rezolvare_curenta+'<br/>'
	+'Estimare: '+prop.estimare_rezolvare+
	   (prop.link?('<br/><a href="'+prop.link+'" target="PUM">detalii</a>'):'');


    }
    var x=(prop.highway?prop.highway:prop.railway)
	+' <a href=\"https://openstreetmap.org/way/'+prop.osm_id+'\" target="OSM">'
	+(prop.ref?prop.ref+(prop.name?('('+prop.name+')'):''):(prop.name?prop.name:prop.osm_id))
	+"</a>"
	//+"[<a href=\"https://openstreetmap.org/edit?way="+prop.osm_id+"\" target=\"OSMEdit\">edit</a>] "
    //    +"</a> [<a href=\"https://openstreetmap.org/edit?editor=potlatch2&way="+prop.osm_id+"\" target=\"OSMEdit\">edit-potlach</a>]"
    ;
    
    if(prop.highway=='construction'|| prop.highway=='proposed' ){
	x+=(prop.opening_date?"<br>Estimarea terminarii constructiei: "+prop.opening_date:'');
	x+=(prop.access=='no'?"<br><font color='red'>Inchis traficului la terminarea constructiei</font>":'');
	x+="<br>"+((prop.status&& prop.status.indexOf('AC')>=0)?'<font color="00D200">Autorizatie de construire</font>':'<font color="red">Nu are Autorizatie de construire</font>');
	x+=(prop.status&&prop.status.indexOf("builder:")>=0)?"<br>Constructor: "+prop.status.substring(prop.status.indexOf("builder:")+8):'';
    }
    else{
	x+=	(prop.start_date?"<br>Data terminarii constructiei: "+prop.start_date:'');
	x+=prop.opening_date?"<br>Dat in circulatie: "+prop.opening_date:"";
	x+=prop.access=='no'?"<br><font color='red'>Inchis traficului</font>":"";
    }
    x+=prop.bridge=='yes'?"<br>Pod":"";

    return x;
}


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
    center: center,
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










