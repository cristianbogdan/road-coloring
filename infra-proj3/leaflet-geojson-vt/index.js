/* 
  This script is licensed under the MIT License
  https://github.com/iamtekson/leaflet-geojson-vt
*/

const tileLayer = false;
const MAX = 200;

L.GeoJSON.VT = (tileLayer ? L.TileLayer : L.GridLayer).extend({
    options: {
        async: false,
    },

    initialize: function (geojson, options) {
        this.geojson = geojson;
        L.setOptions(this, options);
        if (tileLayer)
            L.TileLayer.prototype.initialize.call(this, "", options);
        else
            L.GridLayer.prototype.initialize.call(this, options);

        this.tileIndex = geojsonvt(geojson, this.options);
        this.initCache();
    },

    reinitialize: function () {
        this.initialize(this.geojson, this.options);
        this.redraw();
    },

    initCache() {
        // TODO: should be a WeakMap
        this.cache = new Map();
        this.keys = [];
    },
    createTile: function (coords, done) {
        const strKey = `/infra/${coords.z}/${coords.x}/${coords.y}.png`;

        const cachedTile = this.cache.get(strKey);
        if (cachedTile) {
            // console.log("hit "+`${coords.z}/${coords.x}/${coords.y}`);
            setTimeout(function () { done(null, cachedTile); });
            return cachedTile;
        }
        // create a <canvas> element for drawing       
        var tile = L.DomUtil.create("canvas", "leaflet-tile");


        function drawLater() {
            // setup tile width and height according to the options
            var size = this.getTileSize();
            tile.width = size.x;
            tile.height = size.y;
            // get a canvas context and draw something on it using coords.x, coords.y and coords.z
            var ctx = tile.getContext("2d");

            //            ctx.font = "12px Arial";
            //            ctx.fillText(`${coords.z}/${coords.x}/${coords.y}`, 0, 10);

            var tileInfo = this.tileIndex.getTile(coords.z, coords.x, coords.y);
            var features = tileInfo ? tileInfo.features : [];
            for (const feature of features) {
                this.drawFeature(ctx, feature);
            }


            var img = new window.Image();

            img.addEventListener("load", function () {
                ctx.drawImage(img, 0, 0);
            });
            img.setAttribute("src", strKey);

            if (coords.z < 12) {
                this.cache.set(strKey, tile);
                this.keys.push(strKey);
                if (this.keys.length == MAX) {
                    for (let i = 0; i < 10; i++)
                        this.cache.delete(this.keys[i]);
                    this.keys.splice(0, 10);
                }
            }

            // return the tile so it can be rendered on screen
            done(undefined, tile);
        };
        //looks like if there's a few ms timeout, Leaflet will not have the "zoom level mix" problem
        setTimeout(drawLater.bind(this));
        return tile;
    },

    drawFeature: function (ctx, feature) {
        if (this.options.filter instanceof Function) {
            if (!this.options.filter(feature)) {
                return;
            }

        }
        const { type, geometry } = feature;

        ctx.beginPath();
        // ctx.setLineDash([10, 5]);  // 10px dashes, 5px spaces
        if (this.options.style) this.options.style instanceof Function ? this.setStyle(ctx, this.options.style(feature)) : this.setStyle(ctx, this.options.style);

        if (type === 2 || type === 3) {
            for (const ring of geometry) {
                for (var k = 0; k < ring.length; k++) {
                    var p = ring[k];
                    if (k) ctx.lineTo(p[0] / 16.0, p[1] / 16.0);
                    else ctx.moveTo(p[0] / 16.0, p[1] / 16.0);
                }
            }
        } else if (type === 1) {
            for (const point of geometry) {
                const [x, y] = point;
                ctx.arc(x / 16.0, y / 16.0, 2, 0, Math.PI * 2, true);
            }
        }
        if (type === 3 && this.options.style.fill) ctx.fill(this.options.style.fillRule || "evenodd");

        ctx.stroke();
    },

    setStyle: function (ctx, style) {
        var stroke = style.stroke || true;
        if (stroke) {
            ctx.lineWidth = style.weight || 5;
            var color = this.setOpacity(style.color, style.opacity);
            ctx.strokeStyle = color;
        } else {
            ctx.lineWidth = 0;
            ctx.strokeStyle = {};
        }
        var fill = style.fill || true;
        if (fill) {
            ctx.fillStyle = style.fillColor || "#03f";
            var color = this.setOpacity(style.fillColor, style.fillOpacity);
            ctx.fillStyle = color;
        } else {
            ctx.fillStyle = {};
        }
    },

    setOpacity: function (color, opacity) {
        if (opacity) {
            var color = color || "#03f";
            if (color.iscolorHex()) {
                var colorRgb = color.colorRgb();
                return (
                    "rgba(" +
                    colorRgb[0] +
                    "," +
                    colorRgb[1] +
                    "," +
                    colorRgb[2] +
                    "," +
                    opacity +
                    ")"
                );
            } else {
                return color;
            }
        } else {
            return color;
        }
    },
});

L.geoJson.vt = function (geojson, options) {
    return new L.GeoJSON.VT(geojson, options);
};

String.prototype.iscolorHex = function () {
    var sColor = this.toLowerCase();
    var reg = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    return reg.test(sColor);
};

String.prototype.colorRgb = function () {
    var sColor = this.toLowerCase();
    if (sColor.length === 4) {
        var sColorNew = "#";
        for (var i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
        }
        sColor = sColorNew;
    }
    var sColorChange = [];
    for (var i = 1; i < 7; i += 2) {
        sColorChange.push(parseInt("0x" + sColor.slice(i, i + 2)));
    }
    return sColorChange;
};
