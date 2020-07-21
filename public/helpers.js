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

function deleteTask(id){
	console.log(`client: requesting to delete task ${id}`);
	
	$.ajax({
		url:'/project/' + id,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	});
};

function deleteSubtask(id){
	console.log(`client: requesting to delete task ${id}`);
	
	$.ajax({
		url:'/task/' + id,
		type: 'DELETE',
		success: function(result){
			window.location.reload(true);
		}
	});
};

function updateProject(pid){
    $.ajax({
        url: '/project/' + pid,
        type: 'PUT',
        data: $('#update-project').serialize(),
        success: function(result){
			//window.location.replace("./");
			window.location.reload(true);
        }
    })
};
