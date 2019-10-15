var wdth= 4;
var yellow= new ol.style.Style({
    stroke: new ol.style.Stroke({
	width: 5,
	color: [0xff,0xff,0,1]
    })
});

var transp= new ol.style.Style({
    stroke: new ol.style.Stroke({
	width: 20,
	color: [0xff,0xff,0xff,0.01]
    })
});

var blue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0,0,0xff, 1]
	}),
/*    text: new ol.style.Text({
	font: 'bold 14px "Open Sans", "Arial Unicode MS", "sans-serif"',
	placement: 'line',
	fill: new ol.style.Fill({
	    color: 'white'
	})
    })*/
});

var green=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0,210,0, 1]
	})
});

var dodgerBlue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x19,0x9a,0x8d, 1]
	})
});

var deepSkyBlue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x20,0xc5,0xb5, 1]
	})
});

var lightSkyBlue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x40,0xe0,0xd0, 1]
	})
});

var powderBlue=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x91,0xed,0xe4, 1]
	})
});


var lightblue=new ol.style.Style({
    stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x1e,0x90,0xff, 1]
	})
});

var red=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0xb3,0,0, 1]
	})
});

var lightred=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [255,189,189, 1]
	})
});


var orange=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0xff,0xbf,0x00, 1]
	})
});

var orangeRed=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0xff,0x45,0x00, 1]
	})
});

var bridge=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth+3,
	    color: [0,0,0, 0.5]
	})
});

var proposed_highway=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth,
	    color: [0x80,0x9b,0xc0, 1]
	})
    });


var gray=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: 3,
	    color: [0x78,0x78,0x78, 1]
	})
    });
var black=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: 3,
	    color: [0,0,0, 1]
	})
    });

var railDash=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: 2,
	    lineDash:[5,10],
	    color: [0,0,0, 1]
	})
    });

var whiteDash=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth-2,
	    lineDash:[10,10],
	    color: [0xff,0xff,0xff, 1]
	})
    });


var redDash=new ol.style.Style({
	stroke: new ol.style.Stroke({
	    width: wdth-2,
	    lineDash:[10,10],
	    color: [0xff,0x0,0x0, 1]
	})
    });

var noNothing=new ol.style.Style({
    stroke: new ol.style.Stroke({
	    width: wdth,
	    lineDash:[10,10],
	    color: [0, 0xff,0,1]
	})
    });

function toHex(n){
    var ret= new Number(n).toString(16);
    if (ret.length==1)
	return '0'+ret;
    return ret;
}

function clr(style){
    return '#'+toHex(style.getStroke().getColor()[0])
	+toHex(style.getStroke().getColor()[1])
    	+toHex(style.getStroke().getColor()[2]);
}
    
var colorProgress=function(latestProgress){
    return latestProgress>75?dodgerBlue:latestProgress>50?deepSkyBlue:latestProgress>25?lightSkyBlue:latestProgress>0?powderBlue:gray;
}

