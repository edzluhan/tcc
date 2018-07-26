const MongoClient = require("mongodb").MongoClient;
const nfe = require("nfe-biblioteca");
const envVars = require("dotenv").config();

const connectionString = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME

console.log(connectionString, dbName, process.env.PEI);return;

async function processInvoice(db, key) {
  const link = `https://www.sefaz.rs.gov.br/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?HML=false&chaveNFe=${key}`;
  console.log("key", key);
  try {
    const nota = await nfe.consultar(link);

    const { cabecalho, emitente, produtos } = nota;
    console.log(cabecalho);
    console.log(emitente);
    console.log(produtos);
    productsPromises = produtos.map(produto => insertProduct(db, produto));
    return await Promise.all(productsPromises);
  } catch (e) {
    console.log(e);
  }
}

async function insertProduct(db, product) {
  console.log(JSON.stringify(product));
  return db.collection("Products").updateOne(
    { description: product.descricao },
    {
      $set: {
        description: product.descricao,
        amount: product.quantidade,
        unit: product.unidade,
        price: product.preco,
        code: product.codigo ? product.codigo : null
      }
    },
    { upsert: true }
  );
}

const invoice = [
  "43180542591651115048650040000324411207953255", //0
  "43180593015006000890651050002185881517712065", //1
  "43180593015006001357651170004983391126783239", //2
  "43180593015006001519651030001633871104311083", //3
  "43180602314041003446650040000078761929721306" //4
  // '43180502233406000492650020001809519002791956', //5 n
];

// processInvoice(invoice[0]);

MongoClient.connect(
  connectionString,
  { useNewUrlParser: true }
).then(client => {
  const db = client.db(dbName);
  processInvoice(db, invoice[2]);
});
