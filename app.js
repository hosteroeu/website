var express = require('express');
var request = require('request');
var crequest = require('cached-request')(request);
var compression = require('compression');
var mustacheExpress = require('mustache-express');
var cookieParser = require('cookie-parser');
var app = express();
var port = process.env.PORT || 3003;

function render_404(req, res) {
  res.status(404).render('404', {
    title: 'Page not found',
    description: 'The page you requested couldn\'t be found.',
    link: 'https://www.hostero.eu/',
    keywords: 'mining, software, crypto, cpu, statistics, miner, universal cpu miner, cpu miner, webdollar, nerva, webchain'
  });
}

function get_coins(callback, ttl) {
  crequest({
    url: 'https://api.hostero.eu/v1/coins',
    ttl: ttl || (3600 * 1000 * 24) // 1d
  }, function(error, response, body) {
    var coins = JSON.parse(body);

    callback(error, coins);
  });
}

function get_benchmarks(callback, coin, ttl) {
  crequest({
    url: 'https://api.hostero.eu/v1/benchmarks?coin=' + coin,
    ttl: ttl || (3600 * 1000 * 24) // 1d
  }, function(error, response, body) {
    var benchmarks = JSON.parse(body);

    callback(error, benchmarks);
  });
}

function get_name(req) {
  var profile = req.cookies.profile || null;
  var name = null;

  if (profile) {
    try {
      var parsed = JSON.parse(profile);

      if (parsed.first_name && parsed.last_name) {
        name = parsed.first_name + ' ' + parsed.last_name;
      } else {
        name = parsed.email;
      }
    } catch(e) {
      console.error(e);
    }
  }

  return name;
}

crequest.setCacheDirectory('tmp');

app.engine('html', mustacheExpress());

app.use(compression());
app.use(cookieParser());

// CORS
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');

  next();
});

// Pre-flight and ELB requests
app.options('*', function(req, res) {
  res.send(200);
});

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
  var name = get_name(req);

  get_coins(function(error, coins) {
    res.render('index', {
      title: 'Mining software for CPU cryptocurrencies',
      description: 'Start mining cryptocurrency in a few minutes. Mine the most profitable coins and unlock the full potential of your mining rigs.',
      link: 'https://www.hostero.eu',
      keywords: 'mining, software, crypto, cpu, statistics, miner, universal cpu miner, cpu miner, webdollar, nerva, webchain',
      coins: coins,
      name: name
    });
  });
});

app.get('/pricing', function(req, res) {
  var name = get_name(req);

  res.render('pricing', {
    title: 'Pricing plans for Hostero',
    description: 'Choose your plan based on the required number of miners. We have a wide range of plans available.',
    link: 'https://www.hostero.eu/pricing',
    keywords: 'plans, subscriptions, prices, mining, software, hardware, crypto, cpu, miner, universal cpu miner, cpu miner',
    name: name,
  });
});

app.get('/getting-started', function(req, res) {
  var name = get_name(req);

  res.render('getting-started', {
    title: 'Getting Started with the CPU Miner',
    description: 'Learn how to deploy the Universal CPU Miner on your mining rigs. Follow our tutorial to install the CPU miner on your hardware.',
    link: 'https://www.hostero.eu/getting-started',
    keywords: 'get started, tutorial, mining, software, hardware, crypto, cpu, miner, universal cpu miner, cpu miner',
    name: name,
  });
});

app.get('/changelog', function(req, res) {
  var name = get_name(req);

  res.render('changelog', {
    title: 'Changelog for our Mining Software',
    description: 'Find out what new features we have released. We are constantly working on improving the mining software, and make your miners profitable.',
    link: 'https://www.hostero.eu/changelog',
    keywords: 'changelog, chance log, improvements, features, mining, software, crypto, cpu, statistics, miner, universal cpu miner, cpu miner'
  });
});

app.get('/docs/purchase-webdollar', function(req, res) {
  var name = get_name(req);

  res.render('purchase-webdollar', {
    title: 'Purchase WebDollar, only use Escrow',
    description: 'Tutorial on how to purchase WebDollar coins from multiple sources. Use WebDollar to pay for the platform services. Purchase only with escrow.',
    link: 'https://www.hostero.eu/purchase-webdollar',
    keywords: 'purchase, webdollar, tutorial, crypto, cryptocurrencies, coins, escrow, cpu, cpu miner',
    name: name,
  });
});

