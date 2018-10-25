const MongoClient = require('mongodb').MongoClient;
// const ObjectId = require('mongodb').ObjectId;
const envVars = require('dotenv').config();
const bcrypt = require('bcrypt');

const connectionString = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

async function registerUser(user) {

	return MongoClient.connect(
		connectionString,
		{ useNewUrlParser: true }
	)
		.then(async client => {
			const db = client.db(dbName);

			result = await db.collection('User').insertOne({
				name: user.name,
				email: user.email,
				password: bcrypt.hashSync(user.password, 8)
			});

			return { client, user };
		})
		.then(param => {
			param.client.close();
			return { result: param.user };
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
				email: email,
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

async function getLists({ email }) {
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