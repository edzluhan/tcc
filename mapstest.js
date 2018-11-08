const envVars = require('dotenv').config();

const googleMapsClient = require('@google/maps').createClient({
	key: process.env.MAPS_KEY,
	Promise: Promise
});

const street = 'AVENIDA IPIRANGA, 3000';
const zipcode = '90610-000';

// // const geolocation = await 
// googleMapsClient.geocode({ address: `${street} ${zipcode}` })
// 	.asPromise().then(result => console.log(JSON.stringify(result.json.results[0].geometry.location)))
// 	.catch(err => console.log(err))

// // console.log('geolocation', geolocation);
// return;
async function getLocation(street, zipcode) {
	const geolocation = await googleMapsClient.geocode({ address: `${street} ${zipcode}` }).asPromise();
	const { lat, lng } = geolocation.json.results[0].geometry.location;
	console.log(lat, lng);
	return true;
}

getLocation(street, zipcode);