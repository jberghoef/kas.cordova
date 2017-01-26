// Load function.
/* ====================================================================== */
window.addEventListener('load', function(){

	document.ontouchstart = function(e){ 
		e.preventDefault(); 
	}
	
	$('#bgm_menu').get(0).play();	

}, false)