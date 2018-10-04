const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const envVars = require('dotenv').config();

const connectionString = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

async function findProductsByDescription(description) {
	return MongoClient.connect(
		connectionString,
		{ useNewUrlParser: true }
	)
		.then(async client => {
			const db = client.db(dbName);
			result = await db.collection('Products').find({
				"description":
					new RegExp(description, "i")
			});
			const products = [];
			await result.forEach(product => {
				products.push(product);
			});
			return { client, products };
		})
		.then(param => {
			param.client.close();
			return param.products;
		})
		.catch(err => {
			console.log(err);
			return false;
		});
}

async function findProductById(id) {
	console.log(id);
	return MongoClient.connect(
		connectionString,
		{ useNewUrlParser: true }
	)
		.then(async client => {
			const db = client.db(dbName);
			product = await db.collection('Products').findOne({
				"_id": ObjectId(id)
			});
			return { client, product };
		})
		.then(param => {
			param.client.close();
			return param.product;
		})
		.catch(err => {
			console.log(err);
			return false;
		});
}

module.exports = findProducts = {
	findProductsByDescription,
	findProductById
};
