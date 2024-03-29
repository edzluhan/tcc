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

			const newUser = {
				name: user.name,
				email: user.email,
				password: user.password ? bcrypt.hashSync(user.password, 8) : null,
				nfes: [],
				shoppingLists: []
			}

			if (user.provider && user.id) {
				newUser[user.provider] = user.id;
			}
			console.log(newUser);
			result = await db.collection('Users').insertOne(newUser);

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

async function updateUser(userEmail, updatedData) {
	return MongoClient.connect(
		connectionString,
		{ useNewUrlParser: true }
	)
		.then(async client => {
			const db = client.db(dbName);

			const result = await db.collection('Users').updateOne(
				{
					email: userEmail
				}, {
					$set: updatedData
				}
			)

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

async function updateList(email, updatedList) {
	console.log(updatedList);
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
		.then(async param => {
			const userLists = user.shoppingLists;
			const db = param.client.db(dbName);
			const listIndex = userLists.findIndex(
				list => {
					console.log(list.name, updatedList)
					return list.name === updatedList.name
				}
			);

			if (listIndex >= 0) {
				if (updatedList.delete) {
					userLists.splice(listIndex, 1);
				} else {
					userLists[listIndex] = updatedList;
				}
			} else {
				userLists.push(updatedList);
			}

			const updateResult = await db.collection('Users').updateOne(
				{
					email: email
				},
				{
					$set: {
						shoppingLists: userLists
					}
				}
			);
			return { client: param.client, updateResult };
		})
		.then(param => {
			param.client.close();
			// console.log('lists', param.updateResult);  
			return param.updateResult;
		})
		.catch(err => {
			console.log(err);
			return false;
		});
}

async function createListFromNFE(name, products) {
	const descriptionForQuery = products.map(product => product.descricao);
	console.log('descriptions', descriptionForQuery);
	return MongoClient.connect(
		connectionString,
		{ useNewUrlParser: true }
	)
		.then(async client => {
			const db = client.db(dbName);
			result = await db.collection('Products').find({
				"description":
					{ "$in": descriptionForQuery }
			});
			const products = [];
			await result.forEach(product => {
				products.push(product);
			});
			return { client, products };
		})
		.then(param => {
			param.client.close();
			return { name: name, products: param.products };
		})
		.catch(err => {
			console.log(err);
			return false;
		});
}

async function getNFEs(email) {
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
			console.log('lists', param.user.nfes);
			return param.user.nfes;
		})
		.catch(err => {
			console.log(err);
			return false;
		});
}

module.exports = user = {
	registerUser,
	authUser,
	updateUser,
	getLists,
	updateList,
	getNFEs,
	createListFromNFE
};
