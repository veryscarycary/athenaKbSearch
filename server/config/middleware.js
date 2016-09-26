'use strict'
let mongoose = require('mongoose');
mongoose.Promise = global.Promise; //fixes depreciated mongoose promise by implementing ES6 promise.

module.exports = {
  urls: require('./urls.js'),
  express: require('express'),
  router: require('express').Router,
  mongoose: mongoose,
  bodyParser: require('body-parser'),
  chalk: require('chalk'),
  request: require('request')//,
  // sequelize: require('sequelize'), 
  // pg: require('pg'),
  // dbAuth: require('./dbAuth.js'),
}