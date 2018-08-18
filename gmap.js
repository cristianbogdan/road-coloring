var gmap = new google.maps.Map(document.getElementById('gmap'), {
  disableDefaultUI: true,
  keyboardShortcuts: false,
  draggable: false,
  disableDoubleClickZoom: true,
  scrollwheel: false,
    streetViewControl: false,
    scaleControl:true,
    mapTypeControl:true,
    mapTypeControlOptions:{mapTypeIds:['hybrid','satellite','roadmap', 'terrain'], position:google.maps.ControlPosition.TOP_CENTER}
});
