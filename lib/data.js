var url = require('url');
var util = require('util');

var _ = require('lodash');
var debug = require('debug')('eoddata:data');
var moment = require('moment');
var Promise = require('bluebird');
var request = require('request');
var xml2js = require('xml2js');

request = Promise.promisifyAll(request);
xml2js = Promise.promisifyAll(xml2js);

function Data(config) {
  this._config = _getConfig(config);
  this._tokenPromise = null;
  this._tokenTime = null;
}

function _getConfig(config) {
  var result = _.clone(config);
  if (!_.isPlainObject(result)) { result = {}; }
  _.defaults(result, {
    endpoint: 'http://ws.eoddata.com/data.asmx/',
    requestTimeout: 15000,
    tokenCache: true,
    tokenExpiryInterval: 30000,
    username: null,
    password: null
  });
  return result;
}

function _getToken() {
  if (this._config.tokenCache && this._tokenPromise) {
    if (Date.now() - this._tokenTime >= this._config.tokenExpiryInterval) {
      this._tokenPromise = null;
    } else {
      return this._tokenPromise;
    }
  }
  debug('Getting a token...');
  this._tokenTime = Date.now();
  var promise = this._tokenPromise = Promise.bind(this)
    .then(function () {
      return _request.call(this, 'Login', {
        Username: this._config.username,
        Password: this._config.password
      });
    })
    .then(function (result) {
      if (!result.LOGINRESPONSE.$.Token) {
        throw new Error(
          util.format('Failed to login: %s',
                      result.LOGINRESPONSE.$.Message)
        );
      }
      var token = result.LOGINRESPONSE.$.Token;
      debug(util.format('Login Token: %s', token));
      return token;
    })
    .tap(function (token) {
      this._tokenTime = Date.now();
    })
    .catch(function (err) {
      throw new Error(util.format('Failed to login: %s', err.message));
    });
  return promise;
}

function _request(urlPath, formData) {
  return Promise.bind(this)
    .then(function () {
      return request.postAsync({
        url: url.resolve(this._config.endpoint, urlPath),
        form: formData || {},
        timeout: this._config.timeout
      }).spread(function (res, body) {
        if (res.statusCode === 200) {
          return xml2js.parseStringAsync(body);
        } else {
          throw new Error(util.format('status %d', res.statusCode));
        }
      });
    });
}

function _requestWithToken(urlPath, formData) {
  return Promise.bind(this)
    .then(_getToken)
    .then(function (token) {
      if (formData) {
        _.assign(formData, {
          Token: token
        });
      }
      return _request.call(this, urlPath, formData);
    });
}

