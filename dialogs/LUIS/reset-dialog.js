'use strict';

const reset = (session, args, next) => {
    if (session.userData.flags){
        const flags = session.userData.flags;
        flags.greeting = false;
        flags.what = false;
        flags.volume = false;
        flags.symptoms = false;
        flags.selfMeds = false;
        flags.frequency = false;
        flags.cause = false;
    };
    session.endDialog(`Dialog reset`);
};

module.exports = [reset];