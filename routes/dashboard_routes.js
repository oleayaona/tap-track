const express = require('express')
const router = express.Router();

// Models
const timelog = require('../models/timelog-model')
const account = require('../models/account-model')

// Get dashboard view
router.get('/dashboard', (req, res) => {
    // If user is not logged in, redirect to home
    if (typeof req.session.userId === 'undefined') {
        var param = {message: "Please login first", title: "Home | Login"};
        res.render('login', param);
    } else {
        res.render('dashboard', {
            title: "Dashboard", 
            userId: req.session.userId, 
            userName: req.session.userName, 
            isManager: req.session.isManager,
            active: 'dashboard'
        })
    }
})

// Deliver punch clock view
router.get('/punch-clock', (req, res) => {
    // If user is not logged in, redirect to home
    if (typeof req.session.userId === 'undefined') {
        var param = {message: "Please login first", title: "Home | Login"};
        res.render('login', param);
    } else {
        // if logged in, go to dashboard 
        res.render('punch-clock', { title: "Punch Clock", active: 'punch-clock', isManager: req.session.isManager});
    }
})

// Get last time log
router.get('/punch-clock/last-log/:id', timelog.checkForExistingLogToday)

// Submit time log
router.post('/punch-clock/submit', timelog.submitLog)

// Get time logs from db
router.get('/get-logs/:id', timelog.getLogs)

// Filter logs by date
router.get('/filter-logs/:id/:start/:end', timelog.filterLogs)


// EXPORT
module.exports = router;