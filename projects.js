module.exports = function(){
    var express = require('express');
    var bodyParser = require('body-parser');
    var mysql = require('./dbcon.js');
    var { requireAuth } = require('./middleware.js');
    var Utils = require('./utils');
    var app = express();
    var router = express.Router();
    
    app.use(bodyParser.urlencoded({extended:true}));

    // Add project.
    router.post('/', requireAuth, function(req, res) // requireAuth is middleware that will run before our own callback.
    {
        var sql = `INSERT IGNORE INTO Projects (Project_Name, Status, Project_Owner, Due_Date) VALUES (?, ?, ?, ?)`;
        var inserts = [req.body.Project_Name, req.body.Status, req.body.user, req.body.Due_Date];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if (error) {
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            } else {
                res.redirect('/projects');
            }
        });
    });

    function getProjects(res, context, complete) {
        var sql = `SELECT 
            p.*,
            u.name,
            pu.user_id,
            CASE WHEN pu.user_id = p.Project_Owner THEN TRUE ELSE FALSE END AS is_owner
        FROM (${Utils.sqlProjectUsers()}) pu
        INNER JOIN Projects p ON pu.project_id = p.Project_ID
        INNER JOIN users u ON p.Project_Owner = u.id
        WHERE pu.user_id = ? 
        ${(context.Project_Name) ? 'AND Project_Name LIKE ?' : ''}
        ${(context.Status) ? 'AND Status = ?' : ''}
        ORDER BY Due_Date ASC`;

        var inserts = [context.userId];
        if (context.Project_Name) inserts.push(`%${context.Project_Name}%`);
        if (context.Status) inserts.push(context.Status);

        mysql.pool.query(sql, inserts, function(error, results) {
            if (error) {
                res.write(JSON.stringify(error));
                res.end();
            }
            else {
                results.forEach(p => {
                    p.isOverdue = Utils.isOverdue(p.Due_Date);
                    [p.Due_Date, p.Format_Date] = Utils.formatDueDate(p.Due_Date);
                })
                context.currentprojects = results.filter(p => p.Status != 'Completed');
                context.pastprojects = results.filter(p => p.Status == 'Completed');
                complete();
            }
        });
    }

    // Display all projects
    router.get('/', requireAuth, function(req, res) {
        var callbackCount = 0;
        var context = {};
        var { Project_Name, Status } = req.query;
        context.userId = req.user.id;
        context.name = req.user.name;
        if (Project_Name) context.Project_Name = Project_Name;
        if (Status && Status !== 'All') context.Status = Status;

        getProjects(res, context, complete);
        function complete() {
            callbackCount++;
            if (callbackCount == 1) {
                Utils.getUsers(res, context, complete);
            } else if (callbackCount >= 2) {
                res.render('projects', context);
            }
        };
    });

    router.post('/update', requireAuth, function(req,res) {
        var sql = `UPDATE Projects 
                   SET Project_Name = ?, 
                   Due_Date = ?,
                   Status = ?,
                   Project_Owner = ? 
                   WHERE Project_ID = ?`;
        var inserts = [req.body.name, req.body.due_date, req.body.status, req.body.user, req.body.id];
        sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
            if (error) {
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            } else {
                res.redirect(req.get('referer'));
            }
        })
    });

    router.delete('/:id', requireAuth, function(req, res){
        var inserts = req.params.id;
        Utils.deleteData(res, 'subtasks', 'project_id', inserts);
        Utils.deleteData(res, 'tasks', 'project_id', inserts);
        Utils.deleteData(res, 'Projects', 'Project_ID', inserts);
        console.log(`server: project ${req.params.id} deleted.`);
        res.status(202).end();
    });

    return router;

}();
