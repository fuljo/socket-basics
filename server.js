var PORT = process.env.PORT || 80;
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var moment = require('moment');

app.use(express.static(__dirname + '/public'));

var clientInfo = {};

//Sends current users to provided socket
function sendCurrentUsers(socket) {
  var info = clientInfo[socket.id];
  var users = [];

  if (typeof info === 'undefined') {
    return;
  }

  Object.keys(clientInfo).forEach(function (socketId) {
    var userInfo = clientInfo[socketId];
    if (info.room === userInfo.room) {
      users.push(userInfo.name);
    }
  });

  socket.emit('message', {
    name: 'System',
    text: 'Current users: ' + users.join(', '),
    timestamp: moment().valueOf()
  })
}

io.on('connection', function (socket) {
  console.log('User connected via socket.io');
  //Disconnection
  socket.on('disconnect', function () {
    var userData = clientInfo[socket.id];
    if (typeof userData !== 'undefined') {
      socket.leave(userData.room);
      io.to(userData.room).emit('message', {
        name: 'System',
        text: userData.name + ' has left!',
        timestamp: moment().valueOf()
      });
      delete clientInfo[socket.id];
    }
  });
  //Join room
  socket.on('joinRoom', function (req) {
    clientInfo[socket.id] = req;
    socket.join(req.room);
    socket.broadcast.to(req.room).emit('message', {
      name: 'System',
      text: req.name + ' joined the chat!',
      timestamp: moment().valueOf()
    });
  });
  //Broadcast message
  socket.on('message', function (message) {
    if (message.text === '@currentUsers') {
      //Log users command
      sendCurrentUsers(socket);
    } else {
      message.timestamp = moment().valueOf();
      io.to(clientInfo[socket.id].room).emit('message', message);
    }
  });
  //Emit welcome message
  socket.emit('message', {
    name: 'System',
    text:'Welcome to the chat application',
    timestamp: moment().valueOf()
  });
});

http.listen(PORT, function () {
  console.log('HTTP listening on port '+ PORT);
});
