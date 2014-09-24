[![NPM](https://nodei.co/npm/eoddata.png?downloads=false&stars=false)](https://npmjs.org/package/eoddata) [![NPM](https://nodei.co/npm-dl/eoddata.png?months=6)](https://npmjs.org/package/eoddata)


# EODData

`eoddata` is a client library for [EODData Web Service](http://eoddata.com/) written in [Node.js](http://nodejs.org/). This library returns the result in both callback & promise styles.


## Installation

    $ npm install eoddata


## Usage

```js
var eoddata = new (require('eoddata').Data)({
  username: EODDATA_USERNAME,
  password: EODDATA_PASSWORD
});
```

* [See more comprehensive examples here.](https://github.com/pilwon/node-eoddata/tree/master/examples)


### API ([documentation](http://ws.eoddata.com/Data.asmx))

The client automatically handles token authentication therefore the following API calls can be made right away.

All API functions accept callback as the last parameter. Whether you pass a callback function or not, they will always return a promise object built using [Bluebird](https://github.com/petkaantonov/bluebird). You can do whatever you want with the returned promise, or stick with the traditional callback style.

- **Date Format:** JavaScript Date Object or String format supported by [Moment.js](http://momentjs.com/docs/)
- **Periods:** 1, 5, 10, 15, 30, h, d, w, m, q, y


#### Country List

Returns a list of available countries.

```js
eoddata.getCountryList(function (err, countries) {
  // Sample `countries`
  // {
  //   "AF": "Afghanistan",
  //   "AL": "Albania",
  //   "DZ": "Algeria",
  //   "AS": "American Samoa",
  //   "AD": "Andorra",
  //   "AO": "Angola",
  //   ...
  // }
});
```


#### Data Formats

Returns the list of data formats.

```js
eoddata.getDataFormats(function (err, dataFormats) {
  // Sample `dataFormats`
  // {
  //   "3FV": {
  //     "Code": "3FV",
  //     "Name": "3F VIP Trading",
  //     "Header": "<TICKER>,<PER>,<DTYYYYMMDD>,<OPEN>,<HIGH>,<LOW>,<CLOSE>,<VOL>",
  //     "DateFormat": "yyyyMMdd",
  //     "Extension": "txt",
  //     "IncludeSuffix": "false",
  //     "TabColumnSeperator": "false",
  //     "ColumnSeperator": ",",
  //     "TextQualifier": "",
  //     "FilenamePrefix": "3FV",
  //     "FilenameExchangeCode": "true",
  //     "FilenameDate": "true",
  //     "IncludeHeaderRow": "true",
  //     "HourFormat": "HHmm",
  //     "DateTimeSeperator": "",
  //     "ExchangeFilenameFormatDate": "<Field:ExchangeCode><Text:_><Field:Date:yyyyMMdd>",
  //     "ExchangeFilenameFormatDateRange": "",
  //     "SymbolFilenameFormatDate": "<Field:SymbolCode><Text:_><Field:Date:yyyyMMdd>",
  //     "SymbolFilenameFormatDateRange": "<Field:SymbolCode><Text:_><Field:DateFrom:yyyyMMdd><Text:_><Field:DateTo:yyyyMMdd>"
  //   },
  //   ...
  // }
});
```


#### Exchange Get

Returns detailed information of a specific exchange.

```js
eoddata.getExchangeGet(exchangeCode, function (err, exchange) {
  // Sample`exchange`
  // {
  //   "Code": "NASDAQ",
  //   "Name": "NASDAQ Stock Exchange",
  //   "LastTradeDateTime": "2013-06-28T16:59:55",
  //   "Country": "US",
  //   "Currency": "USD",
  //   "Advances": "4553",
  //   "Declines": "1837",
  //   "Suffix": "",
  //   "TimeZone": "Eastern Standard Time",
  //   "IsIntraday": "true",
  //   "IntradayStartDate": "2008-01-01T00:00:00",
  //   "HasIntradayProduct": "true"
  // }
});
```


#### Exchange List

Returns a list of available exchanges.

```js
eoddata.getExchangeList(function (err, exchanges) {
  // Sample `exchanges`
  // {
  //   "AMEX": {
  //     "Code": "AMEX",
  //     "Name": "American Stock Exchange",
  //     "LastTradeDateTime": "2013-06-28T16:59:59",
  //     "Country": "US",
  //     "Currency": "USD",
  //     "Advances": "2532",
  //     "Declines": "897",
  //     "Suffix": "",
  //     "TimeZone": "Eastern Standard Time",
  //     "IsIntraday": "true",
  //     "IntradayStartDate": "2008-01-01T00:00:00",
  //     "HasIntradayProduct": "true"
  //   },
  //   ...
  // }
});
```


#### Fundamental List

Returns a complete list of fundamental data for an entire exchange.

```js
eoddata.getFundamentalList(exchangeCode, function (err, fundamentals) {
  // Sample `fundamentals`
  // {
  //   "XONE": {
  //     "Symbol": "XONE",
  //     "Name": "The Exone Company",
  //     "Description": "The Exone Company",
  //     "DateTime": "2013-06-28T00:00:00",
  //     "Industry": "",
  //     "Sector": "",
  //     "Shares": "12798740",
  //     "MarketCap": "325600000",
  //     "PE": "0",
  //     "EPS": "-1.487",
  //     "NTA": "0",
  //     "DivYield": "0",
  //     "Dividend": "0",
  //     "DividendDate": "0001-01-01T00:00:00",
  //     "DPS": "0",
  //     "ImputationCredits": "0",
  //     "EBITDA": "-9900000",
  //     "PEG": "0",
  //     "PtS": "18.67",
  //     "PtB": "0",
  //     "Yield": "0"
  //   },
  //   ...
  // }
});
```


#### Quote Get

Returns an end of day quote for a specific symbol.

```js
eoddata.getQuoteGet(exchangeCode, symbolCode, function (err, quote) {
  // Sample `quote
  // {
  //   "Symbol": "AAPL",
  //   "Description": "Apple Inc.",
  //   "Name": "Apple Inc.",
  //   "DateTime": "2013-06-28T00:00:00",
  //   "Open": "391.36",
  //   "High": "400.27",
  //   "Low": "388.87",
  //   "Close": "396.53",
  //   "Volume": "19915800",
  //   "OpenInterest": "0",
  //   "Previous": "393.78",
  //   "Change": "2.75",
  //   "Bid": "459.65",
  //   "Ask": "460",
  //   "PreviousClose": "0",
  //   "NextOpen": "0",
  //   "Modified": "2013-06-28T18:18:36.67"
  // }
});
```


#### Quote List

Returns a complete list of end of day quotes for an entire exchange.

```js
eoddata.getQuoteList(exchangeCode, function (err, quotes) {
  // Sample `quotes`
  // {
  //   "AAPL": {
  //     "Symbol": "AAPL",
  //     "Description": "Apple Inc.",
  //     "Name": "Apple Inc.",
  //     "DateTime": "2013-06-28T00:00:00",
  //     "Open": "391.36",
  //     "High": "400.27",
  //     "Low": "388.87",
  //     "Close": "396.53",
  //     "Volume": "19915800",
  //     "OpenInterest": "0",
  //     "Previous": "393.78",
  //     "Change": "2.75",
  //     "Bid": "459.65",
  //     "Ask": "460",
  //     "PreviousClose": "0",
  //     "NextOpen": "0",
  //     "Modified": "2013-06-28T18:18:36.67"
  //   },
  //   ...
  // }
});
```


#### Quote List 2

Returns end of day quotes for a list of symbols of a specific exchange.

```js
eoddata.getQuoteList2(exchangeCode, symbolCodes, function (err, quotes) {
  // Sample `quotes`: same as getQuoteList()
});
```


#### Quote List by Date

Returns a complete list of end of day quotes for an entire exchange and a specific date.

```js
eoddata.getQuoteListByDate(exchangeCode, quoteDate, function (err, quotes) {
  // Sample `quotes`: same as getQuoteList()
});
```


#### Quote List by Date 2

Returns a complete list of end of day quotes for an entire exchange and a specific date.

```js
eoddata.getQuoteListByDate2(exchangeCode, quoteDate, function (err, quotes) {
  // Sample `quotes`
  // {
  //   "WEYS": {
  //     "s": "WEYS",
  //     "d": "2013-06-28T00:00:00",
  //     "o": "24.33",
  //     "h": "25.31",
  //     "l": "24.33",
  //     "c": "25.2",
  //     "v": "62100",
  //     "i": "0",
  //     "b": "0",
  //     "a": "0"
  //   },
  //   ...
  // }
});
```


#### Quote List by Date Period

Returns a complete list of end of day quotes for an entire exchange, specific date, and specific period.

```js
eoddata.getQuoteListByDatePeriod(exchangeCode, quoteDate, period, function (err, quotes) {
  // Sample `quotes`
  // {
  //   "BANCP": [
  //     {
  //       "Symbol": "BANCP",
  //       "Description": "First Pactrust Bancorp Inc.",
  //       "Name": "First Pactrust Bancorp Inc.",
  //       "DateTime": "2013-06-28T00:00:00",
  //       "Open": "25.5",
  //       "High": "25.5",
  //       "Low": "25.4",
  //       "Close": "25.4",
  //       "Volume": "2400",
  //       "OpenInterest": "0",
  //       "Previous": "0",
  //       "Change": "0",
  //       "Bid": "0",
  //       "Ask": "0",
  //       "PreviousClose": "0",
  //       "NextOpen": "0",
  //       "Modified": "2013-06-28T16:12:07.613"
  //     },
  //     ...
  //   ],
  //   ...
  // }
});
```


#### Quote List by Date Period 2

Returns a complete list of end of day quotes for an entire exchange, specific date, and specific period.

```js
eoddata.getQuoteListByDatePeriod2(exchangeCode, quoteDate, period, function (err, quotes) {
  // Sample `quotes`
  // {
  //   "BANCP": [
  //     {
  //       "s": "BANCP",
  //       "d": "2013-06-28T00:00:00",
  //       "o": "25.5",
  //       "h": "25.5",
  //       "l": "25.4",
  //       "c": "25.4",
  //       "v": "2400",
  //       "i": "0",
  //       "b": "0",
  //       "a": "0"
  //     },
  //     ...
  //   ],
  //   ...
  // }
});
```


#### Split List by Exchange

Returns a list of Splits of a specific exchange.

```js
eoddata.getSplitListByExchange(exchangeCode, function (err, splits) {
  // Sample `splits`
  // [
  //   {
  //     Exchange: 'NASDAQ',
  //     Symbol: 'CERN',
  //     DateTime: '2013-07-01T00:00:00',
  //     Ratio: '2-1'
  //   },
  //   ...
  // }
});
```


#### Split List by Symbol

Returns a list of Splits of a specific symbol.

```js
eoddata.getSplitListBySymbol(exchangeCode, symbolCode, function (err, splits) {
  // Sample `splits`: same as getSplitListByExchange()
});
```


#### Symbol Changes by Exchange

Returns a list of symbol changes of a given exchange.

```js
eoddata.getSymbolChangesByExchange(exchangeCode, function (err, symbolChanges) {
  // Sample `symbolChanges`
  // [
  //   {
  //     DateTime: '2013-04-09T00:00:00',
  //     OldSymbol: 'ROHI',
  //     NewSymbol: 'ROHIQ',
  //     ExchangeCode: 'NASDAQ',
  //     NewExchangeCode: 'OTCBB'
  //   },
  //   ...
  // ]
});
```


#### Symbol Get

Returns detailed information of a specific symbol.

```js
eoddata.getSymbolGet(exchangeCode, symbolCode, function (err, symbol) {
  // Sample `symbol`
  // {
  //   "Code": "AAPL",
  //   "Name": "Apple Inc.",
  //   "LongName": "Apple Inc.",
  //   "DateTime": "2013-06-28T00:00:00"
  // }
});
```


#### Symbol History

Returns a list of historical end of day data of a specified symbol and specified start date up to today's date.

```js
eoddata.getSymbolHistory(exchangeCode, symbolCode, startDate, function (err, quotes) {
  // Sample `quotes`
  // [
  //   {
  //     "Symbol": "AAPL",
  //     "Description": "Apple Inc.",
  //     "Name": "Apple Inc.",
  //     "DateTime": "2013-06-28T00:00:00",
  //     "Open": "391.36",
  //     "High": "400.27",
  //     "Low": "388.87",
  //     "Close": "396.53",
  //     "Volume": "20665600",
  //     "OpenInterest": "0",
  //     "Previous": "0",
  //     "Change": "0",
  //     "Bid": "0",
  //     "Ask": "0",
  //     "PreviousClose": "0",
  //     "NextOpen": "0",
  //     "Modified": "2013-06-28T15:58:30.01"
  //   },
  //   ...
  // ]
});
```


#### Symbol History Period

Returns a list of historical data of a specified symbol, specified date and specified period.

```js
eoddata.getSymbolHistoryPeriod(exchangeCode, symbolCode, date, period, function (err, quotes) {
  // Sample `quotes`: same as getSymbolHistory()
});
```


#### Symbol History Period by Date Range

Returns a list of historical data of a specified symbol, specified date range and specified period.

```js
eoddata.getSymbolHistoryPeriodByDateRange(exchangeCode, symbolCode, startDate, endDate, period, function (err, quotes) {
  // Sample `quotes`: same as getSymbolHistory()
});
```


#### Symbol List 2

Returns a list of symbols of a specified exchange.

```js
eoddata.getSymbolList2(exchangeCode, function (err, symbols) {
  // Sample `symbols`
  // {
  //   "NHTB": "New Hampshire Thrift Bancshares",
  //   "NICE": "Nice-Systems Limited",
  //   "NICK": "Nicholas Financial",
  //   "NIHD": "Nii Holdings",
  //   "NILE": "Blue Nile",
  //   "NINE": "Ninetowns Internet Technology Group",
  //   "NKSH": "National Bankshares",
  //   "NKTR": "Nektar Therapeutics",
  //   "NLNK": "Newlink Genetics Corporation",
  //   "NLST": "Netlist",
  //   ...
  // }
});
```


#### Technical List

Returns a complete list of technical data for an entire exchange.

```js
eoddata.getTechnicalList(exchangeCode, function (err, technicals) {
  // Sample`technicals`
  // {
  //   "ZNGA": {
  //     "Symbol": "ZNGA",
  //     "Name": "Zynga Inc.",
  //     "Description": "Zynga Inc.",
  //     "DateTime": "2013-06-28T00:00:00",
  //     "Previous": "2.86",
  //     "Change": "-0.08",
  //     "MA1": "21",
  //     "MA2": "22",
  //     "MA5": "3",
  //     "MA20": "3",
  //     "MA50": "3",
  //     "MA100": "3",
  //     "MA200": "3",
  //     "MAPercent": "0",
  //     "MAReturn": "0",
  //     "VolumeChange": "35644100",
  //     "ThreeMonthChange": "0",
  //     "SixMonthChange": "0",
  //     "WeekHigh": "2.86",
  //     "WeekLow": "2.5",
  //     "WeekChange": "0.07",
  //     "AvgWeekChange": "0",
  //     "AvgWeekVolume": "19806060",
  //     "WeekVolume": "99030300",
  //     "MonthHigh": "3.53",
  //     "MonthLow": "2.5",
  //     "MonthChange": "-0.65",
  //     "AvgMonthChange": "-0.0285",
  //     "AvgMonthVolume": "18652650",
  //     "MonthVolume": "391705700",
  //     "YearHigh": "5.61",
  //     "YearLow": "2.09",
  //     "YearChange": "-0.31",
  //     "AvgYearChange": "-0.01",
  //     "AvgYearVolume": "23564170",
  //     "YTDChange": "-2.58",
  //     "RSI14": "48.2976",
  //     "STO9": "61.9512",
  //     "WPR14": "64.5161",
  //     "MTM14": "-0.08",
  //     "ROC14": "0.972",
  //     "PTC": "0",
  //     "SAR": "0",
  //     "Volatility": "27",
  //     "Liquidity": "0"
  //   },
  //   ...
  // }
});
```


#### Top 10 Gains

Returns a list of the Top 10 Gains of a specified exchange.

```js
eoddata.getTop10Gains(exchangeCode, function (err, quotes) {
  // Sample `quotes`
  // [
  //   {
  //     Symbol: 'AERLR',
  //     Description: 'Asia Entertainment & Resources',
  //     Name: 'Asia Entertainment & Resources',
  //     DateTime: '2013-06-21T00:00:00',
  //     Open: '0.25',
  //     High: '0.51',
  //     Low: '0.24',
  //     Close: '0.48',
  //     Volume: '226100',
  //     OpenInterest: '0',
  //     Previous: '0.28',
  //     Change: '0.2',
  //     Bid: '0',
  //     Ask: '0',
  //     PreviousClose: '0',
  //     NextOpen: '0',
  //     Modified: '2013-06-30T01:43:43.113'
  //   },
  //   ...
  // ]
});
```


#### Top 10 Losses

Returns a list of the Top 10 Losses of a specified exchange.

```js
eoddata.getTop10Losses(exchangeCode, function (err, quotes) {
  // Sample `quotes`: same as getTop10Gains()
});
```


## Credits

  See the [contributors](https://github.com/pilwon/node-eoddata/graphs/contributors).


## License

<pre>
The MIT License (MIT)

Copyright (c) 2012-2014 Pilwon Huh

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
</pre>

[![Analytics](https://ga-beacon.appspot.com/UA-47034562-5/node-eoddata/readme?pixel)](https://github.com/pilwon/node-eoddata)
