      var tz=`<table class='table table-stripped'><tr><th>Data</th>
<th>Drum</th>
<th>Calitate veche</th>
<th>Calitate nouă</th>
<th>Zona (un segment)</th>
<th>Comentarii</th>
</tr>`;


//<th>OSM user</th>
//<th>Harta</th>
//<th>Comentarii vechi</th>

    log.forEach(function(x){
	var dt= new Date(0); dt.setUTCSeconds(x.time);
	
	var surf= x.new_survey;
	if(surf){
	    var i= surf.indexOf("_http://");
	    
	    if(i!=-1)
		surf="<a href="+surf.substring(i+1)+">"+surf.substring(0, i)+"</a>";
	}
	
	
	var places= x.cities||'';
	var changesets=x.changesets.split(',');
	if(changesets.length>0){
	    places="<a href='https://openstreetmap.org/way/"+changesets[0]+"' target='osm'>"+(x.cities || "_")+"</a>";
	}
	tz+="<tr><td>"+dateFormat(dt, "d_mmm_H:MM_yyyy")
//	    +"</td><td>"+x.osm_user
	    +"</td><td>"+(x.ref||'')
	    +"</td><td><font color='"+smo(x.old_smoothness)+"'>"+(x.old_smoothness || '')+"</font>"
	    +"</td><td><b><font color='"+smo(x.new_smoothness)+"'>"+(x.new_smoothness || '')+"</font></b>"
	    +"</td><td>"+places
	    +"</td>";
/*	
	    var cnt=1;
	sep="";
	changesets.forEach(function(chg){
	    tz+=sep+"<a href='https://openstreetmap.org/changeset/"+chg+"' target='osm'>"+(cnt++)+"</a>";
	    sep=",";
	});
	
	tz+="</td>";
*/
	tz+='<td title="'+(x.old_survey||'')+'"/>'+(surf || '')+"</td>"
//	tz+="<td>"+(x.old_survey||'')+"</td>";
	tz+="</tr>";
    });
    tz+="</table>";
    document.getElementById("text").innerHTML=tz;
    
    function smo(s){
	if(!s)
	    return "black";
	
	if(s=='excellent')return "blue";
	if(s=='good')return "#376f00";
	if(s=='intermediate')return "#ff9f00";
	if(s.indexOf('bad')!=-1)
	    return "red";
	if(s.indexOf('horrible')!=-1 || s=='impassable')
	    return "#ff00ff";
	return "black";
    }
