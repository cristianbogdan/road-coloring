var changedComment=false;
var dt= new Date();
var months=["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
document.querySelector('input[name="surface_survey"]').value= dt.getFullYear().toString()+months[dt.getMonth()]+"_";

var user= getCookie("usr");
if(user)
    document.querySelector('input[name="osm_user"]').value=user;
var pass= getCookie("pass");
if(pass)
    document.querySelector('input[name="osm_pass"]').value=pass;
    
function onComment(e){
    console.log(e);
    changedComment=true;
    enableSave();
}

function enableSave(selected){
    
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
    
    if(!changedComment || document.querySelector('input[name="comment"]').value=='')
        document.querySelector('input[name="comment"]').value= txt;
    
    if(selected)
	if(selected.length>0){
	    var txt= '<a href="http://openstreetmap.org/way/'+selected[0].getProperties().osm_id+'" target="OSM">ultimul selectat</a>';
	    if(selected[0].getProperties().ref || selected[0].getProperties().name){
		txt+=' (';
		sep='';
		if(selected[0].getProperties().ref)
		{txt+=selected[0].getProperties().ref; sep=" ";}
		
		if(selected[0].getProperties().name)
		    txt+=sep+selected[0].getProperties().name;
		
		txt+=')';
	    }
	    document.getElementById('current').innerHTML=txt;
	    
       document.getElementById('current_smoothness').innerHTML=selected[0].getProperties().smoothness;
	    
	    var surf=selected[0].getProperties().surface_survey;
	    if(surf){
		var i= surf.indexOf("_http://");
		
		if(i!=-1)
		    surf="<a href=\""+surf.substring(i+1)+"\" target=\"peundemerg\">"+surf.substring(0, i)+"</a>";
	    }
	    
	    document.getElementById('current_survey').innerHTML=surf;
	}else {
	    document.getElementById('current').innerHTML=
		document.getElementById('current_smoothness').innerHTML=
		document.getElementById('current_survey').innerHTML
		='';
	}
    
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
    var url= "../mapedit?username="+encodeURIComponent(document.querySelector('input[name="osm_user"]').value)
	+"&password="+encodeURIComponent(document.querySelector('input[name="osm_pass"]').value)
	+"&smoothness="+document.querySelector('input[name="quality"]:checked').value
	+"&comment="+encodeURIComponent(document.querySelector('input[name="comment"]').value)
	+"&surface_survey="+encodeURIComponent(document.querySelector('input[name="surface_survey"]').value)
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
