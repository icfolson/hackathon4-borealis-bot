'use strict';

/**
 * General messages associated with the entire dialog.
 */

const ConfirmationMessages = {
    misunderstood       : `I'm sorry, I didn't quite catch that.`,
    confirmationThanks  : `Thank you for confirming.`,
};

/**
 * associated with incontinence-hello.js dialog
 */
const AppointmentConfirmationMessages = {
    negative          : 'It is unfortunate that you cannot make the appointment, but we understand.' + 
                          'I\'ll notify the hospital.  Have a great day!',
    positive          : 'We\'re happy you can come in.'
};


module.exports = {
    ConfirmationMessages : ConfirmationMessages,
    AppointmentConfirmationMessages : AppointmentConfirmationMessages
};