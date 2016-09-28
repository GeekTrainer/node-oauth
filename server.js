"use strict";

const builder = require('botbuilder');
const restify = require('restify');
require('dotenv').load();

const passport = require('passport');
const Strategy = require('passport-oauth').OAuthStrategy;
passport.use('provider', new Strategy({
    requestTokenURL: 'https://github.com/login/oauth/authorize?scope=user',
    accessTokenURL: 'https://github.com/login/oauth/access_token',
    userAuthorizationURL: 'https://github.com/login/oauth/authorize',
    consumerKey: process.env.CLIENT_ID,
    consumerSecret: process.env.CLIENT_SECRET,
    callbackURL: process.env.REDIRECT_URI
  },
  function(token, tokenSecret, profile, done) {
    User.findOrCreate(function(err, user) {
      done(err, user);
    });
  }
));

const connector = new builder.ChatConnector();
const bot = new builder.UniversalBot(connector);

bot.dialog('/', require('./dialogs/oauth.js'));

const server = restify.createServer();
server.use(restify.queryParser());

server.post('/api/messages', connector.listen());
server.get('/oauth', (req, res) => {
    res.send(200, `Paste this code into the bot: ${req.query.code}`);
});

server.listen(process.env.PORT || process.env.port, () => {
    console.log('listening');
});