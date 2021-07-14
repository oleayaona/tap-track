// heroku: https://salty-anchorage-73250.herokuapp.com/ | https://git.heroku.com/salty-anchorage-73250.git
// DATABASE_URL='postgres://qeuhweqncguyxd:15220d4647581a0c04901ae23cad020811fcbfcb274fb5c14ea8f5146eab6b1c@ec2-54-87-112-29.compute-1.amazonaws.com:5432/d43rd1lqfs4koo'

const express = require('express');
const path = require('path');
const session = require('express-session');
const http = require('http');
const reload = require('reload')

const PORT = process.env.PORT || 4000

// Routes
const homeRoutes = require('./routes/home_routes');
const accountRoutes = require('./routes/account_routes');
const dashboardRoutes = require('./routes/dashboard_routes');
const ptoRoutes = require('./routes/pto_routes');
const managerRoutes = require('./routes/manager_routes');

const app = express()
    // access public folder
    .use(express.static(path.join(__dirname, 'public')))
    // access passed data from forms
    .use(express.urlencoded({
        extended: true
    }))
    .use(express.json())
    .use(session({
        name: 'server-session-cookie-id',
        secret: 'tap-track',
        saveUninitialized: true,
        resave: true
    }))
    .use(function(req, res, next) {
        res.locals.message = req.session.message;
        res.locals.userId = req.session.userId;
        res.locals.first_name = req.session.userName;
        next();
    })
    // Get views
    .set('views', path.join(__dirname, 'views'))
    // Set view engine
    .set('view engine', 'ejs')
    /*--------------------------------------------------
     *                       ROUTES
     * -------------------------------------------------*/
    .get('/', (req, res) => {
        console.log(req.session.userId);
        // If user is not logged in, redirect to home for login
        if (typeof req.session.userId === 'undefined') {
            res.render('home', {
                title: "Home"
            });
        } else {
            // For ejs output
            res.locals.first_name = req.session.userName;
            // if logged in, go to dashboard 
            res.render('dashboard', {
                title: "Dashboard"
            })
        }
    })
    .get('/home', (req, res) => { res.redirect('/');
    })
    // Routes
    .use(accountRoutes)
    .use(homeRoutes)
    .use(dashboardRoutes)
    .use(ptoRoutes)
    .use(managerRoutes)
    

const server = http.createServer(app);
server.listen(PORT, () => console.log(`Listening at ${ PORT }...`))
reload(app);