module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var { requireAuth } = require('./middleware.js');


    // function that returns the entire list of users as a promise
    function getUsers(context, complete) {
        var mysql = require('./dbcon.js');
            mysql.pool.query("SELECT id, name, email FROM users", function(error,results) {
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                } else {
                    context.users = results;
                    complete();
                }
            })
      }


        /* function to display all tasks of the current Project */
        function getCurrentSubTasks(tid, req, res, mysql, context, complete){
            var mysql = require('./dbcon.js');

            var sql = `
            SELECT id, subtasks.project_id, subtasks.name, subtasks.assignee_id, subtasks.due_date, subtasks.status, subtasks.description
            FROM subtasks INNER JOIN Projects ON subtasks.project_id = Projects.Project_ID WHERE subtasks.task_id = ? ORDER BY Due_Date ASC`;

            var insert = [tid];
            
    
            mysql.pool.query(sql, insert, function(error, results, fields)
            {
                if(error){
                    res.write(JSON.stringify(error));
                    res.end();
                }
                var currentDate = Date.now();
                context.subtasks = results;
                    if (context.subtasks) {
                        context.subtasks.forEach(function(subtask) {
                            var formatDate = subtask.due_date;
                            if (formatDate <= currentDate) {
                                subtask.isOverdue = 1;
                            } else {
                                subtask.isOverdue = 0;
                            }
        
                            formatDate = formatDate.toISOString().split('T')[0];
                            var finalDate = formatDate.split("-");
                            subtask.due_date = finalDate[1] + "-" + finalDate[2] + "-" + finalDate[0];
                            subtask.format_date = finalDate[0] + "-" + finalDate[1]+ "-" + finalDate[2];
                        })
                    }
                    
                
                complete();
            });
        }

        function getCurrentProjectTask(res,context,taskId,complete) {
            var mysql = require('./dbcon.js');
            var sql = "SELECT p.Project_Name as project_name, " +
                        "p.Due_Date as project_due_date, " + 
                        "p.Status as project_status, " + 
                        "p.Project_Owner as project_owner_id, " + 
                        "u.name as project_owner_name, " + 
                        "t.name as task_name, " + 
                        "t.due_date as task_due_date, " +
                        "t.status as task_status, " + 
                        "t.description as task_description, " +
                        "t.assignee_id as task_assignee_id, " +
                        "u2.name as task_assignee_name " +
                        "FROM tasks t " +
                        "LEFT JOIN users u2 " +
                        "on u2.id = t.assignee_id " +
                        "LEFT JOIN Projects p " +
                        "on p.Project_ID = t.project_id " + 
                        "LEFT JOIN users u " +
                        "on u.id=p.Project_Owner " +
                        "WHERE t.id = ?";

            var inserts = [taskId];
            mysql.pool.query(sql, inserts, function(error, results, fields){
                if (error) {
                    res.write(JSON.stringify(error));
                    res.end();
                }

                context.project_task = results[0];
                if (context.project_task) {
                    var formatDate = context.project_task.project_due_date;
                    formatDate = formatDate.toISOString().split('T')[0];
                    var finalDate = formatDate.split("-");
                    context.project_task.project_due_date = finalDate[1] + "-" + finalDate[2] + "-" + finalDate[0];

                    formatDate = context.project_task.task_due_date;
                    formatDate = formatDate.toISOString().split('T')[0];
                    finalDate = formatDate.split("-");
                    context.project_task.task_due_date = finalDate[1] + "-" + finalDate[2] + "-" + finalDate[0];
                }

                //console.log(context.project_task)
                
                complete();
            });
        }

    /* Display all subtasks of the current task */
        router.get('/:tid', requireAuth, function(req, res){
        var callbackCount = 0;
        var context = {};
        context.userId = req.user.id;
        context.name = req.user.name;
 
        var mysql = req.app.get('mysql');
  
        
        getCurrentSubTasks(req.params.tid, req, res, mysql, context, complete)
      
        function complete(){
            callbackCount++;
            if (callbackCount == 1){
                getCurrentProjectTask(res,context,req.params.tid,complete)
            } else if (callbackCount == 2) {
                getUsers(context, complete);
             } else if (callbackCount >=3) { 
                 // console.log(context)
                 res.render('task', context);
            }
        }
    });


    router.post('/update', function(req,res) {
        var mysql = require('./dbcon.js');
        var sql = "UPDATE subtasks " + 
                  "SET name = ?, " + 
                  "due_date = ?, " +
                  "status = ?, " +
                  "assignee_id = ?, " + 
                  "description = ? " +
                  "WHERE id = ?";
        
        var inserts = [req.body.name, req.body.due_date, req.body.status, req.body.user, req.body.description, req.body.id];
        // console.log(inserts)
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            } else {
                res.redirect(req.get('referer'));
            }
        })
    });


    return router;

}();
