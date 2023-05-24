declare module L {
    export namespace Control {
        type CTR = import('leaflet').Control
        
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
