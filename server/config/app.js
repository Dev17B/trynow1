/* installed 3rd party packages */
let createError = require('http-errors');
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');   // local, google and facebook, email have smae line 
let session = require('express-session');   // local,google and facebook,email have smae line 
var passport = require('passport');  // local, google , facebook, email have a same line
let passportLocal = require('passport-local');
let localStrategy = passportLocal.Strategy;
var SQLiteStore = require('connect-sqlite3')(session);  // google and facebook have smae line 
let flash = require('connect-flash');
var authRouter = require('../routes/auth');  //google auth
let app = express();
// config mongoDB

let mongoose = require('mongoose');
let DB = require('./db');


// point mongoose to DB URI

mongoose.connect(DB.URI);
let mongoDB = mongoose.connection;
mongoDB.on('error',console.error.bind(console,'connection Error:'));
mongoDB.once('open', ()=> {
  console.log('connected to the MongoDB');
});

// set-up Express session
app.use(session({
  secret:"SomeSecret",
  saveUninitialized:false,
  resave:false
}))

// initialize flash
app.use(flash());

app.use('/', authRouter); //google auth


//create a user model instance
let userModel = require('../models/user');
let User = userModel.User;


// implement a User authentication
passport.use(User.createStrategy());
// serialize and deserialize the user info
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// initialize passport
app.use(passport.initialize());
app.use(passport.session());

let indexRouter = require('../routes/index');
let Group18TeamRouter = require('../routes/Group18Team');
let usersRouter = require('../routes/users');
let wikipediaRouter = require('../routes/wikipedia');
let wikipedia2Router = require('../routes/wikipedia2');
let wikipedia3Router = require('../routes/wikipedia3');
const { parseArgs } = require('util');


// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));   //google and facebook, email both have same   auth line 78 to 85
app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  store: new SQLiteStore({ db: 'sessions.db', dir: './var/db' })
}));
app.use(passport.authenticate('session'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../../public')));
app.use(express.static(path.join(__dirname, '../../node_modules')));

app.use('/', indexRouter); // localhost:3000
app.use('/users', usersRouter); // localhost:3000/users
app.use('/Group18Team', Group18TeamRouter); // localhost:3000/users
app.use('/wikipedia', wikipediaRouter); // localhost:3000/wikipedia
app.use('/wikipedia2', wikipedia2Router); // localhost:3000/wikipedia2
app.use('/wikipedia3', wikipedia3Router); // localhost:3000/wikipedia3

// catch 404 and forward to error 
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error',
  {
    title:"Error"
  }
  );
});

module.exports = app;
