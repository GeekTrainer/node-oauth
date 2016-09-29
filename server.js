"use strict";

const builder = require('botbuilder');
const restify = require('restify');
require('dotenv').load();

const passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
passport.use('provider', new GitHubStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.REDIRECT_URI
},
  function (token, tokenSecret, profile, done) {
    process.nextTick(function () {

      // To keep the example simple, the user's GitHub profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the GitHub account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
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