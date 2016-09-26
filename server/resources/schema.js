'use strict'
/*************************
        KB SCHEMA
*************************/

const mongoose = require('../config/middleware.js').mongoose;

var schema = new mongoose.Schema({
  title: {
    type:String,
    unique: true
  }
},
{ versionKey: false });

module.exports = mongoose.model('Kb', schema);