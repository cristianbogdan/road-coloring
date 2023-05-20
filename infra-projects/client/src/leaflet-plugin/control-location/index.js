import './style.css';
import L from 'leaflet';

L.Control.Location = L.Control.extend({
    options: {
        iconUrl: ""
    },
    isActive: false,
    initialize(options) {
        L.setOptions(this, options);
    },
    onAdd: function (map) {
        const rootElement = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
        L.DomEvent.disableClickPropagation(rootElement)

        const buttonElement = L.DomUtil.create('a', '', rootElement);
        buttonElement.href = "#"
        buttonElement.title = "Show current location"

        const iconElement = L.DomUtil.create('img', 'action', buttonElement);
        iconElement.src = this.options.iconUrl;

        const isGeoLiveElement = L.DomUtil.create('div', null, buttonElement);

        map.on('locationfound', (e) => {
            if (!this.marker) {
                this.marker = L.circleMarker(e.latlng, { radius: 10, color: "red" }).addTo(map);
                this.marker.getElement().style.cursor = "default";
            }
            else {
                this.marker.addTo(map)
                this.marker.setLatLng(e.latlng);
                // this.marker.setRadius(e.accuracy * 10);
            }
            if (this.locationJustInitiated) {
                this.locationJustInitiated = false;
                map.locate({  maxZoom: 13, watch: true, setView: false, enableHighAccuracy: true });
            }
        });

        map.on('locationerror', (e) => {
            console.error(e.message);

            // code: 1, message: 'Geolocation error: User denied Geolocation.', type: 'locationerror',
            if (e.code === 1) {
                window.alert("Nu am putut determina locatia curenta. Verifica daca ai permis aplicatiei sa acceseze locatia ta.")
                L.DomUtil.removeClass(isGeoLiveElement, 'active');
                this.marker.remove()
            }
        });
        
        L.DomEvent.on(buttonElement, 'click', (e) => {
            this.isActive = !this.isActive;
            if (this.isActive) {
                L.DomUtil.addClass(isGeoLiveElement, 'active');
                map.locate({  maxZoom: 13, watch: false, setView: true, enableHighAccuracy: true });
                this.locationJustInitiated = true; 
                
            } else {
                map.stopLocate();
                this.marker.remove()
                L.DomUtil.removeClass(isGeoLiveElement, 'active');
            }
        });
        return rootElement

    },
    onRemove: function (map) { },
});

L.control.location = function (opts) {
    return new L.Control.Location(opts);
}
