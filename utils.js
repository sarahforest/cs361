var mysql = require('./dbcon.js');

const Utils = {
  // gets and stores the entire list of users in the given context
  getUsers(res, context, complete) {
    mysql.pool.query("SELECT id, name, email FROM users", (error, results) => {
      if(error) {
        res.write(JSON.stringify(error));
        res.end();
      } else {
        context.users = results;
        complete();
      }
    });
  },

  // gets and stores the current project in the given context
  getCurrentProject(res, context, complete){
    var sql = "SELECT p.*, u.name FROM Projects p LEFT JOIN users u on p.Project_Owner = u.id WHERE Project_ID = ?";
    var inserts = [context.project_id];
    mysql.pool.query(sql, inserts, function(error, results) {
      if(error){
        res.write(JSON.stringify(error));
        res.end();
      }
      else {
        if (results[0]) {
          [results[0].Due_Date] = Utils.formatDueDate(results[0].Due_Date);
          context.project = results[0];
          context.project.is_owner = context.userId == results[0].Project_Owner;
        }
        complete();
      }
    });
  },
  
  // returns if the given due_date is overdue
  isOverdue(due_date) {
    return due_date <= new Date();
  },

  // formats the given due_date
  formatDueDate(due_date) {
    const date = due_date.toISOString().split('T')[0].split("-");
    due_date = date[1] + "-" + date[2] + "-" + date[0];
    const format_date = date[0] + "-" + date[1]+ "-" + date[2];
    return [due_date, format_date];
  },

  // sql query to get project_id and user_id of all users with access
  sqlProjectUsers() {
    return `SELECT Project_ID AS project_id, Project_Owner AS user_id FROM Projects
      UNION
      SELECT project_id, assignee_id FROM tasks
      UNION
      SELECT project_id, assignee_id FROM subtasks`;
  },

  // update status of the given data
  updateStatus(res, referer, request) {
    var sql = "UPDATE " + request['tableName'] +
              " SET status = ? " +
              "WHERE id = ?";

    var inserts = [request['status'], request['id']];

    sql = mysql.pool.query(sql, inserts, function(error, results, fields){
      if(error){
        res.write(JSON.stringify(error));
        res.status(400);
        res.end();
      } else {
        res.redirect(referer);
      }
    })
  },

  // delete data from the given table
  deleteData(res, tableName, fieldName, inserts) {
    var sql = `DELETE FROM ${tableName} WHERE ${fieldName} = ?`;
    mysql.pool.query(sql, inserts, function(error, results) {
      if(error) {
        res.write(JSON.stringify(error));
        res.status(400);
        res.end();
      }
    });
  }
};

module.exports = Utils;
