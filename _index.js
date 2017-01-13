document.title='Harta calității drumurilor OSM';

var prefix=location.pathname.substring(location.pathname.lastIndexOf("/") + 1);
var x= prefix.indexOf('-');
prefix=(x==-1)?'':prefix.substring(0, x+1);

function insertHTML(){
document.body.insertAdjacentHTML
( 
    'afterbegin',
    '<div id="mymap" style="width:100%;height:630px;margin:auto;"></div> '
	+'<div style="width:900px;margin:auto;"> '
	+'<font size="smaller"> '
	+'<b><a href="http://wiki.openstreetmap.org/wiki/Key:smoothness">Legenda:</a> '
	+'<font color="blue">excellent</font> '
	+'<font color="#376f00">good</font> '
	+'<font color="#ff9f00">intermediate</font> '
	+'<font color="red">bad very_bad</font> '
	+'<font color="#ff00ff"">horrible very_horrible impassable</font></b><br/>'
	+'<font size="smaller">Vezi <a href="hcd-log.html">ultimele noutăți</a> în privința calității drumurilor!</font></br>'      
	+'<font size="smaller">Lipsește drumul tău "favorit"? Treci în <a href="http://cristi.dtdns.net/maps/edit.html" id="editlink" onmouseover="this.href=\'http://cristi.dtdns.net/maps/edit.html#map=\'+window.location.href.split(\'#map=\')[1]">modul de editare!</a> (ai nevoie de un cont OSM)</font>'

    
	+'<h2>Harta calității drumurilor din România, varianta Open Data / OSM</h2>'
	+'Harta se actualizează automat la fiecare 24h cu date despre calitatea drumurilor preluate din <a href="http://openstreetmap.org">OpenStreetMap</a>.'
	+'<h3>See also</h3>'
	+'Hărți actualizate manual pe baza rapoartelor scrise:'
	+'<a href="http://enjoymaps.ro/harta-interactiva-calitatii-drumurilor-din-romania/">enjoymaps.ro</a>,'
	+'<a href="http://forum.peundemerg.ro/index.php?topic=199.0">peundemerg.ro</a> (@Vancouver)'
	+'</ul>'
    
	+'<h3>Source code</h3>'
	+'<a href="https://github.com/cristianbogdan/road-coloring">github</a> '
	+'CreativeCommons license, <a href="http://forum.peundemerg.ro/index.php?action=profile;u=2034">@cristi5</a>'
        +'</div>'
);
}

loadScript([ 
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css", 
    insertHTML,
    "leaflet.css","leaflet.js",
    "tiles.js", "smoothness.js", function(){ loadDoc();}], 0
	  );

