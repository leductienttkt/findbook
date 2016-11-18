var request = require('request');
var restify = require('restify');
var builder = require('botbuilder');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
   console.log('%s listening to %s', server.name, server.url);
});

// Create bot and bind to Emulator
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

// Create LUIS recognizer that points at our model and add it as the root '/' dialog for our Cortana Bot.
var model = 'https://api.projectoxford.ai/luis/v1/application?id=f45e0f47-cf80-4347-b916-d7321d79df59&subscription-key=72eae51afb6f4c2e99587987c6af94b8&q=';
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({ recognizers: [recognizer] });

var bookAPI = 'https://www.googleapis.com/books/v1/volumes?q=';

bot.dialog('/', dialog);

// dialog.matches('Greeting', [
//   function (session, args, next) {
//     var title = builder.EntityRecognizer.findEntity(args.entities, 'Hello');
//     var greeting = session.dialogData.greeting = {
//       title: title ? title.entity : null
//     };
//
//     if (ebook.title) {
//       session.send('Hello! What ebooks do you want to find?');
//     }
//
//   }
// ]);

dialog.matches(/^hello/i, [
  function (session) {
    session.send('Hello! What ebooks do you want to find?');
  }
]);

dialog.matches(/^hi/i, [
  function (session) {
    session.send('Hello! What ebooks do you want to find?');
  }
]);

// Add intent handlers
dialog.matches('StartSearching', [
    function (session, args, next) {

        // Resolve and store any entities passed from LUIS.
        var title = builder.EntityRecognizer.findEntity(args.entities, 'EbookName');
        var ebook = session.dialogData.ebook = {
          title: title ? title.entity : null
        };

        // Prompt for title
        if (!ebook.title) {
            builder.Prompts.text(session, 'What would you like to find ebooks?');
        } else {
            next();
        }
    },
    function (session, results, next) {
      var ebook = session.dialogData.ebook;
      request({url: bookAPI + ebook.title, json: true}, function(err, res, ebooks) {
        if (err) {
          throw err;
        }

        var index = 0;

        // return 5 ebooks
        ebooks.items.forEach(function (item) {
          if (index < 5) {
            session.send("Ebook: " + ++index + "\n");
            session.send("Title: " + item.volumeInfo.title);
            session.send("previewLink: " + item.volumeInfo.previewLink);
          }
        });
      });

    }
]);

dialog.onDefault(builder.DialogAction.send("You're asking me too much. I'm a bot!"));
