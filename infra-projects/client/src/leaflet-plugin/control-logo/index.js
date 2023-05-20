import './style.css';

L.Control.Logo = L.Control.extend({
    options: {
        url: "",
        logoUrl: ""
    },

    initialize(options) {
        L.setOptions(this, options);
    },
    onAdd: function (map) {
        const rootElement = L.DomUtil.create('a', 'leaflet-control-layers leaflet-logo-container');
        const imgElement = L.DomUtil.create('img', 'logo', rootElement);
        imgElement.src = this.options.logoUrl;
        imgElement.width = 50;

        if (this.options.url) {
            rootElement.setAttribute('href', this.options.url);
            L.DomUtil.addClass(rootElement, 'clickable')
        }
        return rootElement;
    },
    onRemove: function (map) { },
});

L.control.logo = function (opts) {
    return new L.Control.Logo(opts);
}