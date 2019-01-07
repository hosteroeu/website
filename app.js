var express = require('express');
var request = require('request');
var compression = require('compression');
var cacheControl = require('express-cache-controller');
var mustacheExpress = require('mustache-express');
var app = express();
var port = 80;

app.engine('html', mustacheExpress());

app.use(compression());
app.use(cacheControl());
//app.use('/webdollar', express.static('webdollar'));
app.use('/assets', express.static('assets'));

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.all(/.*/, function(req, res, next) {
  var host = req.header('host');

  if (host.match(/^www\..*/i) || host.match(/^localhost*/i)) {
    next();
  } else {
    res.redirect(301, 'https://www.' + host);
  }
});

app.get('/robots.txt', function(req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow:");
});

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Run your Miners, easy as &pi;',
    description: 'Mining software for CPU minable coins',
    link: 'https://www.hostero.eu/',
    keywords: ''
  });
});

app.get('/getting-started', function(req, res) {
  res.render('getting-started', {
    title: 'Getting Started',
    description: 'Learn how to deploy the Universal CPU Miner on your mining nodes',
    link: 'https://www.hostero.eu/getting-started',
    keywords: ''
  });
});

app.get('/changelog', function(req, res) {
  res.render('changelog', {
    title: 'Changelog',
    description: 'Find out what new features we have implemented',
    link: 'https://www.hostero.eu/changelog',
    keywords: ''
  });
});

app.get('/purchase-webdollar', function(req, res) {
  res.render('purchase-webdollar', {
    title: 'Purchase WebDollar',
    description: 'Tutorial on how to purchase WebDollar coins from multiple sources',
    link: 'https://www.hostero.eu/purchase-webdollar',
    keywords: ''
  });
});

app.get('/webdollar', function(req, res) {
  res.render('webdollar', {
    title: 'Tools and Services developed for WebDollar',
    description: 'List of tools and services developed for the WebDollar community',
    link: 'https://www.hostero.eu/webdollar',
    keywords: ''
  });
});

app.get('/cpu-minable-coins', function(req, res) {
  // TODO: Implement cache
  request('https://api.hostero.eu/v1/coins', function(error, response, body) {
    console.log('error:', error);
    console.log('status code:', response && response.statusCode);

    res.render('coins', {
      title: 'CPU Minable Coins',
      description: 'Directory with CPU minable coins that are integrated with our mining software',
      link: 'https://www.hostero.eu/cpu-minable-coins',
      keywords: '',
      coins: JSON.parse(body)
    });
  });
});

app.listen(port, function() {
  console.log(`Example app listening on port ${port}!`);
});
