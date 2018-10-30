const MongoClient = require('mongodb').MongoClient;
// const ObjectId = require('mongodb').ObjectId;
const envVars = require('dotenv').config();
const bcrypt = require('bcrypt');

const connectionString = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

async function registerUser(user) {
  console.log('user in register', user);
  return MongoClient.connect(
    connectionString,
    { useNewUrlParser: true }
  )
    .then(async client => {
      const db = client.db(dbName);

      result = await db.collection('Users').insertOne({
        name: user.name,
        email: user.email,
        password: bcrypt.hashSync(user.password, 8)
      });

      return { client, result };
    })
    .then(param => {
      param.client.close();
      return { result: param.result };
    })
    .catch(err => {
      console.log(err);
      return false;
    });
}

async function authUser({ email }) {
  return MongoClient.connect(
    connectionString,
    { useNewUrlParser: true }
  )
    .then(async client => {
      const db = client.db(dbName);
      user = await db.collection('Users').findOne({
        email: email
      });

      return { client, user };
    })
    .then(param => {
      param.client.close();
      return param.user;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
}

async function getLists(email) {
  return MongoClient.connect(
    connectionString,
    { useNewUrlParser: true }
  )
    .then(async client => {
      const db = client.db(dbName);
      user = await db.collection('Users').findOne({
        email: email
      });
      console.log('user', user);
      return { client, user };
    })
    .then(param => {
      param.client.close();
      console.log('lists', param.user.shoppingLists);
      return param.user.shoppingLists;
    })
    .catch(err => {
      console.log(err);
      return false;
    });
}

module.exports = user = {
  registerUser,
  authUser,
  getLists
};