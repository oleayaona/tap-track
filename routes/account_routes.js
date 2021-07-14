const express = require('express')
const router = express.Router();

// Account model
const account = require('../models/account-model')

// Logout
router.get('/account/logout', account.handleLogout)

// EXPORT
module.exports = router;