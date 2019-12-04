const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const Chatkit = require('@pusher/chatkit-server');
const app = express();

// init chatkit
const chatkit = new Chatkit.default({
  instanceLocator: 'v1:us1:5a64b818-5ec9-4f14-b3dc-c14a1fb11ff4',
  key:
    'a5bab8c1-c9ad-4a41-8c12-bd6540811819:4zyyQxR1GeH1YQxK+Gei3zEfw4j2vicohF+1dsqVW3M='
});
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

// create users
app.post('/users', (req, res) => {
  const { username } = req.body;
  console.log(username);
  chatkit
    .createUser({
      id: username,
      name: username
    })
    .then(() => res.sendStatus(201))
    .catch(error => {
      if (error.error_type === 'services/chatkit/user_already_exists') {
        res.sendStatus(200);
      } else {
        res.status(error.status).json(error);
      }
    });
});
const PORT = 3001;
app.listen(PORT, err => {
  if (err) {
    console.error(err);
  } else {
    console.log(`Running on port ${PORT}`);
  }
});
