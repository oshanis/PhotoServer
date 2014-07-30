$(document).ready(function(){


});

function audit(resource){
	$.get( "http://provenance-tracker.herokuapp.com/logs_temp/audit/" + encodeURIComponent(resource), function( data ) {
		$( ".modal-body" ).html( JSON.stringify(data, undefined, 2) );
  		//alert(JSON.stringify(data));
  		$('#myModal').modal('show');
	});

}

