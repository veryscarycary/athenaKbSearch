'use strict'
const mw = require('../config/middleware.js');
const urls = mw.urls;
const chalk = mw.chalk;

module.exports = {
  kb: mw.mongoose.connect(urls.kb.database).connection
    .on('error', err => console.log(err))
    .on('open', () => {
      console.log(
        `  ${chalk.green.bold(String.fromCharCode(0x27A0))} ${chalk.cyan(`Connected to ${urls.kb.database}`)}`
      );
      mw.request.get('http://localhost:' + mw.urls.kb.default + '/update')
        .on('error', err => console.log(err))
        .on('response', response => console.log('dataset loaded from master db'));
    }),
  tickets: mw.mongoose.connect(urls.ticket.database).connection
    .on('error', err => console.log(err))
    .on('open', () => {
      console.log(
        `  ${chalk.green.bold(String.fromCharCode(0x27A0))} ${chalk.cyan(`Connected to ${urls.ticket.database}`)}`
      );
      mw.request.get('http://localhost:' + mw.urls.ticket.default + '/update')
        .on('error', err => console.log(err))
        .on('response', response => console.log('dataset loaded from master db'));
    }),
}
