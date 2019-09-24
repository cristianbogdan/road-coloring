/*
curl  https://www.openstreetmap.org/api/0.6/changeset/69648591
curl  https://www.openstreetmap.org/api/0.6/changeset/69648591/download
curl  https://www.openstreetmap.org/api/0.6/way/667236048
curl  https://www.openstreetmap.org/api/0.6/way/667236048/history
https://stackoverflow.com/questions/1773550/convert-xml-to-json-and-back-using-javascript
curl -u cristian.m.bogdan@gmail.com:*** -X POST https://api-ssl.bitly.com/oauth/access_token
curl -H "Authorization: Bearer 66396cd75f9d0d906bb858609b8831092101bd7b" -d '{"long_url":"http://cristi5.ddns.net/maps/edit.html"}'  -H 'Content-Type: application/json' https://api-ssl.bitly.com/v4/shorten 
*/

var changedComment=false;
var dt= new Date();
var months=["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
if(document.querySelector('input[name="surface_survey"]'))
    document.querySelector('input[name="surface_survey"]').value= dt.getFullYear().toString()+months[dt.getMonth()]+"_";

var user= getCookie("usr");
if(user)
    if(document.querySelector('input[name="osm_user"]'))
	document.querySelector('input[name="osm_user"]').value=user;
var pass= getCookie("pass");
if(pass)
    if( document.querySelector('input[name="osm_pass"]'))
	document.querySelector('input[name="osm_pass"]').value=pass;
    
function onComment(e){
    console.log(e);
    changedComment=true;
    enableSave();
}

function enableSave(selection){
    
    var txt='';
    var sep='';
    if(Object.keys(roads).length>0){
	txt=Object.keys(roads).join(', ');
	sep=' and ';
    }
    if(other >0)
	txt+=sep+other.toString()+' segments';
    if(txt)
	txt+=" smoothness";

    if(document.querySelector('input[name="comment"]'))
	if(!changedComment || document.querySelector('input[name="comment"]').value=='')
            document.querySelector('input[name="comment"]').value= txt;
    
    if(document.querySelector('button[id="save"]'))
    document.querySelector('button[id="save"]').disabled=Object.keys(ways).length==0 
	|| !document.querySelector('input[name="osm_user"]').value
	|| !document.querySelector('input[name="osm_pass"]').value
	|| !document.querySelector('input[name="quality"]:checked')
	|| !document.querySelector('input[name="surface_survey"]').value
	|| !document.querySelector('input[name="comment"]').value
    ;
}

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
	    txt+=' (<a href="http://openstreetmap.org/way/'+lastSelected.getProperties().osm_id+'" target="OSM">detalii</a> si '+
		'<a href="http://openstreetmap.org/way/'+lastSelected.getProperties().osm_id+'/history" target="OSM">istoric</a> OSM)';
	    document.getElementById('current').innerHTML=txt;
	    
	    document.getElementById('current_smoothness').innerHTML=lastSelected.getProperties().smoothness;
	    var surf=lastSelected.getProperties().surface_survey;
	    if(surf){
		var i= surf.indexOf("_http://");
		
		if(i!=-1)
		    surf="<a href=\""+surf.substring(i+1)+"\" target=\"peundemerg\">"+surf.substring(0, i)+"</a>";
	    }
	    
	    document.getElementById('current_survey').innerHTML=surf;
	    surf=lastSelected.getProperties().surface;
	    document.getElementById('current_surface').innerHTML=surf;
	}else {
	    document.getElementById('current').innerHTML
		=document.getElementById('current_smoothness').innerHTML
		=document.getElementById('current_survey').innerHTML
		=document.getElementById('current_surface').innerHTML
		='';
	}


}

var successNode= document.getElementById("success");
function submit(){
    document.cookie="usr="+document.querySelector('input[name="osm_user"]').value;
    document.cookie="pass="+document.querySelector('input[name="osm_pass"]').value;

    document.querySelector('button[id="save"]').disabled=true;
    document.getElementById("error").innerHTML = '';

    var resultNode= document.createElement("span");
    resultNode.innerHTML="<img id='searchimg' class='loadingimg' src='/maps/images/loading.gif'/>";
    
    successNode.insertBefore(resultNode, successNode.firstChild);
    

    var http=new XMLHttpRequest();
    var url= "/mapedit?username="+encodeURIComponent(document.querySelector('input[name="osm_user"]').value)
	+"&password="+encodeURIComponent(document.querySelector('input[name="osm_pass"]').value)
	+"&smoothness="+document.querySelector('input[name="quality"]:checked').value
	+"&comment="+encodeURIComponent(document.querySelector('input[name="comment"]').value)
	+"&surface_survey="+encodeURIComponent(document.querySelector('input[name="surface_survey"]').value)
    	+"&surface="+encodeURIComponent(document.querySelector('input[name="surface"]').value)
    ;
    
    url= Object.keys(ways).reduce(function(partial, key){ return partial+"&way="+key; }, url);
    http.open("GET", url);
    http.onreadystatechange = function() {
	changedComment=false;
	if (http.readyState == 4 && http.status != 200) {
	    document.getElementById("error").innerHTML = http.responseText;
	}
	
	if (http.readyState == 4 && http.status == 200) {
	    resultNode.innerHTML= '<a href="http://openstreetmap.org/changeset/'+http.responseText+'" target="OSM">'+http.responseText+'</a> ';
	}
	
    };
    
    http.send();
}


function clearSearch(){
    searchLayer.getSource().clear();
    document.querySelector('input[name="search"]').value="";
    document.getElementById("searchclear").style.display="none";
}
function search(){
    searchLayer.getSource().clear();

    var http=new XMLHttpRequest();
    var url= "/mapsearch?search="+encodeURIComponent(document.querySelector('input[name="search"]').value.trim())
    ;
    
    http.open("GET", url);
    http.onreadystatechange = function() {
	changedComment=false;
	if (http.readyState == 4 && http.status != 200) {
//	    document.getElementById("error").innerHTML = http.responseText;
	}
	
	if (http.readyState == 4 && http.status == 200) {
	    var result= JSON.parse(http.responseText);
	    if(result.features){
		searchLayer.getSource().addFeatures(( new ol.format.GeoJSON() ).readFeatures( result, {
		    featureProjection: 'EPSG:3857'
		} ) );
		var features=(new ol.format.GeoJSON()).readFeatures(http.responseText);
		
		searchSource.addFeature(features[0]);
		searchSource.changed();
		zoomOn(result.features[0].properties);
	    }
	    
	}
	
	document.getElementById("searchimg").style.display="none";
	document.getElementById("searchclear").style.display="inline";
	
    };
    
    http.send();
    document.getElementById("searchimg").style.display="inline";
    document.getElementById("searchclear").style.display="none";
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
	 .then(d=>d.filter(e=>e.type!='administrative' && e.type!='archaeological_site'))
	 .then(d=> {
		    input.val=input.value=(d&&d[0])?d[0].display_name:"?"+input.value;
		})
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}
