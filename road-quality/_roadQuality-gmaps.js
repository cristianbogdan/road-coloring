SCRIPT_ROOT+="/road-quality/";
document.title='Harta calitatii drumurilor din România';

var yr= new Date().getFullYear();

document.head.insertAdjacentHTML
( 'afterbegin','<style>'
+'body,html{height:100%;width:100%;}'
+'.map {  height:100%;width:100%;}'
+'.popover{width:300px;}'
+'div.ol-attribution button{position: absolute; bottom: 12px;right: 0;  }'
  +'#text{  position:absolute; left:50%; bottom:0px;}'
  +'#api{  position:absolute; right:10px; top:10px; background-color:rgba(255, 255, 255, 0.4);}'
  +'    div.layer-switcher {'
  + 'position:absolute; right:10px; top:100px;'
 +'padding: 0;'
+'	margin: 0;'
+'	font-family: sans-serif;'
+'	font-size: small;'
+'    }'
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
  +'  <a href="https://proinfrastructura.ro"><img id="api" src="https://proinfrastructura.ro/images/logos/api/logo_api_portrait_big.png" width="50"/></a>'


)  ;
}

loadScript(["../common/googleMapsKey.js", loadAll],0);

function loadAll(){
loadScript([
    "https://unpkg.com/jquery@1.11.2/dist/jquery.min.js",
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css", 
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js",
    insertHTML,
//   "https://cdnjs.cloudflare.com/ajax/libs/ol3/4.0.1/ol.css",
//        "https://cdnjs.cloudflare.com/ajax/libs/ol3/4.0.1/ol.js",
    "https://cdnjs.cloudflare.com/ajax/libs/openlayers/3.15.1/ol.css",
    "https://cdnjs.cloudflare.com/ajax/libs/openlayers/3.15.1/ol.js",
    "https://rawgit.com/walkermatt/ol3-layerswitcher/master/src/ol3-layerswitcher.css",
    "https://rawgit.com/walkermatt/ol3-layerswitcher/master/src/ol3-layerswitcher.js",
//    "ol-debug10.js",
    "https://maps.google.com/maps/api/js?v=3&sensor=false&key="+window.googleMapsKey,
    "../common/gmap.js",
    "vector-hcd.js"
], 0);
}

