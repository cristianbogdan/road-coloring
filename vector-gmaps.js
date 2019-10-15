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
	}),
/*    text: new ol.style.Text({
	font: 'bold 14px "Open Sans", "Arial Unicode MS", "sans-serif"',
	placement: 'line',
	fill: new ol.style.Fill({
	    color: 'white'
	})
    })*/
});

var green=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0,210,0, 1]
	})
});

var dodgerBlue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x19,0x9a,0x8d, 1]
	})
});

var deepSkyBlue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x20,0xc5,0xb5, 1]
	})
});

var lightSkyBlue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x40,0xe0,0xd0, 1]
	})
});

var powderBlue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x91,0xed,0xe4, 1]
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
	    color: [0xb3,0,0, 1]
	})
});

var lightred=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [255,189,189, 1]
	})
});


var orange=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0xff,0xbf,0x00, 1]
	})
});

var orangeRed=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0xff,0x45,0x00, 1]
	})
});

var bridge=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth+3,
	    color: [0,0,0, 0.5]
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
	    width: 2,
	    lineDash:[5,10],
	    color: [0,0,0, 1]
	})
    });

var whiteDash=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth-2,
	    lineDash:[10,10],
	    color: [0xff,0xff,0xff, 1]
	})
    });


var redDash=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth-2,
	    lineDash:[10,10],
	    color: [0xff,0x0,0x0, 1]
	})
    });

var noNothing=new ol.style.Style({
    stroke: new ol.style.Stroke({
	    width: wdth,
	    lineDash:[10,10],
	    color: [0, 0xff,0,1]
	})
    });

function toHex(n){
    var ret= new Number(n).toString(16);
    if (ret.length==1)
	return '0'+ret;
    return ret;
}