app.get('/tools', function(req, res) {
  var name = get_name(req);

  res.render('tools', {
    title: 'Tools',
    description: 'List of tools and services developed for the open-source community. Crypto tools that create a bridge for mass-adoption.',
    link: 'https://www.hostero.eu/tools',
    keywords: 'tools, services, webdollar, community, list, cpu, cpu miner, crypto',
    name: name,
  });
});

app.get('/cpu-mineable-coins', function(req, res) {
  var name = get_name(req);
  var coins = [];

  get_coins(function(error, _coins) {
    for (var i=0; i<_coins.length; i++) {
      var coin = _coins[i];

      if (coin.network_hashrate == 0) {
        coin.network_hashrate = null;
      } else {
        coin.network_hashrate = coin.network_hashrate / 1000 / 1000;
        coin.network_hashrate = coin.network_hashrate.toFixed(2);
      }

      if (coin.price_eur == 0) {
        coin.price_eur = null;
      } else {
        coin.price_eur = coin.price_eur.toFixed(5);
      }

      if (coin.block_time == 0) {
        coin.block_time = null;
      }

      if (coin.block_reward == 0) {
        coin.block_reward = null;
      }

      if (!coin.removed) {
        coins.push(coin);
      }
    }

    res.render('coins', {
      title: 'List with CPU mineable cryptocurrencies',
      description: 'Directory with CPU mineable cryptocurrencies that are integrated with our mining software. See our list with the most profitable CPU mineable coins.',
      link: 'https://www.hostero.eu/cpu-mineable-coins',
      keywords: 'directory, cpu, cpu miner, profitable, crypto, cryptocurrencies, mining software, multicurrency, list',
      coins: coins,
      coins_no: coins.length,
      name: name,
    });
  });
});

app.get('/universal-miner', function(req, res) {
  var account_id = req.cookies.ACCOUNT_ID || null;
  var name = get_name(req);

  res.render('universal-miner', {
    title: 'Universal Miner',
    description: 'Install the Universal Miner and start mining over 10 cryptocurrencies in under a minute.',
    link: 'https://www.hostero.eu/universal-miner',
    keywords: 'universal, miner, software, cpu, cpu miner, crypto, cryptocurrencies',
    account_id: account_id,
    name: name,
  });
});

app.get('/docs/install-on-ubuntu', function(req, res) {
  var account_id = req.cookies.ACCOUNT_ID || null;
  var name = get_name(req);

  res.render('install-on-ubuntu', {
    title: 'Install Hostero on Ubuntu',
    description: 'Install the Hostero Universal Miner on Ubuntu',
    link: 'https://www.hostero.eu/docs/install-on-ubuntu',
    keywords: 'universal, miner, software, cpu, cpu miner, crypto, cryptocurrencies, install, guide, ubuntu',
    account_id: account_id,
    name: name,
  });
});

app.get('/docs/install-on-windows', function(req, res) {
  var account_id = req.cookies.ACCOUNT_ID || null;
  var name = get_name(req);

  res.render('install-on-windows', {
    title: 'Install Hostero on Windows',
    description: 'Install the Hostero Universal Miner on Windows',
    link: 'https://www.hostero.eu/docs/install-on-windows',
    keywords: 'universal, miner, software, cpu, cpu miner, crypto, cryptocurrencies, install, guide, windows',
    account_id: account_id,
    name: name,
  });
});

app.get('/docs/install-on-macos', function(req, res) {
  var account_id = req.cookies.ACCOUNT_ID || null;
  var name = get_name(req);

  res.render('install-on-macos', {
    title: 'Install Hostero on MacOS',
    description: 'Install the Hostero Universal Miner on MacOS',
    link: 'https://www.hostero.eu/docs/install-on-macos',
    keywords: 'universal, miner, software, cpu, cpu miner, crypto, cryptocurrencies, install, guide, macos',
    account_id: account_id,
    name: name,
  });
});

