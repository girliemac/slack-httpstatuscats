'use strict';
require('dotenv').config();

const httpstatus = require('./httpstatus');
const signature = require('./verifySignature');
const axios = require('axios');
const qs = require('qs');
const express = require('express');
const bodyParser = require('body-parser');

const apiUrl = 'https://slack.com/api';

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

app.use(express.static(__dirname + '/../')); // html
app.use(express.static(__dirname + '/../public')); // images

// Static Web UI
app.get('/', (req, res) => {
  res.sendFile('index.html');
});

/*
 * Sign-in 
 * This part is only needed for distributing your app.
 * Internal integrations do not require the user sign in. You just install it on your workspace! 
 */

app.get('/auth', (req, res) => {
  if (!req.query.code) { // access denied
    res.redirect('/?error=access_denied');
    return;
  }
  const authInfo = {
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code: req.query.code
  };

  axios.post(`${apiUrl}/oauth.access`, qs.stringify(authInfo))
    .then((result) => {
      // The payload data has been modified since the last version!
      // See https://api.slack.com/methods/oauth.access

      console.log(result.data);

      const { access_token, refresh_token, expires_in, error } = result.data;

      if(error) {
        res.sendStatus(401);
        console.log(error);
        return;
      }

      // This link will open the workspace in Slack client, 
      // however, I am calling extra API for the tutorial to show you how to use Web API.
      // res.redirect(`slack://open?team=${team_id}`);

      // When you call Web APIs, you need to check if your access_token (xoxa-) is expired (60min) and if it is, get a fresh access token with your refresh_token (xoxr-).  
      // However, in this scenario, because you are calling this API immediately after the initial OAuth, access_token is not expired thus you can just use it.
      // See the additional code sample in the end of this file.
    
      axios.post(`${apiUrl}/team.info`, qs.stringify({token: access_token})).then((result) => {
        if(!result.data.error) {
          res.redirect(`http://${result.data.team.domain}.slack.com`);
        }
      }).catch((err) => { console.error(err); });

    }).catch((err) => {
      console.error(err);
    });

});


/* 
 * Slash Command
 * Endpoint to receive /httpstatus slash command from Slack.
 */

app.post('/command', (req, res) => {
  if(!signature.isVerified(req)) { // the request is NOT coming from Slack!
    res.sendStatus(404);
    return;
  }

  let message = {};
  if (req.body.text) {
    const code = req.body.text;

    if(! /^\d+$/.test(code)) { // not a digit
      res.send(':crying_cat_face:U R DOIN IT WRONG. Enter a status code like 200');
      return;
    }

    const status = httpstatus[code];
    if(!status) {
      res.send('Bummer, ' + code + ' is not a HTTP status code :scream_cat:');
      return;
    }

    message = {
      response_type: 'in_channel', // public to the channel
      attachments:[
        {
          pretext: `${code}: ${status}`,
          image_url: `https://${req.hostname}/images/${code}.jpg`
        }
      ]
    };
  } else {
    message = {
      response_type: 'ephemeral', // private message
      text: ':cat: How to use `/httpstatus` command:',
      attachments:[
        {
          text: 'Type a status code after the command, _e.g._ `/httpstatus 404`'
        }
      ]
    };
  }

  res.json(message);
});

const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});



/* Additional notes:

Although, this sample app only uses Slash command after the initial authentication, 
if you want to call Slack Web APIs (such as chat.postMessage`) you need an access token to access the APIs, which expires in 60min.
Once your temporary token expires, you need to call `oauth.access` to get a new token.

I suggest to set your access_token and refresh_token somewhere with an expiry_time (e.g. in millisecond, (new Date()).getTime() + (1000 * 60 * 60))
then each time you need to call an API, check if the current_time > expiry_time.

*/

/* TOKEN ROTATION IMPLEMENTATION EXAMPLE
 * These code are not used in this particular app, but leave here for tutorial purpose
 * Call setAccessToken after the initial OAuth handshake when you receive the first access_token
 * refresh_token should be stored separately somewhere in DB
 * Call getAccessToken immediately before making an API call
 */

const setAccessToken = async (access_token, expires_in) => {
  const data = {
    token: access_token,
    expiry_time: Date().now() + (1000 * expires_in)
  }
  await db.setItem('access_token', data);
}
const getAccessToken = async () => {
  const tokenData = await db.getItem('access_token');
  if(tokenData.expiry_time < Date.now()) {
    return tokenData.token;
  } else {
    const result = await getNewAccessToken();
    return result.data.access_token;
  }
}
const getNewAccessToken = () => {
  const arg = { 
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    refresh_token: REFRESH_TOKEN,
    grant_type: 'refresh_token'
  };
  return axios.post(`${apiUrl}/oauth.access`, qs.stringify(arg));
};

