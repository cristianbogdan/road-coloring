/*global L */
    // create a map
var map ;

var params = {};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m, key, value) {
    params[key] = value;
});

function loadDoc() {      
    map= new L.Map('mymap');
    // create the OpenStreetMap layer

    const osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>',
    thunLink = '<a href="http://thunderforest.com/">Thunderforest</a>';
    
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; ' + osmLink + ' Contributors',
	osmBwUrl= 'http://{s}.www.toolserver.org/tiles/bw-mapnik/{z}/{x}/{y}.png',
        landUrl = 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
        thunAttrib = '&copy; '+osmLink+' Contributors & '+thunLink;
    
    var osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib}),
	osmBwMap=L.tileLayer(osmBwUrl, {attribution: osmAttrib}),
        landMap = L.tileLayer(landUrl, {attribution: thunAttrib});

    map.addLayer(osmBwMap);
    
    // set the map's starting view
    map.setView( new L.LatLng((params.lat||46), (params.lng||25)), (params.zoom|| 7) );

    // load from http://roads2.enjoymaps.ro/geo/radare.js
    
    var trunk=L.geoJson(null, {style:render, onEachFeature:popup});
    trunk.addTo(map);

    var other= L.geoJson(null, {style:render, onEachFeature:popup});
    other.addTo(map);

    var control= L.geoJson(null, {onEachFeature:popupControl});
    control.addTo(map);
    
    L.control.layers(
	{
	    "OSM blawk&white": osmBwMap,
	    "OSM": osmMap,
	    "OSM Landscape": landMap
	},
	{
	    "A, DN":trunk
	    ,"DJ, DC": other
	    , "control (enjoymaps.ro)":control
	}
    ).addTo(map);
    
    populate(trunk, "main-roads.topo.json");
    populate(other, "other-roads.topo.json");
    populate(control, "radare.js");

    var oldZoom= map.getZoom();

    var zs;
    map.on('zoomstart', function(){
	zs= new Date();
    });
    map.on('zoomend', function(){
	console.log(new Date()-zs);
	if(oldZoom==map.getZoom())
	    return;
	console.log(oldZoom+" "+map.getZoom());
	changeUrl();

	var max= oldZoom<map.getZoom()? map.getZoom():oldZoom;
	var min= oldZoom<map.getZoom()? oldZoom:map.getZoom();

	oldZoom=map.getZoom();

	
	for(var i=0;i<weightRules.length;i++){
	    if(min < weightRules[i].limit && max >=weightRules[i].limit){
		other.setStyle(render);
		trunk.setStyle(render);
		break;
	    }
	 }
	 
    });
    map.on('dragend', function(){
	changeUrl();
    });
}


function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

function populate(layer, file){
    var x= new Date();
    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4) {
	    var content= xhttp.responseText;
	    if(!endsWith(file, ".js")){
		content= JSON.parse(content);
		if(content.type==="Topology"){
		    var content1=[];
		    for (var key in content.objects) {
			content1.push(topojson.feature(content, content.objects[key]));
		    }
		    content=content1[0];
		}
	    }
	    else
	    {
		eval(content);
		content=radare[0];
	    }
	    //content.features=content.features.slice(0,6000);
	    console.log(file+": "+(new Date()- x)+" ms "+content.features.length+" objects");
	    
	    layer.addData(content);

	}
    };
    xhttp.open("GET", file+"?x="+new Date(), true);
    xhttp.send();
    
}
    
function changeUrl(){
    window.history.pushState("Object", "", "index.html?zoom="+map.getZoom()+"&lat="+ map.getCenter().lat+"&lng="+map.getCenter().lng);
}

function popup(feature, layer){
    layer.bindPopup((feature.properties.ref?"<b>"+feature.properties.ref+":</b> ":"")+
		    feature.properties.smoothness+ 
		    "<br><b>surface survey:</b> " +
		    (feature.properties.surface_survey ||"") +"<br>", {maxWidth: 200});

    //layer.on('mouseover', function() { layer.openPopup(); });
    //layer.on('mouseout', function() { layer.closePopup(); });
}

function popupControl(feature, layer){
    layer.bindPopup("<b>Control rovigneta:</b> " +feature.properties.locatie+" ("+feature.properties.drum+")<br>"+
		    "data from <a href=\"http://enjoymaps.ro\">enjoymaps.ro</a>", {maxWidth: 200});
    
}

const weightRules=[
    {
	limit:9,
	rules:{
	    motorway:4,
	    motorway_link:4,
	    trunk:3,
	    primary:2
	},
	default:1
    },
    {
	limit:13,
	rules:{
	    motorway:8,
	    motorway_link:8,
	    trunk:6,
	    primary:4
	},
	default:2
    },
    {
	limit:1000,
	rules:{
	    motorway:9,
	    motorway_link:9,
	    trunk:7,
	    primary:5
	},
	default:3
    }
];

function render(feature) {
    var color='red';

    switch (feature.properties.smoothness) {
    case 'excellent': color='blue'; break;
    case 'good':  color='green'; break;
    case 'intermediate': color='orange'; break;
    }

    var weight;
    for(var i=0;;i++){
	if(map.getZoom() < weightRules[i].limit){
	    weight=weightRules[i].rules[feature.properties.highway]
		|| weightRules[i].default;
	    break;
	}
    }
    
    return {color: color, weight:weight, opacity:0.65};
}
