require('colors');

var _ = require('lodash');
var moment = require('moment');

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

eoddata.getCountryList(function (err, countries) {
  if (err) { return console.error(err); }
  console.log('=== Country List ==='.cyan);
  _.keys(countries).sort().forEach(function (code) {
    console.log('%s: %s', code, countries[code]);
  });
});

eoddata.getDataFormats(function (err, dataFormats) {
  if (err) { return console.error(err); }
  console.log('=== Data Formats ==='.cyan);
  _.keys(dataFormats).sort().forEach(function (code) {
    console.log('%s: %s', code, JSON.stringify(dataFormats[code], null, 2));
  });
});

eoddata.getExchangeGet(EXCHANGE, function (err, exchange) {
  if (err) { return console.error(err); }
  console.log('=== Exchange Get (%s) ==='.cyan, EXCHANGE);
  console.log(exchange);
});

eoddata.getExchangeList(function (err, exchanges) {
  if (err) { return console.error(err); }
  console.log('=== Exchanges ==='.cyan);
  _.keys(exchanges).sort().forEach(function (code) {
    console.log('%s: %s', code, JSON.stringify(exchanges[code], null, 2));
  });
});

eoddata.getFundamentalList(EXCHANGE, function (err, fundamentals) {
  if (err) { return console.error(err); }
  console.log('=== Fundamental List (%s) ==='.cyan, EXCHANGE);
  _.keys(fundamentals).sort().forEach(function (code) {
    console.log('%s: %s', code, JSON.stringify(fundamentals[code], null, 2));
  });
});

eoddata.getQuoteGet(EXCHANGE, SYMBOL, function (err, quote) {
  if (err) { return console.error(err); }
  console.log('=== Quote Get (%s:%s) ==='.cyan, EXCHANGE, SYMBOL);
  console.log(quote);
});

eoddata.getQuoteList(EXCHANGE, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Quote List (%s) ==='.cyan, EXCHANGE);
  _.keys(quotes).sort().forEach(function (code) {
    console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
  });
});

eoddata.getQuoteList2(EXCHANGE, SYMBOLS, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Quote List 2 (%s:%s) ==='.cyan, EXCHANGE, SYMBOLS);
  _.keys(quotes).sort().forEach(function (code) {
    console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
  });
});

eoddata.getQuoteListByDate(EXCHANGE, QUOTE_DATE, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Quote List by Date (%s, %s) ==='.cyan, EXCHANGE, moment(QUOTE_DATE).format('M/D/YYYY'));
  _.keys(quotes).sort().forEach(function (code) {
    console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
  });
});

eoddata.getQuoteListByDate2(EXCHANGE, QUOTE_DATE, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Quote List by Date 2 (%s, %s) ==='.cyan, EXCHANGE, moment(QUOTE_DATE).format('M/D/YYYY'));
  _.keys(quotes).sort().forEach(function (code) {
    console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
  });
});

eoddata.getQuoteListByDatePeriod(EXCHANGE, QUOTE_DATE, PERIOD, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Quote List by Date Period (%s, %s, %s) ==='.cyan, EXCHANGE, moment(QUOTE_DATE).format('M/D/YYYY'), PERIOD);
  _.keys(quotes).sort().forEach(function (code) {
    if (code !== SYMBOL) { return; }
    console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
  });
});

eoddata.getQuoteListByDatePeriod2(EXCHANGE, QUOTE_DATE, PERIOD, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Quote List by Date Period 2 (%s, %s, %s) ==='.cyan, EXCHANGE, moment(QUOTE_DATE).format('M/D/YYYY'), PERIOD);
  _.keys(quotes).sort().forEach(function (code) {
    if (code !== SYMBOL) { return; }
    console.log('%s: %s', code, JSON.stringify(quotes[code], null, 2));
  });
});

eoddata.getSplitListByExchange(EXCHANGE, function (err, splits) {
  if (err) { return console.error(err); }
  console.log('=== Split List by Exchange (%s) ==='.cyan, EXCHANGE);
  console.log(splits);
});

eoddata.getSplitListBySymbol(EXCHANGE, SYMBOL, function (err, splits) {
  if (err) { return console.error(err); }
  console.log('=== Split List by Symbol (%s:%s) ==='.cyan, EXCHANGE, SYMBOL);
  console.log(splits);
});

eoddata.getSymbolChangesByExchange(EXCHANGE, function (err, symbolChanges) {
  if (err) { return console.error(err); }
  console.log('=== Symbol Changes by Exchange (%s) ==='.cyan, EXCHANGE);
  symbolChanges.forEach(function (symbolChange) {
    console.log(symbolChange);
  });
});

eoddata.getSymbolGet(EXCHANGE, SYMBOL, function (err, symbol) {
  if (err) { return console.error(err); }
  console.log('=== Symbol Get (%s:%s) ==='.cyan, EXCHANGE, SYMBOL);
  console.log(symbol);
});

eoddata.getSymbolHistory(EXCHANGE, SYMBOL, START_DATE, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Symbol History (%s:%s, %s-) ==='.cyan, EXCHANGE, SYMBOL, moment(START_DATE).format('M/D/YYYY'));
  quotes.forEach(function (quote) {
    console.log(quote);
  });
});

eoddata.getSymbolHistoryPeriod(EXCHANGE, SYMBOL, END_DATE, PERIOD, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Symbol History Period (%s:%s, %s, %s) ==='.cyan, EXCHANGE, SYMBOL, moment(END_DATE).format('M/D/YYYY'), PERIOD);
  quotes.forEach(function (quote) {
    console.log(quote);
  });
});

eoddata.getSymbolHistoryPeriodByDateRange(EXCHANGE, SYMBOL, START_DATE, END_DATE, PERIOD, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Symbol History Period by Date Range (%s:%s, %s-%s, %s) ==='.cyan,
    EXCHANGE, SYMBOL, moment(START_DATE).format('M/D/YYYY'), moment(END_DATE).format('M/D/YYYY'), PERIOD);
  quotes.forEach(function (quote) {
    console.log(quote);
  });
});

eoddata.getSymbolList2(EXCHANGE, function (err, symbols) {
  if (err) { return console.error(err); }
  console.log('=== Symbol List 2 (%s) ==='.cyan, EXCHANGE);
  _.keys(symbols).sort().forEach(function (code) {
    console.log('%s: %s', code, symbols[code]);
  });
});

eoddata.getTechnicalList(EXCHANGE, function (err, technicals) {
  if (err) { return console.error(err); }
  console.log('=== Technical List (%s) ==='.cyan, EXCHANGE);
  _.keys(technicals).sort().forEach(function (code) {
    console.log('%s: %s', code, JSON.stringify(technicals[code], null, 2));
  });
});

eoddata.getTop10Gains(EXCHANGE, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Top 10 Gains (%s) ==='.cyan, EXCHANGE);
  quotes.forEach(function (quote, i) {
    console.log('Top Gains #%d (+%d%): %s', i + 1, Math.round((quote.Close / quote.Previous - 1) * 100), JSON.stringify(quote, null, 2));
  });
});

eoddata.getTop10Losses(EXCHANGE, function (err, quotes) {
  if (err) { return console.error(err); }
  console.log('=== Top 10 Losses (%s) ==='.cyan, EXCHANGE);
  quotes.forEach(function (quote, i) {
    console.log('Top Losses #%d (%d%): %s', i + 1, Math.round((quote.Close / quote.Previous - 1) * 100), JSON.stringify(quote, null, 2));
  });
});
