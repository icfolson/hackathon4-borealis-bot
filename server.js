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
};

const luisConstants = require('./dialogs/LUIS/entity-types');

/**
 * Dialogs that are added to the bot builder
 */
const incontinenceDialog = require('./dialogs/incontinence');
const greetingDialog = require('./dialogs/incontinence-hello');
const confirmation = require('./dialogs/confirmation');
const inquireWhat = require('./dialogs/sub_dialogs/inquire-what');
const causeDialog = require('./dialogs/sub_dialogs/inquire-cause');
const frequencyDialog = require('./dialogs/sub_dialogs/inquire-frequency');
const volumeDialog = require('./dialogs/sub_dialogs/inquire-volume');
const medicationDialog = require('./dialogs/sub_dialogs/inquire-self-medication');
const resetDialog = require('./dialogs/luis/reset-dialog');

/**
 * LUIS and Bot related APIs
 */
const luisModel = 'https://api.projectoxford.ai/luis/v1/application?id=670912d3-f95e-4586-bb0b-7fd8c3d92010&subscription-key=f7e7b16408d64750ba8188fd25837887'
var recognizer = new builder.LuisRecognizer(luisModel);
var intents = new builder.IntentDialog({ recognizers: [recognizer] });
// uncomment connector a bot below to 
// const connector = new builder.ConsoleConnector();
// var bot = new builder.UniversalBot(connector.listen());

// Restify connector/bot
const connector = new builder.ChatConnector({appId: process.env.APP_ID, appPassword: process.env.APP_PASSWORD });
var bot = new builder.UniversalBot(connector);


/**
 * Adding the Luis dialog to the root directory.
 */
bot.dialog('/', intents);

intents.matches(LuisIntents.greeting, '/greeting');
intents.matches(LuisIntents.discover, '/discover');
intents.matches(luisConstants.LUIS_INTENTS.frequency, '/frequency');
intents.matches(luisConstants.LUIS_INTENTS.cause, '/cause');
intents.matches(luisConstants.LUIS_INTENTS.volume, '/volume');
intents.matches(luisConstants.LUIS_INTENTS.selfMedication, '/selfMedication');
intents.matches(luisConstants.LUIS_INTENTS.reset, '/reset');
intents.onDefault(session => {builder.DialogAction.send(`I'm sorry. I didn't understand.  Maybe with more training I will, though!`)});



intents.onDefault(() => {});

// greets the user
bot.dialog('/greeting', greetingDialog);
bot.dialog('/discover', incontinenceDialog);
// confirms a simple yes or no answer
bot.dialog('/confirmAppointment', confirmation.confirmationDialog);
bot.dialog('/confirmIncontinence', confirmation.confirmationDialog);
// inquires about the dialog
bot.dialog(`/what`, inquireWhat);
bot.dialog('/cause', causeDialog);
bot.dialog('/frequency', frequencyDialog);
bot.dialog('/volume', volumeDialog);
bot.dialog('/selfMedication', medicationDialog);
bot.dialog('/reset', resetDialog);

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


// // Setup Restify Server
var server = restify.createServer();

// // Setup the path for the botframeworka
// //server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
// //server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});

  server.post('/api/messages', connector.listen());