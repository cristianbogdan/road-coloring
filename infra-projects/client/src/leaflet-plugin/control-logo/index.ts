import './style.css';
import L from 'leaflet';

export class Logo extends L.Control {
    declare options: L.Control.LogoOptions;

    initialize(options: L.Control.LogoOptions) {
        L.setOptions(this, options);
    }
    onAdd(_map: L.Map) {
        const rootElement = L.DomUtil.create('a', 'leaflet-control-layers leaflet-logo-container');
        const imgElement = L.DomUtil.create('img', 'logo', rootElement);
        imgElement.src = this.options.logoUrl;
        imgElement.width = 50;

        if (this.options.url) {
            rootElement.setAttribute('href', this.options.url);
            L.DomUtil.addClass(rootElement, 'clickable')
        }
        return rootElement;
    }
    // onRemove(_map: L.Map) { }
};

L.control.logo = function (opts) {
    return new Logo(opts);
}

declare module 'leaflet' {
    export namespace Control {
        class Logo extends Control {
            constructor(options: LogoOptions);
        }
        interface LogoOptions extends L.ControlOptions {
            logoUrl: string,
            url: string
        }
    }
    export namespace control {
        function logo(options: Control.LogoOptions): Control.Location;
    }
}