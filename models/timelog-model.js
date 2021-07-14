/***************************************
 * MODEL FOR TIME LOGS
 ***************************************/

// Require DB model
const db = require('../models/db-model');

const sanitizer = require('sanitize')();
const dateformat = require('dateformat');

// Gets all requests of user from db
function getLogs(req, res) {
    // Sanitize id
    var id = sanitizer.value(req.params.id, 'int');
    
    db.queryDB(`SET TIMEZONE = 'Asia/Manila';`, (err, result) => {});

    var sql = `
            SELECT id,
                TO_CHAR(date_created :: DATE, 'Mon dd, yyyy') as date_created,
                log_in :: timestamp :: time as log_in,
                log_out:: timestamp :: time as log_out,
                DATE_PART('day', log_out::timestamp - log_in ::timestamp) * 24 + 
                DATE_PART('hour', log_out::timestamp - log_in::timestamp) As hours,
                employee_id
            FROM time_log
            WHERE employee_id = ${id}
            ORDER BY date_created DESC, log_in DESC;
    `;
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error getting time logs from db!");
			res.status(500).json({success: false, data: err});
		} else {
            res.json(result);
		}
    });
}

// POST
// Add time log to db
function submitLog(req, res) {
    // Sanitize inputs
    var id = sanitizer.value(req.body.userId, 'int');

    let today = new Date();
    let date = dateformat(today, 'yyyy-mm-dd')
    let time = dateformat(today, 'yyyy-mm-dd HH:MM:ss');
    
    // If there is no existing log for today, NEW log
    checkForDuplicateLog(id, (err, result) => {
        var sql;
        if (result == null) {
            console.log("FIRST QUERY")
            sql = `
                INSERT INTO time_log (
                    date_created,
                    log_in,
                    employee_id
                )
                VALUES (
                    '${date}',
                    '${time}',
                    '${id}'
                ) RETURNING date_created`;
        } else {
            console.log("SECOND QUERY")
            sql = `
                UPDATE time_log 
                SET log_out = '${time}'
                WHERE employee_id = ${id}
                AND date_created = '${date}'
                RETURNING date_created
                `;
        }

        console.log("Now executing SQL: " + sql);
        db.queryDB(sql, (err, result) => {
            if (err || result == null || result.length != 1) {
                console.log("Error submitting request to db", err)
                res.status(401).send(err);
            } else {
                console.log("Successfully saved time log");
                res.status(200).send(result);
            }
        });
    })
}

// GET
// Check for duplicate time logs within the same day
function checkForDuplicateLog(id, callback) {
    let today = new Date();
    let date = dateformat(today, 'yyyy-mm-dd');

    var sql = `
            SELECT * 
            FROM time_log
            WHERE employee_id = ${id}
            AND date_created = '${date}'
    `;

    db.queryDB(sql, (err, result) => {
        if (result.length == 0) {
            console.log("No duplicates found.");
			callback(err, null);
		} else {
            console.log("Duplicate time log found!");
			callback(null, result);
		}
    });
}

// GET
// Check if there is already a punch in time log for the day
function checkForExistingLogToday(req, res) {
    var id = sanitizer.value(req.params.id, 'int');

    let today = new Date();
    let date = dateformat(today, 'yyyy-mm-dd');

    var sql = `
            SELECT date_created,
                log_in :: timestamp :: time as log_in,
                log_out :: timestamp :: time as log_out,
                employee_id
            FROM time_log 
            WHERE employee_id = ${id}
            AND date_created = '${date}';
    `;
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error checking for existing logs db!");
			res.status(400).json({success: false, data: err});
		} else {
            console.log("Successfully retrieved existing log for today");
            res.status(200).send(result);
		}
    });
}

// GET
// Gets all requests of user from db
function filterLogs(req, res) {
    // Sanitize id
    var id = sanitizer.value(req.params.id, 'int');
    var start = sanitizer.value(req.params.start, 'str');
    var end = sanitizer.value(req.params.end, 'str');
    
    var sql = `
            SELECT id,
                TO_CHAR(date_created :: DATE, 'Mon dd, yyyy') as date_created,
                log_in :: timestamp :: time as log_in,
                log_out:: timestamp :: time as log_out,
                DATE_PART('day', log_out::timestamp - log_in ::timestamp) * 24 + 
                DATE_PART('hour', log_out::timestamp - log_in::timestamp) As hours,
                employee_id
            FROM time_log
            WHERE employee_id = ${id}
            AND date_created >= '${start}'
            AND date_created <= '${end}'
            ORDER BY date_created DESC, log_in DESC;
    `;

    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error getting time logs from db!");
			res.status(500).json({success: false, data: err});
		} else {
            res.json(result);
		}
    });
}


// EXPORT
module.exports = {
    getLogs,
    submitLog,
    checkForExistingLogToday,
    filterLogs
};
