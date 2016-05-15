var builder = require('botbuilder');

const checkSandwichType = (session, args, next) => {
    let sandwichType = builder.EntityRecognizer.findEntity(args.entities, 'jarvis.sandwich.type');

    //check the score?
    let order = session.dialogData.order = {
        sandwichType: sandwichType && sandwichType.score > .9 ? sandwichType.entity : null
    };
    
    

    builder.Prompts.text(session, 'Hi! What is your name?' + order.sandwichType);
};

const sayHello = (session, results) => {
    session.send('Hello %s!', results.response);
}

module.exports = [
    checkSandwichType,
    sayHello
];