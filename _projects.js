document.title='Harta proiectelor de infrastructură din România';

var yr= new Date().getFullYear();

document.head.insertAdjacentHTML
( 'afterbegin',
  '<style>'+
  '.map {background: #f8f4f0;height:700px;}'+
  '.popover{width:300px;}'+
  '</style>'
);

function insertHTML(){
document.body.insertAdjacentHTML
( 'afterbegin',

  '<div><b>Harta proiectelor de infrastructură din România</b><br>'
  +'Click pe drum pentru detalii! '
  +'<b>Legenda:</b> In construcție, predare estimată: '
  +'<b><font color="#0000ff">'+yr+'</font></b>, ' 
  +'<b><font color="78bcff">'+(yr+1)+'...</font></b>, '
  +'<b><font color="#809bc0">neatribuit</font></b> '
  
  +'Predare fără acces trafc: '
  +'<b><font color="#ff0000">'+yr+'</font></b>, '
  +'<b><font color="#F08080">'+(yr+1)+'...</font></b> '

  +'Variante de viteză CF: '
  +'<b><font color="#000000">in constructie</font></b>,'
  +'<b><font color="#787878">neatribuit</font></b> '
  +'</div>'

  +'<div id="map" class="map"><div id="popup"></div></div>'
  +'<div id="text"></div>'
  
  +'<div><hr/>Date hartă: <a href="http://www.openstreetmap.org/copyright">contributori OSM</a> și <a href="http://www.proinfrastructura.ro">API</a>/<a href="http://www.peundemerg.ro">peundemerg.ro</a> </div>'
)  ;
}

loadScript([
    "https://code.jquery.com/jquery-1.11.2.min.js",
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/css/bootstrap.min.css", 
    "https://maxcdn.bootstrapcdn.com/bootstrap/3.3.5/js/bootstrap.min.js",
    insertHTML,
    "http://openlayers.org/en/v3.11.1/css/ol.css",
    "http://standup.csc.kth.se/maps/ol-debug10.js",
    "vector.js",
    "https://spreadsheets.google.com/feeds/cells/1jEmiKZ2hiKzlk_68mSV-L-mzwFJOGEXVBj3tXFFwWJc/default/public/basic?alt=json-in-script&callback=punctCritic"
], 0);


