module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var { requireAuth } = require('./middleware.js');

    /* Add Task */
    router.post('/', requireAuth, function(req, res)
    {
        var mysql = require('./dbcon.js');

        var sql = "INSERT IGNORE INTO tasks (project_id, name, assignee_id, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?)";
   
        var inserts = [req.body.project_id, req.body.name, req.body.user, req.body.due_date, req.body.status, req.body.description];

        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect(`/project/${req.body.project_id}`);
            }
        });

    });


    // function that returns the entire list of users
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


    /*function that returns selected project for project/view update form*/
    function getCurrentProject(res, mysql, context, pid, complete){
        var mysql = require('./dbcon.js');
        var sql = "SELECT p.Project_Name, p.Due_Date, p.Status, p.Project_Owner, u.name FROM Projects p LEFT JOIN users u on u.id=p.Project_Owner WHERE Project_ID = ?";
        var inserts = [pid];
        mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.project = results[0];
            if (context.project) {
                var formatDate = context.project.Due_Date;
                formatDate = formatDate.toISOString().split('T')[0];
                var finalDate = formatDate.split("-");
                context.project.Due_Date = finalDate[1] + "-" + finalDate[2] + "-" + finalDate[0];
            }
            

            complete();
        });
    }


    /* function to display all tasks of the current Project */
    function getCurrentTasks(pid, req, res, mysql, context, complete){
        var mysql = require('./dbcon.js');
        var sql = `
        SELECT id, tasks.project_id, name, assignee_id, tasks.due_date, tasks.status, tasks.description
        FROM tasks INNER JOIN Projects ON tasks.project_id = Projects.Project_ID 
        WHERE tasks.project_id = ? AND Projects.Project_Owner = ?
        ORDER BY Due_Date ASC
`;
        mysql.pool.query(sql, [pid, req.user.id], function(error, results, fields)
        {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            // console.log(results);
            context.tasks = results;
            var currentDate = new Date();
                context.tasks.forEach(function(task) {
                    var formatDate = task.due_date;

                    if (formatDate <= currentDate) {
                        task.isOverdue = 1;
                    } else {
                        task.isOverdue = 0;
                    }

                    formatDate = formatDate.toISOString().split('T')[0];
                    var finalDate = formatDate.split("-");
                    task.due_date = finalDate[1] + "-" + finalDate[2] + "-" + finalDate[0];
                    task.format_date = finalDate[0] + "-" + finalDate[1]+ "-" + finalDate[2];
                })
            
            complete();
        });
    }

    /* Display all tasks of the current project */
    router.get('/:pid', requireAuth, function(req, res){
        var callbackCount = 0;
        var context = {};
        context.userId = req.user.id;
        context.project_id = req.params.pid;
        context.jsscripts = ["updateproject.js"];
        var mysql = req.app.get('mysql');
        getCurrentTasks(req.params.pid, req, res, mysql, context, complete);
        function complete(){
            // console.log(callbackCount);
            callbackCount++;
            if(callbackCount == 1){
                getCurrentProject(res, mysql, context, req.params.pid, complete);
            } else if (callbackCount == 2) {
                getUsers(context, complete);
            } else if (callbackCount >= 3) {
                console.log(context)
                res.render('project', context);
            }
        }
    });

    router.post('/update', function(req,res) {
        var mysql = require('./dbcon.js');
        var sql = "UPDATE tasks " + 
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

//     /* Route to DELETE specified Project */
//     router.delete('/:id', requireAuth, function(req, res){
//         console.log(`server: deleting project ${req.params.id}`);
//         
//         // var mysql = req.app.get('mysql');
//         var mysql = require('./dbcon.js');
//         var sql = "DELETE FROM Projects WHERE Project_ID = ?";
//         var inserts = req.params.id;
//         sql = mysql.pool.query(sql, inserts, function(error, results, fields){
//             if(error){
//                 res.write(JSON.stringify(error));
//                 res.status(400);
//                 res.end();
//             } else {
//                 res.status(202).end();
//             }
//         })
//     });

    return router;

}();
