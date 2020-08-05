const express = require('express');
const mysql = require('./dbcon.js');
const { requireAuth } = require('./middleware.js');
const Utils = require('./utils.js');
const router = express.Router();

router
  .get('/', requireAuth, function(req, res) {
    const context = {};
    const { search_text, status } = req.query;
    context.userId = req.user.id;
    context.name = req.user.name;
    if (search_text) context.search_text = search_text;
    if (status && status !== 'All') context.status = status;

    getMyTasks(res, context, complete);
    function complete() {
        context.page = 'theirtasks';
        res.render('theirTasks', context);
    }
  });

  /* Get all tasks assigned to me */
  function getMyTasks(res, context, complete){
    const sql = `
    SELECT t.*, p.Project_Name, u.name AS assignee_name, p.Project_Owner
    FROM (
        SELECT 
            *, id AS task_id, FALSE AS is_sub
        FROM tasks t 
        WHERE assignee_id <> ?
        UNION ALL
        SELECT
            st.id,
            st.project_id,
            CONCAT(t.name, " - ", st.name) AS name,
            st.assignee_id,
            st.due_date,
            st.status,
            st.description,
            st.task_id,
            TRUE AS is_sub
        FROM subtasks st
        INNER JOIN tasks t ON st.task_id = t.id
        WHERE st.assignee_id <> ?
    ) t
    INNER JOIN Projects p ON t.project_id = p.Project_ID
    INNER JOIN users u ON t.assignee_id = u.id
    WHERE p.Project_Owner = ?
    ${(context.search_text) ? 'AND (t.name LIKE ? OR t.description LIKE ?)' : ''}
    ${(context.status) ? 'AND t.status = ?' : ''}
    ORDER BY t.due_date ASC
`;
    const inserts = [context.userId, context.userId, context.userId];
    if (context.search_text) {
        inserts.push(`%${context.search_text}%`);
        inserts.push(`%${context.search_text}%`);
    }
    if (context.status) inserts.push(context.status);
    
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
            context.currenttasks = results.filter(t => t.status != 'Completed');
            context.pasttasks = results.filter(t => t.status == 'Completed');
            complete();
        }
    });
  }

module.exports = router;
