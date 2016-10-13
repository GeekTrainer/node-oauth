"use strict";

const builder = require('botbuilder');
const restify = require('restify');
const crypto = require('crypto');
require('dotenv').load();

const passport = require('passport');

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

require('./strategies/GitHubStrategy.js').configurePassport(passport);

// const GitHubStrategy = require('passport-github2').Strategy;
// passport.use('github', new GitHubStrategy({
//   clientID: process.env.CLIENT_ID,
//   clientSecret: process.env.CLIENT_SECRET,
//   callbackURL: process.env.REDIRECT_URI
// },
//   function (token, tokenSecret, profile, done) {
//     process.nextTick(function () {
//       console.log('authenticated!!!!!');
//       return done(null, profile);
//     });
//   }
// ));

const connector = new builder.ChatConnector();
const bot = new builder.UniversalBot(connector);
const querystring = require('querystring');

bot.dialog('/', require('./dialogs/oauth.js'));

const server = restify.createServer();
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(passport.initialize());

server.get('/login', (req, res, next) => {
  passport.authenticate('github', {scope: ['user'], state: req.query.address}, (req, res) => {})(req, res, next);
});

server.get('/oauth',
  passport.authenticate('github', { failureRedirect: '/login' }),
  (req, res) => {
    const address = JSON.parse(req.query.state);

    const magicCode = crypto.randomBytes(4).toString('hex');
    const authCode = req.query.code;
    const userId = address.user.id;
    const messageData = { magicCode: magicCode, authCode: authCode, userId: userId };

    let message = new builder.Message().address(address).text(JSON.stringify(messageData));
    bot.receive(message.toMessage());
    res.send(`Please enter the code into the bot: ${magicCode}`);
  }
);

server.post('/api/messages', connector.listen());

server.listen(process.env.PORT || process.env.port, () => {
  console.log('listening');
});