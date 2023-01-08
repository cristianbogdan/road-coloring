SCRIPT_ROOT+="/infra-proj3/";
document.title='Harta proiectelor de infrastructură din România';

var yr= new Date().getFullYear();

document.head.insertAdjacentHTML
( 'afterbegin','<style>'
+  'body {            padding: 0;            margin: 0;}'
+ 'html,     body,        #mymap {            height: 100%;            width: 100%;        }'
+'body,html{height:100%;width:100%;}'
+'</style>'
);

function insertHTML(){
document.body.insertAdjacentHTML
    ( 'afterbegin', '    <div id="mymap"></div>');
}

loadScript(["../common/googleMapsKey.js", loadAll],0);

function loadAll(){
    loadScript([
        "leaflet-1.9.3.css",
        "style.css",
        "leaflet-1.9.3.js",
        "https://unpkg.com/geojson-vt@3.2.0/geojson-vt.js",
        "leaflet-geojson-vt/index.js",
        "constants.js",
        "legend.js",
        "../common/thunderforestKey.js",
        "leaflet.edgebuffer.js",
        "tiles-vt.js",
        insertHTML,
        ()=>loadDoc(8)
], 0);
}

