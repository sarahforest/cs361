module.exports = function(){
    var express = require('express');
    var router = express.Router();
    

    /* Add Project */
    router.post('/', function(req, res){
        var mysql = require('./dbcon.js');
        var sql = "INSERT IGNORE INTO Projects (Project_Name, Status) VALUES (?,?)";
   
        var inserts = [req.body.Project_Name, req.body.Status];
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
 
    /* function to display all PROJECTS */
    function getProjects(res, mysql, context, complete){
        var mysql = require('./dbcon.js');
        mysql.pool.query("SELECT Project_ID, Project_Name, Due_Date, Status FROM Projects", function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.end();
            }
            context.projects = results;
            complete();
        });
    }

    /* Display all PROJECTS */
    router.get('/', function(req, res){
        var callbackCount = 0;
        var context = {};
        context.jsscripts = ["deleteproject.js"];
        var mysql = req.app.get('mysql');
        getProjects(res, mysql, context, complete);
         function complete(){
            callbackCount++;
            if(callbackCount >= 1){
                res.render('projects', context);
            }
        }
    });

    /* Route to DELETE specified Project */
    router.delete('/:id', function(req, res){
        // var mysql = req.app.get('mysql');
        var mysql = require('./dbcon.js');
        var sql = "DELETE FROM Projects WHERE Project_ID = ?";
        var inserts = req.params.id;
        sql = mysql.pool.query(sql, inserts, function(error, results, fields){
            if(error){
                res.write(JSON.stringify(error));
                res.status(400);
                res.end();
            } else {
                res.status(202).end();
            }
        })
    });

    return router;

}();
