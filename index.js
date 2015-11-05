/*global L smoothness mainRoads otherRoads radare*/

/* Example use : 
(make sure the large data js files are served gzipped)

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <script src="http://d3js.org/topojson.v1.min.js"></script>
    <script src="http://roads2.enjoymaps.ro/geo/radare.js"></script>
    <script src="main-roads.topo.json.js"></script>
    <script src="other-roads.topo.json.js"></script>
    <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />
    <script src="leaflet.js"></script>
    <script src="smoothness.js" ></script>
    <script src="index.js" ></script>
  </head>
*/

function loadDoc() {
    
    var map= new L.Map('mymap');
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

    var smo= new smoothness(map, 7,46,25);

    // set the map's starting view
    var control= L.geoJson(null, {onEachFeature:function(feature, layer){
	layer.bindPopup("<b>Control rovigneta:</b> "
			+feature.properties.locatie+" ("
			+feature.properties.drum+")<br>"+
			"data from <a href=\"http://enjoymaps.ro\">enjoymaps.ro</a>",
			{maxWidth: 200});
    
    }});

    control.addTo(map);
    control.addData(radare[0]);
    
    L.control.layers(
	{
	    "OSM black&white": osmBwMap,
	    "OSM": osmMap,
	    "OSM Landscape": landMap
	},
	{
	    "A, DN":smo.addLayer(mainRoads, popup)
	    ,"DJ, DC": smo.addLayer(otherRoads, popup)
	    , "control (enjoymaps.ro)":control
	}
    ).addTo(map);
}

function popup(feature, layer){
    layer.bindPopup((feature.properties.ref?"<b>"+feature.properties.ref+":</b> ":"")+
		    feature.properties.smoothness+ 
		    "<br><b>surface survey:</b> " +
		    (feature.properties.surface_survey ||"") +"<br>", {maxWidth: 200});

    //layer.on('mouseover', function() { layer.openPopup(); });
    //layer.on('mouseout', function() { layer.closePopup(); });
};


