const express = require('express');
const bodyParser = require('body-parser');
const asyncHandler = require('express-async-handler');
const cors = require('cors');
const insertSingleNfe = require('./lib/insertSingleNfe');

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
		res.send({"success": result});
	} else {
		res.statusCode = 400;
		res.send('Bad Request');
	}
}));

app.use(router);

app.listen(port);

console.log(`server running on port ${port}`);