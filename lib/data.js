/*
 * lib/data.js
 */

'use strict';

var url = require('url'),
    util = require('util');

var _ = require('lodash'),
    async = require('async'),
    moment = require('moment'),
    request = require('request'),
    xml2js = require('xml2js');

var debug = require('debug')('eoddata.Data');

function cbDefault(err) {
  if (err) {
    return console.error(err);
  }
  var args = Array.prototype.slice.call(arguments, 0);
  console.log(JSON.stringify(args.slice(1), null, 2));
}

var Data = function (config) {
  this._config = config;
  this._taskQueue = async.queue(function (task, next) {
    task.run(next);
  });

  _.defaults(this._config, {
    endpoint: 'http://ws.eoddata.com/data.asmx/',
    timeout: 30000
  });
};

Data.prototype._getToken = function (cb) {
  debug('Logging In...'.cyan);
  request.post({
    url: url.resolve(this._config.endpoint, 'Login'),
    form: {
      'Username': this._config.username,
      'Password': this._config.password
    },
    timeout: this._config.timeout
  }, function (err, res, body) {
    if (err) { return cb(err); }
    if (res.statusCode === 200) {
      xml2js.parseString(body, function (err, result) {
        if (err) { return cb(err); }
        if (!result.LOGINRESPONSE.$.Token) {
          return cb(new Error('Failed to login: ' + result.LOGINRESPONSE.$.Message));
        }
        var token = result.LOGINRESPONSE.$.Token;
        debug(('Login Token: ' + token).yellow);
        return cb(null, token);
      });
    } else {
      return cb(new Error('Failed to login: status ' + res.statusCode));
    }
  });
};

Data.prototype.getCountryList = function (cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading CountryList...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'CountryList'),
        form: {
          'Token': token
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.COUNTRIES) {
              return cb(new Error('Failed to get CountryList: ' + result.RESPONSE.$.Message));
            }
            var countries = {};
            if (result.RESPONSE.COUNTRIES[0].CountryBase) {
              result.RESPONSE.COUNTRIES[0].CountryBase.forEach(function (country) {
                countries[country.$.Code] = country.$.Name;
              });
            }
            debug(util.format('CountryList: %d',
                              _.keys(countries).length).yellow);
            return cb(null, countries);
          });
        } else {
          return cb(new Error('Failed to get CountryList: status ' + res.statusCode));
        }
      });
    });
  }});
};

Data.prototype.getDataFormats = function (cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading DataFormats...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'DataFormats'),
        form: {
          'Token': token
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.DATAFORMATS) {
              return cb(new Error('Failed to get DataFormats: ' + result.RESPONSE.$.Message));
            }
            var dataFormats = {};
            if (result.RESPONSE.DATAFORMATS[0].DATAFORMAT) {
              result.RESPONSE.DATAFORMATS[0].DATAFORMAT.forEach(function (dataFormat) {
                dataFormats[dataFormat.$.Code] = dataFormat.$;
              });
            }
            debug(util.format('DataFormats: %d', _.keys(dataFormats).length).yellow);
            return cb(null, dataFormats);
          });
        } else {
          return cb(new Error('Failed to get DataFormats: status ' + res.statusCode));
        }
      });
    });
  }});
};

Data.prototype.getExchangeGet = function (exchangeCode, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading ExchangeGet...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'ExchangeGet'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.EXCHANGE) {
              return cb(new Error(util.format('Failed to get ExchangeGet (%s): %s',
                                              exchangeCode, result.RESPONSE.$.Message).bold));
            }
            var exchange = result.RESPONSE.EXCHANGE[0].$;
            debug(util.format('ExchangeGet (%s)', exchangeCode).yellow);
            return cb(null, exchange);
          });
        } else {
          return cb(new Error(util.format('Failed to get ExchangeGet (%s): status %s',
                              exchangeCode, res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getExchangeList = function (cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading ExchangeList...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'ExchangeList'),
        form: {
          'Token': token
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.EXCHANGES) {
              return cb(new Error('Failed to get ExchangeList: ' + result.RESPONSE.$.Message));
            }
            var exchanges = {};
            if (result.RESPONSE.EXCHANGES[0].EXCHANGE) {
              result.RESPONSE.EXCHANGES[0].EXCHANGE.forEach(function (exchange) {
                exchanges[exchange.$.Code] = exchange.$;
              });
            }
            debug(util.format('ExchangeList: %d',
                              _.keys(exchanges).length).yellow);
            return cb(null, exchanges);
          });
        } else {
          return cb(new Error('Failed to get ExchangeList: status ' + res.statusCode));
        }
      });
    });
  }});
};

