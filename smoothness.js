/*global L */
    // create a map
var map ;
var trunk;
var other;

function loadDoc() {      
    map= new L.Map('mymap');
    // create the OpenStreetMap layer

    const osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>',
    thunLink = '<a href="http://thunderforest.com/">Thunderforest</a>';
    
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; ' + osmLink + ' Contributors',
        landUrl = 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
        thunAttrib = '&copy; '+osmLink+' Contributors & '+thunLink;
    
    var osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib}),
        landMap = L.tileLayer(landUrl, {attribution: thunAttrib});

    map.addLayer(landMap);
    
    // set the map's starting view
    map.setView( new L.LatLng(46, 25), 7 );

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4) {
	    trunk= L.geoJson(JSON.parse(xhttp.responseText) ,{ style: render, onEachFeature:popup});
	    trunk.addTo(map);

	    var xhttp1 = new XMLHttpRequest();
	    xhttp1.onreadystatechange = function() {
		if (xhttp1.readyState == 4) {
		    other=L.geoJson(JSON.parse(xhttp1.responseText) ,{ style: render, onEachFeature:popup});
		    other.addTo(map);
		    trunk.bringToFront();
		    
		    L.control.layers({
			"OSM": osmMap,
			"OSM Landscape": landMap},
				     { "A, DN":trunk,
				       "DJ, DC": other}
			).addTo(map);
		}
	    };
	    xhttp1.open("GET", "other-roads.json", true);
	    xhttp1.send();


	}
    };
    xhttp.open("GET", "main-roads.json", true);
    xhttp.send();

    map.on('zoomend', function(){
	if(other)other.setStyle(render);
	if(trunk)trunk.setStyle(render);
    });
	  
}

function popup(feature, layer){
    layer.bindPopup((feature.properties.ref?"<b>"+feature.properties.ref+":</b> ":"")+
		    feature.properties.smoothness+ 
		    "<br><b>surface survey:</b> " +
		    (feature.properties.surface_survey ||"") +"<br>", {maxWidth: 200});

    //layer.on('mouseover', function() { layer.openPopup(); });
    //layer.on('mouseout', function() { layer.closePopup(); });
}

function render(feature) {
    var color='red';

    switch (feature.properties.smoothness) {
    case 'excellent': color='blue'; break;
    case 'good':  color='green'; break;
    case 'intermediate': color='yellow'; break;
    }

    var weight;
    if(map.getZoom()<9){
	weight=1;
	switch (feature.properties.highway) {
	case 'motorway': weight=4; break;
	case 'trunk':  weight=3; break;
	case 'primary': weight=2; break;
	}
    }else if(map.getZoom()<13){
	weight=2;
	switch (feature.properties.highway) {
	case 'motorway': weight=8; break;
	case 'trunk':  weight=6; break;
	case 'primary': weight=4; break;
	}
    }
    else{
	weight=3;
	switch (feature.properties.highway) {
	case 'motorway': weight=9; break;
	case 'trunk':  weight=7; break;
	case 'primary': weight=5; break;
	}
    }
    
    return {color: color, weight:weight, opacity:0.65};
}
