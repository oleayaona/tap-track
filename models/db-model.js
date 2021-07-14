/***************************************
 * MAIN MODEL
 ***************************************/

// DB vars
process.env.NODE_TLS_REJECT_UNAUTHORIZED='0';
const connectionString = process.env.DATABASE_URL || 'postgres://qeuhweqncguyxd:15220d4647581a0c04901ae23cad020811fcbfcb274fb5c14ea8f5146eab6b1c@ec2-54-87-112-29.compute-1.amazonaws.com:5432/d43rd1lqfs4koo?ssl=true';
const { Pool } = require('pg');
const pool = new Pool({connectionString: connectionString, ssl: true});


// Handles db queries
function queryDB(sql, callback) {
    pool.query(sql, (err, res) => {
        if (err || res == null || res.length == 0) { 
            console.log("Error in query: ", err);
            callback(err, null);
        } else {
            console.log("Got results from db!");
            console.log("Query result:");
            console.log(JSON.stringify(res.rows));
            callback(null, res.rows);
        }
    });
    
}

module.exports = {
    queryDB
}