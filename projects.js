module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var mysql = require('./dbcon.js');
    var { requireAuth } = require('./middleware.js');
    var bodyParser = require('body-parser');
    var app = express();
    app.use(bodyParser.urlencoded({extended:true}));

    var Utils = require('./utils');

    /* Add project */
    router.post('/', requireAuth, function(req, res)
    {
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

    /* Get all projects */
    function getProjects(res, context, complete){
        var sql = `SELECT 
            p.*,
            u.name,
            pu.user_id,
            CASE WHEN pu.user_id = p.Project_Owner THEN TRUE ELSE FALSE END AS is_owner
        FROM (${Utils.sqlProjectUsers()}) pu
        INNER JOIN Projects p ON pu.project_id = p.Project_ID
        INNER JOIN users u ON p.Project_Owner = u.id
        WHERE pu.user_id = ?
        ORDER BY Due_Date ASC`;
        var inserts = [context.userId];
        mysql.pool.query(sql, inserts, function(error, results) {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            results.forEach(p => {
                p.isOverdue = Utils.isOverdue(p.Due_Date);
                [p.Due_Date, p.Format_Date] = Utils.formatDueDate(p.Due_Date);
            })
            context.currentprojects = results.filter(p => p.Status != 'Completed');
            context.pastprojects = results.filter(p => p.Status == 'Completed');
            complete();
        });
    }

    /* Display all projects */
    router.get('/', requireAuth, function(req, res){
        var callbackCount = 0;
        var context = {};
        context.userId = req.user.id;
        context.name = req.user.name;
        getProjects(res, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                Utils.getUsers(res, context, complete);
            } else if (callbackCount >= 2) {
                res.render('projects', context);
            }
        };
    });

    /* Update project */
    router.post('/update', function(req,res) {
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

    function deleteAssociatedSubTasks(inserts, res) {
        var sql = "DELETE FROM subtasks WHERE project_id = ?";
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }
        })
    }

    function deleteAssociatedTasks(inserts, res) {
        var sql = "DELETE FROM tasks WHERE project_id = ?";
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }
        })
    }

    function deleteProject(inserts, res) {
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

        var inserts = req.params.id;
        deleteAssociatedSubTasks(inserts, res);
        deleteAssociatedTasks(inserts, res);
        deleteProject(inserts, res);
        res.status(202).end();

    });

    return router;

}();
