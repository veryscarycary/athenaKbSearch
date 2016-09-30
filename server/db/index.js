'use strict'
const mw = require('../config/middleware.js');
const urls = mw.urls;
const chalk = mw.chalk;

module.exports = mw.mongoose.connect(urls.database).connection
  .on('error', err => console.log(err))
  .on('open', () => {
    console.log(
      `  ${chalk.green.bold(String.fromCharCode(0x27A0))} ${chalk.cyan(`Connected to ${urls.database}`)}`
    );
    mw.request.get('http://localhost:' + mw.urls.default + '/update')
      .on('error', err => console.log(err))
      .on('response', response => console.log('dataset loaded from master db'));
  });
