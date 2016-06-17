# "Incontinence Breakfast" Bot

This is a node bot to handle the medical "doorhandle" conversation 
surrounding incontinence.  The idea is that a patient can talk to this 
bot to disclose issues regarding incontinence, and that information
can be forwarded to the doctor.  


### Code Overview and Flow
---

Our bot has several dialogs attached to various paths.  For instance,
a `greetingDialog` is associated with the path `'/greeting'`.  Additional dialogs
can be associated with different paths as with the following line:

```javascript
// in server.js
bot.add('/greeting', greetingDialog);
```

Our `LuisDialog` (see documentation referenced below) handles specific intents by passing information off to various dialogs using the following line:

```javascript
// in server.js
luisDialog.on(LuisIntents.greeting, '/greeting');

```

Developers may add a dialog module that uses "waterfalls" to help
navigate a user through a dialog and acquire any information that LUIS was
unable to contain.  A template of such a dialog can be found in `incontinence-hello.js`.

* Note that at the end of every dialog, we send a question and redirect to the root
branch so that LUIS may interpret the answer.  LUIS then categorizes this answer
with an intent and invokes the beginning of another dialog.

For example, say we want to know what type of incontinence the user is experiencing.
We can take the following steps:

1. create a dialog under a file named `incontinence-type.js`
2. associate this dialog with a path called `'/getType'`
3. associate a LUIS intent with a path called `'/getType'`

Once we are confident that we have the type of incontinence, we may want to ask frequency.
We send a message in the final step of the our "incontinence-type" dialog with 

```javascript
session.endDialog(...); 
```

This gives control back to LUIS and allows him to interpret the response.
A logical user would respond accordingly. LUIS, if trained to do so,
can associate that number with an intent (e.g. `incontinence.frequency`), which would
then fire off a new dialog we created.

### Documentation
---

For further information, see the following links:

* [LUIS Overview with Example Dialog](http://docs.botframework.com/builder/node/guides/understanding-natural-language/)
* [BotBuilder SDK Reference](http://docs.botframework.com/sdkreference/nodejs/modules/_botbuilder_d_.html)
* [LUIS Login](https://www.luis.ai)
* [BotBuilder Overview](http://docs.botframework.com)