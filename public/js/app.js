var name = getQueryVariable('name') || 'Anonymous';
var room = getQueryVariable('room');
var socket = io();

socket.on('connect', function () {
  console.log('Connected to socket.io server');
});

socket.on('message', function (message) {
  console.log('New message: ');
  console.log(message.text);
  var $message = jQuery('.messages');
  $message.append('<p><strong>'+ message.name + ' '
  + moment.utc(message.timestamp).local().format('h:mm a') + '</strong></p>');
  $message.append('<p>' + message.text + '</p>');
});

// Handles submitting a new message
var $form = jQuery('#message-form');

$form.on('submit', function (event) {
  event.preventDefault();
  var $message = $form.find('input[name=message]')
  socket.emit('message', {
    name: name,
    text: $message.val()
  });
  $message.val('');
});
