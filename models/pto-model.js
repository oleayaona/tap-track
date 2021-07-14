/***************************************
 * MODEL FOR PTO Requests
 ***************************************/

// Require DB model
const db = require('../models/db-model');

const sanitizer = require('sanitize')();

// Gets all requests of user from db
function getRequests(req, res) {
    // Sanitize id
    var id = sanitizer.value(req.params.id, 'int');
    
    db.queryDB(`SET TIMEZONE = 'Asia/Manila';`, (err, result) => {});

    var sql = `
            SELECT pto.*, 
                TO_CHAR(pto.date_created :: DATE, 'Mon dd, yyyy') as date_created_formatted,
                type.name AS req_type_name, 
                CONCAT(e.first_name, ' ', e.last_name) AS emp_name
            FROM pto_request AS pto
                JOIN pto_request_type AS type
                    ON pto.req_type  = type.id
                JOIN employee AS e
                    ON e.id = pto.employee_id
            WHERE employee_id = ${id}
            ORDER BY date_created DESC, start_date;
    `;
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error getting pto requests from db!");
			res.status(500).json({success: false, data: err});
		} else {
            res.json(result);
		}
    });
}

// Gets all requests of user from db
function getUserRequests(req, res) {
    // Sanitize id
    var id = sanitizer.value(req.params.id, 'int');
    
    var sql = `
            SELECT pto.*, 
                TO_CHAR(pto.date_created :: DATE, 'Mon dd, yyyy') as date_created_formatted,
                type.name AS req_type_name, 
                CONCAT(e.first_name, ' ', e.last_name) AS emp_name
            FROM pto_request AS pto
                JOIN pto_request_type AS type
                    ON pto.req_type  = type.id
                JOIN employee AS e
                    ON e.id = pto.employee_id
            WHERE employee_id = ${id}
            ORDER BY date_created DESC, start_date DESC;
    `;
    console.log(sql)
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error getting pto requests from db!");
			res.status(500).json({success: false, data: err});
		} else {
            res.json(result);
		}
    });
}

// Gets all requests of user from db
function getAllRequests(req, res) {
    var sql = `
            SELECT pto.*, 
                TO_CHAR(pto.date_created :: DATE, 'Mon dd, yyyy') as date_created_formatted,
                type.name AS req_type_name, 
                CONCAT(e.first_name, ' ', e.last_name) AS emp_name
            FROM pto_request AS pto
                JOIN pto_request_type AS type
                    ON pto.req_type  = type.id
                JOIN employee AS e
                    ON e.id = pto.employee_id
            ORDER BY date_created DESC, start_date;
    `;
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error getting pto requests from db!");
			res.status(500).json({success: false, data: err});
		} else {
            res.json(result);
		}
    });
}

// POST
// Add pto request to db
function submitPtoRequest(req, res) {
    // Sanitize inputs
    var start_date = sanitizer.value(req.body.start_date, 'str');
    var end_date = sanitizer.value(req.body.end_date, 'str');
    var duration = sanitizer.value(req.body.duration, 'int');
    var type = sanitizer.value(req.body.type, 'int');
    var id = sanitizer.value(req.body.emp_id, 'int');

    db.queryDB(`SET timezone to 'Asia/Manila';`, (err, result) => {});

    var sql = `
        INSERT INTO pto_request (
            start_date,
            end_date,
            duration,
            req_type,
            employee_id
        )
        VALUES (
            '${start_date}',
            '${end_date}',
            '${duration}',
            '${type}',
            '${id}'
        ) RETURNING id;
        `;
    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, result) => {
        if (err || result == null || result.length != 1) {
            console.log("Error saving PTO request to db", err)
			var param = {success: false, message: "Sorry! An error ocurred while trying to submit your request. Please try again later.", title: "PTO Request", active: 'pto-requests'};
            res.render('add-pto', param);
		} else {
            console.log("Successfully saved PTO request");
            var param = {success: true, message: "Success! Your request has been submitted to your supervisor.", title: "PTO Request", active: 'pto-requests'};
            res.render('add-pto', param);
		}
    });
}

// POST
// Delete pending PTO request
function deleteRequest(req, res) {
    var id = sanitizer.value(req.params.id, 'int');

    var sql = `
        DELETE FROM pto_request
        WHERE id = ${id}
        RETURNING id
    `;
    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error getting pto requests from db!");
			res.status(500).json({success: false, data: err});
		} else {
            console.log("Successfully deleted PTO request");
            res.json(result);
		}
    });
}

// POST
// Approve PTO request
function approveRequest(req, res) {
    var id = sanitizer.value(req.params.id, 'int');

    var sql = `
        UPDATE pto_request
        SET status = 'Approved',
            is_pending = false
        WHERE id = ${id}
        RETURNING id
    `;

    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error approving request!");
			res.status(500).json({success: false, data: err});
		} else {
            console.log("Successfully approved PTO request");
            res.json(result);
		}
    });
}

// POST
// Decline PTO request
function declineRequest(req, res) {
    var id = sanitizer.value(req.params.id, 'int');

    var sql = `
        UPDATE pto_request
        SET status = 'Declined',
            is_pending = false
        WHERE id = ${id}
        RETURNING id
    `;

    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, result) => {
        if (err || result == null) {
            console.log("Error declining request!");
			res.status(500).json({success: false, data: err});
		} else {
            console.log("Successfully declined PTO request");
            res.json(result);
		}
    });
}


// EXPORT
module.exports = {
    getUserRequests,
    getAllRequests,
    submitPtoRequest,
    deleteRequest,
    approveRequest,
    declineRequest
};
