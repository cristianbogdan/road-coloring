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

var nextYear= ''+(new Date().getFullYear()+1);

var computeStatus=function(p)
{
    p.status.split(',').forEach(function(prop){
	var kv= prop.split(':');
	if(kv.length>1){
	    p[kv[0]]=kv[1];
	    if(kv[0]=='progress'){
		p.progress=kv[1].split(' ');
		p.latestProgress=parseFloat(p.progress[0].split('%')[0]);
	    }
	}
	else
	    p[kv[0]]=true;
    });
    if(p.progress_estimate)
	p.latestProgress=parseFloat(p.progress_estimate.split('%')[0]);
    p.hadStatus=true;
    p.status=null;
};

function check(x, ret){
    if(document.getElementById(x))
	return document.getElementById(x).checked?ret:[transp];
    return ret;	
}

let feature_render=function(p){
    let rule=legend.projectTypes.find(x=>x.condition(p));
    if(rule && !rule.hidden)
	return rule.lineType(p);
    return [transp];
}

let old_render=function(p){
    if(p.railway)
	return p.railway=='proposed'?check("CF-neatrib",[transp,gray, railDash]):check("CF",[transp, colorProgress(p.latestProgress), railDash]);

	var AC= (!p.AC)?(p.construction||p.hadStatus)?p.PTE?orange:p.AM?orangeRed:red:lightred:green;
	var AC_id=(!p.AC)?(p.construction||p.hadStatus)?p.PTE?"PTfaraAC":p.AM?"AMfaraPT":"atribuitFaraAM":"propus":"inConstructie";

	if(AC===green && p.latestProgress!=undefined)
	    AC= colorProgress(p.latestProgress)
	
//    if(p.construction&&p.opening_date>=nextYear || !p.opening_date)
//	construction= (p.access=='no')?lightred:lightblue;

     	if(p.construction&& !p.hadStatus)
	    return [transp, unknown];

	//if(p.proposed && p.status)
	//{ p.construction=p.proposed; p.proposed=null;}

	if(!p.construction){
	    if(p.proposed)
		return check(AC_id, ([transp, AC, whiteDash]));
	    else{
		if(p.access=='no')
	            return [transp, blue, redDash];
		else
	            return [transp, blue];
	    }
	}
	

        if( p.builder) return [transp, AC];
	return [transp, AC, whiteDash];


}

var styleFunction = function(feature, resolution) {
    var p= feature.getProperties();
    if(p.tags)
	p=p.tags;
    if(p.status)
	computeStatus(p);

    if(p.highway!='construction' && p.construction)
	return [transp];
    
    if(p.highway && p.highway!='proposed' && p.proposed)
	return [transp];
    

    var ret= feature_render(p);
/*    var ret1=old_render(p);
    if(JSON.stringify(ret)!==JSON.stringify(ret1)){
	console.log((x=>x?x.text:"none")(legend.projectTypes.find(x=>x.condition(p))), ret.map(x=>x.name), ret1.map(x=>x.name), p);
    }
 */   
    if(ret.length>1 && resolution<150 && (p.bridge || p.tunnel))
	ret.splice(1, 0, bridge);
    if(resolution<150 && p.tunnel)
	ret.splice(-1,1);
    return ret;
};

const legendClick= (e, span)=>{
    if(e.target.type!=="checkbox")
	return;
    legend.projectTypes[[... span.children].findIndex(x=>x.firstChild==e.target)].hidden= !e.target.checked;
    roads.getSource().changed();
}

