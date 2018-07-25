const MongoClient = require('mongodb').MongoClient;
const nfe = require("nfe-biblioteca");

const connectionString = 'mongodb://heroku_tgr7s4z2:m1p81fcir9pk4a6g5vl4ecvgvu@ds147011.mlab.com:47011/heroku_tgr7s4z2';

var invoices = [];

(async () => {
    const client = await MongoClient.connect(connectionString, { useNewUrlParser: true });
    const db = client.db('heroku_tgr7s4z2');

    try {
       const res = await db.collection('Nfe').find({}).toArray(async (err, res)=> {
        try {
          const link = `https://www.sefaz.rs.gov.br/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?HML=false&chaveNFe=${res[1]._id}`;
          nfe.consultar(link)
            .then(invoice => invoice["produtos"].map(produto =>
                ({
                  _id: produto.descricao,
                  amount: produto.quantidade,
                  unit: produto.unidade,
                  price: produto.preco
                })
              )
            )
            .then(produtos => db.collection('products'))
            .catch(err => console.log(err));
        } catch (err) {
          console.log(err)
        }
       });
    }
    finally {
        client.close();
    }
})().catch(err => console.error(err));