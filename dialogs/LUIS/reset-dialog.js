'use strict';

const reset = (session, args, next) => {
    session.userData.flags = {};
    const flags = session.userData.flags;
        flags.greeting = true;
        flags.what = false;
        flags.volume = false;
        flags.symptoms = false;
        flags.selfMedication = false;
        flags.frequency = false;
        flags.cause = false;
    session.endDialog(`The dialog has been reset.`);
};

module.exports = [reset];