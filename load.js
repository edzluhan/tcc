const nfe = require('./insertSingleNfe');

nfe(
  'https://www.sefaz.rs.gov.br/NFCE/NFCE-COM.aspx?chNFe=43180593015006000890651050002185881517712065&nVersao=100&tpAmb=1&dhEmi=323031382d30352d30355431323a31383a33332d30333a3030&vNF=71.89&vICMS=1.60&digVal=7a646e52687a646a566a34786d7074794856775378454e67324e513d&cIdToken=000001&cHashQRCode=E6ED6854ED5ED18E06EFD60337127A4C9ECFC608'
).catch(err => console.log(err));
