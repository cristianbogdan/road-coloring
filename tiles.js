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

function loadDoc(zoom) {
    zoom=zoom||7;
    
    var map= new L.Map('mymap',{
	minZoom:7,
	maxZoom:13
    });
    // create the OpenStreetMap layer

    const osmLink = '<a href="http://openstreetmap.org">OpenStreetMap</a>',
    thunLink = '<a href="http://thunderforest.com/">Thunderforest</a>';
    
    var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; ' + osmLink + ' Contributors',
	osmBwUrl= 'http://standup.csc.kth.se/tiles/{z}/{x}/{y}.png',
//	osmBwUrl= 'http://ev.csc.kth.se:18080/tiles/tiles/{z}/{x}/{y}.png',
        landUrl = 'http://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
        thunAttrib = '&copy; '+osmLink+' Contributors & '+thunLink;
    
    var osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib}),
	osmBwMap=L.tileLayer(osmBwUrl, {attribution: osmAttrib}),
        landMap = L.tileLayer(landUrl, {attribution: thunAttrib});

    map.addLayer(osmBwMap);

    var smo;
    if('smoothness' in window){
	smo = new smoothness(map, zoom,46,25, 0.00001);
    }
    else
	map.setView( new L.LatLng(46, 25), zoom);

    if('mainRoads' in window)
	L.control.layers(
	    {
		"OSM + road quality":osmBwUrl
	    },
	    {
		"A, DN details":smo.addLayer(mainRoads, popup)
		,"DJ, DC details": smo.addLayer(otherRoads, popup)
		
	    }
	).addTo(map);
}

function popup(feature, layer){
    var surf= feature.properties.surface_survey;
    surf= surf||"";
    var x= surf.indexOf("_http://");

    if(x!=-1)
	surf="<a href="+surf.substring(x+1)+">"+surf.substring(0, x)+"</a>";
    
    layer.bindPopup((feature.properties.ref?"<b>"+feature.properties.ref+":</b> ":"")+
		    feature.properties.smoothness+ 
		    "<br><b>surface survey:</b> " +
		     surf, {maxWidth: 200});

    //layer.on('mouseover', function() { layer.openPopup(); });
    //layer.on('mouseout', function() { layer.closePopup(); });
};
