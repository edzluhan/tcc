const MongoClient = require('mongodb').MongoClient;
// const ObjectId = require('mongodb').ObjectId;
const envVars = require('dotenv').config();
const bcrypt = require('bcrypt');

const connectionString = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

async function getEstablishments() {
	return MongoClient.connect(
		connectionString,
		{ useNewUrlParser: true }
	)
		.then(async client => {
			const db = client.db(dbName);
			result = await db.collection('Establishments').find();
			const establishments = [];
			await result.forEach(product => {
				establishments.push(product);
			});
			return { client, establishments };
		})
		.then(param => {
			param.client.close();
			return param.establishments;
		})
		.catch(err => {
			console.log(err);
			return false;
		});
}

async function findEstablishments(name, district) {
	return MongoClient.connect(
		connectionString,
		{ useNewUrlParser: true }
	)
		.then(async client => {
			const db = client.db(dbName);
			result = await db.collection('Establishments').find({
				"name": name,
				"district": district
			});
			const establishments = [];
			await result.forEach(product => {
				establishments.push(product);
			});
			return { client, establishments };
		})
		.then(param => {
			param.client.close();
			return param.establishments;
		})
		.catch(err => {
			console.log(err);
			return false;
		});
}

module.exports = user = {
	getEstablishments,
	findEstablishments
};