Data.prototype.getFundamentalList = function (exchangeCode, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading FundamentalList...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'FundamentalList'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.FUNDAMENTALS) {
              return cb(new Error(util.format('Failed to get FundamentalList (%s): %s',
                                              exchangeCode, result.RESPONSE.$.Message).bold));
            }
            var fundamentals = {};
            if (result.RESPONSE.FUNDAMENTALS[0].FUNDAMENTAL) {
              result.RESPONSE.FUNDAMENTALS[0].FUNDAMENTAL.forEach(function (fundamental) {
                fundamentals[fundamental.$.Symbol] = fundamental.$;
              });
            }
            debug(util.format('FundamentalList (%s): %d',
                              exchangeCode,
                              _.keys(fundamentals).length).yellow);
            return cb(null, fundamentals);
          });
        } else {
          return cb(new Error(util.format('Failed to get FundamentalList (%s): status %s',
                                          exchangeCode, res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getQuoteGet = function (exchangeCode, symbolCode, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading QuoteGet...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'QuoteGet'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.QUOTE) {
              return cb(new Error(util.format('Failed to get QuoteGet (%s:%s): %s',
                                              exchangeCode, symbolCode, result.RESPONSE.$.Message).bold));
            }
            var quote = result.RESPONSE.QUOTE[0].$;
            debug(util.format('QuoteGet (%s:%s)',
                                    exchangeCode,
                                    symbolCode).yellow);
            return cb(null, quote);
          });
        } else {
          return cb(new Error(util.format('Failed to get QuoteGet (%s:%s): status %s',
                              exchangeCode, symbolCode, res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getQuoteList = function (exchangeCode, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading QuoteList...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'QuoteList'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.QUOTES) {
              return cb(new Error(util.format('Failed to get QuoteList (%s): %s',
                                              exchangeCode, result.RESPONSE.$.Message)));
            }
            var quotes = {};
            if (result.RESPONSE.QUOTES[0].QUOTE) {
              result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
                quotes[quote.$.Symbol] = quote.$;
              });
            }
            debug(util.format('QuoteList (%s): %d',
                              exchangeCode,
                              _.keys(quotes).length).yellow);
            return cb(null, quotes);
          });
        } else {
          return cb(new Error(util.format('Failed to get QuoteList (%s): status %s',
                                          exchangeCode, res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getQuoteList2 = function (exchangeCode, symbolCodes, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    symbolCodes = (_.isArray(symbolCodes) ? symbolCodes : [symbolCodes]);

    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading QuoteList2...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'QuoteList2'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbols': symbolCodes.join(',')
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.QUOTES) {
              return cb(new Error(util.format('Failed to get QuoteList2 (%s:%s): %s',
                                              exchangeCode,
                                              symbolCodes.join(','),
                                              result.RESPONSE.$.Message)));
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
                              _.keys(quotes).length).yellow);
            return cb(null, quotes);
          });
        } else {
          return cb(new Error(util.format('Failed to get QuoteList2 (%s:%s): status %s',
                                          exchangeCode,
                                          symbolCodes.join(','),
                                          res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getSymbolChangesByExchange = function (exchangeCode, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading SymbolChangesByExchange...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'SymbolChangesByExchange'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.SYMBOLCHANGES) {
              return cb(new Error(util.format('Failed to get SymbolChangesByExchange (%s): %s',
                                              exchangeCode, result.RESPONSE.$.Message).bold));
            }
            var symbolChanges = [];
            if (result.RESPONSE.SYMBOLCHANGES[0].SYMBOLCHANGE) {
              result.RESPONSE.SYMBOLCHANGES[0].SYMBOLCHANGE.forEach(function (symbolChange) {
                symbolChanges.push(symbolChange.$);
              });
            }
            debug(util.format('SymbolChangesByExchange (%s): %d',
                              exchangeCode,
                              _.keys(symbolChanges).length).yellow);
            return cb(null, symbolChanges);
          });
        } else {
          return cb(new Error(util.format('Failed to get SymbolChangesByExchange (%s): status %s',
                              exchangeCode, res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getSymbolGet = function (exchangeCode, symbolCode, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading SymbolGet...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'SymbolGet'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.SYMBOL) {
              return cb(new Error(util.format('Failed to get SymbolGet (%s:%s): %s',
                                              exchangeCode, symbolCode, result.RESPONSE.$.Message).bold));
            }
            var symbol = result.RESPONSE.SYMBOL[0].$;
            debug(util.format('SymbolGet (%s:%s)', exchangeCode, symbolCode).yellow);
            return cb(null, symbol);
          });
        } else {
          return cb(new Error(util.format('Failed to get SymbolGet (%s:%s): status %s',
                              exchangeCode, symbolCode, res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getSymbolHistory = function (exchangeCode, symbolCode, startDate, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading SymbolHistory...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'SymbolHistory'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode,
          'StartDate': moment(startDate).format('YYYYMMDD')
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.QUOTES) {
              return cb(new Error(util.format('Failed to get SymbolHistory (%s:%s, %s-): %s',
                                              exchangeCode,
                                              symbolCode,
                                              moment(startDate).format('M/D/YYYY'),
                                              result.RESPONSE.$.Message).bold));
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
                              _.keys(quotes).length).yellow);
            return cb(null, quotes);
          });
        } else {
          return cb(new Error(util.format('Failed to get SymbolHistory (%s:%s, %s-): status %s',
                              exchangeCode,
                              symbolCode,
                              moment(startDate).format('M/D/YYYY'),
                              res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getSymbolHistoryPeriod = function (exchangeCode, symbolCode, date, period, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading SymbolHistoryPeriod...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'SymbolHistoryPeriod'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode,
          'Date': moment(date).format('YYYYMMDD'),
          'Period': period
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.QUOTES) {
              return cb(new Error(util.format('Failed to get SymbolHistoryPeriod (%s:%s, %s, %s): %s',
                                              exchangeCode,
                                              symbolCode,
                                              moment(date).format('M/D/YYYY'),
                                              period,
                                              result.RESPONSE.$.Message).bold));
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
                              _.keys(quotes).length).yellow);
            return cb(null, quotes);
          });
        } else {
          return cb(new Error(util.format('Failed to get SymbolHistoryPeriod (%s:%s:%s:%s): status %s',
                              exchangeCode,
                              symbolCode,
                              date,
                              period,
                              res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getSymbolHistoryPeriodByDateRange = function (exchangeCode, symbolCode, startDate, endDate, period, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading SymbolHistoryPeriodByDateRange...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'SymbolHistoryPeriodByDateRange'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode,
          'StartDate': moment(startDate).format('YYYYMMDD'),
          'EndDate': moment(endDate).format('YYYYMMDD'),
          'Period': period
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.QUOTES) {
              return cb(new Error(util.format('Failed to get SymbolHistoryPeriodByDateRange (%s:%s, %s-%s, %s): %s',
                                              exchangeCode,
                                              symbolCode,
                                              moment(startDate).format('M/D/YYYY'),
                                              moment(endDate).format('M/D/YYYY'),
                                              period,
                                              result.RESPONSE.$.Message).bold));
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
                              _.keys(quotes).length).yellow);
            return cb(null, quotes);
          });
        } else {
          return cb(new Error(util.format('Failed to get SymbolHistoryPeriodByDateRange (%s:%s, %s-%s, %s): status %s',
                              exchangeCode,
                              symbolCode,
                              moment(startDate).format('M/D/YYYY'),
                              moment(endDate).format('M/D/YYYY'),
                              period,
                              res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getSymbolList2 = function (exchangeCode, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading SymbolList2...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'SymbolList2'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.SYMBOLS2) {
              return cb(new Error(util.format('Failed to get SymbolList2 (%s): %s',
                                              exchangeCode,
                                              result.RESPONSE.$.Message).bold));
            }
            var symbols = {};
            if (result.RESPONSE.SYMBOLS2[0].SYMBOL2) {
              result.RESPONSE.SYMBOLS2[0].SYMBOL2.forEach(function (symbol) {
                symbols[symbol.$.c] = symbol.$.n;
              });
            }
            debug(util.format('SymbolList2 (%s): %d',
                              exchangeCode,
                              _.keys(symbols).length).yellow);
            return cb(null, symbols);
          });
        } else {
          return cb(new Error(util.format('Failed to get SymbolList2 (%s): status %s',
                              exchangeCode,
                              res.statusCode)));
        }
      });
    });
  }});
};

