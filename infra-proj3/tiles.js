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
    <script src="index.js" ></script>
  </head>
*/

try { MAP_ROOT }catch(e) {
    MAP_ROOT="";
}

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
        //osmBwUrl= 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
        roadQUrl1= MAP_ROOT+'/infraGraphic/{z}/{x}/{y}.png',
        landUrl='https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey='+thunderforestKey,
        //        landUrl = 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
//      hikeBikeUrl='https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
        googleUrl= 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
        
        thunAttrib = '&copy; '+osmLink+' Contributors & '+thunLink;
    
    var osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib}),
        googleMap= L.tileLayer(googleUrl),
//      osmBwMap=L.tileLayer(osmBwUrl, {attribution: osmAttrib}),
        landMap = L.tileLayer(landUrl, {attribution: thunAttrib}),
//      osmHikeBikeMap = L.tileLayer(hikeBikeUrl, {attribution: thunAttrib}),
        roadQMap1= L.tileLayer(roadQUrl1),
//      roadQMap2= L.tileLayer(roadQUrl2),
//      roadQMap3= L.tileLayer(roadQUrl3),
//      roadQMap4= L.tileLayer(roadQUrl4),
 //       roadQMap5= L.tileLayer(roadQUrl5),
//      roadQMap6= L.tileLayer(roadQUrl6),
//      roadQMap7= L.tileLayer(roadQUrl7),
//      roadQMap8= L.tileLayer(roadQUrl8);
        dummy=0;
    
    function changeUrl(){
        window.location.replace("#map="+map.getZoom()+"/"
                                +Math.round(map.getCenter().lat*1000)/1000+"/"
                                +Math.round(map.getCenter().lng*1000)/1000);
    };
    

    var lat= 46;
    var lng= 25;
    
    var x=window.location.href.split('#map=');
    if(x.length==2){
        var y= x[1].split("/");
        zoom=y[0];
        lat=y[1];
        lng=y[2];
    }

    
// map.addLayer(landMap);
    map.addLayer(googleMap);
    map.addLayer(roadQMap1);
//    map.addLayer(roadQMap2);
//    map.addLayer(roadQMap3);
//    map.addLayer(roadQMap4);
//    map.addLayer(roadQMap5);
//    map.addLayer(roadQMap6);
//    map.addLayer(roadQMap7);
//    map.addLayer(roadQMap8);
    
    map.on('dragend', changeUrl);
    map.on('zoomend', changeUrl);


    map.setView( new L.LatLng(lat, lng), zoom);

    L.control.layers(
        {
            "Google": googleMap,
            "Landscape":landMap,
            //"Hike & bike": osmHikeBikeMap,
            //  "OSM B&W":osmBwMap
            },
            {
                "Projects1":roadQMap1,
//              "Projects2":roadQMap2,
//              "Projects3":roadQMap3,
//              "Projects4":roadQMap4,
//              "Projects5":roadQMap5,
//              "Projects6":roadQMap6,
//              "Projects7":roadQMap7,
//              "Projects8":roadQMap8,
            }       
    ).addTo(map);
    changeUrl();
}
