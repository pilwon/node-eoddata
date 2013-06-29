# EODData

`eoddata` is a client library for [EODData Web Service](http://eoddata.com/) written in [Node.js](http://nodejs.org/).

## Installation

    $ npm install eoddata

## Usage

```js
var eoddata = new (require('eoddata').Data)({
  username: EODDATA_USERNAME,
  password: EODDATA_PASSWORD
});
```

### API ([documentation](http://ws.eoddata.com/Data.asmx))

The client automatically handles token authentication therefore the following API calls can be made right away. All tasks are internally queued.

- **Date Format:** JavaScript Date Object or String format supported by [Moment.js](http://momentjs.com/docs/)
- **Periods:** 1, 5, 10, 15, 30, h, d, w, m, q, y

#### Country List

Returns a list of available countries.

```js
eoddata.getCountryList(function (err, countries) {
  // ...
});
```

#### Data Formats

Returns the list of data formats.

```js
eoddata.getDataFormats(function (err, dataFormats) {
  // ...
});
```

#### Exchange Get

Returns detailed information of a specific exchange.

```js
eoddata.getExchangeGet(exchangeCode, function (err, exchange) {
  // ...
});
```

#### Exchange List

Returns a list of available exchanges.

```js
eoddata.getExchangeList(function (err, exchanges) {
  // ...
});
```

#### Fundamental List

Returns a complete list of fundamental data for an entire exchange.

```js
eoddata.getFundamentalList(exchangeCode, function (err, fundamentals) {
  // ...
});
```

#### Quote Get

Returns an end of day quote for a specific symbol.

```js
eoddata.getQuoteGet(exchangeCode, symbolCode, function (err, quote) {
  // ...
});
```

#### Quote List

Returns a complete list of end of day quotes for an entire exchange.

```js
eoddata.getQuoteList(exchangeCode, function (err, quotes) {
  // ...
});
```

#### Quote List 2

Returns end of day quotes for a list of symbols of a specific exchange.

```js
eoddata.getQuoteList2(exchangeCode, symbolCodes, function (err, quotes) {
  // ...
});
```

#### Quote List by Date

Returns a complete list of end of day quotes for an entire exchange and a specific date.

```js
eoddata.QuoteListByDate(exchangeCode, quoteDate, function (err, quotes) {
  // ...
});
```

#### Quote List by Date 2

Returns a complete list of end of day quotes for an entire exchange and a specific date.

```js
eoddata.QuoteListByDate2(exchangeCode, quoteDate, function (err, quotes) {
  // ...
});
```

#### Quote List by Date Period

Returns a complete list of end of day quotes for an entire exchange, specific date, and specific period.

```js
eoddata.QuoteListByDatePeriod(exchangeCode, quoteDate, period, function (err, quotes) {
  // ...
});
```

#### Quote List by Date Period 2

Returns a complete list of end of day quotes for an entire exchange, specific date, and specific period.

```js
eoddata.QuoteListByDatePeriod2(exchangeCode, quoteDate, period, function (err, quotes) {
  // ...
});
```

#### Split List by Exchange

Returns a list of Splits of a specific exchange.

```js
eoddata.getSplitListByExchange(exchangeCode, function (err, splits) {
  // ...
});
```

#### Split List by Symbol

Returns a list of Splits of a specific symbol.

```js
eoddata.getSplitListBySymbol(exchangeCode, symbolCode, function (err, splits) {
  // ...
});
```

#### Symbol Changes by Exchange

Returns a list of symbol changes of a given exchange.

```js
eoddata.getSymbolChangesByExchange(exchangeCode, function (err, symbolChanges) {
  // ...
});
```

#### Symbol Get

Returns detailed information of a specific symbol.

```js
eoddata.getSymbolGet(exchangeCode, symbolCode, function (err, symbol) {
  // ...
});
```

#### Symbol History

Returns a list of historical end of day data of a specified symbol and specified start date up to today's date.

```js
eoddata.getSymbolHistory(exchangeCode, symbolCode, startDate, function (err, quotes) {
  // ...
});
```

#### Symbol History Period

Returns a list of historical data of a specified symbol, specified date and specified period.

```js
eoddata.getSymbolHistoryPeriod(exchangeCode, symbolCode, date, period, function (err, quotes) {
  // ...
});
```

#### Symbol History Period by Date Range

Returns a list of historical data of a specified symbol, specified date range and specified period.

```js
eoddata.getSymbolHistoryPeriodByDateRange(exchangeCode, symbolCode, startDate, endDate, period, function (err, quotes) {
  // ...
});
```

#### Symbol List 2

Returns a list of symbols of a specified exchange.

```js
eoddata.getSymbolList2(exchangeCode, function (err, symbols) {
  // ...
});
```

#### Technical List

Returns a complete list of technical data for an entire exchange.

```js
eoddata.getTechnicalList(exchangeCode, function (err, technicals) {
  // ...
});
```

#### Top 10 Gains

Returns a list of the Top 10 Gains of a specified exchange.

```js
eoddata.getTop10Gains(exchangeCode, function (err, quotes) {
  // ...
});
```

#### Top 10 Losses

Returns a list of the Top 10 Losses of a specified exchange.

```js
eoddata.getTop10Losses(exchangeCode, function (err, quotes) {
  // ...
});
```

## Credits

  See the [contributors](https://github.com/pilwon/node-eoddata/graphs/contributors).

## License

  `eoddata` is released under the [MIT License](http://opensource.org/licenses/MIT).
