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

// application data stored on the central server 
// TODO: move to full-scale database
var questions = {};
var nextId = Object.keys(questions).length;

socketServer.on('connection', function (socket) {
  // when connected, show current questions to client
  socket.emit('here_are_the_current_questions', questions);

  // update questions object
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

  // return question associated with given id
  socket.on('get_question_info', function (id) {
    if (typeof questions[id] === 'undefined') {
      socket.emit('question_info', null);
    } else {
      socket.emit('question_info', questions[id]);
    }
  });

  // broadcast update answer to all other clients
  socket.on('add_answer', function (update) {
    questions[update.id].answer = update.answer;
    socket.broadcast.emit('answer_added', questions[update.id]);
  });

});

