/* global ol */
try { MAP_ROOT }catch(e) {
    MAP_ROOT="";
}

try{ gmap } catch(e){
    gmap=false;
}
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
    (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
                         m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
                        })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-38702438-2', 'auto');
ga('send', 'pageview');

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


function toHex(n){
    var ret= new Number(n).toString(16);
    if (ret.length==1)
	return '0'+ret;
    return ret;
}

function clr(style){
    return '#'+toHex(style.stroke_.color_[0])
	+toHex(style.stroke_.color_[1])
    	+toHex(style.stroke_.color_[2]);
}

var attrib= ['<span style="font-size:14px;">'
				 +'© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors<br>'
				 +'<div style="text-align:left;line-height:115%;">'
				 +'<a href="http://proinfrastructura.ro">API</a>, <a href="http://forum.peundemerg.ro">peundemerg.ro</a><br>'
				 
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:blue;"></div> excelent<br>'
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:#376f00;"></div> bun<br>'
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:#ff9f00;"></div> intermediar<br>'
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:red;"></div> rău sau foarte rău<br>'
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:#ff00ff;"></div> oribil sau nepracticabil<br>'
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color: red; border-top:dotted blue"></div> (rau) în reabilitare<br>'
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; border-top:dotted #376f00;"></div> (bun) neasfaltat<br>'
	     +'<br><a href="'+
	     MAP_ROOT
	     +'maps/edit.html" id="editlink" onmouseover="this.href=MAP_ROOT+\'/maps/edit.html#map=\'+window.location.href.split(\'#map=\')[1]">Editează harta!</a><br>'+
				 '<div style:"font-size:2px"><br></div></div></span>'];

var mapnik= new ol.layer.Tile({
    title:"Calitatea drumurilor",
    source: new ol.source.OSM({
	url:MAP_ROOT+'/tiles/{z}/{x}/{y}.png'
	,crossOrigin:null
	,    attributions: attrib

    })
    , tileOptions: {crossOriginKeyword: null}
    
});

var defaultStyle=       new ol.style.Style({
    stroke: new ol.style.Stroke({
	width: 6,
	color: [0xff,0xff,0x00,0.25]
    })
})
;

var selectedIds=[];

var roadLayer=
    new ol.layer.VectorTile({
	title:"segment info",
	visible:false,
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


var selectClick = new ol.interaction.Select({
    //condition: ol.events.condition.mouseOnly,
//    condition: ol.events.condition.click
});


var view = new ol.View({
    minZoom:7,
    maxZoom:17
});
view.on('change:center', function() {
    if(gmap){
	var center = ol.proj.transform(view.getCenter(), 'EPSG:3857', 'EPSG:4326');
	gmap.setCenter(new google.maps.LatLng(center[1], center[0]));
    }
});
view.on('change:resolution', function() {
    if(gmap)
	gmap.setZoom(view.getZoom());
});



var olMapDiv = document.getElementById('olmap');

var map = gmap?new ol.Map({
    layers: [mapnik
	     , roadLayer
	    ],
    interactions: ol.interaction.defaults({
    altShiftDragRotate: false,
    dragPan: false,
    rotate: false
  }).extend([new ol.interaction.DragPan({kinetic: null})]),
  target: olMapDiv,
    view: view
//    ,controls: ol.control.defaults({attribution: false})
}):new ol.Map({
    layers: [
	mapnik, roadLayer
//,
//	roads
	
    ],
    target: 'olmap',
    view: view
});;


var popupElement = document.getElementById('popup');

var popup = new ol.Overlay({
    element: popupElement,
    positioning: 'bottom-center',
    stopEvent: false
});
map.addOverlay(popup);

var layerSwitcher = new ol.control.LayerSwitcher({
    tipLabel: 'Légende' // Optional label for button
});
map.addControl(layerSwitcher);

if(gmap){
    olMapDiv.parentNode.removeChild(olMapDiv);
    gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);
}
view.setCenter( ol.proj.fromLonLat(center));
view.setZoom(zoom);

map.getControls().forEach(control=>{
    if(control instanceof ol.control.Attribution)
	control.setCollapsed(false);
})

selectClick.on('select', function(event){
    document.getElementById('text').innerHTML=selectClick.getFeatures().getArray().map(treatFeature).join(", ");
});



var features;
var popupOn=false;

//if(!edit)
//    edit=false;

//if(!edit)
/*
map.on('click', function(evt) {
    var lonlat=ol.proj.transform(evt.coordinate, 'EPSG:3857', 'EPSG:4326');
    document.getElementById('text').innerHTML="<div align=center>"+(Math.round(lonlat[1]*10000)/10000)+", "+(Math.round(lonlat[0]*10000)/10000)+"</div>";

    if(evt.originalEvent.target.parentElement.className=='popover-content' ||
       evt.originalEvent.target.className=='popover-content'){
	$(popupElement).popover('hide');
	return;
    }
    
    features=[];
    map.forEachFeatureAtPixel(evt.pixel,
			      function(feature, layer) {
				  features.push(feature);
			      });
    if(features[0]){
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

function treatFeature(rd){
    var prop= rd.getProperties();
    return '';
}
*/

var shouldUpdate = true;
//var view = map.getView();
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










