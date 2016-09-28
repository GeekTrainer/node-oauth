"use strict";

const builder = require('botbuilder');
const restify = require('restify');
require('dotenv').load();

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