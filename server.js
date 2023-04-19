/*****************************
 * WEB322 - 2231 Project
 * I declare that this assignment is my own work in accordance with the Seneca Academic
 * Policy. No part of this assignment has been copied manually or electronically from
 * any other source (including web sites) or distributed to other students.
 *
 * Student Name  : Fardeen Hamed Raheem Khan
 * Student ID    : 166812214
 * Course/Section: WEB322 ZBB
 *
 ******************************/

const path = require("path");
const express = require("express");
const exphbs = require("express-handlebars");
const rentalsList = require("./model/rentals-db");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
var session = require('express-session')
const mongoose = require('mongoose');


const passport = require('passport');

const cookieParser = require('cookie-parser');

dotenv.config();

const app = express();

const authController = require('./controllers/auth/signupController');
const loginController = require('./controllers/auth/loginController');
const logoutController = require('./controllers/auth/logoutController');
const loadData = require('./controllers/loadDataController');
const rentalsController = require('./controllers/rentalsController');
const cartController = require('./controllers/cartController');

const Rental = require('./model/rentals-db');


mongoose.connect(process.env.RENTAL_DB_URL)
  .then(() => { console.log('Connected!'); }).catch((err) => {
    console.error('Error occured', err);
  });

  const helpers = {
    getTotatlPrice: function (a, b) {
      return a * b;
    }
  }

// Set up HandleBars
app.engine(
  ".hbs",
  exphbs.engine({
    extname: ".hbs",
    defaultLayout: "main",
    helpers: helpers
  })
);
app.set("view engine", ".hbs");

// Make the "assets" folder public.
app.use(express.static(path.join(__dirname, "/assets")));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('trust proxy', 1) // trust first proxy


app.use(session({
  cookieName: 'session',
  secret: 'qwdwcrfesxfwasfwesdjkz',
  duration: 30 * 60 * 1000,
  activeDuration: 5 * 60 * 1000,
}));

app.use(function(req, res, next) {
  const isCustomer = req.session.userData && req.session.userData.userType === 'Customer';
  res.locals.isCustomer = isCustomer;
  res.locals.session = req.session;
  res.locals.session.isCustomer = isCustomer;
  console.log(res.locals);
  next();
});

app.use(passport.initialize());
app.use(passport.session());
// setup a 'route' to listen on the default url path (http://localhost)

app.use('/load-data', loadData);
app.use('/rentals', rentalsController);
app.use('/cart', cartController);



let loggedInUser = {};
app.get("/", function (req, res) {
  res.render("home");
});


app.get("/sign-up", function (req, res) {
  res.render("sign-up");
});



app.get("/error-page", function (req, res) {
  res.render("error-page", { ErrorMessage: "you are not allowed to access this page" });
});


app.get("/log-in", function (req, res) {
  res.render("log-in");
});
app.get("/welcome", function (req, res) {
  res.render("welcome", loggedInUser);
});

app.post('/sign-up', authController);
app.post('/login', loginController);
app.post('/logout', logoutController);


// app.post("/login", function (req, res) {
//   let msgData = {};
//   let email = req.body.email;
//   let password = req.body.password;
//   let onlySpaces = /^\s+$/;

//   if (email == "" || email == null || onlySpaces.test(email)) {
//     msgData.emailMsg = "Please enter a valid email address";
//   }
//   if (password == "" || password == null || onlySpaces.test(password)) {
//     msgData.passwordMsg = "Please enter your password";
//   }
//   if (msgData.emailMsg || msgData.passwordMsg) {
//     msgData.email = email;
//     msgData.password = password;
//     res.render("log-in", msgData);
//   } else {
//     loggedInUser.email = email;
//     res.redirect("/welcome");
//   }
// });



// * DO NOT MODIFY THE LINES BELOW *

// This use() will not allow requests to go beyond it
// so we place it at the end of the file, after the other routes.
// This function will catch all other requests that don't match
// any other route handlers declared before it.
// This means we can use it as a sort of 'catch all' when no route match is found.
// We use this function to handle 404 requests to pages that are not found.
app.use((req, res) => {
  res.status(404).send("Page Not Found");
});

// This use() will add an error handler function to
// catch all errors.
app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

// Define a port to listen to requests on.
const HTTP_PORT = process.env.PORT || 8080;

// Call this function after the http server starts listening for requests.
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

// Listen on port 8080. The default port for http is 80, https is 443. We use 8080 here
// because sometimes port 80 is in use by other applications on the machine
app.listen(HTTP_PORT, onHttpStart);
