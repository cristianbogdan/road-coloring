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

var attrib= ['<span style="font-size:14px;">'
				 +'© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors<br>'
				 +'<div style="text-align:left;line-height:115%;">'
				 +'<a href="https://proinfrastructura.ro">API</a>, <a href="http://forum.peundemerg.ro">peundemerg.ro</a><br>'
				 
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:blue;"></div> Legend will be here<br>'
				 + '<div style:"font-size:2px"><br></div></div></span>'];


var mapnik= new ol.layer.Tile({
    title:"Projects",
    source: new ol.source.OSM({
	url:MAP_ROOT+'/infraGraphic/{z}/{x}/{y}.png'
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

var infoLayer=
    new ol.layer.VectorTile({
	title:"segment info",
//	visible:false,
	source: new ol.source.VectorTile({
	    format: new ol.format.GeoJSON(),
	    tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
	    tilePixelRatio: 16,
	    url: '/infraVector/{z}/{x}/{y}.json'
	})
	,style:
	function(f, resolution) {
	    return [transp];
/*	    if (selectedIds.indexOf(f.getId())!=-1 ) {
		return selectStyle;
	    }
	    return  defaultStyle ;
*/
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
	     , infoLayer
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
	mapnik, infoLayer
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

function treatFeature(rd) {
    var prop = rd.getProperties();
	if (!prop.osm_id) prop.osm_id=prop.id.split('/')[1];
	
    if (prop.comentarii_problema) {
        return '<b>' + prop.nume + '</b><br/>'
            + prop.comentarii_problema + '<br/><br/>'
            + prop.comentarii_rezolvare_curenta + '<br/>'
            + 'Estimare: ' + prop.estimare_rezolvare +
            (prop.link ? ('<br/><a href="' + prop.link + '" target="PUM">detalii</a>') : '');


    }
    if (prop.highway == 'lot_limit' || prop.railway == 'lot_limit')
        return 'Limita lot ' + (prop.highway ? 'autostrada' : 'CF') + ' <a href=\"https://openstreetmap.org/node/' + prop.osm_id + '\" target="OSM">' + prop.name + '</a>';

    var x = (prop.highway ? prop.highway : prop.railway)
        + ' <a href=\"https://openstreetmap.org/way/' + prop.osm_id + '\" target="OSM">'
        + (prop.ref ? prop.ref + (prop.name ? ('(' + prop.name + ')') : '') : (prop.name ? prop.name : prop.osm_id))
        + "</a>"
        //+"[<a href=\"https://openstreetmap.org/edit?way="+prop.osm_id+"\" target=\"OSMEdit\">edit</a>] "
        //    +"</a> [<a href=\"https://openstreetmap.org/edit?editor=potlatch2&way="+prop.osm_id+"\" target=\"OSMEdit\">edit-potlach</a>]"
    ;

    if (prop.status) computeStatus(prop);

    if (prop.highway == 'construction' || prop.highway == 'proposed' || (prop.railway && prop.latestProgress != 100)) {
        x += (prop.opening_date ? "<br>Estimarea terminarii constructiei: " + prop.opening_date : '');
        x += (prop.access == 'no' ? "<br><font color='red'>Inchis traficului la terminarea constructiei</font>" : '');

        if (prop.hadStatus)
            if (prop.highway) x += "<br>" + (prop.AC ? '<font color=' + clr(deepSkyBlue) + '>Autorizatie de construire</font>' : prop.PTE ? '<font color=' + clr(orange) + '>Are Proiect Tehnic aprobat dar nu Autorizatie de Construire</font>' : prop.AM ? '<font color=' + clr(orangeRed) + '>Are Acord de Mediu dar nu Proiect Tehnic aprobat, deci nu are Autorizatie de Construire</font>' : '<font color=' + clr(red) + '>Nu are Acord de Mediu, deci nu are Autorizatie de Construire</font>');
            else x += (prop.AC ? "<br>" + '<font color=' + clr(deepSkyBlue) + '>Autorizatie de construire</font>' : '');
        else if (prop.highway)
            x += "<br>Progresul constructiei necunoscut";
        if (prop.tender) {
            x += "<br>In licitatie " + prop.tender;
            if (prop.winner) x += "<br> castigator " + prop.winner;
        }
        x += (prop.builder ? "<br>Constructor: " + prop.builder : '');
        x += (prop.severance ? "<br>Reziliat: " + prop.severance : '');
        x += (prop.funding ? "<br>Finantare: " + prop.severance : '');

        if (prop.progress) {
            var color = prop.latestProgress > 75 ? clr(dodgerBlue) : prop.latestProgress > 50 ? clr(deepSkyBlue) : prop.latestProgress > 25 ? clr(lightSkyBlue) : prop.latestProgress > 0 ? clr(powderBlue) : clr(gray);
            x += "<br>Stadiul lucrarilor: <font color=" + color + "><b>" + prop.progress[0] + "</b></font><font size=-2>"
                + prop.progress.slice(1).reduce(function (s, e) {
                    return s + " " + e.trim();
                }, "")
                + "</font>";
        }
        if (prop.progress_estimate) {
            var color_e = prop.latestProgress > 75 ? clr(dodgerBlue) : prop.latestProgress > 50 ? clr(deepSkyBlue) : prop.latestProgress > 25 ? clr(lightSkyBlue) : prop.latestProgress > 0 ? clr(powderBlue) : clr(gray);
            x += "<br>Estimare stadiu: <font color=" + color_e + "><b>" + prop.progress_estimate[0] + "</b></font><font size=-2>"
                + prop.progress_estimate.slice(1).reduce(function (s, e) {
                    return s + " " + e.trim();
                }, "")
                + "</font>";
        }
    } else {
        if (prop.highway) {
            x += (prop.start_date ? "<br>Data terminarii constructiei: " + prop.start_date : '');
            x += (prop.opening_date ? "<br>Dat in circulatie: " + prop.opening_date : "");

        } else if (prop.railway) {
            x += (prop.start_date ? "<br>Data terminarii variantei noi: " + prop.start_date : '');
            x += (prop.opening_date ? "<br>Data terminarii reabilitarii: " + prop.opening_date : '');
        }
        x += prop.access == 'no' ? "<br><font color='red'>Inchis traficului</font>" : "";
    }

    if (prop.railway) {
        if (prop.signal_progress && !prop["railway:etcs"]) {
            x += "<br>Semnalizare ETCS: <font color=" + clr(orange) + "><b>" + prop.signal_progress[0] + "</b></font><font size=-2><br>"
                + prop.signal_progress.slice(1).reduce(function (s, e) {
                    return s + " " + e.trim();
                }, "")
        } else if (prop["railway:etcs"]) x += "<br>Semnalizare ETCS: nivel " + prop["railway:etcs"];
        else if (prop["construction:railway:etcs"]) x += "<br>Semnalizare ETCS: implementare impreuna cu reabilitarea liniei, nivel " + prop["construction:railway:etcs"];
        else x += "<br>Semnalizare ETCS: neimplementat";
    }

    x += prop.bridge == 'yes' ? "<br>Pod" : "";
    x += prop.tunnel == 'yes' ? "<br>Tunel" : "";
    return x;
}

var computeStatus = function (p) {
    p.status.split(',').forEach(function (prop) {
        var kv = prop.split(':');
        if (kv.length > 1) {
            p[kv[0]] = kv[1];
            if (kv[0] == 'progress') {
	        p.progress = kv[1].split(' ');
	        p.latestProgress = parseFloat(p.progress[0].split('%')[0]);
	    } else if (kv[0] == 'progress_estimate') {
                p.progress_estimate = kv[1].split(' ');
		p.latestProgress = parseFloat(p.progress_estimate[0].split('%')[0]);
            } else if (kv[0] == 'signal_progress') {
                p.signal_progress = kv[1].split(' ');
	        p.latestSignalProgress = parseFloat(p.signal_progress[0].split('%')[0]);
	    }
	} else
	    p[kv[0]] = true;
    });
    //if(p.progress_estimate)                                                                                              
    //p.latestProgress=parseFloat(p.progress_estimate.split('%')[0]);                                                      
    p.hadStatus = true;
    p.status = null;
};

/*function treatFeature(rd){
    var prop= rd.getProperties();
    const {osm_id, ref, status}=prop;
    return JSON.stringify({osm_id, ref, status});
}*/