var attrib= [new ol.Attribution({html:'<span style="font-size:14px;">'
				 +'© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors<br>'
				 +'<div style="text-align:left;line-height:115%;">'
				 +'<a href="http://proinfrastructura.ro">API</a>, <a href="http://forum.peundemerg.ro">peundemerg.ro</a><br><span onclick="legendClick(event, this)">'
				 +legend.projectTypes.map(x=>'<span>'+(x.canHide?'<input type=checkbox'+ (x.hidden?'':' checked ') +'> ':' ')+ '<div style="'+legend.basicStyle+' '+x.symbol+'"></div> '+x.text+"<br></span>").join('')
				 +'</span><div style="position:relative; display:inline-block; width:35px; font-size:10px; font-weight:bold; color:blue;">2017</div> deschidere (estimată)<br>'
				 +'<div style="position:relative; display:inline-block; width:35px; font-size:10px; font-weight:bold; color:red;">2017</div> deschidere fără acces<br>'
				 +'AC= autorizație de construire<br>PT= proiect tehnic<br>AM= acord de mediu<br>'
				 +'<a href=http://forum.peundemerg.ro/index.php?topic=836.msg161436#msg161436>Get involved!</a><br>'+
'<div style:"font-size:2px"><br></div></div></span>'})];
	
/*var roads=
	new ol.layer.Vector({
	    source: new ol.source.Vector({
		format: new ol.format.GeoJSON(),
		tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
		tilePixelRatio: 16,
		url: MAP_ROOT+'/maps/data/motorways.json'
		,attributions: attrib
		
	    }),
	    style: styleFunction
	});

*/
function overpass()
{
    var url=SCRIPT_ROOT+'/data/data-overpass.json';
    
    var xhr = new XMLHttpRequest();

    xhr.open('GET', url);
    var onError = function() {
	console.error("Overpass error "+xhr.statusText);
    }
    xhr.onerror = onError;
    xhr.onload = function() {
	if (xhr.status == 200) {
	    let data=JSON.parse(xhr.responseText);
	    if(!data.elements || data.elements.length<5){
		if(data.remark)
		    console.error(data.remark)
	    }
	    else{
		vectorSource.addFeatures(
		    vectorSource.getFormat().readFeatures(
			osmtogeojson(
			    data
			)
			,{
			    featureProjection: map.getView().getProjection()
			}
		    ));
		document.getElementById("text").innerHTML=""+new Date(data.osm3s.timestamp_osm_base);
	    }
	} else {
		onError();
	}
    }
    try{
	xhr.send();
    }catch(e){ onError(); }   
}

var vectorSource= new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
    tilePixelRatio: 16,
    loader: function(extent, resolution, projection) {
	overpass();
    },
    strategy:ol.loadingstrategy.all
    ,attributions: attrib
    
});

var roads=  new ol.layer.Vector({
    source: vectorSource,
    style: styleFunction
});

var roads_tiles=
	new ol.layer.Vector({
	    source: new ol.source.VectorTile({
		format: new ol.format.GeoJSON(),
		tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
		tilePixelRatio: 16,
		url: MAP_ROOT+'/motorway/{z}/{x}/{y}.json'
		
	    }),
	    style: styleFunction
	});


var selectClick = new ol.interaction.Select({
    //condition: ol.events.condition.mouseOnly,
//    condition: ol.events.condition.click
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
    source: new ol.source.Vector({
		format: new ol.format.GeoJSON(),
		tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
		tilePixelRatio: 16,
		url: MAP_ROOT+'/maps/data/lot_limits.json'
		}),

    style: iconStyle
});    


