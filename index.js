const express = require('express');

var app = express();

app.get("/", function(req, res) {
    res.write("Hello, World!");
    res.end();
})

app.listen(8000, function() {
    console.log("Listening at port 8000...");
});