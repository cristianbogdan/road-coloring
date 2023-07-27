import './style.css';
import L from 'leaflet';

export class Location extends L.Control {
    // private readonly opts: L.ControlOptions
    private readonly iconUrl: string;
    private marker: L.CircleMarker | undefined;
    private locationJustInitiated: boolean = false;
    private isActive: boolean = false;
    declare options: L.Control.LocationOptions;

    constructor(options: L.Control.LocationOptions) {
        super(options)
        this.iconUrl = options.iconUrl;
    }

    onAdd(map: L.Map) {
        const rootElement = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
        L.DomEvent.disableClickPropagation(rootElement)
        
        const buttonElement = L.DomUtil.create('a', '', rootElement);
        buttonElement.href = "#"
        buttonElement.title = "Show current location"

        const iconElement = L.DomUtil.create('img', 'action', buttonElement);
        iconElement.src = this.iconUrl;

        const isGeoLiveElement = L.DomUtil.create('div', undefined, buttonElement);

        map.on('locationfound', (e) => {
            // console.log(e);
            if (this.marker === undefined) {
                this.marker = L.circleMarker(e.latlng, { radius: 10, color: "red" }).addTo(map);
                const element = this.marker.getElement() as HTMLElement;
                element.style.cursor = "default";
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
            console.log(e);
            // code: 1, message: 'Geolocation error: User denied Geolocation.', type: 'locationerror',
            if (e.code === 1) {
                window.alert("Nu am putut determina locatia curenta. Verifica daca ai permis aplicatiei sa acceseze locatia ta.")
                L.DomUtil.removeClass(isGeoLiveElement, 'active');
                this.marker?.remove()
                this.isActive = false;
            }
        });
        
        L.DomEvent.on(buttonElement, 'click', (_e) => {
            this.isActive = !this.isActive;
            if (this.isActive) {
                L.DomUtil.addClass(isGeoLiveElement, 'active');
                map.locate({  maxZoom: 13, watch: false, setView: true, enableHighAccuracy: true });
                this.locationJustInitiated = true; 
                
            } else {
                map.stopLocate();
                this.marker?.remove()
                L.DomUtil.removeClass(isGeoLiveElement, 'active');
            }
        });
        return rootElement
    }
}

L.control.location = function (opts: L.Control.LocationOptions) {
    return new Location(opts);
}

declare module 'leaflet' {
    export namespace Control {
        class Location extends Control {
            constructor(options: LocationOptions);
        }
        interface LocationOptions extends L.ControlOptions {
            iconUrl: string
        }
    }
    export namespace control {
        function location(options: Control.LocationOptions): Control.Location;
    }
}
// declare module 'leaflet' {
//     namespace Control {
//         export class Location extends L.Control {
//             constructor(options: LocationOptions);
//         }
//     }
//     export namespace control {
//         function attribution(options?: Control.AttributionOptions): Control.Attribution;

//         function location(options: L.LocationOptions): Control.Location;
//         // function scale(options?: Control.ScaleOptions): Control.Scale;
//     }
//     interface LocationOptions extends L.ControlOptions {
//         iconUrl: string
//     }
// }

// L.Control.Location = L.Control.extend({
//     options: {
//         iconUrl: ""
//     },
//     marker: undefined,
//     isActive: false,
//     initialize(options: LocationOptions) {
//         L.Util.setOptions(this, options);
//     },
//     onAdd: function (map: L.Map) {
//         const rootElement = L.DomUtil.create('div', 'leaflet-control leaflet-bar');
//         L.DomEvent.disableClickPropagation(rootElement)

//         const buttonElement = L.DomUtil.create('a', '', rootElement);
//         buttonElement.href = "#"
//         buttonElement.title = "Show current location"

//         const iconElement = L.DomUtil.create('img', 'action', buttonElement);
//         iconElement.src = this.options.iconUrl;

//         const isGeoLiveElement = L.DomUtil.create('div', undefined, buttonElement);

//         map.on('locationfound', (e) => {
//             console.log(e);
//             if (!this.marker) {
//                 this.marker = L.circleMarker(e.latlng, { radius: 10, color: "red" }).addTo(map);
//                 this.marker.getElement().style.cursor = "default";
//             }
//             else {
//                 this.marker.addTo(map)
//                 this.marker.setLatLng(e.latlng);
//                 // this.marker.setRadius(e.accuracy * 10);
//             }
//             if (this.locationJustInitiated) {
//                 this.locationJustInitiated = false;
//                 map.locate({  maxZoom: 13, watch: true, setView: false, enableHighAccuracy: true });
//             }
//         });

//         map.on('locationerror', (e) => {
//             console.error(e.message);
//             console.log(e);
//             // code: 1, message: 'Geolocation error: User denied Geolocation.', type: 'locationerror',
//             if (e.code === 1) {
//                 window.alert("Nu am putut determina locatia curenta. Verifica daca ai permis aplicatiei sa acceseze locatia ta.")
//                 L.DomUtil.removeClass(isGeoLiveElement, 'active');
//                 this.marker.remove()
//             }
//         });
        
//         L.DomEvent.on(buttonElement, 'click', (e) => {
//             this.isActive = !this.isActive;
//             if (this.isActive) {
//                 L.DomUtil.addClass(isGeoLiveElement, 'active');
//                 map.locate({  maxZoom: 13, watch: false, setView: true, enableHighAccuracy: true });
//                 this.locationJustInitiated = true; 
                
//             } else {
//                 map.stopLocate();
//                 this.marker.remove()
//                 L.DomUtil.removeClass(isGeoLiveElement, 'active');
//             }
//         });
//         return rootElement

//     },
//     onRemove: function (map) { },
// });


// L.control.location = function (opts: LocationOptions) {
//     return new L.Control.Location(opts);
// }