Data.prototype.getCountryList = function (cb) {
  debug('Downloading CountryList...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'CountryList', {});
    })
    .then(function (result) {
      if (!result.RESPONSE.COUNTRIES) {
        throw new Error(util.format(
          'Failed to get CountryList: %s',
          result.RESPONSE.$.Message
        ));
      }
      var countries = {};
      if (result.RESPONSE.COUNTRIES[0].CountryBase) {
        result.RESPONSE.COUNTRIES[0].CountryBase.forEach(function (country) {
          countries[country.$.Code] = country.$.Name;
        });
      }
      debug(util.format('CountryList: %d',
                        _.keys(countries).length));
      return countries;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get CountryList: %s',
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getDataFormats = function (cb) {
  debug('Downloading DataFormats...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'DataFormats', {});
    })
    .then(function (result) {
      if (!result.RESPONSE.DATAFORMATS) {
        throw new Error(util.format(
          'Failed to get DataFormats: %s',
          result.RESPONSE.$.Message
        ));
      }
      var dataFormats = {};
      if (result.RESPONSE.DATAFORMATS[0].DATAFORMAT) {
        result.RESPONSE.DATAFORMATS[0].DATAFORMAT.forEach(function (dataFormat) {
          dataFormats[dataFormat.$.Code] = dataFormat.$;
        });
      }
      debug(util.format('DataFormats: %d', _.keys(dataFormats).length));
      return dataFormats;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get DataFormats: %s',
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getExchangeGet = function (exchangeCode, cb) {
  debug('Downloading ExchangeGet...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'ExchangeGet', {
        Exchange: exchangeCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.EXCHANGE) {
        throw new Error(util.format(
          'Failed to get ExchangeGet (%s): %s',
          exchangeCode,
          result.RESPONSE.$.Message
        ));
      }
      var exchange = result.RESPONSE.EXCHANGE[0].$;
      debug(util.format('ExchangeGet (%s)', exchangeCode));
      return exchange;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get ExchangeGet (%s): %s',
        exchangeCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getExchangeList = function (cb) {
  debug('Downloading ExchangeList...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'ExchangeList', {});
    })
    .then(function (result) {
      if (!result.RESPONSE.EXCHANGES) {
        throw new Error(util.format(
          'Failed to get ExchangeList: %s',
          result.RESPONSE.$.Message
        ));
      }
      var exchanges = {};
      if (result.RESPONSE.EXCHANGES[0].EXCHANGE) {
        result.RESPONSE.EXCHANGES[0].EXCHANGE.forEach(function (exchange) {
          exchanges[exchange.$.Code] = exchange.$;
        });
      }
      debug(util.format('ExchangeList: %d',
                        _.keys(exchanges).length));
      return exchanges;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get ExchangeList: %s',
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getFundamentalList = function (exchangeCode, cb) {
  debug('Downloading FundamentalList...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'FundamentalList', {
        Exchange: exchangeCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.FUNDAMENTALS) {
        throw new Error(util.format(
          'Failed to get FundamentalList (%s): %s',
          exchangeCode,
          result.RESPONSE.$.Message
        ));
      }
      var fundamentals = {};
      if (result.RESPONSE.FUNDAMENTALS[0].FUNDAMENTAL) {
        result.RESPONSE.FUNDAMENTALS[0].FUNDAMENTAL.forEach(function (fundamental) {
          fundamentals[fundamental.$.Symbol] = fundamental.$;
        });
      }
      debug(util.format('FundamentalList (%s): %d',
                        exchangeCode,
                        _.keys(fundamentals).length));
      return fundamentals;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get FundamentalList (%s): %s',
        exchangeCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getQuoteGet = function (exchangeCode, symbolCode, cb) {
  debug('Downloading QuoteGet...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'QuoteGet', {
        Exchange: exchangeCode,
        Symbol: symbolCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTE) {
        throw new Error(util.format(
          'Failed to get QuoteGet (%s:%s): %s',
          exchangeCode,
          symbolCode,
          result.RESPONSE.$.Message
        ));
      }
      var quote = result.RESPONSE.QUOTE[0].$;
      debug(util.format('QuoteGet (%s:%s)', exchangeCode, symbolCode));
      return quote;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get QuoteGet (%s:%s): %s',
        exchangeCode,
        symbolCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getQuoteList = function (exchangeCode, cb) {
  debug('Downloading QuoteList...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'QuoteList', {
        Exchange: exchangeCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES) {
        throw new Error(util.format(
          'Failed to get QuoteList (%s): %s',
          exchangeCode,
          result.RESPONSE.$.Message
        ));
      }
      var quotes = {};
      if (result.RESPONSE.QUOTES[0].QUOTE) {
        result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
          quotes[quote.$.Symbol] = quote.$;
        });
      }
      debug(util.format('QuoteList (%s): %d',
                        exchangeCode,
                        _.keys(quotes).length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get QuoteList (%s): %s',
        exchangeCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getQuoteList2 = function (exchangeCode, symbolCodes, cb) {
  debug('Downloading QuoteList2...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'QuoteList2', {
        Exchange: exchangeCode,
        Symbols: symbolCodes.join(',')
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES) {
        throw new Error(util.format(
          'Failed to get QuoteList2 (%s:%s): %s',
          exchangeCode,
          symbolCodes.join(','),
          result.RESPONSE.$.Message
        ));
      }
      var quotes = {};
      if (result.RESPONSE.QUOTES[0].QUOTE) {
        result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
          quotes[quote.$.Symbol] = quote.$;
        });
      }
      debug(util.format('QuoteList2 (%s:%s): %d',
                        exchangeCode,
                        symbolCodes.join(','),
                        _.keys(quotes).length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get QuoteList2 (%s:%s): %s',
        exchangeCode,
        symbolCodes.join(','),
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getQuoteListByDate = function (exchangeCode, quoteDate, cb) {
  debug('Downloading QuoteListByDate...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'QuoteListByDate', {
        Exchange: exchangeCode,
        QuoteDate: moment(quoteDate).format('YYYYMMDD')
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES) {
        throw new Error(util.format(
          'Failed to get QuoteListByDate (%s, %s): %s',
          exchangeCode,
          moment(quoteDate).format('M/D/YYYY'),
          result.RESPONSE.$.Message
        ));
      }
      var quotes = {};
      if (result.RESPONSE.QUOTES[0].QUOTE) {
        result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
          quotes[quote.$.Symbol] = quote.$;
        });
      }
      debug(util.format('QuoteListByDate (%s, %s): %d',
                        exchangeCode,
                        moment(quoteDate).format('M/D/YYYY'),
                        _.keys(quotes).length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get QuoteListByDate (%s, %s): %s',
        exchangeCode,
        moment(quoteDate).format('M/D/YYYY'),
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getQuoteListByDate2 = function (exchangeCode, quoteDate, cb) {
  debug('Downloading QuoteListByDate2...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'QuoteListByDate2', {
        Exchange: exchangeCode,
        QuoteDate: moment(quoteDate).format('YYYYMMDD')
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES2) {
        throw new Error(util.format(
          'Failed to get QuoteListByDate2 (%s, %s): %s',
          exchangeCode,
          moment(quoteDate).format('M/D/YYYY'),
          result.RESPONSE.$.Message
        ));
      }
      var quotes = {};
      if (result.RESPONSE.QUOTES2[0].QUOTE2) {
        result.RESPONSE.QUOTES2[0].QUOTE2.forEach(function (quote) {
          quotes[quote.$.s] = quote.$;
        });
      }
      debug(util.format('QuoteListByDate2 (%s, %s): %d',
                        exchangeCode,
                        moment(quoteDate).format('M/D/YYYY'),
                        _.keys(quotes).length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get QuoteListByDate2 (%s, %s): %s',
        exchangeCode,
        moment(quoteDate).format('M/D/YYYY'),
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getQuoteListByDatePeriod = function (exchangeCode, quoteDate, period, cb) {
  debug('Downloading QuoteListByDatePeriod...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'QuoteListByDatePeriod', {
        Exchange: exchangeCode,
        QuoteDate: moment(quoteDate).format('YYYYMMDD'),
        Period: period
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES) {
        throw new Error(util.format(
          'Failed to get QuoteListByDatePeriod (%s, %s, %s): %s',
          exchangeCode,
          moment(quoteDate).format('M/D/YYYY'),
          period,
          result.RESPONSE.$.Message
        ));
      }
      var quotes = {};
      if (result.RESPONSE.QUOTES[0].QUOTE) {
        result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
          if (!_.has(quotes, quote.$.Symbol)) {
            quotes[quote.$.Symbol] = [];
          }
          quotes[quote.$.Symbol].push(quote.$);
        });
      }
      debug(util.format('QuoteListByDatePeriod (%s, %s, %s): %d',
                        exchangeCode,
                        moment(quoteDate).format('M/D/YYYY'),
                        period,
                        _.keys(quotes).length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get QuoteListByDatePeriod (%s, %s, %s): %s',
        exchangeCode,
        moment(quoteDate).format('M/D/YYYY'),
        period,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getQuoteListByDatePeriod2 = function (exchangeCode, quoteDate, period, cb) {
  debug('Downloading QuoteListByDatePeriod2...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'QuoteListByDatePeriod2', {
        Exchange: exchangeCode,
        QuoteDate: moment(quoteDate).format('YYYYMMDD'),
        Period: period
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES2) {
        throw new Error(util.format(
          'Failed to get QuoteListByDatePeriod2 (%s, %s, %s): %s',
          exchangeCode,
          moment(quoteDate).format('M/D/YYYY'),
          period,
          result.RESPONSE.$.Message
        ));
      }
      var quotes = {};
      if (result.RESPONSE.QUOTES2[0].QUOTE2) {
        result.RESPONSE.QUOTES2[0].QUOTE2.forEach(function (quote) {
          if (!_.has(quotes, quote.$.s)) {
            quotes[quote.$.s] = [];
          }
          quotes[quote.$.s].push(quote.$);
        });
      }
      debug(util.format('QuoteListByDatePeriod2 (%s, %s, %s): %d',
                        exchangeCode,
                        moment(quoteDate).format('M/D/YYYY'),
                        period,
                        _.keys(quotes).length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get QuoteListByDatePeriod2 (%s, %s, %s): %s',
        exchangeCode,
        moment(quoteDate).format('M/D/YYYY'),
        period,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getSplitListByExchange = function (exchangeCode, cb) {
  debug('Downloading SplitListByExchange...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'SplitListByExchange', {
        Exchange: exchangeCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.SPLITS) {
        throw new Error(util.format(
          'Failed to get SplitListByExchange (%s): %s',
          exchangeCode,
          result.RESPONSE.$.Message
        ));
      }
      var splits = [];
      if (result.RESPONSE.SPLITS[0].SPLIT) {
        result.RESPONSE.SPLITS[0].SPLIT.forEach(function (split) {
          splits.push(split.$);
        });
      }
      debug(util.format('SplitListByExchange (%s): %d',
                        exchangeCode,
                        _.keys(splits).length));
      return splits;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get SplitListByExchange (%s): %s',
        exchangeCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getSplitListBySymbol = function (exchangeCode, symbolCode, cb) {
  debug('Downloading SplitListBySymbol...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'SplitListBySymbol', {
        Exchange: exchangeCode,
        Symbol: symbolCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.SPLITS) {
        if (result.RESPONSE.$.Message === 'No Splits were found') {
          return [];
        }
        throw new Error(util.format(
          'Failed to get SplitListBySymbol (%s:%s): %s',
          exchangeCode,
          symbolCode,
          result.RESPONSE.$.Message
        ));
      }
      var splits = [];
      if (result.RESPONSE.SPLITS[0].SPLIT) {
        result.RESPONSE.SPLITS[0].SPLIT.forEach(function (split) {
          splits.push(split.$);
        });
      }
      debug(util.format('SplitListBySymbol (%s:%s): %d',
                        exchangeCode,
                        symbolCode,
                        _.keys(splits).length));
      return splits;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get SplitListBySymbol (%s:%s): %s',
        exchangeCode,
        symbolCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getSymbolChangesByExchange = function (exchangeCode, cb) {
  debug('Downloading SymbolChangesByExchange...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'SymbolChangesByExchange', {
        Exchange: exchangeCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.SYMBOLCHANGES) {
        throw new Error(util.format(
          'Failed to get SymbolChangesByExchange (%s): %s',
          exchangeCode,
          result.RESPONSE.$.Message
        ));
      }
      var symbolChanges = [];
      if (result.RESPONSE.SYMBOLCHANGES[0].SYMBOLCHANGE) {
        result.RESPONSE.SYMBOLCHANGES[0].SYMBOLCHANGE.forEach(function (symbolChange) {
          symbolChanges.push(symbolChange.$);
        });
      }
      debug(util.format('SymbolChangesByExchange (%s): %d',
                        exchangeCode,
                        _.keys(symbolChanges).length));
      return symbolChanges;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get SymbolChangesByExchange (%s): %s',
        exchangeCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getSymbolGet = function (exchangeCode, symbolCode, cb) {
  debug('Downloading SymbolGet...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'SymbolGet', {
        Exchange: exchangeCode,
        Symbol: symbolCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.SYMBOL) {
        throw new Error(util.format(
          'Failed to get SymbolGet (%s:%s): %s',
          exchangeCode,
          symbolCode,
          result.RESPONSE.$.Message
        ));
      }
      var symbol = result.RESPONSE.SYMBOL[0].$;
      debug(util.format('SymbolGet (%s:%s)', exchangeCode, symbolCode));
      return symbol;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get SymbolGet (%s:%s): %s',
        exchangeCode,
        symbolCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getSymbolHistory = function (exchangeCode, symbolCode, startDate, cb) {
  debug('Downloading SymbolHistory...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'SymbolHistory', {
        Exchange: exchangeCode,
        Symbol: symbolCode,
        StartDate: moment(startDate).format('YYYYMMDD')
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES) {
        throw new Error(util.format(
          'Failed to get SymbolHistory (%s:%s, %s-): %s',
          exchangeCode,
          symbolCode,
          moment(startDate).format('M/D/YYYY'),
          result.RESPONSE.$.Message
        ));
      }
      var quotes = [];
      if (result.RESPONSE.QUOTES[0].QUOTE) {
        result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
          quotes.push(quote.$);
        });
      }
      debug(util.format('SymbolHistory (%s:%s, %s-): %d',
                        exchangeCode,
                        symbolCode,
                        moment(startDate).format('M/D/YYYY'),
                        quotes.length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get SymbolHistory (%s:%s, %s-): %s',
        exchangeCode,
        symbolCode,
        moment(startDate).format('M/D/YYYY'),
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getSymbolHistoryPeriod = function (exchangeCode, symbolCode, date, period, cb) {
  debug('Downloading SymbolHistoryPeriod...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'SymbolHistoryPeriod', {
        Exchange: exchangeCode,
        Symbol: symbolCode,
        Date: moment(date).format('YYYYMMDD'),
        Period: period
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES) {
        throw new Error(util.format(
          'Failed to get SymbolHistoryPeriod (%s:%s, %s, %s): %s',
          exchangeCode,
          symbolCode,
          moment(date).format('M/D/YYYY'),
          period,
          result.RESPONSE.$.Message
        ));
      }
      var quotes = [];
      if (result.RESPONSE.QUOTES[0].QUOTE) {
        result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
          quotes.push(quote.$);
        });
      }
      debug(util.format('SymbolHistoryPeriod (%s:%s, %s, %s): %d',
                        exchangeCode,
                        symbolCode,
                        moment(date).format('M/D/YYYY'),
                        period,
                        quotes.length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get SymbolHistoryPeriod (%s:%s, %s, %s): %s',
        exchangeCode,
        symbolCode,
        moment(date).format('M/D/YYYY'),
        period,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getSymbolHistoryPeriodByDateRange = function (exchangeCode, symbolCode, startDate, endDate, period, cb) {
  debug('Downloading SymbolHistoryPeriodByDateRange...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'SymbolHistoryPeriodByDateRange', {
        Exchange: exchangeCode,
        Symbol: symbolCode,
        StartDate: moment(startDate).format('YYYYMMDD'),
        EndDate: moment(endDate).format('YYYYMMDD'),
        Period: period
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES) {
        throw new Error(util.format(
          'Failed to get SymbolHistoryPeriodByDateRange (%s:%s, %s-%s, %s): %s',
          exchangeCode,
          symbolCode,
          moment(startDate).format('M/D/YYYY'),
          moment(endDate).format('M/D/YYYY'),
          period,
          result.RESPONSE.$.Message
        ));
      }
      var quotes = [];
      if (result.RESPONSE.QUOTES[0].QUOTE) {
        result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
          quotes.push(quote.$);
        });
      }
      debug(util.format('SymbolHistoryPeriodByDateRange (%s:%s, %s-%s, %s): %d',
                        exchangeCode,
                        symbolCode,
                        moment(startDate).format('M/D/YYYY'),
                        moment(endDate).format('M/D/YYYY'),
                        period,
                        quotes.length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get SymbolHistoryPeriodByDateRange (%s:%s, %s-%s, %s): %s',
        exchangeCode,
        symbolCode,
        moment(startDate).format('M/D/YYYY'),
        moment(endDate).format('M/D/YYYY'),
        period,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getSymbolList2 = function (exchangeCode, cb) {
  debug('Downloading SymbolList2...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'SymbolList2', {
        Exchange: exchangeCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.SYMBOLS2) {
        throw new Error(util.format(
          'Failed to get SymbolList2 (%s): %s',
          exchangeCode,
          result.RESPONSE.$.Message
        ));
      }
      var symbols = {};
      if (result.RESPONSE.SYMBOLS2[0].SYMBOL2) {
        result.RESPONSE.SYMBOLS2[0].SYMBOL2.forEach(function (symbol) {
          symbols[symbol.$.c] = symbol.$.n;
        });
      }
      debug(util.format('SymbolList2 (%s): %d',
                        exchangeCode,
                        _.keys(symbols).length));
      return symbols;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get SymbolList2 (%s): %s',
        exchangeCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getTechnicalList = function (exchangeCode, cb) {
  debug('Downloading TechnicalList...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'TechnicalList', {
        Exchange: exchangeCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.TECHNICALS) {
        throw new Error(util.format(
          'Failed to get TechnicalList (%s): %s',
          exchangeCode,
          result.RESPONSE.$.Message
        ));
      }
      var technicals = {};
      if (result.RESPONSE.TECHNICALS[0].TECHNICAL) {
        result.RESPONSE.TECHNICALS[0].TECHNICAL.forEach(function (technical) {
          technicals[technical.$.Symbol] = technical.$;
        });
      }
      debug(util.format('TechnicalList (%s): %d',
                        exchangeCode,
                        _.keys(technicals).length));
      return technicals;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get TechnicalList (%s): %s',
        exchangeCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getTop10Gains = function (exchangeCode, cb) {
  debug('Downloading Top10Gains...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'Top10Gains', {
        Exchange: exchangeCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES) {
        throw new Error(util.format(
          'Failed to get Top10Gains (%s): %s',
          exchangeCode,
          result.RESPONSE.$.Message
        ));
      }
      var quotes = [];
      if (result.RESPONSE.QUOTES[0].QUOTE) {
        result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
          quotes.push(quote.$);
        });
      }
      debug(util.format('Top10Gains (%s): %d',
                        exchangeCode,
                        quotes.length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get Top10Gains (%s): %s',
        exchangeCode,
        err.message
      ));
    })
    .nodeify(cb);
};

Data.prototype.getTop10Losses = function (exchangeCode, cb) {
  debug('Downloading Top10Losses...');
  return Promise.bind(this)
    .then(function () {
      return _requestWithToken.call(this, 'Top10Losses', {
        Exchange: exchangeCode
      });
    })
    .then(function (result) {
      if (!result.RESPONSE.QUOTES) {
        throw new Error(util.format(
          'Failed to get Top10Losses (%s): %s',
          exchangeCode,
          result.RESPONSE.$.Message
        ));
      }
      var quotes = [];
      if (result.RESPONSE.QUOTES[0].QUOTE) {
        result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
          quotes.push(quote.$);
        });
      }
      debug(util.format('Top10Losses (%s): %d',
                        exchangeCode,
                        quotes.length));
      return quotes;
    })
    .catch(function (err) {
      throw new Error(util.format(
        'Failed to get Top10Losses (%s): %s',
        exchangeCode,
        err.message
      ));
    })
    .nodeify(cb);
};

exports = module.exports = Data;
