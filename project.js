module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var { requireAuth } = require('./middleware.js');

//     /* Add Task */
//     router.post('/', requireAuth, function(req, res)
//     {
//         var mysql = require('./dbcon.js');
// 
//         var sql = "INSERT IGNORE INTO Projects (Project_Name, Status, Project_Owner, Due_Date) VALUES (?,?, ?,?)";
//    
//         var inserts = [req.body.Project_Name, req.body.Status, req.body.user, req.body.Due_Date];
// 
//         sql = mysql.pool.query(sql,inserts,function(error, results, fields){
//             if(error){
//                 console.log(JSON.stringify(error))
//                 res.write(JSON.stringify(error));
//                 res.end();
//             }else{
//                 res.redirect('/projects');
//             }
//         });
// 
//     });


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
            
                context.tasks.forEach(function(task) {
                    var formatDate = task.due_date;
                    formatDate = formatDate.toISOString().split('T')[0];
                    var finalDate = formatDate.split("-");
                    task.due_date = finalDate[1] + "-" + finalDate[2] + "-" + finalDate[0];
                })
            
            complete();
        });
    }

    /* Display all tasks of the current project */
    router.get('/:pid', requireAuth, function(req, res){
        var callbackCount = 0;
        var context = {};
        context.userId = req.user.id;
        var mysql = req.app.get('mysql');
        getCurrentTasks(req.params.pid, req, res, mysql, context, complete);
         function complete(){
            // console.log(callbackCount);
            callbackCount++;
            if(callbackCount == 1){
                getUsers(context, complete);
            } else if (callbackCount >= 2) {
                res.render('project', context);
            }
        }
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
