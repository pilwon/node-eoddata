var url = require('url');
var util = require('util');

var _ = require('lodash');
var async = require('async');
var moment = require('moment');
var Q = require('q');
var request = require('request');
var xml2js = require('xml2js');

var debug = require('debug')('eoddata:data');

var Data = function (config) {
  this._config = _.isPlainObject(config) ? config : {};
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
          return cb(new Error(
            util.format('Failed to login: %s',
                        result.LOGINRESPONSE.$.Message)
          ));
        }
        var token = result.LOGINRESPONSE.$.Token;
        debug(('Login Token: ' + token).yellow);
        return cb(null, token);
      });
    } else {
      return cb(new Error(
        util.format('Failed to login: status %d',
                    res.statusCode)
      ));
    }
  });
};

Data.prototype.getCountryList = function (cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading CountryList...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'CountryList'),
        form: {
          'Token': token
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.COUNTRIES) {
              e = new Error(util.format(
                'Failed to get CountryList: %s',
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
            }
            var countries = {};
            if (result.RESPONSE.COUNTRIES[0].CountryBase) {
              result.RESPONSE.COUNTRIES[0].CountryBase.forEach(function (country) {
                countries[country.$.Code] = country.$.Name;
              });
            }
            debug(util.format('CountryList: %d',
                              _.keys(countries).length).yellow);
            return _.isFunction(cb) ? cb(null, countries) : dfd.resolve(countries);
          });
        } else {
          e = new Error(util.format(
            'Failed to get CountryList: status %d',
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getDataFormats = function (cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading DataFormats...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'DataFormats'),
        form: {
          'Token': token
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.DATAFORMATS) {
              e = new Error(util.format(
                'Failed to get DataFormats: %s',
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
            }
            var dataFormats = {};
            if (result.RESPONSE.DATAFORMATS[0].DATAFORMAT) {
              result.RESPONSE.DATAFORMATS[0].DATAFORMAT.forEach(function (dataFormat) {
                dataFormats[dataFormat.$.Code] = dataFormat.$;
              });
            }
            debug(util.format('DataFormats: %d', _.keys(dataFormats).length).yellow);
            return _.isFunction(cb) ? cb(null, dataFormats) : dfd.resolve(dataFormats);
          });
        } else {
          e = new Error(util.format(
            'Failed to get DataFormats: status %d',
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getExchangeGet = function (exchangeCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading ExchangeGet...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'ExchangeGet'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.EXCHANGE) {
              e = new Error(util.format(
                'Failed to get ExchangeGet (%s): %s',
                exchangeCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
            }
            var exchange = result.RESPONSE.EXCHANGE[0].$;
            debug(util.format('ExchangeGet (%s)', exchangeCode).yellow);
            return _.isFunction(cb) ? cb(null, exchange) : dfd.resolve(exchange);
          });
        } else {
          e = new Error(util.format(
            'Failed to get ExchangeGet (%s): status %d',
            exchangeCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getExchangeList = function (cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading ExchangeList...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'ExchangeList'),
        form: {
          'Token': token
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.EXCHANGES) {
              e = new Error(util.format(
                'Failed to get ExchangeList: %s',
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
            }
            var exchanges = {};
            if (result.RESPONSE.EXCHANGES[0].EXCHANGE) {
              result.RESPONSE.EXCHANGES[0].EXCHANGE.forEach(function (exchange) {
                exchanges[exchange.$.Code] = exchange.$;
              });
            }
            debug(util.format('ExchangeList: %d',
                              _.keys(exchanges).length).yellow);
            return _.isFunction(cb) ? cb(null, exchanges) : dfd.resolve(exchanges);
          });
        } else {
          e = new Error(util.format(
            'Failed to get ExchangeList: status %d',
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getFundamentalList = function (exchangeCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading FundamentalList...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'FundamentalList'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.FUNDAMENTALS) {
              e = new Error(util.format(
                'Failed to get FundamentalList (%s): %s',
                exchangeCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
            return _.isFunction(cb) ? cb(null, fundamentals) : dfd.resolve(fundamentals);
          });
        } else {
          e = new Error(util.format(
            'Failed to get FundamentalList (%s): status %d',
            exchangeCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getQuoteGet = function (exchangeCode, symbolCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading QuoteGet...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'QuoteGet'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTE) {
              e = new Error(util.format(
                'Failed to get QuoteGet (%s:%s): %s',
                exchangeCode,
                symbolCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
            }
            var quote = result.RESPONSE.QUOTE[0].$;
            debug(util.format('QuoteGet (%s:%s)',
                                    exchangeCode,
                                    symbolCode).yellow);
            return _.isFunction(cb) ? cb(null, quote) : dfd.resolve(quote);
          });
        } else {
          e = new Error(util.format(
            'Failed to get QuoteGet (%s:%s): status %d',
            exchangeCode,
            symbolCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getQuoteList = function (exchangeCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading QuoteList...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'QuoteList'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES) {
              e = new Error(util.format(
                'Failed to get QuoteList (%s): %s',
                exchangeCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get QuoteList (%s): status %d',
            exchangeCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getQuoteList2 = function (exchangeCode, symbolCodes, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    symbolCodes = (_.isArray(symbolCodes) ? symbolCodes : [symbolCodes]);

    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading QuoteList2...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'QuoteList2'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbols': symbolCodes.join(',')
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES) {
              e = new Error(util.format(
                'Failed to get QuoteList2 (%s:%s): %s',
                exchangeCode,
                symbolCodes.join(','),
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get QuoteList2 (%s:%s): status %d',
            exchangeCode,
            symbolCodes.join(','),
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getQuoteListByDate = function (exchangeCode, quoteDate, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading QuoteListByDate...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'QuoteListByDate'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'QuoteDate': moment(quoteDate).format('YYYYMMDD')
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES) {
              e = new Error(util.format(
                'Failed to get QuoteListByDate (%s, %s): %s',
                exchangeCode,
                moment(quoteDate).format('M/D/YYYY'),
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
                              _.keys(quotes).length).yellow);
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get QuoteListByDate (%s, %s): status %d',
            exchangeCode,
            moment(quoteDate).format('M/D/YYYY'),
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getQuoteListByDate2 = function (exchangeCode, quoteDate, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading QuoteListByDate2...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'QuoteListByDate2'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'QuoteDate': moment(quoteDate).format('YYYYMMDD')
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES2) {
              e = new Error(util.format(
                'Failed to get QuoteListByDate2 (%s, %s): %s',
                exchangeCode,
                moment(quoteDate).format('M/D/YYYY'),
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
                              _.keys(quotes).length).yellow);
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get QuoteListByDate2 (%s, %s): status %d',
            exchangeCode,
            moment(quoteDate).format('M/D/YYYY'),
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getQuoteListByDatePeriod = function (exchangeCode, quoteDate, period, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading QuoteListByDatePeriod...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'QuoteListByDatePeriod'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'QuoteDate': moment(quoteDate).format('YYYYMMDD'),
          'Period': period
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES) {
              e = new Error(util.format(
                'Failed to get QuoteListByDatePeriod (%s, %s, %s): %s',
                exchangeCode,
                moment(quoteDate).format('M/D/YYYY'),
                period,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
                              _.keys(quotes).length).yellow);
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get QuoteListByDatePeriod (%s, %s, %s): status %d',
            exchangeCode,
            moment(quoteDate).format('M/D/YYYY'),
            period,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getQuoteListByDatePeriod2 = function (exchangeCode, quoteDate, period, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading QuoteListByDatePeriod2...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'QuoteListByDatePeriod2'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'QuoteDate': moment(quoteDate).format('YYYYMMDD'),
          'Period': period
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES2) {
              e = new Error(util.format(
                'Failed to get QuoteListByDatePeriod2 (%s, %s, %s): %s',
                exchangeCode,
                moment(quoteDate).format('M/D/YYYY'),
                period,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
                              _.keys(quotes).length).yellow);
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get QuoteListByDatePeriod2 (%s, %s, %s): status %d',
            exchangeCode,
            moment(quoteDate).format('M/D/YYYY'),
            period,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getSplitListByExchange = function (exchangeCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading SplitListByExchange...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'SplitListByExchange'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.SPLITS) {
              e = new Error(util.format(
                'Failed to get SplitListByExchange (%s): %s',
                exchangeCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
            }
            var splits = [];
            if (result.RESPONSE.SPLITS[0].SPLIT) {
              result.RESPONSE.SPLITS[0].SPLIT.forEach(function (split) {
                splits.push(split.$);
              });
            }
            debug(util.format('SplitListByExchange (%s): %d',
                              exchangeCode,
                              _.keys(splits).length).yellow);
            return _.isFunction(cb) ? cb(null, splits) : dfd.resolve(splits);
          });
        } else {
          e = new Error(util.format(
            'Failed to get SplitListByExchange (%s): status %d',
            exchangeCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getSplitListBySymbol = function (exchangeCode, symbolCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading SplitListBySymbol...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'SplitListBySymbol'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.SPLITS) {
              e = new Error(util.format(
                'Failed to get SplitListBySymbol (%s:%s): %s',
                exchangeCode,
                symbolCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
                              _.keys(splits).length).yellow);
            return _.isFunction(cb) ? cb(null, splits) : dfd.resolve(splits);
          });
        } else {
          e = new Error(util.format(
            'Failed to get SplitListBySymbol (%s:%s): status %d',
            exchangeCode,
            symbolCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getSymbolChangesByExchange = function (exchangeCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading SymbolChangesByExchange...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'SymbolChangesByExchange'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.SYMBOLCHANGES) {
              e = new Error(util.format(
                'Failed to get SymbolChangesByExchange (%s): %s',
                exchangeCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
            return _.isFunction(cb) ? cb(null, symbolChanges) : dfd.resolve(symbolChanges);
          });
        } else {
          e = new Error(util.format(
            'Failed to get SymbolChangesByExchange (%s): status %d',
            exchangeCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getSymbolGet = function (exchangeCode, symbolCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading SymbolGet...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'SymbolGet'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.SYMBOL) {
              e = new Error(util.format(
                'Failed to get SymbolGet (%s:%s): %s',
                exchangeCode,
                symbolCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
            }
            var symbol = result.RESPONSE.SYMBOL[0].$;
            debug(util.format('SymbolGet (%s:%s)', exchangeCode, symbolCode).yellow);
            return _.isFunction(cb) ? cb(null, symbol) : dfd.resolve(symbol);
          });
        } else {
          e = new Error(util.format(
            'Failed to get SymbolGet (%s:%s): status %d',
            exchangeCode,
            symbolCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getSymbolHistory = function (exchangeCode, symbolCode, startDate, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading SymbolHistory...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'SymbolHistory'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode,
          'StartDate': moment(startDate).format('YYYYMMDD')
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES) {
              e = new Error(util.format(
                'Failed to get SymbolHistory (%s:%s, %s-): %s',
                exchangeCode,
                symbolCode,
                moment(startDate).format('M/D/YYYY'),
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
                              quotes.length).yellow);
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get SymbolHistory (%s:%s, %s-): status %d',
            exchangeCode,
            symbolCode,
            moment(startDate).format('M/D/YYYY'),
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getSymbolHistoryPeriod = function (exchangeCode, symbolCode, date, period, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading SymbolHistoryPeriod...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'SymbolHistoryPeriod'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode,
          'Date': moment(date).format('YYYYMMDD'),
          'Period': period
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES) {
              e = new Error(util.format(
                'Failed to get SymbolHistoryPeriod (%s:%s, %s, %s): %s',
                exchangeCode,
                symbolCode,
                moment(date).format('M/D/YYYY'),
                period,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
                              quotes.length).yellow);
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get SymbolHistoryPeriod (%s:%s, %s, %s): status %d',
            exchangeCode,
            symbolCode,
            moment(date).format('M/D/YYYY'),
            period,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getSymbolHistoryPeriodByDateRange = function (exchangeCode, symbolCode, startDate, endDate, period, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading SymbolHistoryPeriodByDateRange...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'SymbolHistoryPeriodByDateRange'),
        form: {
          'Token': token,
          'Exchange': exchangeCode,
          'Symbol': symbolCode,
          'StartDate': moment(startDate).format('YYYYMMDD'),
          'EndDate': moment(endDate).format('YYYYMMDD'),
          'Period': period
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES) {
              e = new Error(util.format(
                'Failed to get SymbolHistoryPeriodByDateRange (%s:%s, %s-%s, %s): %s',
                exchangeCode,
                symbolCode,
                moment(startDate).format('M/D/YYYY'),
                moment(endDate).format('M/D/YYYY'),
                period,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
                              quotes.length).yellow);
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get SymbolHistoryPeriodByDateRange (%s:%s, %s-%s, %s): status %d',
            exchangeCode,
            symbolCode,
            moment(startDate).format('M/D/YYYY'),
            moment(endDate).format('M/D/YYYY'),
            period,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getSymbolList2 = function (exchangeCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading SymbolList2...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'SymbolList2'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.SYMBOLS2) {
              e = new Error(util.format(
                'Failed to get SymbolList2 (%s): %s',
                exchangeCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
            return _.isFunction(cb) ? cb(null, symbols) : dfd.resolve(symbols);
          });
        } else {
          e = new Error(util.format(
            'Failed to get SymbolList2 (%s): status %d',
            exchangeCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getTechnicalList = function (exchangeCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading TechnicalList...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'TechnicalList'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.TECHNICALS) {
              e = new Error(util.format(
                'Failed to get TechnicalList (%s): %s',
                exchangeCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
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
            return _.isFunction(cb) ? cb(null, technicals) : dfd.resolve(technicals);
          });
        } else {
          e = new Error(util.format(
            'Failed to get TechnicalList (%s): status %d',
            exchangeCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getTop10Gains = function (exchangeCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading Top10Gains...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'Top10Gains'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES) {
              e = new Error(util.format(
                'Failed to get Top10Gains (%s): %s',
                exchangeCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
            }
            var quotes = [];
            if (result.RESPONSE.QUOTES[0].QUOTE) {
              result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
                quotes.push(quote.$);
              });
            }
            debug(util.format('Top10Gains (%s): %d',
                              exchangeCode,
                              quotes.length).yellow);
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get Top10Gains (%s): status %d',
            exchangeCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

Data.prototype.getTop10Losses = function (exchangeCode, cb) {
  var _this = this;
  var dfd = Q.defer();
  var e;

  this._taskQueue.push({run: function (next) {
    _this._getToken(function (err, token) {
      if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }

      debug('Downloading Top10Losses...'.cyan);
      request.post({
        url: url.resolve(_this._config.endpoint, 'Top10Losses'),
        form: {
          'Token': token,
          'Exchange': exchangeCode
        },
        timeout: _this._config.timeout
      }, function (err, res, body) {
        next();
        if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
        if (res.statusCode === 200) {
          xml2js.parseString(body, function (err, result) {
            if (err) { return _.isFunction(cb) ? cb(err) : dfd.reject(err); }
            if (!result.RESPONSE.QUOTES) {
              e = new Error(util.format(
                'Failed to get Top10Losses (%s): %s',
                exchangeCode,
                result.RESPONSE.$.Message
              ));
              return _.isFunction(cb) ? cb(e) : dfd.reject(e);
            }
            var quotes = [];
            if (result.RESPONSE.QUOTES[0].QUOTE) {
              result.RESPONSE.QUOTES[0].QUOTE.forEach(function (quote) {
                quotes.push(quote.$);
              });
            }
            debug(util.format('Top10Losses (%s): %d',
                              exchangeCode,
                              quotes.length).yellow);
            return _.isFunction(cb) ? cb(null, quotes) : dfd.resolve(quotes);
          });
        } else {
          e = new Error(util.format(
            'Failed to get Top10Losses (%s): status %d',
            exchangeCode,
            res.statusCode
          ));
          return _.isFunction(cb) ? cb(e) : dfd.reject(e);
        }
      });
    });
  }});

  return dfd.promise;
};

// Public API
exports = module.exports = Data;
