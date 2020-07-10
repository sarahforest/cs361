function deleteProject(id){
	console.log(`client: requesting to delete project ${id}`);
	
	$.ajax({
		url:'/projects/' + id,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	});
};