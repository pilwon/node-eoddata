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

- **Date Format:** JavaScript Date Object
- **Periods:** 1, 5, 10, 15, 30, h, d, w, m, q, y

#### Country List

```js
eoddata.getCountryList(function (err, countries) {
  // ...
});
```

#### Data Formats

```js
eoddata.getDataFormats(function (err, dataFormats) {
  // ...
});
```

#### Exchange Get

```js
eoddata.getExchangeGet(exchangeCode, function (err, exchange) {
  // ...
});
```

#### Exchange List

```js
eoddata.getExchangeList(function (err, exchanges) {
  // ...
});
```

#### Fundamental List

```js
eoddata.getFundamentalList(exchangeCode, function (err, fundamentals) {
  // ...
});
```

#### Quote Get

```js
eoddata.getQuoteGet(exchangeCode, symbolCode, function (err, quote) {
  // ...
});
```

#### Quote List

```js
eoddata.getQuoteList(exchangeCode, function (err, quotes) {
  // ...
});
```

#### Quote List 2

```js
eoddata.getQuoteList2(exchangeCode, symbolCodes, function (err, quotes) {
  // ...
});
```

#### Symbol Changes by Exchange

```js
eoddata.getSymbolChangesByExchange(exchangeCode, function (err, symbolChanges) {
  // ...
});
```

#### Symbol Get

```js
eoddata.getSymbolGet(exchangeCode, symbolCode, function (err, symbol) {
  // ...
});
```

#### Symbol History

```js
eoddata.getSymbolHistory(exchangeCode, symbolCode, startDate, function (err, quotes) {
  // ...
});
```

#### Symbol History Period

```js
eoddata.getSymbolHistoryPeriod(exchangeCode, symbolCode, date, period, function (err, quotes) {
  // ...
});
```

#### Symbol History Period by Date Range

```js
eoddata.getSymbolHistoryPeriodByDateRange(exchangeCode, symbolCode, startDate, endDate, period, function (err, quotes) {
  // ...
});
```

#### Symbol List 2

```js
eoddata.getSymbolList2(exchangeCode, function (err, symbols) {
  // ...
});
```

#### Technical List

```js
eoddata.getTechnicalList(exchangeCode, function (err, technicals) {
  // ...
});
```

## Credits

  See the [contributors](https://github.com/pilwon/node-eoddata/graphs/contributors).

## License

  `eoddata` is released under the [MIT License](http://opensource.org/licenses/MIT).
