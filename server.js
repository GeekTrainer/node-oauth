"use strict";

const builder = require('botbuilder');
const restify = require('restify');
require('dotenv').load();

const passport = require('passport');
var GitHubStrategy = require('passport-github2').Strategy;
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});
passport.use('github', new GitHubStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: process.env.REDIRECT_URI
},
  function (token, tokenSecret, profile, done) {
    process.nextTick(function () {
      console.log('authenticated!!!!!');
      return done(null, profile);
    });
  }
));

const connector = new builder.ChatConnector();
const bot = new builder.UniversalBot(connector);

bot.dialog('/', require('./dialogs/oauth.js'));

const server = restify.createServer();
server.use(restify.queryParser());
server.use(passport.initialize());
server.use(restify.bodyParser());

server.get('/login', (req, res, next) => {
  passport.authenticate('github', {scope: ['user']}, (req, res) => {})(req, res, next);
});

server.get(
  '/oauth',
  (req, res, next) => {
    passport.authenticate('github', { failureRedirect: '/login' })(req, res, next);
    
  }, 
  (req, res, next) => {

  }
);

server.post('/api/messages', connector.listen());
// server.get('/oauth', (req, res) => {
//   res.send(200, `Paste this code into the bot: ${req.query.code}`);
// });

server.listen(process.env.PORT || process.env.port, () => {
  console.log('listening');
});