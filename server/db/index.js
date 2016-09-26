'use strict'
const mw = require('../config/middleware.js');
const uri = mw.urls.database;
const chalk = mw.chalk;

module.exports = mw.mongoose.connect(uri).connection
  .on('error', err => console.log(err))
  .on('open', () => {
    console.log(
      '  ' + chalk.green.bold(String.fromCharCode(0x27A0)) + ' ' + 
      chalk.cyan('Connected to ' + uri), 
      '\n    ' + chalk.magenta.underline.dim('Loading Default Data...')
    );
    let errCount = 0;
    require('../data/default.json')
      .forEach((record, index, arr) => new require('../resources/schema.js')(record)
        .save(err => {
          err && errCount++;
          index == arr.length - 1 && console.log(
            '    ' + chalk.cyan.dim('Load Complete.'), 
            errCount ? chalk.yellow.dim(`(${errCount} conflicts)`) : ''
          );
      }));
  });