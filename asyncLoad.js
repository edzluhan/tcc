const MongoClient = require('mongodb').MongoClient;
const nfe = require('nfe-biblioteca');
const envVars = require('dotenv').config();

const connectionString = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

async function processInvoice(db, key) {
  const link = `https://www.sefaz.rs.gov.br/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?HML=false&chaveNFe=${key}`;
  console.log('key', key);
  try {
    const nota = await nfe.consultar(link);
    insertInvoice(db, key, nota)
      .then()
      .catch(e => console.log(e));
    const { cabecalho, emitente, produtos } = nota;
    const establishment = await insertEstablishment(db, emitente);
    productsPromises = produtos.map(produto =>
      insertProduct(db, produto, emitente, cabecalho.dataEmissao)
    );
    return await Promise.all(productsPromises);
  } catch (e) {
    console.log(e);
  }
}

async function insertInvoice(db, key, invoice, user) {
  return db.collection('Nfe').updateOne(
    { key: key },
    {
      $set: {
        header: invoice.cabecalho,
        establishment: invoice.emitente,
        products: invoice.produtos,
        user: user
      }
    },
    { upsert: true }
  );
}

async function insertProduct(db, product, establishment, buyDate) {
  console.log(JSON.stringify(product));
  return db
    .collection('Products')
    .updateOne(
      { description: product.descricao },
      {
        $set: {
          description: product.descricao,
          code: product.codigo ? product.codigo : null
        },
        $addToSet: {
          price: {
            establishment: establishment,
            amount: product.quantidade,
            value: product.preco,
            unit: product.unidade,
            buyDate: buyDate
          }
        }
      },
      { upsert: true }
    );
}

async function insertEstablishment(db, establishment) {
  console.log(JSON.stringify(establishment));

  return db.collection('Establishments').updateOne(
    {
      cnpj: establishment.cnpj,
      companyName: establishment.razaoSocial,
      zipcode: establishment.cep
    },
    {
      $set: {
        cnpj: establishment.cnpj,
        companyName: establishment.razaoSocial,
        name: establishment.nome
          ? establishment.nome
          : establishment.razaoSocial,
        zipcode: establishment.cep,
        city: establishment.cidade,
        district: establishment.bairro,
        street: establishment.rua,
        state: establishment.estado,
        phone: establishment.telefone
      }
    },
    { upsert: true }
  );
}

const invoice = [
  '43180542591651115048650040000324411207953255', //0
  '43180593015006000890651050002185881517712065', //1
  '43180593015006001357651170004983391126783239', //2
  '43180593015006001519651030001633871104311083', //3
  '43180602314041003446650040000078761929721306', //4
  '43180502233406000492650020001809519002791956' //5 n
];

// processInvoice(invoice[0]);

MongoClient.connect(
  connectionString,
  { useNewUrlParser: true }
).then(async client => {
  const db = client.db(dbName);
  for (let index = 0; index < invoice.length; index++) {
    console.log(processInvoice(db, invoice[index]));
  }
  return;
});
