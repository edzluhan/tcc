const express = require("express");
const bodyParser = require("body-parser");
const nfe = require("nfe-biblioteca");

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = 80;

const router = express.Router();

router.get("/:key", async (req, res) => {
    const link = `https://www.sefaz.rs.gov.br/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?HML=false&chaveNFe=${req.params.key}`;
    const response = await nfe.consultar(link);
    res.send(response);
});

app.use(router);

app.listen(port);

console.log(`server running on port ${port}`);