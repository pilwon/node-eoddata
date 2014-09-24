require('colors');

var _ = require('lodash');
var moment = require('moment');
var Promise = require('bluebird');

var USERNAME = '<EODDATA_USERNAME>';
var PASSWORD = '<EODDATA_PASSWORD>';
var EXCHANGE = 'NASDAQ';
var SYMBOL = 'GOOG';
var SYMBOLS = ['GOOG', 'AAPL'];
var START_DATE = new Date('9/15/2014');
var END_DATE = new Date('9/24/2014');
var QUOTE_DATE = new Date('9/23/2014');
var PERIOD = 'h';

var eoddata = new (require('..').Data)({
  username: USERNAME,
  password: PASSWORD
});

Promise.resolve()
  .then(function () {
    return eoddata.getCountryList()
      .then(function (countries) {
        console.log('=== Country List ==='.cyan);
        _.keys(countries).sort().forEach(function (code) {
          console.log('%s: %s', code, countries[code]);
        });
      });
  })
  .then(function () {
    return eoddata.getDataFormats()
      .then(function (dataFormats) {
        console.log('=== Data Formats ==='.cyan);
        _.keys(dataFormats).sort().forEach(function (code) {
          console.log('%s: %s', code, JSON.stringify(dataFormats[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getExchangeGet(EXCHANGE)
      .then(function (exchange) {
        console.log('=== Exchange Get (%s) ==='.cyan, EXCHANGE);
        console.log(exchange);
      });
  })
  .then(function () {
    return eoddata.getExchangeList()
      .then(function (exchanges) {
        console.log('=== Exchanges ==='.cyan);
        _.keys(exchanges).sort().forEach(function (code) {
          console.log('%s: %s', code, JSON.stringify(exchanges[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getFundamentalList(EXCHANGE)
      .then(function (fundamentals) {
        console.log('=== Fundamental List (%s) ==='.cyan, EXCHANGE);
        _.keys(fundamentals).sort().forEach(function (code) {
          console.log('%s: %s', code, JSON.stringify(fundamentals[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getQuoteGet(EXCHANGE, SYMBOL)
      .then(function (quote) {
        console.log('=== Quote Get (%s:%s) ==='.cyan, EXCHANGE, SYMBOL);
        console.log(quote);
      });
  })
  .then(function () {
    return eoddata.getQuoteList(EXCHANGE)
      .then(function (quotes) {
        console.log('=== Quote List (%s) ==='.cyan, EXCHANGE);
        _.keys(quotes).sort().forEach(function (code) {
          console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getQuoteList2(EXCHANGE, SYMBOLS)
      .then(function (quotes) {
        console.log('=== Quote List 2 (%s:%s) ==='.cyan, EXCHANGE, SYMBOLS);
        _.keys(quotes).sort().forEach(function (code) {
          console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getQuoteListByDate(EXCHANGE, QUOTE_DATE)
      .then(function (quotes) {
        console.log('=== Quote List by Date (%s, %s) ==='.cyan, EXCHANGE, moment(QUOTE_DATE).format('M/D/YYYY'));
        _.keys(quotes).sort().forEach(function (code) {
          console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getQuoteListByDate2(EXCHANGE, QUOTE_DATE)
      .then(function (quotes) {
        console.log('=== Quote List by Date 2 (%s, %s) ==='.cyan, EXCHANGE, moment(QUOTE_DATE).format('M/D/YYYY'));
        _.keys(quotes).sort().forEach(function (code) {
          console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getQuoteListByDatePeriod(EXCHANGE, QUOTE_DATE, PERIOD)
      .then(function (quotes) {
        console.log('=== Quote List by Date Period (%s, %s, %s) ==='.cyan, EXCHANGE, moment(QUOTE_DATE).format('M/D/YYYY'), PERIOD);
        _.keys(quotes).sort().forEach(function (code) {
          if (code !== SYMBOL) { return; }
          console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getQuoteListByDatePeriod2(EXCHANGE, QUOTE_DATE, PERIOD)
      .then(function (quotes) {
        console.log('=== Quote List by Date Period 2 (%s, %s, %s) ==='.cyan, EXCHANGE, moment(QUOTE_DATE).format('M/D/YYYY'), PERIOD);
        _.keys(quotes).sort().forEach(function (code) {
          if (code !== SYMBOL) { return; }
          console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getSplitListByExchange(EXCHANGE)
      .then(function (splits) {
        console.log('=== Split List by Exchange (%s) ==='.cyan, EXCHANGE);
        console.log(splits);
      });
  })
  .then(function () {
    return eoddata.getSplitListBySymbol(EXCHANGE, SYMBOL)
      .then(function (splits) {
        console.log('=== Split List by Symbol (%s:%s) ==='.cyan, EXCHANGE, SYMBOL);
        console.log(splits);
      });
  })
  .then(function () {
    return eoddata.getSymbolChangesByExchange(EXCHANGE)
      .then(function (symbolChanges) {
        console.log('=== Symbol Changes by Exchange (%s) ==='.cyan, EXCHANGE);
        symbolChanges.forEach(function (symbolChange) {
          console.log(symbolChange);
        });
      });
  })
  .then(function () {
    return eoddata.getSymbolGet(EXCHANGE, SYMBOL)
      .then(function (symbol) {
        console.log('=== Symbol Get (%s:%s) ==='.cyan, EXCHANGE, SYMBOL);
        console.log(symbol);
      });
  })
  .then(function () {
    return eoddata.getSymbolHistory(EXCHANGE, SYMBOL, START_DATE)
      .then(function (quotes) {
        console.log('=== Symbol History (%s:%s, %s-) ==='.cyan, EXCHANGE, SYMBOL, moment(START_DATE).format('M/D/YYYY'));
        quotes.forEach(function (quote) {
          console.log(quote);
        });
      });
  })
  .then(function () {
    return eoddata.getSymbolHistoryPeriod(EXCHANGE, SYMBOL, END_DATE, PERIOD)
      .then(function (quotes) {
        console.log('=== Symbol History Period (%s:%s, %s, %s) ==='.cyan, EXCHANGE, SYMBOL, moment(END_DATE).format('M/D/YYYY'), PERIOD);
        quotes.forEach(function (quote) {
          console.log(quote);
        });
      });
  })
  .then(function () {
    return eoddata.getSymbolHistoryPeriodByDateRange(EXCHANGE, SYMBOL, START_DATE, END_DATE, PERIOD)
      .then(function (quotes) {
        console.log('=== Symbol History Period by Date Range (%s:%s, %s-%s, %s) ==='.cyan,
          EXCHANGE, SYMBOL, moment(START_DATE).format('M/D/YYYY'), moment(END_DATE).format('M/D/YYYY'), PERIOD);
        quotes.forEach(function (quote) {
          console.log(quote);
        });
      });
  })
  .then(function () {
    return eoddata.getSymbolList2(EXCHANGE)
      .then(function (symbols) {
        console.log('=== Symbol List 2 (%s) ==='.cyan, EXCHANGE);
        _.keys(symbols).sort().forEach(function (code) {
          console.log('%s: %s', code, symbols[code]);
        });
      });
  })
  .then(function () {
    return eoddata.getTechnicalList(EXCHANGE)
      .then(function (technicals) {
        console.log('=== Technical List (%s) ==='.cyan, EXCHANGE);
        _.keys(technicals).sort().forEach(function (code) {
          console.log('%s: %s', code, JSON.stringify(technicals[code], null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getTop10Gains(EXCHANGE)
      .then(function (quotes) {
        console.log('=== Top 10 Gains (%s) ==='.cyan, EXCHANGE);
        quotes.forEach(function (quote, i) {
          console.log('Top Gains #%d (+%d%): %s', i + 1, Math.round((quote.Close / quote.Previous - 1) * 100), JSON.stringify(quote, null, 2));
        });
      });
  })
  .then(function () {
    return eoddata.getTop10Losses(EXCHANGE)
      .then(function (quotes) {
        console.log('=== Top 10 Losses (%s) ==='.cyan, EXCHANGE);
        quotes.forEach(function (quote, i) {
          console.log('Top Losses #%d (%d%): %s', i + 1, Math.round((quote.Close / quote.Previous - 1) * 100), JSON.stringify(quote, null, 2));
        });
      });
  })
  .catch(console.error);
