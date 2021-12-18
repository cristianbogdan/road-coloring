/*global L smoothness mainRoads otherRoads radare*/

/* Example use : 
(make sure the large data js files are served gzipped)

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <script src="https://d3js.org/topojson.v1.min.js"></script>
    <script src="https://roads2.enjoymaps.ro/geo/radare.js"></script>
    <script src="main-roads.topo.json.js"></script>
    <script src="other-roads.topo.json.js"></script>
    <link rel="stylesheet" href="https://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />
    <script src="leaflet.js"></script>
    <script src="smoothness.js" ></script>
    <script src="index.js" ></script>
  </head>
*/

try { MAP_ROOT }catch(e) {
    MAP_ROOT="";
}
    console.log(MAP_ROOT);

function loadDoc(zoom) {
    zoom=zoom||7;
    
    var map= new L.Map('mymap',{
	minZoom:7,
	maxZoom:18
    });
    // create the OpenStreetMap layer

    const osmLink = '<a href="https://openstreetmap.org">OpenStreetMap</a>',
    thunLink = '<a href="https://thunderforest.com/">Thunderforest</a>';
    
    var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; ' + osmLink + ' Contributors',
	roadQUrl= MAP_ROOT+'/tiles/{z}/{x}/{y}.png',
	osmBwUrl= 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
	landUrl='https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey='+thunderforestKey,
	//        landUrl = 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
	hikeBikeUrl='https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
	
        thunAttrib = '&copy; '+osmLink+' Contributors & '+thunLink;
    
    var osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib}),
	osmBwMap=L.tileLayer(osmBwUrl, {attribution: osmAttrib}),
        landMap = L.tileLayer(landUrl, {attribution: thunAttrib}),
	osmHikeBikeMap = L.tileLayer(hikeBikeUrl, {attribution: thunAttrib}),
	roadQMap= L.tileLayer(roadQUrl);


// map.addLayer(landMap);
    map.addLayer(landMap);
    map.addLayer(roadQMap);

    var smo;
    if('smoothness' in window){
	smo = new smoothness(map, zoom,46,25, 0.00001);
    }
    else
	map.setView( new L.LatLng(46, 25), zoom);

	L.control.layers(
	    {
		"Landscape":landMap,
		"Hike & bike": osmHikeBikeMap,
		"OSM B&W":osmBwMap
	    },
	    {
		"Road quality":roadQMap
	    }	    
	).addTo(map);
}

function popup(feature, layer){
    var surf= feature.properties.surface_survey;
    surf= surf||"";
    var x= surf.indexOf("_https://");

    if(x!=-1)
	surf="<a href="+surf.substring(x+1)+">"+surf.substring(0, x)+"</a>";
    
    layer.bindPopup((feature.properties.ref?"<b>"+feature.properties.ref+":</b> ":"")+
		    feature.properties.smoothness+ 
		    "<br><b>surface survey:</b> " +
		     surf, {maxWidth: 200});

    //layer.on('mouseover', function() { layer.openPopup(); });
    //layer.on('mouseout', function() { layer.closePopup(); });
};
