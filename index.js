var express = require('express')();
var http = require('http').Server(express);
var io = require('socket.io')(http);

// users online
var users = {};

express.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

express.get('/style.css', function(req, res){
  res.sendFile(__dirname + '/style.css');
});

io.on('connection', function(socket){
    console.log('a user connected');
    // on connection -> greet everyone    
    //socket.emit('control', {control: 'new ID'});  // response to socket emiter
    //io.emit('control', {control: 'new user say: Hi!!'});  // emite to everyone
    //socket.broadcast.emit('control', {control: 'New user connected'}); // emite to everyone except socket emiter

    socket.on('nick selector', function(n){
      if (n) {
        var found = false;
        Object.keys(users).forEach(function (id) {
          if (users[id].nick === n) {
            socket.emit('nick selector', 'Duplicate nick.');  // response to socket emiter      
            found = true;
          }
        });      
        if (!found) {
          users[socket.id] = {nick: n};
          socket.broadcast.emit('control', {control: n + ' connected'}); // emite to everyone except socket emiter
          io.emit('users', users); // emite to everyone except socket emiter
          socket.emit('nick selector', 'OK');//{control: 'new ID'});  // response to socket emiter              
        }
      }
      else {
        socket.emit('nick selector', 'No valid nick.');  // response to socket emiter      
      }
    });

    socket.on('chat message', function(msg){
      var nick = '';
      if (users[socket.id])
        nick = users[socket.id].nick;
      socket.broadcast.emit('chat message', nick + ': ' + msg);  // emite to everyone except socket emiter
      //io.emit('chat message', msg);
    });

    socket.on('disconnect', function(){      
      console.log('user disconnected');      
      // on disconnection -> bye everyone    
      //io.emit('control', {control: 'user say: Bye!!'});
      if (users[socket.id]) {
        socket.broadcast.emit('control', {control: users[socket.id].nick + ' disconnected'}); // emite to everyone except socket emiter              
        delete users[socket.id];
        socket.broadcast.emit('users', users); // emite to everyone except socket emiter
      }
    });
  });

http.listen(3000, function(){
  console.log('listening on *:3000');
});