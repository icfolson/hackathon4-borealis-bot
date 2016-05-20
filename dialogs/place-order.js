'use strict';

var builder = require('botbuilder');

const LUIS_ENTITY_CHEESE_TYPE = 'jarvis.sandwich.cheese';
const LUIS_ENTITY_SANDWICH_TYPE = 'jarvis.sandwich.type';


const _cheeseTypes = [
    'American',
    'Monterey Cheddar',
    'Pepperjack',
    'Pepper Jack',
    'PJack'
];

const _sandwichTypes = [
    'BLT',
    'Black Forest Ham',
    'Buffalo Chicken',
    'Chicken and Bacon Ranch Melt',
    'Cold Cut Combo,Meatball',
    'Meatball Marinara',
    'Over Roasted Chicken,Roast Beef',
    'Rotisserie Style Chicken',
    'Spicy Italian,Steak and Cheese',
    'Sweet Onion Teriyaki',
    'Tuna',
    'Turkey Breast,Veggie'
];


/* BEGIN: Intake */
const initializeOrder = (session, args, next) => {
    if (!session.dialogData.order) {
        session.dialogData.order = {};
    }

    if (!session.dialogData.luisEntities) {
        session.dialogData.luisEntities = {};
    }

    let sandwichType = builder.EntityRecognizer.findEntity(args.entities, LUIS_ENTITY_SANDWICH_TYPE);
    let cheeseType = builder.EntityRecognizer.findEntity(args.entities, LUIS_ENTITY_CHEESE_TYPE);

    let luisEntities = session.dialogData.luisEntities;

    if (cheeseType) {
        luisEntities.cheeseType = cheeseType.entity;
    }

    if (sandwichType) {
        luisEntities.sandwichType = sandwichType.entity;
    }

    builder.Prompts.text(session, 'Sounds like you want to order a sandwich.  Can I get a name for the order?');
};

const intakeName = (session, results, next) => {
    let order = session.dialogData.order;

    order.name = results.response;

    session.send('Thanks ' + order.name + ', lets get to your order!');

    next(session);
};
/* END: Intake */


/* BEGIN: Sandwich Type */
const promptForSandwichType = (session, results, next) => {
    let luisEntities = session.dialogData.luisEntities;
    let order = session.dialogData.order;

    let match;
    if (luisEntities.sandwichType) {
        match = builder.EntityRecognizer.findBestMatch(_sandwichTypes, luisEntities.sandwichType);
    }

    if (!match) {
        builder.Prompts.choice(session, "What type of sandwich would you like to start with?", _sandwichTypes);
    } else {
        next({
            response: match
        });
    }
};

const intakeSandwichType = (session, results, next) => {
    session.dialogData.order.sandwichType = results.response.entity;

    next(session);
};
/* END: Sandwich Type */


/* BEGIN Cheese Type */
const promptForCheeseType = (session, results, next) => {
    let luisEntities = session.dialogData.luisEntities;
    let order = session.dialogData.order;

    let match;
    if (luisEntities.cheeseType) {
        match = builder.EntityRecognizer.findBestMatch(_cheeseTypes, luisEntities.cheeseType);
    }

    if (!match) {
        builder.Prompts.choice(session, 'What type of cheese would you like on your sandwich?', _cheeseTypes);
    } else {
        next({
            response: match
        });
    }
};

const intakeCheeseType = (session, results) => {
    session.dialogData.order.cheeseType = results.response.entity;

    session.send('Thanks, I think that we are good!');
};
/* END Cheese Type */


module.exports = [
    initializeOrder,
    intakeName,
    promptForSandwichType,
    intakeSandwichType,
    promptForCheeseType,
    intakeCheeseType
];