const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');

// mongodb connection
mongoose.connect(
  'mongodb+srv://brockdw:brockdw@cluster0-jcxcb.mongodb.net/test?retryWrites=true&w=majority',
  {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
  }
);

mongoose.Promise = global.Promise;

app.use(morgan('dev'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  if (req.method == 'OPTIONS') {
    res.header('Access-Control-Arrow-Methods', 'PUT, POST, PATCH, DELETE');
    return res.status(200).json({});
  }
  next();
});

//connecting routes
app.use('/assets', express.static('./staticAssets'));

const profileRoutes = require('./api/routes/profiles');
app.use('/profiles', profileRoutes);

const userRoutes = require('./api/routes/users');
app.use('/users', userRoutes);

const postRoutes = require("./api/routes/posts");
app.use('/posts', postRoutes);

const commentsRoutes = require("./api/routes/comments");
app.use('/comments', commentsRoutes);

const twoFARoutes = require('./api/routes/twoFA');
app.use('/twoFA', twoFARoutes);

const forgot_psw = require('./api/routes/forgot_psw');
app.use('/forgot_psw', forgot_psw);

const forgot_psw_email = require('./api/routes/forgot_psw_email');
app.use('/forgot_psw_email', forgot_psw_email);


app.use(flash());

app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
      messagetwo: 'not found'
    }
  });
});

module.exports = app;
