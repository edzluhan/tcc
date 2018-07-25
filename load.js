const nfe = require("nfe-biblioteca");
const MongoClient = require('mongodb').MongoClient;

// Connection URL
const url = 'mongodb://heroku_tgr7s4z2:m1p81fcir9pk4a6g5vl4ecvgvu@ds147011.mlab.com:47011/heroku_tgr7s4z2';
const assert = require('assert');
const dbName = 'heroku_tgr7s4z2';

let db;

MongoClient.connect(url, { useNewUrlParser: true }, function(err, client) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
 
  db = client.db(dbName);

});

setTimeout(function() {console.log(db)}, 5000);

// nfe.consultar(link)
// 	.then(res => console.log(res))
// 	.catch(e => console.log(e));