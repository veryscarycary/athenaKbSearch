'use strict'
const mw = require('../config/middleware.js');
const mongoose = mw.mongoose;

module.exports = mongoose.model('Kb', new mongoose.Schema(
    {
      id: Number,
      title: {
        type:String,
        unique: true
      },
      issuePreview: String, 
      issue: String,
      solution: String,
      relatedTickets: [String],
      relatedProducts: Object, //keys are products, values are versions
      authorId: String,
      archived: Boolean,
      dateLastEdited: String,
      dateSubmittedOn: String,
      dateLastViewed: String,
      viewCount: Number
    },
    {  versionKey: false }
));