// const geocode = require('bing-geocoder').geocode;
global.fetch = require("node-fetch"); // set fetch for nodeJS
var geoCode = new require("geo-coder").GeoCode();
geoCode
  .geolookup("jorge fayet 757 porto alegre brasil")
  .then(res => console.log(res))
  .catch(err => console.log(err));
// const key = "AvX0U3fiOK9vYI_xB7wUkvGBkf6_2O72zEytmrFrOovUSs9dEdqqAlM0SibD7Fi_";
// geocode('jorge fayet 757 porto alegre brasil', key, (err, res) => console.log(res.lat, res.lon));