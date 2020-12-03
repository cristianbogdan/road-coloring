document.title='Harta proiectelor de infrastructură din România';

var yr= new Date().getFullYear();

document.head.insertAdjacentHTML
( 'afterbegin','<style>'
+'body,html{height:100%;width:100%;}'
+'.map {  height:100%;width:100%;}'
+'.popover{width:300px;}'
+'div.ol-attribution button{position: absolute; bottom: 12px;right: 0;  }'
  +'#text{  position:absolute; left:50%; bottom:0px;}'
  +'#api{  position:absolute; right:10px; top:10px; background-color:rgba(255, 255, 255, 0.4);}'
+'</style>'
);

function insertHTML(){
document.body.insertAdjacentHTML
( 'afterbegin',
  '<div id="map" class="map"> '
+'<div id="gmap" class="map"></div>'
  +'<div id="olmap" class="map"><div id="popup"></div></div>'
  +'</div>'
  +'  <div id="text"></div>'
  +'  <a href="http://proinfrastructura.ro"><img id="api" src="http://proinfrastructura.ro/images/logos/api/logo_api_portrait_big.png" width="50"/></a>'


)  ;
}

loadScript(["googleMapsKey.js", loadAll],0);

function loadAll(){
loadScript([
    "http://code.jquery.com/jquery-1.11.2.min.js",
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css", 
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js",
    insertHTML,
//    "https://cdnjs.cloudflare.com/ajax/libs/openlayers/4.6.5/ol.css",
//   "https://cdnjs.cloudflare.com/ajax/libs/openlayers/4.6.5/ol.js",
    "https://cdnjs.cloudflare.com/ajax/libs/openlayers/3.15.1/ol.css",
    "https://cdnjs.cloudflare.com/ajax/libs/openlayers/3.15.1/ol.js",
//    "https://tyrasd.github.io/osmtogeojson/osmtogeojson.js",
    "http://maps.google.com/maps/api/js?v=3&sensor=false&key="+window.googleMapsKey,
    "gmap.js",
    "project-colors.js",
    "projects-legend.js",
    "vector-gmaps.js"
], 0);
}