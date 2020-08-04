module.exports = function(){
    var express = require('express');
    
    var mysql = require('./dbcon.js');
    var { requireAuth } = require('./middleware.js');
    var Utils = require('./utils');
    
    var router = express.Router();

    /* Add Task */
    router.post('/', requireAuth, function(req, res) {
        var sql = "INSERT IGNORE INTO tasks (project_id, name, assignee_id, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?)";
   
        var inserts = [req.body.project_id, req.body.name, req.body.user, req.body.due_date, req.body.status, req.body.description];

        sql = mysql.pool.query(sql, inserts, function(error, results, fields) {
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect(`/project/${req.body.project_id}`);
            }
        });
    });


    /* Get all tasks of the current project */
    function getCurrentTasks(res, context, complete){
        var sql = `SELECT 
            t.*,
            u.name AS assignee_name,
            pu.user_id,
            CASE WHEN pu.user_id = p.Project_Owner THEN TRUE ELSE FALSE END AS is_owner,
            CASE WHEN pu.user_id = t.assignee_id THEN TRUE ELSE FALSE END AS is_assignee
        FROM (${Utils.sqlProjectUsers()}) pu
        INNER JOIN Projects p ON pu.project_id = p.Project_ID
        INNER JOIN tasks t ON pu.project_id = t.project_id
        INNER JOIN users u ON t.assignee_id = u.id
        WHERE pu.user_id = ? AND t.project_id = ?
        ORDER BY due_date ASC`;
        var inserts = [context.userId, context.project_id];
        mysql.pool.query(sql, inserts, function(error, results) {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else {
                results.forEach(t => {
                    t.isOverdue = Utils.isOverdue(t.due_date);
                    [t.due_date, t.format_date] = Utils.formatDueDate(t.due_date);
                });
                context.tasks = results;
                complete();
            }
        });
    }

    /* Display all tasks of the current project */
    router.get('/:pid', requireAuth, function(req, res){
        var callbackCount = 0;
        var context = {};
        context.userId = req.user.id;
        context.name = req.user.name;
        context.project_id = req.params.pid;
        getCurrentTasks(res, context, complete);
        function complete(){
            callbackCount++;
            if(callbackCount == 1){
                Utils.getCurrentProject(res, context, complete);
            } else if (callbackCount == 2) {
                Utils.getUsers(res, context, complete);
            } else if (callbackCount >= 3) {
                res.render('project', context);
            }
        }
    });

    router.post('/update', function(req,res) {
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

    /* Route to DELETE specified Task */
    router.delete('/:id', requireAuth, function(req, res){
        var inserts = req.params.id;
        Utils.deleteData(res, 'subtasks', 'task_id', inserts);
        Utils.deleteData(res, 'tasks', 'id', inserts);
        console.log(`server: task ${req.params.id} deleted.`);
        res.status(202).end();
    });


    router.post('/update-status', function(req,res) {
        var referrer = req.get('referer');

        var request = [];
        request['tableName'] = 'tasks';
        request['id'] = req.body.id;
        request['status'] = req.body.status;
        
        Utils.updateStatus(res, referrer, request);
    });

    return router;

}();