Data.prototype.getTechnicalList = function (exchangeCode, cb) {
  var self = this;

  cb = _.isFunction(cb) ? cb : cbDefault;

  this._taskQueue.push({run: function (next) {
    self._getToken(function (err, token) {
      if (err) { return cb(err); }

      debug('Downloading TechnicalList...'.cyan);
      request.post({
        url: url.resolve(self._config.endpoint, 'TechnicalList'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: self._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return cb(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return cb(err); }
            if (!result.RESPONSE.TECHNICALS) {
              return cb(new Error(util.format('Failed to get TechnicalList (%s): %s',
                                              exchangeCode,
                                              result.RESPONSE.$.Message).bold));
            }
            var technicals = {};
            if (result.RESPONSE.TECHNICALS[0].TECHNICAL) {
              result.RESPONSE.TECHNICALS[0].TECHNICAL.forEach(function (technical) {
                technicals[technical.$.Symbol] = technical.$;
              });
            }
            debug(util.format('TechnicalList (%s): %d',
                              exchangeCode,
                              _.keys(technicals).length).yellow);
            return cb(null, technicals);
          });
        } else {
          return cb(new Error(util.format('Failed to get TechnicalList (%s): status %s',
                              exchangeCode,
                              res.statusCode)));
        }
      });
    });
  }});
};

// Public API
exports = module.exports = Data;
