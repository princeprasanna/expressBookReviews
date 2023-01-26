const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());
app.use(session({ secret: "fingerprint", resave: true, saveUninitialized: true }))

app.use("/customer", session({ secret: "fingerprint_customer", resave: true, saveUninitialized: true }))

app.use("/customer/auth/*", function auth(req, res, next) {
    //Write the authenication mechanism here
    if (req.session?.authorization?.username) {
        next()
    }
    else {
        console.error("Not logged in")
        return res.status(401).json({ code: 401, message: 'You are log logged in!' })
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT, () => console.log("Server is running"));