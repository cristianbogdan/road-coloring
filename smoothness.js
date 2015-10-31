/*global L */
function loadDoc() {
      
    // create a map
    var map = new L.Map('mymap');
    
    // create the OpenStreetMap layer
    var osmTile = "http://tile.openstreetmap.org/{z}/{x}/{y}.png";
    var osmCopyright = "Map data &copy; 2015 OpenStreetMap contributors";
    var osmLayer = new L.TileLayer(osmTile, { maxZoom: 18, attribution: osmCopyright } );
    map.addLayer(osmLayer);
    
    // set the map's starting view
    map.setView( new L.LatLng(46, 25), 7 );

    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
	if (xhttp.readyState == 4) {
	    var trunk= L.geoJson(JSON.parse(xhttp.responseText) ,{ style: render});
	    trunk.addTo(map);

	    var xhttp1 = new XMLHttpRequest();
	    xhttp1.onreadystatechange = function() {
		if (xhttp1.readyState == 4) {
		    var rest=L.geoJson(JSON.parse(xhttp1.responseText) ,{ style: render});
		    rest.addTo(map);
		    trunk.bringToFront();
		    L.control.layers({}, { "A, DN":trunk,
					   "DJ, DC": rest}
			).addTo(map);
		}
	    };
	    xhttp1.open("GET", "other-roads.json", true);
	    xhttp1.send();
	}
    };
    xhttp.open("GET", "main-roads.json", true);
    xhttp.send();
}

function render(feature) {
    var color='red';
    var weight=1;
    
    switch (feature.properties.smoothness) {
    case 'excellent': color='blue'; break;
    case 'good':  color='green'; break;
    case 'intermediate': color='yellow'; break;
    }
    
    switch (feature.properties.highway) {
    case 'motorway': weight=6; break;
    case 'trunk':  weight=4; break;
    case 'primary': weight=2; break;
    }
    return {color: color, weight:weight, opacity:0.65};
}
