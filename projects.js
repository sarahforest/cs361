module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var { requireAuth } = require('./middleware.js');
    var bodyParser = require('body-parser');
    var app = express();
    app.use(bodyParser.urlencoded({extended:true}));

    /* Add Project */
    router.post('/', requireAuth, function(req, res)
    {
        var mysql = require('./dbcon.js');

        var sql = "INSERT IGNORE INTO Projects (Project_Name, Status, Project_Owner, Due_Date) VALUES (?,?, ?,?)";
   
        var inserts = [req.body.Project_Name, req.body.Status, req.body.user, req.body.Due_Date];

        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect('/projects');
            }
        });

    });

 

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
 
    /* function to display all CURRENT PROJECTS */
    function getCurrentProjects(res, mysql, context, complete){
        var mysql = require('./dbcon.js');
        var sql = "SELECT Project_ID, Project_Name, Due_Date, Status FROM Projects WHERE Project_Owner = ?  AND Status != 'Completed' ORDER BY Due_Date ASC"

       // var sql = "SELECT p.Project_ID, p.Project_Name, p.Due_Date, p.Status FROM Projects AS p INNER JOIN user_projects AS up ON p.Project_ID = up.project_id WHERE up.user_id = ?"

        var inserts = [context.userId];
        mysql.pool.query(sql, inserts, function(error, results, fields)
        //mysql.pool.query("SELECT Project_ID, Project_Name, Due_Date, Status FROM Projects WHERE Project_ID = ?", function(error, results, fields)
        {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.currentprojects = results;

            var currentDate = new Date();
            
                context.currentprojects.forEach(function(project) {
                    var formatDate = project.Due_Date;
                    if (formatDate <= currentDate) {
                        project.isOverdue = 1;
                    } else {
                        project.isOverdue = 0;
                    }
                    formatDate = formatDate.toISOString().split('T')[0];
                    var finalDate = formatDate.split("-");
                    project.Due_Date = finalDate[1] + "-" + finalDate[2] + "-" + finalDate[0];
                    project.Format_Date = finalDate[0] + "-" + finalDate[1]+ "-" + finalDate[2];
                })
            
            complete();
        });
    }


     /* function to display all PAST PROJECTS */
     function getPastProjects(res, mysql, context, complete){
        var mysql = require('./dbcon.js');
        var sql = "SELECT Project_ID, Project_Name, Due_Date, Status FROM Projects WHERE Project_Owner = ?  AND Status = 'Completed' ORDER BY Due_Date ASC"

        var inserts = [context.userId];
        mysql.pool.query(sql, inserts, function(error, results, fields)
        {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.pastprojects = results;
            
                context.pastprojects.forEach(function(project) {
                    var formatDate = project.Due_Date;
                    formatDate = formatDate.toISOString().split('T')[0];
                    var finalDate = formatDate.split("-");
                    project.Due_Date = finalDate[1] + "-" + finalDate[2] + "-" + finalDate[0];
                    project.Format_Date = finalDate[0] + "-" + finalDate[1]+ "-" + finalDate[2];
                })
            
            complete();
        });
    }


    /* Display all PROJECTS */
    router.get('/', requireAuth, function(req, res){
        var callbackCount = 0;
        var context = {};
        context.userId = req.user.id;
        context.name = req.user.name;
        console.log(context.name)
        var mysql = req.app.get('mysql');
        getCurrentProjects(res, mysql, context, complete);
         function complete(){
            callbackCount++;
            if(callbackCount == 1){
                getPastProjects(res, mysql, context, complete);
            } else if (callbackCount == 2) {
                getUsers(context, complete);
            } else if (callbackCount >= 3) {
                res.render('projects', context);
            }
        }
    });

    router.post('/update', function(req,res) {
        var mysql = require('./dbcon.js');
        var sql = "UPDATE Projects " + 
                  "SET Project_Name = ?, " + 
                  "Due_Date = ?, " +
                  "Status = ?, " +
                  "Project_Owner = ? " + 
                  "WHERE Project_ID = ?";
        
        var inserts = [req.body.name, req.body.due_date, req.body.status, req.body.user, req.body.id];
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

    function deleteAssociatedSubTasks(mysql, inserts, res) {
        var sql = "DELETE FROM subtasks WHERE project_id = ?";
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }
        })
    }

    function deleteAssociatedTasks(mysql, inserts, res) {
        var sql = "DELETE FROM tasks WHERE project_id = ?";
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }
        })
    }

    function deleteProject(mysql,inserts, res) {
        var sql = "DELETE FROM Projects WHERE Project_ID = ?";
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }
        })
    }

    /* Route to DELETE specified Project */
    router.delete('/:id', requireAuth, function(req, res){
        console.log(`server: deleting project ${req.params.id}`);
        
        // var mysql = req.app.get('mysql');
        var mysql = require('./dbcon.js');
       
       
        var inserts = req.params.id;
        deleteAssociatedSubTasks(mysql,inserts, res);
        deleteAssociatedTasks(mysql,inserts, res);
        deleteProject(mysql,inserts, res);
        res.status(202).end();

    });

    return router;

}();
