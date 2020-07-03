function deleteProject(id){
	$.ajax({
		url:'/projects/' + id,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	});
};