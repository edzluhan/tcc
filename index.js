const express = require('express');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const insertSingleNfe = require('./lib/insertSingleNfe');
const findProductsByDescription = require('./lib/findProduct')
	.findProductsByDescription;
const findProductById = require('./lib/findProduct').findProductById;
const authUser = require('./lib/user').authUser;
const registerUser = require('./lib/user').registerUser;
const updateUser = require('./lib/user').updateUser;
const getLists = require('./lib/user').getLists;
const getNFEs = require('./lib/user').getNFEs;
const updateList = require('./lib/user').updateList;
const createListFromNFE = require('./lib/user').createListFromNFE;
const getEstablishments = require('./lib/establishment').getEstablishments;
const findEstablishments = require('./lib/establishment').findEstablishments;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 8080;

const router = express.Router();

router.post(
	'/insert',
	asyncHandler(async (req, res) => {
		const token = req.headers['x-access-token'];

		if (!token) {
			const result = await insertSingleNfe(req.body.url);
			res.statusCode = 200;
			return res.send({ success: result });
		}

		jwt.verify(token, 'secret', async (err, decoded) => {
			if (err) {
				return res
					.status(500)
					.send({ success: false, message: 'Failed to authenticate token.' });
			}
			const { email } = decoded;
			const result = await insertSingleNfe(req.body.url, email);
			return res.status(200).send({ success: result });
		});
	})
);

router.get(
	'/findProductsByDescription',
	asyncHandler(async (req, res) => {
		const result = await findProductsByDescription(req.query.description);
		if (result) {
			res.statusCode = 200;
			res.send({ success: true, result: result });
		} else {
			console.log('no result');
		}
	})
);

router.get(
	'/findProductById',
	asyncHandler(async (req, res) => {
		const result = await findProductById(req.query.id);
		if (result) {
			res.statusCode = 200;
			res.send({ success: true, result: result });
		} else {
			console.log('no result');
		}
	})
);

router.post(
	'/register',
	asyncHandler(async (req, res) => {
		const { name, email, password } = req.body;
		const register = await registerUser({ name, email, password });

		if (register.result.result.ok === 1) {
			const userData = { name: user.name, email: user.email };
			const token = jwt.sign(userData, 'secret');
			return res.status(200).send({ success: true, user: userData, token: token });
		}
	})
);

router.post(
	'/login',
	asyncHandler(async (req, res) => {
		const { email, password } = req.body;
		console.log('body', req.body);

		const user = await authUser({ email });

		if (user) {
			if (await bcrypt.compare(password, user.password)) {
				const userData = { name: user.name, email: user.email };
				const token = jwt.sign(userData, 'secret');

				return res
					.status(200)
					.send({ success: true, user: userData, token: token });
			}
		}
		return res.status(401).send({ success: false, message: 'access denied' });
	})
);

router.post(
	'/socialLogin',
	asyncHandler(async (req, res) => {
		const { id, email, name, provider } = req.body;
		console.log('body', req.body);

		const user = await authUser({ email });

		if (user) {
			if (user[provider] && user[provider].id !== id) {
				return res.status(401).send({ success: false, message: 'access denied' });
			}
			if (!user[provider]) {
				// add provider and id to user
				// user[provider] = id;
				await updateUser(email, { [provider]: { id: id } });
			}

		} else {
			// register user with name, email, social provider and id
			registerUser({ name, email, provider, id })
		}
		const userData = { name: name, email: email };
		const token = jwt.sign(userData, 'secret');

		return res
			.status(200)
			.send({ success: true, user: userData, token: token });
	})
);

router.get(
	'/me',
	asyncHandler(async (req, res) => {
		console.log(req.headers);
		const token = req.headers['x-access-token'];

		if (!token) {
			return res
				.status(401)
				.send({ success: false, message: 'No token provided.' });
		}

		jwt.verify(token, 'secret', (err, decoded) => {
			if (err) {
				return res
					.status(500)
					.send({ success: false, message: 'Failed to authenticate token.' });
			}
			return res.status(200).send(decoded);
		});
	})
);

router.get(
	'/lists',
	asyncHandler(async (req, res) => {
		console.log(req.headers);
		const token = req.headers['x-access-token'];

		if (!token) {
			return res
				.status(401)
				.send({ success: false, message: 'No token provided.' });
		}

		jwt.verify(token, 'secret', async (err, decoded) => {
			if (err) {
				return res
					.status(500)
					.send({ success: false, message: 'Failed to authenticate token.' });
			}
			console.log('decoded jwt', decoded);
			const { email } = decoded;
			const lists = await getLists(email);
			console.log('lists', lists);
			return res.status(200).send({ success: true, lists: lists });
		});
	})
);

router.put(
	'/list',
	asyncHandler(async (req, res) => {
		console.log(req.headers);
		const token = req.headers['x-access-token'];

		if (!token) {
			return res
				.status(401)
				.send({ success: false, message: 'No token provided.' });
		}

		const { list } = req.body;

		jwt.verify(token, 'secret', async (err, decoded) => {
			if (err) {
				return res
					.status(500)
					.send({ success: false, message: 'Failed to authenticate token.' });
			}
			if (!list) {
				return res
					.status(400)
					.send({ success: false, message: 'Malformed request.' });
			}
			console.log('decoded jwt', decoded);
			const { email } = decoded;
			const result = await updateList(email, list);
			// console.log('result', result);
			return res.status(200).send({ success: true, lists: result });
		});
	})
);

router.get(
	'/establishment',
	asyncHandler(async (req, res) => {
		const establishments = await getEstablishments();
		console.log('establishments', establishments);
		return res.status(200).send({ success: true, establishments: establishments });
	})
);

router.get(
	'/nfes',
	asyncHandler(async (req, res) => {
		console.log(req.headers);
		const token = req.headers['x-access-token'];

		if (!token) {
			return res
				.status(401)
				.send({ success: false, message: 'No token provided.' });
		}

		jwt.verify(token, 'secret', async (err, decoded) => {
			if (err) {
				return res
					.status(500)
					.send({ success: false, message: 'Failed to authenticate token.' });
			}
			console.log('decoded jwt', decoded);
			const { email } = decoded;
			const nfes = await getNFEs(email);
			console.log('nfes', nfes);
			return res.status(200).send({ success: true, nfes: nfes });
		});
	})
);

router.post(
	'/createListFromNFE',
	asyncHandler(async (req, res) => {
		const token = req.headers['x-access-token'];

		if (!token) {
			return res
				.status(401)
				.send({ success: false, message: 'No token provided.' });
		}

		const { name, products } = req.body;

		jwt.verify(token, 'secret', async (err, decoded) => {
			if (err) {
				return res
					.status(500)
					.send({ success: false, message: 'Failed to authenticate token.' });
			}
			if (!name || !products) {
				return res
					.status(400)
					.send({ success: false, message: 'Malformed request.' });
			}
			console.log('decoded jwt', decoded);
			const newList = await createListFromNFE(name, products);
			const { email } = decoded;
			const result = await updateList(email, newList);
			// console.log('result', result);
			return res.status(200).send({ success: true, lists: result });
		});
	})
);

app.use(router);

app.listen(port);

console.log(`server running on port ${port}`);
