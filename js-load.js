// change this to retrieve scripts from another server
var ROOT= location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');
var SCRIPT_ROOT=ROOT+"/maps/";
var MAP_ROOT=ROOT;

if(scriptName=="_imgur.js")
    SCRIPT_ROOT=MAP_ROOT+"/imgur/";

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(searchString, position) {
      var subjectString = this.toString();
      if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
        position = subjectString.length;
      }
      position -= searchString.length;
      var lastIndex = subjectString.lastIndexOf(searchString, position);
      return lastIndex !== -1 && lastIndex === position;
  };
}
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function(searchString, position){
      position = position || 0;
      return this.substr(position, searchString.length) === searchString;
  };
}
function loadScript(urls, i)
{
    if(i==urls.length){
	return;
      }
    if(typeof urls[i]==='function'){
	urls[i]();
	loadScript(urls, i+1);
	return;
    }

    
    // Adding the script tag to the head as suggested before
    var head = document.getElementsByTagName('head')[0];

    var elem;
    if(typeof urls[i]==='string' && urls[i].endsWith('css')){
	elem= document.createElement('link');
	elem.rel='stylesheet';
	elem.href=urls[i].startsWith('http')?urls[i]:SCRIPT_ROOT+urls[i];
    }
    else{
	elem= document.createElement('script');
	elem.type = 'text/javascript';
	elem.src = urls[i].startsWith('http')?urls[i]:SCRIPT_ROOT+urls[i];
    }
    var callback=function(){
	loadScript(urls, i+1);
    }
    // Then bind the event to the callback function.
	// There are several events for cross browser compatibility.
    elem.onreadystatechange = callback;
    elem.onload = callback;
	
    // Fire the loading
    head.appendChild(elem);
}
loadScript([SCRIPT_ROOT+scriptName],0);
