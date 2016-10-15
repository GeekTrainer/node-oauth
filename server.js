"use strict";
require('dotenv').load();

const querystring = require('querystring');
const builder = require('botbuilder');
const restify = require('restify');

const loginPath = process.env.LOGIN_PATH;
const redirectPath = process.env.REDIRECT_PATH;

// create bot
const connector = new builder.ChatConnector();
const bot = new builder.UniversalBot(connector);
bot.dialog('/', require('./dialogs/oauth.js'));

// load passport configuration
const passport = require('./passport-config.js');

// create server
const server = restify.createServer();
// add required middleware
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(passport.initialize());

// add login path
server.get(loginPath, (req, res, next) => {
  passport.authenticate('github', 
                        {scope: ['user'], state: req.query.address}, 
                        (req, res) => {})(req, res, next);
});

// add oauth path
server.get(redirectPath,
  passport.authenticate('github', { failureRedirect: loginPath }),
  (req, res) => {
    const address = JSON.parse(req.query.state);

    const magicCode = require('crypto').randomBytes(4).toString('hex');
    const authCode = req.query.code;
    const userId = address.user.id;
    const messageData = { magicCode: magicCode, authCode: authCode, userId: userId };

    let message = new builder.Message().address(address).text(JSON.stringify(messageData));
    bot.receive(message.toMessage());
    res.send(`Please enter the code into the bot: ${magicCode}`);
  }
);

// add bot
server.post('/api/messages', bot.connector().listen());

// start listening!
server.listen(process.env.PORT || process.env.port, () => {
  process.env.HOST = server.url.replace('[::]', 'localhost');
  console.log('listening');
});