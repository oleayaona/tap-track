/***************************************
 * MODEL FOR ACCOUNTS
 ***************************************/

// Main database model
const db = require('../models/db-model');
// Time logs model
const timelog = require('../models/timelog-model');

// For form sanitation
const sanitizer = require('sanitize')();

// Password hasher
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Verify login
function verifyLogin(req, res) {
    console.log("Verifying login...");

    // sanitize inputs
    var email = sanitizer.value(req.body.email, 'email');
    var password = sanitizer.value(req.body.password, /(?=.{8,})(?=.*[a-zA-Z]).*$/);

    checkEmail(email, (err, result) => {
        if (err || result === null) {
            var param = {message: "Invalid email or password. Please try again.", title: "Home | Login"};
            res.render('login', param);
        } else {
            getUserInfo(email, (err, result) => {
                if (err || result == null) {
                    var param = {message: "Server error :( Can't login. Please try again later", title: "Home | Login"};
                    res.render('login', param);
                } else {
                    // verify password
                    console.log("Now verifying password...");
                    bcrypt.compare(password, result.password, function(err, hashResult) {
                        if (err || hashResult == false) {
                            console.log("Invalid password.")
                            req.session.message = "Invalid email or password. Please try again.";
                            res.redirect('/login');
                        } else {
                            console.log("Password verified!")
                            req.session.userId = result.employee_id;
                            req.session.userName = result.first_name
                            req.session.isManager = result.is_manager
                            res.redirect('/dashboard');
                        }
                    });
                }
            });
            
        }
    })
}

// Check if email exists in db
function checkEmail(email, callback){
    var sql = `
        SELECT * 
        FROM public.user
        WHERE email = '${email}'`;
    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, result) => {
        if (err || result == null || result.length == 0) {
            // no matching email- unsuccessful
            console.log("Error: Couldn't check email", err)
			callback(err, null)
		} else {
            console.log("Email has a user account");
            // success
            callback(null, result)
		}
    });
}

// Gets user info from db
function getUserInfo(email, callback) {
    console.log("Retrieving user info for login verification...")
    var sql = `
        SELECT * 
        FROM public.user AS u
            JOIN employee AS e
                ON u.employee_id = e.id
        WHERE u.email = '${email}'`;
    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, result) => {
        if (err || result.length == 0) {
			console.log("Error getting user info: ", err);
            callback(err, null);
		} else {
            console.log("Successfully retrieved user info!");
            callback(null, result[0]);
		}
    });
}

// Verify if employee email and ID are in db
function verifyEmployee(req, res) {
    console.log("Verifying employee credentials...")
    // Sanitize
    var emp_email = sanitizer.value(req.body.emp_email, 'email');
    var id = sanitizer.value(req.body.id, 'int');

    // If validation fails
    if (emp_email == null || isNaN(id)) {
        console.log("Invalid input");
		res.json({success: false});
    } else {
        var sql = `
            SELECT * 
            FROM employee
            WHERE emp_email = '${emp_email}' AND id = ${id};`;
        console.log("Now executing SQL: " + sql);
        db.queryDB(sql, (err, result) => {
            if (err || result == null || result.length == 0) {
                console.log("Error verifying employee info in db", err)
                res.json({success: false, error: err});
            } else {
                console.log("Email and ID verified!");
                // console.log(result);
                res.json({success: true, data: result});
            }
        });
    }
}

// Create account in db
function createAccount(req, res) {
    // Validate and sanitize inputs
    var password = sanitizer.value(req.body.password, /(?=.{8,})/)
    var emp_email = sanitizer.value(req.body.emp_email, 'email');
    var id = sanitizer.value(req.body.id, 'int');
    var first_name = sanitizer.value(req.body.first_name, 'str');

    // Check if any of the inputs are invalid
    if (password == null) {
        console.log("Invalid password");
        var param = {message: "Password must be at least 8 characters.", title: "Home | Create Account"};
        res.render('create-account', param);
    } else {
        bcrypt.hash(password, saltRounds, function(err, hash) {
            if (err) {
                console.log("Error while hashing", err)
            } else {
                var sql = `
                    INSERT INTO public.user (
                        email,
                        password,
                        employee_id
                    )
                    VALUES (
                        '${emp_email}',
                        '${hash}',
                        '${id}'
                    )
                    RETURNING id`;
                console.log("Now executing SQL: " + sql);
                db.queryDB(sql, (err, result) => {
                    if (err || result == null || result.length == 0) {
                        var param = {message: "Couldn't create account :( Please try again.", title: "Home | Create Account"};
                        res.render('login', param);
                    } else {
                        console.log("Successfully created account!");
                        console.log("Now adding user_id to employee...");
                        // update employee info with user_id
                        addUserId(result, id, (err, updateResult) => {
                            if (err || updateResult.length == 0 || updateResult == null) {
                                console.log("Error adding user Id to employee: ", err);
                                // Send user back to view if err
                                var param = {message: "Couldn't complete account registration. Please contact admin.", title: "Home | Create Account"};
                                res.render('create-account', param);
                            } else {
                                console.log("Successfully updated employee with userId");
                                // Allow user to login by saving id to session
                                req.session.userId = result[0].id;
                                req.session.userName = first_name;
                                res.render('dashboard', {title: "Dashboard", userId: req.session.userId, userName: req.session.userName, active: 'dashboard'});
                            }
                        })
                    }
                });
    
            }
        });
    }
    
}


// POST
// Update employee info with user account ID
function addUserId(result, emp_id, callback) {
    var sql = `
        UPDATE employee
        SET user_id = ${result[0].id}
        WHERE id = ${emp_id}
        RETURNING id`;
    console.log("Now executing SQL: " + sql);
    db.queryDB(sql, (err, res) => {
        if (err || res == null || res.length == 0) {
            console.log("Error adding user_id", err)
            callback(err, null);
        } else {
            console.log("Successfully added user_id");
            callback(null, res);
        }
    })
}

// Handle logout
function handleLogout(req, res) {
    if (req.session.userId) {
		req.session.destroy();
        console.log("Session successfully destroyed.")
		res.redirect('/login');
	}
}

module.exports = {
    verifyLogin,
    checkEmail,
    verifyEmployee,
    createAccount,
    handleLogout
};