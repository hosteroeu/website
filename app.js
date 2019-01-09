var express = require('express');
var request = require('request');
var compression = require('compression');
var mustacheExpress = require('mustache-express');
var app = express();
var port = process.env.PORT || 3000;

app.engine('html', mustacheExpress());

app.use(compression());

app.get('/*', function(req, res, next) {
  if (req.url.indexOf('/assets/') === 0) {
    res.setHeader('Cache-Control', 'public, max-age=2592000');
    res.setHeader('Expires', new Date(Date.now() + 2592000000).toUTCString());
  }

  next();
});

app.use('/assets', express.static('assets'));

app.set('view engine', 'html');
app.set('views', __dirname + '/views');

app.all(/.*/, function(req, res, next) {
  var host = req.header('host');

  console.log(req.method, req.url);

  if (host.match(/^www\..*/i) || host.match(/^localhost*/i)) {
    next();
  } else {
    var url = req.url || '';

    res.redirect(301, 'https://www.' + host + url);
  }
});

app.get('/robots.txt', function(req, res) {
  res.type('text/plain');
  res.send("User-agent: *\nDisallow:\nSitemap: https://www.hostero.eu/assets/sitemap.xml");
});

app.get('/', function(req, res) {
  res.render('index', {
    title: 'Mining software for CPU cryptocurrencies',
    description: 'Mining software for CPU mineable cryptocurrencies. Start mining cryptocurrency in a few minutes. Mine the most profitable coins and unlock the full potential of your mining rigs.',
    link: 'https://www.hostero.eu/',
    keywords: 'mining, software, crypto, cpu, statistics, miner, universal cpu miner, cpu miner, webdollar, nerva, webchain'
  });
});

app.get('/getting-started', function(req, res) {
  res.render('getting-started', {
    title: 'Getting Started with the CPU Miner',
    description: 'Learn how to deploy the Universal CPU Miner on your mining rigs. Follow our tutorial to install the CPU miner on your hardware. Mine WebDollar, Nerva, WebChain, and many others.',
    link: 'https://www.hostero.eu/getting-started',
    keywords: 'get started, tutorial, mining, software, hardware, crypto, cpu, miner, universal cpu miner, cpu miner'
  });
});

app.get('/changelog', function(req, res) {
  res.render('changelog', {
    title: 'Changelog for our Mining Software',
    description: 'Find out what new features we have released. We are constantly working on improving the mining software, and make your miners profitable.',
    link: 'https://www.hostero.eu/changelog',
    keywords: 'changelog, chance log, improvements, features, mining, software, crypto, cpu, statistics, miner, universal cpu miner, cpu miner'
  });
});

app.get('/purchase-webdollar', function(req, res) {
  res.render('purchase-webdollar', {
    title: 'Purchase WebDollar, only use Escrow',
    description: 'Tutorial on how to purchase WebDollar coins from multiple sources. Use WebDollar to pay for the platform services. Purchase only with escrow.',
    link: 'https://www.hostero.eu/purchase-webdollar',
    keywords: 'purchase, webdollar, tutorial, crypto, cryptocurrencies, coins, escrow, cpu, cpu miner'
  });
});

app.get('/webdollar', function(req, res) {
  res.render('webdollar', {
    title: 'Tools and Services developed for WebDollar',
    description: 'List of tools and services developed for the WebDollar community. Crypto third-party tools that allow anybody to join the crypto space.',
    link: 'https://www.hostero.eu/webdollar',
    keywords: 'tools, services, webdollar, community, list, cpu, cpu miner, crypto'
  });
});

app.get('/cpu-mineable-coins', function(req, res) {
  // TODO: Implement cache
  request('https://api.hostero.eu/v1/coins', function(error, response, body) {
    //console.log('error:', error);
    //console.log('status code:', response && response.statusCode);

    res.render('coins', {
      title: 'List with CPU mineable cryptocurrencies',
      description: 'Directory with CPU mineable cryptocurrencies that are integrated with our mining software. See our list with the most profitable CPU mineable coins. Multicurrency mining software with easy-to-use CPU miner.',
      link: 'https://www.hostero.eu/cpu-mineable-coins',
      keywords: 'directory, cpu, cpu miner, profitable, crypto, cryptocurrencies, mining software, multicurrency, list',
      coins: JSON.parse(body)
    });
  });
});

app.get('*', function(req, res) {
  res.status(404).render('404', {
    title: 'Page not found',
    description: 'The page you requested couldn\'t be found.',
    link: 'https://www.hostero.eu/',
    keywords: 'mining, software, crypto, cpu, statistics, miner, universal cpu miner, cpu miner, webdollar, nerva, webchain'
  });
});

app.listen(port, function() {
  console.log('Hostero site listening on port', port);
});
