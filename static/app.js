var socket = io.connect('http://xx.xx.xx.xx:8082', {
	'max reconnection attempts': Infinity
});
					
socket.on('updateclient', function (data) {
	$('#notice').html('<b> file updated ...<br>');
	$('#notice').effect("highlight", {}, 1500);
});
socket.on('connect', function (data){
	$('#connect').html('<b> kontakt ! <br>') ;
}) ;
var dmp = new diff_match_patch() ;
// on load of page
$(function(){
	socket.emit('first', $('#data').val() ) ; // or localstorage cache
	localStorage.setItem("last", $('#data').val()) ;
	socket.on('disconnect', function (reason){console.log('disconnected') ;});
	socket.on('reconnect', function (reason){
		console.log('reconnected') ;
		saveMe() ;
	});
		
	// when the client clicks SEND
	$('#datasend').click( function() {
		event.preventDefault() ;
		saveMe() ;
		$('#data').focus() ;
	});

	// when the client hits ENTER on their keyboard
	$('#data').keypress(function(e) {
		if(e.which == 13) {
			$(this).blur() ;
			$('#datasend').focus().click() ;
		}
	});
	
	$("#form").sisyphus({ 
		locationBased: false,
		timeout: 5,
		autoRelease: false,
		onSave: function() {saveMe() ;}
	});
	
	function saveMe(){
		var last = localStorage.getItem("last") ; if(!last){last = "" ;}
		var text = $('#data').val() ;
		
		var diff = dmp.diff_main(last, text) ;
		dmp.diff_cleanupSemantic(diff) ;
		var patch_list = dmp.patch_make(last, text, diff) ;
		var patch_text = dmp.patch_toText(patch_list) ;
		
		if(patch_text){
			if (!socket.socket.connected) {
				console.log('trying...') ;
			}
			else{
				socket.emit('update', patch_text) ;
				localStorage.setItem("last", localStorage.getItem("formformtext")) ;
			}
		}
	}
});
