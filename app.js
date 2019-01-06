var express = require('express');
var request = require('request');
var mustacheExpress = require('mustache-express');
var app = express();
var port = 80;

app.engine('html', mustacheExpress());

app.use('/webdollar', express.static('webdollar'));
app.use('/assets', express.static('assets'));

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Run your Miners, easy as &pi;',
    message: 'Hello there!'
  });
});

app.get('/getting-started', function(req, res) {
  res.render('getting-started', {
    title: 'Getting Started',
    message: 'Hello there!'
  });
});

app.get('/changelog', function(req, res) {
  res.render('changelog', {
    title: 'Changelog',
    message: 'Hello there!'
  });
});

app.get('/purchase-webdollar', function(req, res) {
  res.render('purchase-webdollar', {
    title: 'Purchase WebDollar',
    message: 'Hello there!'
  });
});

app.get('/coins', function(req, res) {
  request('https://api.hostero.eu/v1/coins', function (error, response, body) {
    console.log('error:', error);
    console.log('status code:', response && response.statusCode);

    res.render('coins', {
      title: 'CPU Minable Coins',
      message: 'Hello there!',
      coins: JSON.parse(body)
    });
  });
});

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`);
});
