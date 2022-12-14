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

    map.createPane('years');
    map.getPane('years').style.zIndex = 650;;                                                                                                                          
    map.getPane('years').style.pointerEvents = 'none'; 
    
    // create the OpenStreetMap layer

    const osmLink = '<a href="https://openstreetmap.org">OpenStreetMap</a>',
    thunLink = '<a href="https://thunderforest.com/">Thunderforest</a>';
    
    var osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        osmAttrib = '&copy; ' + osmLink + ' Contributors',
        roadQUrl1= MAP_ROOT+'/infraPbf/{z}/{x}/{y}.pbf',
        //osmBwUrl= 'https://tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
        landUrl='https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png?apikey='+thunderforestKey,
        //        landUrl = 'https://{s}.tile.thunderforest.com/landscape/{z}/{x}/{y}.png',
//      hikeBikeUrl='https://tiles.wmflabs.org/hikebike/{z}/{x}/{y}.png',
        googleUrl= 'https://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}'
    ,        thunAttrib = '&copy; '+osmLink+' Contributors & '+thunLink;
    
    var osmMap = L.tileLayer(osmUrl, {attribution: osmAttrib}),
        googleMap= L.tileLayer(googleUrl),
//      osmBwMap=L.tileLayer(osmBwUrl, {attribution: osmAttrib}),
        landMap = L.tileLayer(landUrl, {attribution: thunAttrib}),
//      osmHikeBikeMap = L.tileLayer(hikeBikeUrl, {attribution: thunAttrib}),
//      roadQMap1= L.tileLayer(roadQUrl1),
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


     var style = {
        "clickable": true,
        "color": "#ff0000",
        "fillColor": "#00D",
        "weight": 2.0,
        "opacity": 0.8,
        "fillOpacity": 0.2
    };
    var hoverStyle = {
        "fillOpacity": 0.5
    };

    var options = {
        maxZoom: 18,
        pane:'overlayPane',
        tolerance: 5,
        debug: true,
        solidChildren: true,
        style(properties){
            return style;
        }
    };

    fetch("https://pum.project-online.se/maps/data/data-overpass-infra.geo.json").then(r=>r.json()).then(function(data){
        layer= L.geoJson.vt(data, options);
        layer.addTo(map);
        layer.bindPopup('Hi There!');
        map.on('click', function (e) {
            console.log(e.latlng);
            L.popup()
                .setLatLng(e.latlng)
                .setContent('<p>'+e.latlng+'</p>')
                .openOn(map);
        });


        
        L.control.layers(
        {
            "Google": googleMap,
            "Landscape":landMap,
            //"Hike & bike": osmHikeBikeMap,
            //  "OSM B&W":osmBwMap
            },
            {
                "Projects":layer,
                "Years": yearsLayer,
            }       
    ).addTo(map);
        /*layer.bindPopup(function(layer){
            console.log(layer);
        }).addTo(map);*/
    });

/*    var pbfLayer= L.vectorGrid.protobuf(roadQUrl1, {
        getFeatureId: function(f) {
            console.log(f);
            return f.properties.osm_id;
        },
        vectorTileLayerStyles:{
            way:style
        },

        onEachFeature: function (feature, layer) {
            if (feature.properties) {
                var popupString = '<div class="popup">';
                for (var k in feature.properties) {
                    var v = feature.properties[k];
                    if(v)
                        popupString += k + ': ' + v + '<br />';
                }
                popupString += '</div>';
                layer.bindPopup(popupString);
            }

        }
        
    }
                                       );
*/
    var yearsLayer= L.tileLayer(MAP_ROOT+'/infra/{z}/{x}/{y}.png', {pane: "years"});
// map.addLayer(landMap);
    map.addLayer(googleMap);
    //map.addLayer(pbfLayer);
    map.addLayer(yearsLayer);
    
    map.on('dragend', changeUrl);
    map.on('zoomend', changeUrl);


    map.setView( new L.LatLng(lat, lng), zoom);


    changeUrl();
    yearsLayer.bringToFront();
}

