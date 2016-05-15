var builder = require('botbuilder');

const sayHello = (session) => {
    session.send('We have the following types of cheese ...');
}

module.exports = [
    sayHello
];