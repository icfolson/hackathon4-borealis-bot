var restify = require('restify');
var builder = require('botbuilder');

//import intents
var placeOrderInit = require('./dialogs/place-order');
var inquireCheeseInit = require('./dialogs/place-order');

//load these values from the environment
var luisModel = 'https://api.projectoxford.ai/luis/v1/application?id=5cdc03d1-9d72-427b-b763-2054d3877b90&subscription-key=568c2ba8438a4aa3956a2cadf0aad4c1';
var bot = new builder.BotConnectorBot({ appId: 'icfolsonhackathonjarvisbot', appSecret: 'aa81365c38d541e6a92be1a9dfca14a9' });

//root intent handler
bot.add('/', new builder.LuisDialog(luisModel)
    .on('jarvis.order', '/Place-Order')
    .on('jarvis.cheeses', '/Inquire-Cheese')
    .onDefault(builder.DialogAction.send("I'm sorry I didn't understand."))
);

//place order intent
bot.add('/Place-Order', 
    placeOrderInit
);

//inquire about cheese
bot.add('/Inquire-Cheese', 
    inquireCheeseInit
);


// Setup Restify Server
// Setup Restify Server
var server = restify.createServer();
server.post('/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(process.env.port || 3978, function () {
    console.log('%s listening to %s', server.name, server.url); 
});