var infra= new ol.layer.Tile({
    source: new ol.source.OSM({
	url:MAP_ROOT+'/infra/{z}/{x}/{y}.png'
	,crossOrigin:null
	,attributions: attrib
    })
    , tileOptions: {crossOriginKeyword: null} 
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

var attribution = new ol.control.Attribution({
    collapsible: false,
    collapsed:false
    
  });

var map = gmap?new ol.Map({
    layers: [roads,
	     infra,
	     icons],
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
	roads,
	infra,
	icons,
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

if(gmap){
    olMapDiv.parentNode.removeChild(olMapDiv);
    gmap.controls[google.maps.ControlPosition.TOP_LEFT].push(olMapDiv);
    //attribution.setMap(map);
}
view.setCenter( ol.proj.fromLonLat(center));
view.setZoom(zoom);
map.getControls().forEach(control=>{
    if(control instanceof ol.control.Attribution){
	control.setCollapsed(false);
    }
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

function refresh(){
    roads.getSource().changed();
}

function treatFeature(rd){
    var prop= rd.getProperties();
    if(prop.tags){
	prop=prop.tags;
	prop.osm_id=rd.getProperties().id;
    }
    if(prop.comentarii_problema){
	return '<b>'+prop.nume+'</b><br/>'
	+prop.comentarii_problema+'<br/><br/>'
	+prop.comentarii_rezolvare_curenta+'<br/>'
	+'Estimare: '+prop.estimare_rezolvare+
	   (prop.link?('<br/><a href="'+prop.link+'" target="PUM">detalii</a>'):'');


    }
    if(prop.highway=='lot_limit' || prop.railway=='lot_limit')
	return 'Limita lot '+(prop.highway?'autostrada':'CF')+' <a href=\"http://openstreetmap.org/node/'+prop.osm_id+'\" target="OSM">'+prop.name+'</a>';
    
    var x=(prop.highway?prop.highway:prop.railway)
	+' <a href=\"http://openstreetmap.org/way/'+prop.osm_id+'\" target="OSM">'
	+(prop.ref?prop.ref+(prop.name?('('+prop.name+')'):''):(prop.name?prop.name:prop.osm_id))
	+"</a>"
	//+"[<a href=\"http://openstreetmap.org/edit?way="+prop.osm_id+"\" target=\"OSMEdit\">edit</a>] "
    //    +"</a> [<a href=\"http://openstreetmap.org/edit?editor=potlatch2&way="+prop.osm_id+"\" target=\"OSMEdit\">edit-potlach</a>]"
    ;

    if(prop.status)
	computeStatus(prop);
    
    if(prop.highway=='construction'|| prop.highway=='proposed' || prop.railway && prop.hadStatus){
	x+=(prop.opening_date?"<br>Estimarea terminarii constructiei: "+prop.opening_date:'');
	x+=(prop.access=='no'?"<br><font color='red'>Inchis traficului la terminarea constructiei</font>":'');
//	if(prop.construction)
	    if(prop.hadStatus)
		x+="<br>"+(prop.AC?'<font color='+clr(deepSkyBlue)+'>Autorizatie de construire</font>':prop.PTE?'<font color='+clr(orange)+'>Are Proiect Tehnic aprobat dar nu Autorizatie de Construire</font>':prop.AM?'<font color='+clr(orangeRed)+'>Are Acord de Mediu dar nu Proiect Tehnic aprobat, deci nu are Autorizatie de Construire</font>':'<font color='+clr(red)+'>Nu are Acord de Mediu, deci nu are Autorizatie de Construire</font>');
	else
	    x+="<br>Progresul constructiei necunoscut";
	if(prop.tender){
	    x+="<br>In licitatie "+prop.tender;
	    if(prop.winner)
		x+=" castigator "+prop.winner;
	}
	x+=(prop.builder?"<br>Constructor: "+prop.builder:'');
	x+=(prop.severance?"<br>Reziliat: "+prop.severance:'');
	x+=(prop.funding?"<br>Finantare: "+prop.severance:'');

	if(prop.progress){
	    var color=prop.latestProgress>75?clr(dodgerBlue):prop.latestProgress>50?clr(deepSkyBlue):prop.latestProgress>25?clr(lightSkyBlue):prop.latestProgress>0?clr(powderBlue):clr(gray);
	    x+="<br>Stadiul lucrarilor: <font color="+color+"><b>"+prop.progress[0]+"</b></font><font size=-2>"
	    +prop.progress.slice(1).reduce(function(s, e){return s+" "+e.trim();}, "")
	    +"</font>";
	}
	if(prop.progress_estimate){
	    var color_e=prop.latestProgress>75?clr(dodgerBlue):prop.latestProgress>50?clr(deepSkyBlue):prop.latestProgress>25?clr(lightSkyBlue):prop.latestProgress>0?clr(powderBlue):clr(gray);
	    x+="<br>Stadiul lucrarilor (estimat): <font color="+color_e+"><b>"+prop.progress_estimate+"</b></font>";
	}
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




