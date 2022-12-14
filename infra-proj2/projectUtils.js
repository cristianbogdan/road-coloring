function setCurrentText(lastSelected){
	 if(lastSelected){
	 var txt= '';
	 if(lastSelected.getProperties().ref || lastSelected.getProperties().name){
		//txt+=' (';
	  sep='';
          if(lastSelected.getProperties().ref)
		{txt+=lastSelected.getProperties().ref; sep=" ";}
		
	   if(lastSelected.getProperties().name)
		txt+=sep+lastSelected.getProperties().name;
		
		//txt+=')';
	    }
	    txt+=' (<a href="https://openstreetmap.org/way/'+lastSelected.getProperties().osm_id+'" target="OSM">detalii</a> si '+
		'<a href="https://openstreetmap.org/way/'+lastSelected.getProperties().osm_id+'/history" target="OSM">istoric</a> OSM)';
	    document.getElementById('current').innerHTML=txt;
	    
	    document.getElementById('current_status').innerHTML=lastSelected.getProperties().status;
	}else {
	    document.getElementById('current').innerHTML
		=document.getElementById('current_status').innerHTML
		='';
	}


}

function zoomOn(props){
		var yresolution= (props.height*1.4)/map.getSize()[1];
		var xresolution= (props.width*1.4)/map.getSize()[0];
		
		map.getView().setCenter(ol.proj.fromLonLat(JSON.parse(props.center).coordinates));
		if(xresolution==0 || yresolution==0)		
		    map.getView().setZoom(15);
		else
		{
		    var resolution=Math.max(xresolution, yresolution);
		//    console.log(resolution);
		    if(resolution>=map.getView().getMinResolution()){
			/*		    while(map.getView().getResolution()/2>resolution){
			 map.getView().setResolution(map.getView().getResolution()/2);
			 }*/
			map.getView().setResolution(resolution);
		    }
		    else
			map.getView().setZoom(17);
		}
}

function findPlace(input){
    let s= input.value.trim();	
    if(s.startsWith("44.") || s.startsWith("45.") || s.startsWith("46.") || s.startsWith("47.") || s.indexOf("/")!=-1)
	input.val=s;
    
    else	
	fetch("https://nominatim.openstreetmap.org/search?q="+input.value+"&format=json&countrycodes=RO")
	.then(r=>r.json())
	.then(d=>d.filter(e=>/*e.type!='administrative'  && */e.type!='archaeological_site'))  // administrative= judete dar nu chiar...
	.then(d=> {
	    input.val=input.value=(d&&d[0])?d[0].display_name:"?"+input.value;
	});
}

