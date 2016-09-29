"use strict";

const builder = require('botbuilder');
const querystring = require('querystring');
const https = require('https');

const dialog = new builder.IntentDialog()
    .onDefault([
        (session) => {
            if (session.userData.access_token) {
                session.endDialog(`You're already authenticated`);
            } else {
                const url = `http://localhost:3978/login`;
                const card = new builder.ThumbnailCard(session)
                    .text('Click to authenticate, then paste the code into the bot')
                    .tap(new builder.CardAction.openUrl(session, url));
                session.send(new builder.Message(session).attachments([card]));
                builder.Prompts.text(session, 'When you receive the code, paste it here to let me know what it is.');
            }
        },
        (session, result) => {
            const code = result.response;

            const postData = querystring.stringify({
                'client_id': process.env.CLIENT_ID,
                'client_secret': process.env.CLIENT_SECRET,
                'code': code
            });

            const options = {
                host: 'github.com',
                port: 443,
                path: '/login/oauth/access_token',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const authRequest = https.request(options, (response) => {
                let data = '';
                response.on('data', (chunk) => data += chunk);
                response.on('end', () => {
                    session.userData.access_token = querystring.parse(data).access_token;
                    session.endDialog('Login successful');
                });
            });
            authRequest.write(postData);
            authRequest.end();
        }
    ]);

module.exports = dialog;