'use strict'
const mongoose = require('../config/middleware.js').mongoose;

module.exports = mongoose.model('Kb', new mongoose.Schema(
    {
      title: {
        type:String,
        unique: true
      },
      issuePreview: String, 
      relatedProducts: Object, //keys are products, values are versions
      authorId: String,
      archived: Boolean,
      datesEdited: [[Date, String]], //dates edited, user Id
      dateSubmitted: Date,
      dateLastViewed: Date,
      viewCount: Number
    },
    {  versionKey: false }
));