var PORT = process.env.PORT || 80;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));

io.on('connection', function (socket) {
  console.log('User connected via socket.io');
  //Broadcast message
  socket.on('message', function (message) {
    message.timestamp = moment().valueOf();
    console.log('Message received @ '+ moment.utc(message.timestamp).local().format('h:mm a') + ': ' + message.text);
    io.emit('message', message);
  });
  //Emit welcome message
  socket.emit('message', {
    text:'Welcome to the chat application',
    timestamp: moment().valueOf()
  });
});

http.listen(PORT, function () {
  console.log('HTTP listening on port '+ PORT);
});