app.get('/docs/webdollar-pos-mining', function(req, res) {
  var account_id = req.cookies.ACCOUNT_ID || null;
  var name = get_name(req);

  res.render('webdollar-pos-mining', {
    title: 'Mine Proof Of Stake (POS) with WebDollar',
    description: 'Learn how to configure the Proof of Stake (POS) miner for WebDollar',
    link: 'https://www.hostero.eu/docs/webdollar-pos-mining',
    keywords: 'universal, miner, webdollar, pos, software, cpu, cpu miner, crypto, cryptocurrencies',
    account_id: account_id,
    name: name,
  });
});

app.get('/coins/:coin', function(req, res) {
  if (!req.params.coin) {
    return render_404(req, res);
  }

  var name = get_name(req);

  get_coins(function(error, coins) {
    var coin;

    for (var i = 0, l = coins.length; i < l; i++) {
      if (coins[i].internal_name === req.params.coin) {
        coin = coins[i];
        break;
      }
    }

    if (!coin) {
      return render_404(req, res);
    }

    get_benchmarks(function(error, benchmarks) {
      var benchmarks_with_profit = [];

      if (coin.price_eur && coin.network_hashrate && coin.block_time && coin.block_reward) {
        for (var i = 0; i < benchmarks.length; i++) {
          var benchmark = benchmarks[i];

          benchmark.reward_24h_eur = 0;

          if (benchmark.power) {
            var reward = 0;

            // DOMINANCE = USER_HASHES / GLOBAL_HASHES / * 100
            // REWARD_PER_DAY = BLOCK_REWARD * 3600 * 24 / BLOCK_TIME * DOMINANCE / 100
            var dominance = benchmark.power / coin.network_hashrate / 100;
            var reward_coins = coin.block_reward * 3600 * 24 / coin.block_time * dominance * 100;

            reward = coin.price_eur * reward_coins;

            if (coin.hybrid) {
              reward = reward * coin.hybrid_percentage_pow / 100;
            }

            benchmark.reward_24h_eur = reward.toFixed(2);
          }

          benchmarks_with_profit.push(benchmark);
        }
      } else {
        benchmarks_with_profit = benchmarks;
      }

      res.render('coin', {
        title: 'Mine ' + coin.name + ' on Hostero',
        description: coin.description + '. Start mining ' + coin.name + ' in 1 minute.',
        link: 'https://www.hostero.eu/coins/' + coin.internal_name,
        keywords: coin.name + ', coin, benchmarks, directory, mine, cpu, cpu miner, crypto, cryptocurrencies, mining software, multicurrency, list',
        coin: coin,
        benchmarks: benchmarks_with_profit,
        name: name,
      });
    }, coin.internal_name);
  }, 3600 * 1000);
});

// The file is also accessible via /assets/install.sh
app.get('/install', function(req, res) {
  var account_id;

  if (req.query && req.query.a) {
    account_id = req.query.a;
  }

  res.set('Content-Type', 'text/plain');

  res.render('install', {
    account_id: req.query.a
  });

  /*
  res.sendFile('install.sh', {
    root: __dirname + '/assets/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  });
  */
});

// The file is also accessible via /assets/sitemap.xml
app.get('/sitemap.xml', function(req, res) {
  res.sendFile('sitemap.xml', {
    root: __dirname + '/assets/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  });
});

// The file is also accessible via /assets/fallbacks.json
app.get('/webdollar/fallbacks.json', function(req, res) {
  res.set('Content-Type', 'application/json');

  res.sendFile('fallbacks.json', {
    root: __dirname + '/assets/',
    dotfiles: 'deny',
    headers: {
      'x-timestamp': Date.now(),
      'x-sent': true
    }
  });
});

app.get('/purchase-webdollar', function(req, res) {
  res.redirect(301, 'https://www.hostero.eu/docs/purchase-webdollar');
});

app.get('/cpu-minable-coins', function(req, res) {
  res.redirect(301, 'https://www.hostero.eu/cpu-mineable-coins');
});

app.get('/webdollar/chance.html', function(req, res) {
  res.redirect(301, 'https://calculator.wd.hostero.eu');
});

app.get('/webdollar/fallback.html', function(req, res) {
  res.redirect(301, 'http://nodes.wd.hostero.eu');
});

app.get('/webdollar', function(req, res) {
  res.redirect(301, 'https://www.hostero.eu/tools');
});

app.get('*', render_404);

app.listen(port, function() {
  console.log('Hostero site listening on port', port);
});
