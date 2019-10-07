const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser")
const mongoose = require('mongoose')

// mongodb connection
mongoose.connect(
    'mongodb+srv://brockdw:brockdw@cluster0-jcxcb.mongodb.net/test?retryWrites=true&w=majority', {
        useNewUrlParser: true, 
        useCreateIndex: true,
        useUnifiedTopology: true
    });

mongoose.Promise = global.Promise;


app.use(morgan("dev"));
app.use('/postUploads', express.static('postUploads'));
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    if (req.method == "OPTIONS") {
        res.header('Access-Control-Arrow-Methods', 'PUT, POST, PATCH, DELET');
        return res.status(200).json({});
    }
    next()

});

//connecting routes
const userPostRoutes = require("./api/routes/hoosierc");
app.use("/hoosierc", userPostRoutes);

const orderRoutes = require("./api/routes/order");
app.use("/order", orderRoutes);

const userRoutes = require('./api/routes/users');
app.use("/users", userRoutes);

const twoFARoutes = require("./api/routes/twoFA");
app.use("/twoFA", twoFARoutes);

app.use((req, res, next) => {
    const error = new Error('Not found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500)
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;


