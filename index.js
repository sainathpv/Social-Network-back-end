const http = require("http");
const port = process.env.PORT || 8080;
const { verifyJWT } = require('./utlities/verifyJWT');
const express = require('express');
const app = express();
const server = http.createServer(app);
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const flash = require('connect-flash');
const socketio = require('socket.io');
const io = socketio(server);
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utlities/chatManagement');

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
mongoose.set('useFindAndModify', false);

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

io.on('connection', (socket) => {

    socket.on('join', (data, callback) => {
        var user = verifyJWT(data.jwt);
        try{
          if(user.userID === data.profile.user){
              const {error, user} = addUser({
                  id: socket.id,
                  name: data.profile.name, 
                  room: data.chat._id
              });
              if(error) return callback(error);
            
              socket.broadcast.to(data.chat._id)
              .emit('online', { user: data.profile.name, online: true});
              socket.join(data.chat._id);
          }
        }catch(error){

        }
    });

    socket.on('sendMessage', (data, callback) => {
      try{
        
        if(!data) return;

        io.to(data.chat._id).emit('message', { message: "update"});
    
        callback();
      }catch(error){
        console.log(error);
      }
    });

    socket.on('disconnect', (data, callback) => {
      try{
        var user = verifyJWT(data.jwt);
        if(user.userID === data.profile.user){
            socket.broadcast.to(data.chat._id)
            .emit('online', { user: data.profile.name, online: false});
        }
      }catch(error){

      }
    });

});


//connecting routes
app.use('/assets', express.static('./staticAssets'));

const profileRoutes = require('./api/routes/profiles');
app.use('/profiles', profileRoutes);

const userRoutes = require('./api/routes/users');
app.use('/users', userRoutes);

const postRoutes = require("./api/routes/posts");
app.use('/posts', postRoutes);

const chatRoutes = require('./api/routes/chat');
app.use('/chats', chatRoutes);

const imageRoutes = require('./api/routes/images');
app.use('/images', imageRoutes);

const twoFARoutes = require('./api/routes/twoFA');
app.use('/twoFA', twoFARoutes);

const forgot_psw = require('./api/routes/forgot_psw');
app.use('/forgot_psw', forgot_psw);

const events = require('./api/routes/events');
app.use('/events', events);

const friends = require('./api/routes/friends');
app.use('/friends', friends);

const resetCritical = require('./api/routes/resetCritical');
app.use('/resetCritical', resetCritical);

const searchRoutes = require('./api/routes/searchPosts');
app.use('/search', searchRoutes);


app.use(flash());

app.use((req, res, next) => {
    res.status(200);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: "ERROR"
    }
  });
});


server.listen(port);