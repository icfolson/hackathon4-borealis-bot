'use strict';


const redirector = (session, args, next) => {
    const nextDialog = session.userData.nextDialog;
    if (!nextDialog) {
        console.log(`here`);
        session.beginDialog('/intents');
    }
    session.beginDialog(nextDialog);
};

module.exports = [redirector];