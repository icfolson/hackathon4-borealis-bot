'use strict';

/**
 * Node Modules
 */
var restify = require('restify');
var builder = require('botbuilder');

/**
 * LUIS intents
 */
const LuisIntents = {
    discover: "intent.discover",
    greeting: "intent.greeting"
}

/**
 * Dialogs that are added to the bot builder
 */
var incontinenceDialog = require('./dialogs/incontinence');
var greetingDialog = require('./dialogs/incontinence-hello');
var confirmation = require('./dialogs/confirmation');

/**
 * LUIS and Bot related APIs
 */

const luisModel = 'https://api.projectoxford.ai/luis/v1/application?id=670912d3-f95e-4586-bb0b-7fd8c3d92010&subscription-key=f7e7b16408d64750ba8188fd25837887'
var luisDialog = new builder.LuisDialog(luisModel);
var bot = new builder.BotConnectorBot({ appId: process.env.BOT_APP_ID, appSecret: process.env.BOT_APP_SECRET });

/**
 * Adding the Luis dialog to the root directory.
 */
bot.add('/', luisDialog);

luisDialog.on(LuisIntents.greeting, '/greeting');
luisDialog.on(LuisIntents.discover, '/discover');


luisDialog.onDefault((session) => {
        let currentConvoId = session.message.conversationId;
        
        if ( session.userData.intake ) {
            session.endDialog('Your intake convo id is ' + session.userData.intake.conversationId + ' and the current one is ' + session.message.conversationId);
        }
        else {
            session.endDialog('I\'m sorry I didn\'t understand.' + currentConvoId);            
        }
    });

bot.add('/greeting', greetingDialog);
bot.add('/discover', incontinenceDialog);
bot.add('/confirm', confirmation.confirmationDialog);

/**
 * A session is the manager for the bot conversation with the user.
 * Notable attributes:
 * 
 *      - dialogArgs    (optional arguments to pass to dialog when starting conversation)
 *      - dialogData    (data that's only visible to the current dialog)
 *      - dialogId      (id of dialog to start for any new conversations)
 *      - dialogs       (sessions collection of available dialogs)
 *      - message       (message received from the user)
 *      - userData      (data for the user that's persisted across all conversations with the bot)
 */


// Setup Restify Server
var server = restify.createServer();

// Setup the path for the botframework
//server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
//server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

server.post('/api/messages', bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});