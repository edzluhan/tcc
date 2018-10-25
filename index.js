const express = require('express');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const insertSingleNfe = require('./lib/insertSingleNfe');
const findProductsByDescription = require('./lib/findProduct').findProductsByDescription;
const findProductById = require('./lib/findProduct').findProductById;
const authUser = require('./lib/user').authUser;
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

const port = process.env.PORT || 8080;

const router = express.Router();

router.post('/insert', asyncHandler(async (req, res) => {
	const result = await insertSingleNfe(req.body.url);
	if (result) {
		res.statusCode = 200;
		res.send({ "success": result });
	} else {
		res.statusCode = 400;
		res.send('Bad Request');
	}
}));

router.get('/findProductsByDescription', asyncHandler(async (req, res) => {
	const result = await findProductsByDescription(req.query.description);
	if (result) {
		res.statusCode = 200;
		res.send({ "success": true, result: result });
	} else {
		console.log('no result');
	}
}));

router.get('/findProductById', asyncHandler(async (req, res) => {
	const result = await findProductById(req.query.id);
	if (result) {
		res.statusCode = 200;
		res.send({ "success": true, result: result });
	} else {
		console.log('no result');
	}
}));

router.post('/register', asyncHandler(async (req, res) => {
	const { name, email, password } = req.body;

}));

router.post('/login', asyncHandler(async (req, res) => {
	const { email, password } = req.body;
	console.log('body', req.body);

	const user = await authUser({ email, password });

	if (user) {
		if (await bcrypt.compare(password, user.password)) {
			const userData = { name: user.name, email: user.email };
			const token = jwt.sign(userData, 'secret');

			return res.status(200).send({ success: true, user: userData, token: token });
		}
	}
	return res.status(401).send({ success: false, message: 'access denied' });
	
}));

router.get('/me', asyncHandler(async (req, res) => {
	console.log(req.headers);
	const token = req.headers['x-access-token'];

	if (!token) {
		return res.status(401).send({ success: false, message: 'No token provided.' });
	}

	jwt.verify(token, 'secret', (err, decoded) => {
		if (err) {
			return res.status(500).send({ success: false, message: 'Failed to authenticate token.' });
		}
		return res.status(200).send(decoded);
	});
}));

app.use(router);

app.listen(port);

console.log(`server running on port ${port}`);