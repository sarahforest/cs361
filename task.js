module.exports = function(){
    var express = require('express');
    var router = express.Router();
    var mysql = require('./dbcon.js');
    var { requireAuth } = require('./middleware.js');
    var Utils = require('./utils');

    /* Add Subtask */
    router.post('/', requireAuth, function(req, res) {
        var sql = "INSERT IGNORE INTO subtasks (project_id, task_id, name, assignee_id, due_date, status, description) VALUES (?, ?, ?, ?, ?, ?, ?)";
        var inserts = [req.body.project_id, req.body.task_id, req.body.name, req.body.user, req.body.due_date, req.body.status, req.body.description];
        
        //console.log(inserts);
        sql = mysql.pool.query(sql,inserts,function(error, results, fields){
            if(error){
                console.log(JSON.stringify(error))
                res.write(JSON.stringify(error));
                res.end();
            }else{
                res.redirect(`/task/${req.body.task_id}`);
            }
        });
       
    });

    /* Get all subtasks of the current project */
    
    function getCurrentSubTasks(res, context, complete) {
        var sql = `SELECT 
            st.*,
            u.name AS assignee_name,
            pu.user_id,
            CASE WHEN pu.user_id = p.Project_Owner THEN TRUE ELSE FALSE END AS is_owner,
            CASE WHEN pu.user_id = st.assignee_id THEN TRUE ELSE FALSE END AS is_assignee
        FROM (${Utils.sqlProjectUsers()}) pu
        INNER JOIN Projects p ON pu.project_id = p.Project_ID
        INNER JOIN subtasks st ON pu.project_id = st.project_id
        INNER JOIN users u ON st.assignee_id = u.id
        WHERE pu.user_id = ? AND st.task_id = ? 
        ORDER BY due_date ASC`;
        var inserts = [context.userId, context.task_id];
        mysql.pool.query(sql, inserts, function(error, results) {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else {
                results.forEach(st => {
                    st.isOverdue = Utils.isOverdue(st.due_date);
                    [st.due_date, st.format_date] = Utils.formatDueDate(st.due_date);
                })
                context.subtasks = results;
                complete();
            }
        });
    }

    /* Get the current task */
    function getCurrentTask(res, context, complete){
        var sql = "SELECT t.*, u.name AS assignee_name FROM tasks t LEFT JOIN users u on t.assignee_id = u.id WHERE t.id = ?";
        var inserts = [context.task_id];
        mysql.pool.query(sql, inserts, function(error, results) {
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            else {
                if (results[0]) {
                    [results[0].due_date] = Utils.formatDueDate(results[0].due_date);
                    context.task = results[0];
                    context.project_id = results[0].project_id;
                }
                complete();
            }
        });
    }

    /* Display all subtasks of the current task */
    router.get('/:tid', requireAuth, function(req, res){
        var callbackCount = 0;
        var context = {};
        context.userId = req.user.id;
        context.name = req.user.name;
        context.task_id = req.params.tid;
        getCurrentSubTasks(res, context, complete)
        function complete(){
            callbackCount++;
            if (callbackCount == 1){
                getCurrentTask(res, context, complete)
            } else if (callbackCount == 2) {
                Utils.getCurrentProject(res, context, complete);
            } else if (callbackCount == 3) {
                Utils.getUsers(res, context, complete);
            } else if (callbackCount >= 4) { 
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

    function deleteSubtask(inserts, res) {
        var sql = "DELETE FROM subtasks WHERE id = ?";
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            }
        })
    }

    /* Route to DELETE specified Subtask */
    router.delete('/:id', requireAuth, function(req, res){
        //console.log(`server: deleting task ${req.params.id}`);

        var inserts = req.params.id;
        deleteSubtask(inserts, res);
        res.status(202).end();

    });

    router.post('/update-status', function(req,res) {

        var referrer = req.get('referer');
    
        var request = [];
        request['tableName'] = 'subtasks';
        request['id'] = req.body.id;
        request['status'] = req.body.status;
            
        Utils.updateStatus(res, referrer, request);
    });


    return router;

}();
