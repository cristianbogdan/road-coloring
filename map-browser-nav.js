/* global ol */
var MapBrowserNav= function(){
    this.zoom = 7;
    this.center = [25, 46];
    this.rotation = 0;

    if (window.location.hash !== '') {
	// try to restore center, zoom-level and rotation from the URL
	var hash = window.location.hash.replace('#map=', '');
	var parts = hash.split('/');
	if (parts.length>=3) {
	    this.zoom = parseInt(parts[0], 10);
	    this.center = [
		parseFloat(parts[2]),
		parseFloat(parts[1])
	    ];
	    this.rotation= 0;
	    if(parts.length===4)
		this.rotation = parseFloat(parts[3]);
	}
    }

    this.attachTo= function(map){

	var shouldUpdate = true;
	this.updatePermalink = function() {
	    if (!shouldUpdate) {
	    // do not update the URL when the view was changed in the 'popstate' handler
		shouldUpdate = true;
		return;
	    }
	
	    var center = ol.proj.toLonLat(map.getView().getCenter());
	    var hash = '#map=' +
	    map.getView().getZoom() + '/' +
		Math.round(center[1] * 1000) / 1000 + '/' +
		Math.round(center[0] * 1000) / 1000 + '/' +
		map.getView().getRotation();
	    var state = {
		zoom: map.getView().getZoom(),
		center: center,
		rotation: map.getView().getRotation()
	    };
	    window.history.pushState(state, 'map', hash);
	};
    
	map.on('moveend', this.updatePermalink);
    
	// restore the view state when navigating through the history, see
	// https://developer.mozilla.org/en-US/docs/Web/API/WindowEventHandlers/onpopstate
	window.addEventListener('popstate', function(event) {
	    if (event.state === null) {
		return;
	    }
	    map.getView().setCenter(ol.proj.fromLonLat(event.state.center));
	    map.getView().setZoom(event.state.zoom);
	    map.getView().setRotation(event.state.rotation);
	    shouldUpdate = false;
	});
    };
};
