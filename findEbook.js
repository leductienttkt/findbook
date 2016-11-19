var logger = require('morgan');
var http = require('http');
var bodyParser = require('body-parser');
var express = require('express');
var router = express();
var builder = require('botbuilder');
var request = require('request');
var restify = require('restify');

var app = express();
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
var server = http.createServer(app);
var request = require("request");

var bookAPI = 'https://www.googleapis.com/books/v1/volumes?q=';

app.get('/', (req, res) => {
  res.send("Home page. Server running okay.");
});

// Ðây là ðo?n code ð? t?o Webhook
app.get('/webhook', function(req, res) {
  if (req.query['hub.verify_token'] === 'tiendien35') {
    res.send(req.query['hub.challenge']);
  }
  res.send('Error, wrong validation token');
});

// X? l? khi có ngý?i nh?n tin cho bot
app.post('/webhook', function(req, res) {
  var entries = req.body.entry;
  for (var entry of entries) {
    var messaging = entry.messaging;
    for (var message of messaging) {
      var senderId = message.sender.id;
      if (message.message) {
        // If user send text
        if (message.message.text) {
          var text = message.message.text;
          console.log(text); // In tin nh?n ngý?i dùng
          sendMessage(senderId, text);
        }
      }
    }
  }

  res.status(200).send("OK");
});


// G?i thông tin t?i REST API ð? tr? l?i
/*function sendMessage(senderId, message) {
	  
	 var kq = "jang";
	 request({url: bookAPI + message, json: true}, function(err, res, ebooks) {
        if (err) {
          throw err;
        }

        var index = 0;

        // return 5 ebooks
        ebooks.items.forEach(function (item) {
          if (index < 5) {
			  index++;
			  request({
				url: 'https://graph.facebook.com/v2.6/me/messages',
				qs: {
					access_token: "EAAId4GRfo2kBAMl642JQDzZB0bRXOolKl3xq76IO1A5kp6HPCg0wH41vRbDtU9p4sILBRtbNGC4twVCkS9f4PXhGHbBTYFkHlTCqDUMteLhYVI6Vdg7drJbjZC5B2pRlt5orzdAZBX2ABP8pk2ZCDMfiOrdheNKHZBgVZC5B1KwgZDZD",
					},
					method: 'POST',
					json: {
					recipient: {
							id: senderId
					},
					message: {
							text: item.volumeInfo.title
					},
				}
				});
			}
        });
      });  
	
}*/

function sendMessage(senderId, where) {
	  
	 //var kq = "jang";
	 request({url: "http://api.openweathermap.org/data/2.5/weather?q="+where+"&appid=e254547bde07039221451d1862e383ca", json: true}, function(err, res, wt) {
        if (err) {
          throw err;
        }
		var kq = "ko tim thay";//
		var a ="";
		var dateObj = new Date(parseInt(wt.dt)*1000);
		
        try{
			var i = 0;
			
			
        
							kq = wt.name +"\n\n" 
				
							+ "Nhiệt độ hiện tại: " + (parseInt(wt.main.temp) -273)  + " độ C \n"
							+ "Nhiệt độ tối đa: " + (parseInt(wt.main.temp_min) -273)  + " độ C \n"
							+ "Nhiệt độ tối thiểu: " +(parseInt(wt.main.temp_max) -273)  + " độ C \n"
							+ "Độ ẩm: " + wt.main.humidity +" % \n"
							+ "Tốc độ gió: " + wt.wind.speed +" m/s \n"
							+ "Mây che phủ: " + wt.clouds.all +" % \n"
							+ "Tầm nhìn xa: " + wt.visibility +" m \n"
		}
		catch(e)
		{
			kq = "ko tim thay!";
		}
		
		request({
			url: 'https://graph.facebook.com/v2.6/me/messages',
			qs: {
				access_token: "EAAId4GRfo2kBAMl642JQDzZB0bRXOolKl3xq76IO1A5kp6HPCg0wH41vRbDtU9p4sILBRtbNGC4twVCkS9f4PXhGHbBTYFkHlTCqDUMteLhYVI6Vdg7drJbjZC5B2pRlt5orzdAZBX2ABP8pk2ZCDMfiOrdheNKHZBgVZC5B1KwgZDZD",
				},
				method: 'POST',
				json: {
					recipient: {
							id: senderId
					},
					message: {
							text: kq
							//
					},
				}
      });  
	}); 
}



app.set('port', process.env.OPENSHIFT_NODEJS_PORT || process.env.PORT || 3002);
app.set('ip', process.env.OPENSHIFT_NODEJS_IP || process.env.IP || "0.0.0.0");

server.listen(app.get('port'), app.get('ip'), function() {
  console.log("Chat bot server listening at %s:%d ", app.get('ip'), app.get('port'));
})

