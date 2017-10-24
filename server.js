// The below code creates a simple HTTP server with the NodeJS `http` module,
// and makes it able to handle websockets. However, currently it does not
// actually have any websocket functionality - that part is your job!

var http = require('http');
var io = require('socket.io');

var requestListener = function (request, response) {
  response.writeHead(200);
  response.end('Hello, World!\n');
};

var server = http.createServer(requestListener);

server.listen(8080, function () {
  console.log('Server is running...');
});

var socketServer = io(server);

// This is the object that will keep track of all the current questions in the server.
// It can be considered to be the (in-memory) database of the application.
var questions = {};
var nextId = Object.keys(questions).length;

// Your code goes here:

socketServer.on('connection', function (socket) {
  socket.emit('here_are_the_current_questions', questions);

  socket.on('add_new_question', function (question) {
    questions[nextId] = {
      text: question.text,
      answer: '',
      author: socket.id,
      id: nextId
    };
    socketServer.emit('new_question_added', questions[nextId]);
    nextId++;
  });

  socket.on('get_question_info', function (id) {
    if (typeof questions[id] === 'undefined') {
      socket.emit('question_info', null);
    } else {
      socket.emit('question_info', questions[id]);
    }
  });

  socket.on('add_answer', function (update) {
    questions[update.id].answer = update.answer;
    socket.broadcast.emit('answer_added', questions[update.id]);
  });

});

