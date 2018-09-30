const MongoClient = require('mongodb').MongoClient;
const nfe = require('nfe-biblioteca');
const envVars = require('dotenv').config();

const connectionString = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

async function processInvoice(db, key) {
  const link = `https://www.sefaz.rs.gov.br/ASP/AAE_ROOT/NFE/SAT-WEB-NFE-NFC_2.asp?HML=false&chaveNFe=${key}`;
  console.log('key', key);
  try {
    let nota = { cabecalho: { numero: null}};
    do {
        nota = await nfe.consultar(link);
    } while (!nota.cabecalho.numero);
    await insertInvoice(db, key, nota);
    const { cabecalho, emitente, produtos } = nota;
    await insertEstablishment(db, emitente);
    const productsPromises = produtos.map(produto =>
      insertProduct(db, produto, emitente, cabecalho.dataEmissao)
    );
    return Promise.all(productsPromises);
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

  return db.collection('Products').updateOne(
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
//   console.log('establishment', JSON.stringify(establishment));

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

async function insertSingleNfe(invoiceUrl) {
	const matched = invoiceUrl.match(/chNFe=(\d*)(&|%26)/);
	if (! matched) {
		return false;
	}
	invoice = matched[1]
  return MongoClient.connect(
    connectionString,
    { useNewUrlParser: true }
  )
    .then(async client => {
      const db = client.db(dbName);
      await processInvoice(db, invoice);
      return client;
    })
    .then(client => {
			client.close();
			return true;
		})
    .catch(err => {
			console.log(err);
			return false;
		});
}

module.exports = insertSingleNfe;
