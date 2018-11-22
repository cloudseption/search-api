const Fuse = require('fuse.js');
const express = require('express');
const mongoose = require('mongoose');
const User = require('./api/models/user');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
  extended: true
})); //key=value&key=value

//Connect the database
mongoose.connect(
  "mongodb://search-api:" + process.env.MONGO_ATLAS_PASSWORD + 
  "@badge-book-shard-00-00-7gbwk.mongodb.net:27017,badge-book-shard-00-01-7gbwk.mongodb.net:27017,badge-book-shard-00-02-7gbwk.mongodb.net:27017/test?ssl=true&replicaSet=badge-book-shard-0&authSource=admin&retryWrites=true", {
    useNewUrlParser: true
  }
).then(() => console.log('Connected to MondoDb')).catch(err => console.error(err));

// Add CORS headers to request
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
    return res.status(200).json({});
  }

//  console.log(req.headers.authorization);
//
//  if (!req.headers.authorization) {
//    return res.status(403).json({
//      error: 'No credentials sent!'
//    });
//  }
  next();
});

//Search configuration 
var fuseOptions = {
  threshold: 0.3,
  location: 0,
  distance: 100,
  keys: [
    'name',
    'description',
    'email',
  ]
};

/*
 * Search endpoint used by the  badge app. 
 * /api/search?input=[userinput]
 */
app.get('/api/search', (req, res) => {

  let userInput = req.query.input;

  console.log('Userinput', userInput);

  getUsers().then((users) => {
    var fuse = new Fuse(users, fuseOptions);
    const result = fuse.search(userInput);
    if (!result) {
      res.status(404).send('No user found');
    }
    res.status(200).json(result);

  });

});

/*
 * Gets all users from the database
 * Only find users that have a userId property
 */
async function getUsers() {
  const result = await User.find({
    userId: {
      $ne: null
    }
  });
  return result;
}

// PORT 
const port = process.env.PORT || 80;
app.listen(port, () => console.log(`Listening on port ${port}...`));