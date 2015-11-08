/*global L topojson*/

function smoothness(theMap, z, lat, long, opacity){
    this.map=theMap;
    this.layers=[];
    this.initParams();
    this.setPosition(z, lat, long);
    
    var oldZoom= this.map.getZoom();
    var zs;
    this.map.on('zoomstart', function(){
	zs= new Date();
    });
    var smo= this;

    this.opacity=opacity ||0.65;
    
    this.detailLevel= findDetailLevel(this.map.getZoom());   
    
    this.map.on('zoomend', function(){
	console.log(new Date()-zs);
	if(oldZoom==smo.map.getZoom())
	    return;
	smo.changeUrl();

	var x= findDetailLevel(smo.map.getZoom());
	if(x!=smo.detailLevel){
	    smo.detailLevel=x;

	    if(smo.opacity>0.1)
		smo.layers.forEach(function(e){
		    e.setStyle(smo.render);	
		});
	}
	oldZoom=smo.map.getZoom();

    });
    
    this.render= function(feature) {
	var color='red';
	
	switch (feature.properties.smoothness) {
	case 'excellent': color='blue'; break;
	case 'good':  color='green'; break;
	case 'intermediate': color='orange'; break;
	case 'bad':
	case 'very_bad':
	case 'horrible':
	case 'very_horrible':
	case 'impassable':
	    color='red'; break;
	default: color='black';
	}

	var weight=weightRules[smo.detailLevel].rules[feature.properties.highway]
	    || weightRules[smo.detailLevel].default;
	if(smo.opacity <0.1)
	    weight=weightRules[smo.detailLevel].rules['motorway'];
	return {color: color, weight:weight, opacity:smo.opacity};
    };

    this.map.on('dragend', function(){
	smo.changeUrl();
    });

    this.changeUrl();

    /*
    map.on('click', function (evt) {
        var latLng = evt.latlng,
            clickedPoint = evt.layerPoint,
            nearestMarker = null,
            minDistance = Infinity,
            markerClickDistance = 12, // pixels
           distance;
        trunk.eachLayer(function (circleMarker) {
            distance = latLng.distanceTo(circleMarker.getLatLng());
            if (distance < minDistance) {
                minDistance = distance;
                nearestMarker = circleMarker;
            }
        });
        if (nearestMarker) {
            distance = map.latLngToLayerPoint(nearestMarker.getLatLng()).distanceTo(clickedPoint);
            if (distance <= markerClickDistance) {
                nearestMarker.openPopup();
            }
        }
        return false;
     });*/

}

function findDetailLevel(zoom){
    var i=0;
    for(;i<weightRules.length && zoom>= weightRules[i].limit;i++);
    return i;
}

smoothness.prototype.addLayer=function(data, onEach){
    var ret=L.geoJson(null, {style:this.render, onEachFeature:onEach});
    ret.addTo(this.map);
    this.layers.push(ret);
    ret.addData(this.checkTopoJson(data));
    return ret;
}

smoothness.prototype.checkTopoJson=function(content){
    if(content.type==="Topology"){
	var content1=[];
	for (var key in content.objects) {
	    content1.push(topojson.feature(content, content.objects[key]));
	}
	return content1[0];
    }
    return content;
};

smoothness.prototype.initParams=function(){
    this.params={};
    var x=window.location.href.split('#map=');
    if(x.length==2){
	var y= x[1].split("/");
	this.params.zoom=y[0];
	this.params.lat=y[1];
	this.params.lng=y[2];
    }
};

smoothness.prototype.setPosition=function(z, lat, long){
    this.map.setView( new L.LatLng((this.params.lat||46),
				   (this.params.lng||25)),
		      (this.params.zoom|| 7) );
};

smoothness.prototype.changeUrl=function(){
    window.location.replace("#map="+this.map.getZoom()+"/"
			    +this.map.getCenter().lat+"/"
			    +this.map.getCenter().lng);
};


const weightRules=[
    {
	limit:9,
	rules:{
	    motorway:4,
	    motorway_link:4,
	    trunk:3,
	    primary:3
	},
	default:1
    },
    {
	limit:11,
	rules:{
	    motorway:8,
	    motorway_link:8,
	    trunk:6,
	    primary:5
	},
	default:2
    },
    {
	limit:1000,
	rules:{
	    motorway:9,
	    motorway_link:9,
	    trunk:7,
	    primary:5
	},
	default:3
    }
];


