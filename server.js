'use strict';

var restify = require('restify');
var builder = require('botbuilder');

//import dialogs
var gettingDialog = require('./dialogs/getting');
var frequencyDialog = require('./dialogs/frequency');

//load these values from the environment
var luisModel = 'https://api.projectoxford.ai/luis/v1/application?id=19d42dd0-96cd-47db-b2a2-259b679e5f45&subscription-key=f7e7b16408d64750ba8188fd25837887';
var bot = new builder.BotConnectorBot({ appId: process.env.BOT_APP_ID, appSecret: process.env.BOT_APP_SECRET });

//root intent handler
bot.add('/', new builder.LuisDialog(luisModel)
    .on('borealis.getting', '/Getting')     
    .on('borealis.frequency', '/Frequency')  
    .onDefault(builder.DialogAction.send("I'm sorry I didn't understand."))
);

//dialogs
/*
bot.add('/Maintaining', 
    placeOrderInit
);*/

bot.add('/Getting', 
    gettingDialog
);


bot.add('/Frequency', 
    frequencyDialog
);

// Setup Restify Server
var server = restify.createServer();

// Setup the path for the botframework
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());

// Serve a static web page
server.get(/.*/, restify.serveStatic({
	'directory': '.',
	'default': 'index.html'
}));

server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});