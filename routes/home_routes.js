const express = require('express')
const router = express.Router();
// Account model
const account = require('../models/account-model')


// Render Login page
router.get('/login', (req, res) => res.render('login', { title: "Log In"}))
// Login
router.post('/home/login', account.verifyLogin)
// Sign up page
router.get('/home/create-account', (req, res) => res.render('create-account', { title: "Create Account"}))
// Render Dashboard page
router.get('/login', (req, res) => {
    console.log(req.session.message);
    if (req.session.message != null) {
        res.render('login', { title: "Log In", message: req.session.message})
    } else {
        res.render('login', { title: "Log In"})
    }
})
// Verify employee info
router.post('/home/create-account/verify', account.verifyEmployee)
// Create account
router.post('/home/create-account/submit', account.createAccount)



// EXPORT
module.exports = router;