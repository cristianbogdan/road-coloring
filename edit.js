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
    
    if(selection)
	if(selected.length>0){
	    var lastSelected=selected[selected.length-1];
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

    if(document.querySelector('button[id="save"]'))
    document.querySelector('button[id="save"]').disabled=Object.keys(ways).length==0 
	|| !document.querySelector('input[name="osm_user"]').value
	|| !document.querySelector('input[name="osm_pass"]').value
	|| !document.querySelector('input[name="quality"]:checked')
	|| !document.querySelector('input[name="surface_survey"]').value
	|| !document.querySelector('input[name="comment"]').value
    ;
}

function submit(){
    document.cookie="usr="+document.querySelector('input[name="osm_user"]').value;
    document.cookie="pass="+document.querySelector('input[name="osm_pass"]').value;

    document.querySelector('button[id="save"]').disabled=true;
    document.getElementById("error").innerHTML = '';
    
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
	    document.getElementById("success").innerHTML += '<a href="http://openstreetmap.org/changeset/'+http.responseText+'" target="OSM">'+http.responseText+'</a> ';
	}
	
    }
    
    http.send();
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
