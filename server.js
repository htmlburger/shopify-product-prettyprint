const dotenv = require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const cookie = require('cookie');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
const path = require('path');

const session = require('express-session');
const FileStore = require('session-file-store')(session);

const app = express();
app.use(express.static(path.join(__dirname, 'build')));
app.use(
  session({
    store: new FileStore({}),
    secret: 'lorem ipsum',
  }),
);

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const appSlug = process.env.SHOPIFY_APP_SLUG;
const scopes = 'read_products';
const forwardingAddress = process.env.PUBLIC_URI;

app.get('/install', (req, res) => {
  const shop = req.query.shop;
  if (shop) {
    const state = nonce();
    const redirectUri = forwardingAddress + '/auth/callback';
    const installUrl = `https://${shop}/admin/oauth/authorize?client_id=${apiKey}&scope=${scopes}&state=${state}&redirect_uri=${redirectUri}`;
    res.cookie('state', state);
    res.redirect(installUrl);
  } else {
    return res
      .status(400)
      .send(
        'Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request',
      );
  }
});

app.get('/get-product', (req, res) => {
  if (!req.session.shop) {
    res.json({
      status: 'Unauthorized',
    });
    return;
  }
  const productsUrl = `https://${req.session.shop}/admin/products.json`;

  const headers = {
    'X-Shopify-Access-Token': req.session.accessToken,
  };

  request
    .get(productsUrl, {headers})
    .then(response => {
      res.json({
        product: JSON.parse(response).products[0],
      });
    })
    .catch(error => {
      res.json({
        status: 'error',
        error,
      });
    });
});

app.get('/auth/callback', (req, res) => {
  const {shop, hmac, code, state} = req.query;
  const stateCookie = cookie.parse(req.headers.cookie).state;

  if (state !== stateCookie) {
    return res.status(403).send('Request origin cannot be verified');
  }

  if (shop && hmac && code) {
    // DONE: Validate request is from Shopify
    const map = Object.assign({}, req.query);
    delete map['signature'];
    delete map['hmac'];
    const message = querystring.stringify(map);
    const providedHmac = Buffer.from(hmac, 'utf-8');
    const generatedHash = Buffer.from(
      crypto
        .createHmac('sha256', apiSecret)
        .update(message)
        .digest('hex'),
      'utf-8',
    );
    let hashEquals = false;

    try {
      hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac);
    } catch (e) {
      hashEquals = false;
    }

    if (!hashEquals) {
      return res.status(400).send('HMAC validation failed');
    }

    const accessTokenPayload = {
      client_id: apiKey,
      client_secret: apiSecret,
      code,
    };

    request
      .post(`https://${shop}/admin/oauth/access_token`, {
        json: accessTokenPayload,
      })
      .then(accessTokenResponse => {
        const accessToken = accessTokenResponse.access_token;

        req.session.shop = shop;
        req.session.accessToken = accessToken;
        res.redirect('https://' + shop + '/admin/apps/' + appSlug);
      })
      .catch(error => {
        console.log(error);
        res.status(error.statusCode).send(error.error.error_description);
      });
  } else {
    res.status(400).send('Required parameters missing');
  }
});

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);
