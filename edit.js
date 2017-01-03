/*global L smoothness allRoads*/

/* Example use:
(make sure all-roads.topo.json.js is served gzipped)

  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <script src="http://d3js.org/topojson.v1.min.js"></script>
    <script src="all-roads.topo.json.js"></script>
    <link rel="stylesheet" href="http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.css" />
    <script src="leaflet.js"></script>
    <script src="smoothness.js" ></script>
    <script src="edit.js" ></script>
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

    //map.addLayer(osmBwMap);

    var smo= new smoothness(map, 7,46,25);
    
    var all=smo.addLayer(allRoads, popup);

    /*
    L.control.layers(
	{
	    "OSM blawk&white": osmBwMap,
	    "OSM": osmMap,
	    "OSM Landscape": landMap
	},
	{
	    "all":all
	    
	    
	}
    ).addTo(map);
*/

}


function popup(feature, layer){

    var surf= feature.properties.surface_survey;
    surf= surf||"";
    var i= surf.indexOf("_http://");

    if(i!=-1)
	surf="<a href="+surf.substring(i+1)+">"+surf.substring(0, i)+"</a>";
    
    var text=	(feature.properties.ref?"<b>"+feature.properties.ref+":</b> ":"")+
	    (feature.properties.smoothness?
	     feature.properties.smoothness+
	     "<br><b>surface survey:</b> " +
	     surf:'')
	+"<br>";
    var x=0;
    feature.properties.osm_id.split(',').forEach(function(osm_id){
	text+='<a href="http://openstreetmap.org/way/'+osm_id+'" target="OSMEditor">'+(++x)+'</a> ';
    });
    
    layer.bindPopup(text,{maxWidth: 200}
    );

};
