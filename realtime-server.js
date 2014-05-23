var io = require('socket.io').listen(parseInt(process.env.PORT) || 5001);
if (process.env.REDISTOGO_URL) {
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);
  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require('redis').createClient();
}

redis.subscribe('rt-change');
redis.on('message', function(channel, message){
  if(message.room) {
    io.sockets.in(message.room).emit('rt-change', message);
  } else {
    io.sockets.emit('rt-change', message);
  }
});

io.sockets.on('connection', function(socket){
  socket.on('subscribe', function(data) { socket.join(data); })
  socket.on('unsubscribe', function(data) { socket.leave(data); })
});
