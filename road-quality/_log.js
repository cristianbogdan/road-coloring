document.title= "Harta calității drumurilor din România @OSM: contribuții ";

function insertHTML(){
    document.body.insertAdjacentHTML
( 
    'afterbegin',
    '<h1><a href="https://proinfrastructura.ro/harta-calitatii-drumurilor.html">Calitatea drumurilor din România</a> - contribuții pe <a href="https://openstreetmap.org">OpenStreetMap</a></h1>'
	+'<div id="text"/>'
);
}

loadScript([ 
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css", 
    insertHTML,
    SCRIPT_ROOT+"data/log.js",
    "https://stevenlevithan.com/assets/misc/date.format.js",
    SCRIPT_ROOT+"logLoop.js",
], 0
	  );
