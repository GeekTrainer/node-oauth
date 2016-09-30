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
                const url = `http://localhost:3978/login?address=${querystring.escape(JSON.stringify(session.message.address))}`;
                const card = new builder.ThumbnailCard(session)
                    .text('Click to authenticate')
                    .tap(new builder.CardAction.openUrl(session, url));
                builder.Prompts.text(session, new builder.Message(session).attachments([card]));
            }
        },
        (session, result, next) => {
            session.userData.codeData = JSON.parse(result.response);
            builder.Prompts.text(session, 'Please enter the code you received');
        },
        (session, result) => {
            const magicCode = result.response;
            const userId = session.message.user.id;
            const codeData = session.userData.codeData;
            if(codeData.userId === userId && codeData.userId) {
                session.send('you have been authenticated');
            }
        }
    ]);

module.exports = dialog;