'use strict';

const httpstatus = require('./httpstatus');
const request = require('request-promise-native');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

const server = app.listen(process.env.PORT || 3333, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

// Auth

app.get('/slack', (req, res) => {
  if (!req.query.code) { // access denied
    res.redirect('http://www.girliemac.com/slack-httpstatuscats/');
    return;
  }
  let data = {form: {
    'client_id': process.env.SLACK_CLIENT_ID,
    'client_secret': process.env.SLACK_CLIENT_SECRET,
    'code': req.query.code
  }};
  let token;
  request.post('https://slack.com/api/oauth.access', data, (response, body) => {
    // Get an auth token
    token = JSON.parse(body).access_token;

    // Get the team domain name to redirect to the team URL after auth
    return request.post('https://slack.com/api/team.info', {form: {token: token}});
  }).then((response, body) => {
    if (JSON.parse(body).error === 'missing_scope') {
      res.send('HTTP Status Cats has been added to your team!');
    } else {
      let team = JSON.parse(body).team.domain;
      res.redirect(`http://${team}.slack.com`);
    }
  }).catch(error => {
    res.send('Something went wrong, check the logs');
    console.log(error);
  });
});

/* *******************************
/* HTTP Status Cats Slash Command
/* ***************************** */

app.get('/', (req, res) => {
  handleQueries(req.query, res);
});

app.post('/', (req, res) => {
  handleQueries(req.body, res);
});

/*
response:
{ token: '2P429UX-------',
  team_id: 'T1L---',
  team_domain: 'girliemac',
  channel_id: 'C1L---',
  channel_name: 'general',
  user_id: 'U1L----',
  user_name: 'girlie_mac',
  command: '/httpstatus',
  text: '405',
  response_url: 'https://hooks.slack.com/commands/--- }
*/

function handleQueries(q, res) {
  if (q.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    // the request is NOT coming from Slack!
    res.send('No-No. It seems you don\'t have access to do that.');
    return;
  }
  if (q.text) {
    let code = q.text;

    if (!/^\d+$/.test(code)) { // not a digit
      res.send('U R DOIN IT WRONG. Enter a status code like 200 😒');
      return;
    }

    let status = httpstatus[code];
    if (!status) {
      res.send('Bummer, ' + code + ' is not an official HTTP status code 🙃');
      return;
    }

    let image = 'https://http.cat/' + code;
    let data = {
      'response_type': 'in_channel', // public to the channle
      'text': code + ': ' + status,
      'attachments': [
        {
          image_url: image
        }
      ]};
    res.json(data);
  } else {
    let data = {
      'response_type': 'ephemeral', // private message
      'text': 'How to use /httpstatus command:',
      'attachments': [
        {
          text: 'Type a status code after the command, e.g. `/httpstatus 404`',
        }
      ]};
    res.json(data);
  }
}
