const express = require('express')
const router = express.Router();

// Pto requests model
const ptoModel = require('../models/pto-model')

// Get manager tab view
router.get('/manager', (req, res) => {
    // If user is not logged in, redirect to home
    if (typeof req.session.userId === 'undefined') {
        var param = {message: "Please login first", title: "Home | Login"};
        res.render('login', param);
    } else {
        // if logged in, go to view 
        res.render('manager', { title: "Manager Tab", userId: req.session.userId, userName: req.session.userName, active: 'manager', isManager: req.session.isManager})
    }
});

// Get all pending pto requests from db
router.get('/get-all-pto-requests', ptoModel.getAllRequests)

// EXPORT
module.exports = router;