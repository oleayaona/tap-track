const express = require('express')
const router = express.Router();

// Pto requests model
const ptoModel = require('../models/pto-model')

// Get dashboard view
router.get('/pto-requests', (req, res) => {
    // If user is not logged in, redirect to home
    if (typeof req.session.userId === 'undefined') {
        var param = {message: "Please login first", title: "Home | Login"};
        res.render('login', param);
    } else {
        // if logged in, go to view 
        res.render('pto-requests', { title: "PTO", userId: req.session.userId, userName: req.session.userName, active: 'pto-requests', isManager: req.session.isManager})
    }
})

// Get pto form view
router.get('/pto-requests/add-pto', (req, res) => {
    // If user is not logged in, redirect to home
    if (typeof req.session.userId === 'undefined') {
        var param = {message: "Please login first", title: "Home | Login"};
        res.render('home', param);
    } else {
        // if logged in, send user to view
        res.render('add-pto', { title: "New PTO Request", userId: req.session.userId, active: 'pto-requests', isManager: req.session.isManager})
    }
})

// Get pto requests from db
router.get('/get-pto-requests/:id', ptoModel.getUserRequests)

// Submit pto request
router.post('/pto-requests/submit-pto', ptoModel.submitPtoRequest)

// Delete request
router.delete('/delete-pto-request/:id', ptoModel.deleteRequest)

// Approve pto request
router.post('/approve-pto-requests/:id', ptoModel.approveRequest)

// Decline pto request
router.post('/decline-pto-requests/:id', ptoModel.declineRequest)




// EXPORT
module.exports = router;