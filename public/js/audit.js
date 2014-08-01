$(document).ready(function(){


});

function audit(resource){

	$.get( "http://provenance-tracker.herokuapp.com/logs_temp/audit/" + encodeURIComponent(resource), function( data ) {
  		$( ".modal-body" ).html('<img src="'+resource+'" width="200px"/><br/>');
		if (typeof(data) == "string"){
			$( ".modal-body" ).append(document.createTextNode(data));
  		}
  		else {
  			for (var i=0; i< data.length; i++){
  				
  				if (data[i].name != "access"){ //Otherwise can get too big too fast

  					var time_p = $(document.createElement('p'));
  					time_p.append(data[i].time);
					$( ".modal-body" ).append(time_p);

				  	var user_span = document.createElement('span');
					user_span.appendChild(document.createTextNode(data[i].name));
	  				user_span.appendChild(document.createTextNode(" by "));
					$( ".modal-body" ).append(user_span);

					var user_a = document.createElement('a');
					//user_a.href = JSON.stringify(data[i].details.user);
					user_a.href = data[i].details.user;
					user_a.target = "_blank";
					user_a.appendChild(document.createTextNode(data[i].details.name + " "));

				 	$( ".modal-body" ).append(user_a);


				 	$( ".modal-body" ).append(document.createTextNode(" as "));

					var derivative_a = document.createElement('a');
					//user_a.href = JSON.stringify(data[i].details.user);
					derivative_a.href = data[i].derivative;
					derivative_a.target = "_blank";
					derivative_a.appendChild(document.createTextNode(data[i].derivative + " "));

					$( ".modal-body" ).append(derivative_a);
				 	
					var question_a = document.createElement('a');
					question_a.href = "mailto:"+data[i].details.email;
					question_a.target = "_blank";

					var question_button = document.createElement('button');
					question_button.class = "btn btn-default";
					question_button.appendChild(document.createTextNode("?"));

					question_a.appendChild(question_button);

					$( ".modal-body" ).append(question_a);

					$( ".modal-body" ).append(document.createElement('hr'));

  				}

				

  			}
  			
  		}

  		$('#myModal').modal('show');
	});

}