function clr(style){
    return '#'+toHex(style.getStroke().getColor()[0])
	+toHex(style.getStroke().getColor()[1])
    	+toHex(style.getStroke().getColor()[2]);
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

var colorProgress=function(latestProgress){
    return latestProgress>75?dodgerBlue:latestProgress>50?deepSkyBlue:latestProgress>25?lightSkyBlue:latestProgress>0?powderBlue:gray;
}

initiallyHidden={propus:true}

function check(x, ret){
    if(document.getElementById(x))
	return document.getElementById(x).checked?ret:[transp];
    return initiallyHidden[x]?[transp]:ret;	
}

var styleFunction = function(feature, resolution) {
    var p= feature.getProperties();
    if(p.tags)
	p=p.tags;
    if(p.status)
	computeStatus(p);

    
    var ret=function(p){
    //if((p.highway =='motorway' || p.highway== 'motorway_link') && (p.construction || p.proposed))
	//if(p.construction && p.highway!='construction' || p.proposed && p.highway!='proposed')
//	return [transp, blue];
	if(p.highway!='construction' && p.construction)
	    return [transp];

	if(p.highway && p.highway!='proposed' && p.proposed)
	    return [transp];
	
    if(p.railway)
	return p.railway=='proposed'?check("CF-neatrib",[transp,gray, railDash]):check("CF",[transp, colorProgress(p.latestProgress), railDash]);

	var AC= (!p.AC)?(p.construction||p.hadStatus)?p.PTE?orange:p.AM?orangeRed:red:lightred:green;
	var AC_id=(!p.AC)?(p.construction||p.hadStatus)?p.PTE?"PTfaraAC":p.AM?"AMfaraPT":"atribuitFaraAM":"propus":"inConstructie";

	if(AC===green && p.latestProgress!=undefined)
	    AC= colorProgress(p.latestProgress)
	
//    if(p.construction&&p.opening_date>=nextYear || !p.opening_date)
//	construction= (p.access=='no')?lightred:lightblue;

     	if(p.construction&& !p.hadStatus)
	    return [transp, proposed_highway];

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


    }(p);
    
    if(ret.length>1 && resolution<150 && (p.bridge || p.tunnel))
	ret.splice(1, 0, bridge);
    if(resolution<150 && p.tunnel)
	ret.splice(-1,1);
     return ret;
};

var attrib= [new ol.Attribution({html:'<span style="font-size:14px;">'
				 +'© <a href="http://openstreetmap.org">OpenStreetMap</a> contributors<br>'
				 +'<div style="text-align:left;line-height:115%;">'
				 +'<a href="http://proinfrastructura.ro">API</a>, <a href="http://forum.peundemerg.ro">peundemerg.ro</a><br>'
				 
				 +'<input type="checkbox" id="inCirculatie" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:'+clr(blue) +';"></div> în circulație<br>'
				 +'<input type="checkbox" id="circulabilFaraAcces" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:'+clr(blue)+'; border-top:dotted red"></div> recepționat/circulabil fără acces<br>'
				 +'<input type="checkbox" id="inConstructie" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:'+clr(lightSkyBlue)+';"></div> în construcție, cu AC, stadiu:<br>'
				 +'<font color='+clr(gray)+'>0%</font> <font color='+clr(powderBlue)+'>&lt;25%</font> <font color='+clr(lightSkyBlue)+'>&lt;50%</font> <font color='+clr(deepSkyBlue)+'>&lt;75%</font> <font color='+clr(dodgerBlue)+'>&lt;100%</font><br>'
				 +'<input type="checkbox" id="neatribuitCuAC" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; border-top:dotted '+clr(deepSkyBlue)+';"></div> neatribuit sau reziliat, cu AC<br>'
				 +'<input type="checkbox" id="atribuitFaraAM" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:'+clr(red)+';"></div> atribuit, lipsă AM<br>'
				 +'<input type="checkbox" id="AMfaraPT" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:'+clr(orangeRed)+';"></div> cu AM, fără PT aprobat<br>'
				 +'<input type="checkbox" id="PTfaraAC" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:'+clr(orange)+';"></div> cu PT aprobat, fără AC<br>'
				 +'<input type="checkbox" id="neatribuit" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; border-top:dotted '+clr(orangeRed)+';"></div> neatribuit, lipsă AC/PT/AM<br>'
				 +'<input type="checkbox" id="CF" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:black; border-top:dotted '+clr(powderBlue)+';"></div> CF cu AC, în construcție<br>'
				 +'<input type="checkbox" id="CF-neatrib" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:black; border-top:dotted #787878;"></div> CF cu AC, neatribuit<br>'
				 +'<input type="checkbox" id="propus"  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; border-top:dotted #ffbdbd;"></div> proiecte propuse (vise)<br>'
				 +'<input type="checkbox" id="necunoscut" checked  onclick="refresh()"/> '
				 +'<div style="position:relative; display:inline-block; width:35px; height:3px; bottom:2px; background-color:#809bc0;"></div> statut necunoscut<br>'
				 
				 +'<div style="position:relative; display:inline-block; width:35px; font-size:10px; font-weight:bold; color:blue;">2017</div> deschidere (estimată)<br>'
				 +'<div style="position:relative; display:inline-block; width:35px; font-size:10px; font-weight:bold; color:red;">2017</div> deschidere fără acces<br>'
				 +'AC= autorizație de construire<br>PT= proiect tehnic<br>AM= acord de mediu<br>'
				 +'<a href=http://forum.peundemerg.ro/index.php?topic=836.msg161436#msg161436>Get involved!</a><br>'+
'<div style:"font-size:2px"><br></div></div></span>'})];
	
var roads=
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

var ro='way(area.ro)';


var overpass_q=

    "("
	+ro+'[highway=construction];'	+ro+'[highway=motorway];'
	+ro+`[highway=trunk][ref~"^DN",i](if:is_date(t["start_date"])&&date(t["start_date"])>'2009-09-28');`
	+ro+`[highway!~trunk][ref~"^DJ",i](if:is_date(t["start_date"])&&date(t["start_date"])>'2017-09-28');`    
	+ro+'[highway=proposed];'+ro+'[railway=construction];'+ro+'[railway=proposed];'+ro+'[railway=rail][status];'
    
	+")"
    
    //'('+

//	"[highway~trunk][ref~\"^DN\",i](if:is_date(t[\"start_date\"])&&date(t[\"start_date\"])>'2017-09-28T19:51:44Z');"
//        +ro+'[highway!~trunk][ref~"^DJ",i](if:is_date(t["start_date"])&& date(t["start_date"]>\'2017-09-28\');'   
    //

;

var retry={};
var completed=0;
var attempted=0;

function writeStatus(){
    document.getElementById("text").innerHTML=""+completed+"/"+attempted;
}

function writeStatus1(dt){
    document.getElementById("text").innerHTML=""+new Date(dt);
}
function overpass(query)
{
    var sym=true;
    var url= 'https://www.overpass-api.de/api/interpreter';

    if(sym)
	url=SCRIPT_ROOT+'/data/data-overpass.json';
    
    var post=`[out:json][timeout:180];(area[boundary=administrative]["name:en"=Romania];)->.ro;`+
	query
	+";out geom;";
 
    var xhr = new XMLHttpRequest();

    if(sym)
	xhr.open('GET', url);
    else
	xhr.open('POST', url);
    var onError = function() {
	console.error("Overpass error "+xhr.statusText);
	retry[query]=1;
    }
    xhr.onerror = onError;
    xhr.onload = function() {
	if (xhr.status == 200) {
	    let data=JSON.parse(xhr.responseText);
	    if(!data.elements || data.elements.length<5){
		if(data.remark)
		    console.error(data.remark)
		retry[query]=1;
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
		completed++;
		if(sym)writeStatus1(data.osm3s.timestamp_osm_base);
		else writeStatus();
	    }
	} else {
		onError();
	}
    }
    try{
	attempted++;
	if(!sym)writeStatus();
	if(sym)xhr.send();
	else xhr.send(post);
    }catch(e){ onError(); }   
}

var startLoading;
/*
function consume(){
    if(completed==queries.length){
	console.log("overpass complete");
	return;
    }
    
    if(queries.length-Object.keys(retry).length- completed<1){
	let q=Object.keys(retry)[0];
	if(q){
	    delete retry[q]
	    overpass(q);
	}
    }
    setTimeout(consume, 10000);
}*/

var vectorSource= new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    tileGrid: ol.tilegrid.createXYZ({maxZoom: 17}),
    tilePixelRatio: 16,
    loader: function(extent, resolution, projection) {
//	queries.map(q=> retry[q]=1);
	startLoading=new Date().getTime();
	overpass(overpass_q);
    },
    strategy:ol.loadingstrategy.all
    ,attributions: attrib
    
});

if(window.location.search)
   roads=  new ol.layer.Vector({
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




