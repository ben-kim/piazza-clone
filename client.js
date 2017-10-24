/* global $, io */

$(document).ready(function () {
  window.socketURL = 'http://localhost:8080';
  window.socket = io(window.socketURL);
  window.socket.on('connect', function () {
    console.log('Connected to server!');
  });

  // helper function create html from a question object
  window.makeQuestion = function (question) {
    var html = '<div data-question-id="' + question.id + '" class="question"><h1>Question ' + '<span class="qid">' + question.id + '</span>' + '</h1><p class="the-question">' +
      question.text + '</p><br><p>Asked by Socket user ID: <span class="socket-user">' +
      question.author + '</p></div><div class="answer"><h1>Answer</h1><p>' +
      '<div class="form-group"><textarea class="form-control" rows="5" id="answer">' +
      question.answer + '</textarea></div></p><button class="btn btn-default" id="update-answer">Add Answer</button></div>';
    return html;
  };

  // helper function create html from a question object
  window.makeQuestionPreview = function (question) {
    var html = [
      '<li data-question-id="' + question.id + '" class="question-preview"><h1><span class="preview-content">' +
      question.text + '</span></h1><p><em>Author: ' + question.author + '</em></p>'
    ];
    html.join('');
    return html;
  };

  // handler to hide the add question modal when the 'close' button is clicke
  $('#closeModal').on('click', function () {
    $('#questionModal').modal('hide');
  });

  // handler to show current questions when first connected
  window.socket.on('here_are_the_current_questions', function (questions) {
    for (var i = 0; i < Object.keys(questions).length; i++) {
      $('.question-list').prepend(window.makeQuestionPreview(questions[i]));
    }
  });

  // listener for submit button
  $('#submitQuestion').on('click', function () {
    var questionText = $('#question-text').val();
    if (questionText.length !== 0) {
      window.socket.emit('add_new_question', { text: questionText });
    }
  });

  // handler to show new question
  window.socket.on('new_question_added', function (question) {
    $('.question-list').prepend(window.makeQuestionPreview(question));
  });

  // listener for expanding a question preview
  $('.question-list').on('click', 'li', function () {
    window.socket.emit('get_question_info', Number($(this).attr('data-question-id')));
  });

  // handler for showing expanded question
  window.socket.on('question_info', function (question) {
    if (question === null) {
      return;
    }
    $('.question-view').html(window.makeQuestion(question));
  });

  // listener for answer button
  $('.question-view').on('click', '#update-answer', function () {
    var answerText = $('#answer').val();
    window.socket.emit('add_answer', { id: Number($('.qid').text()), answer: answerText });
  });

  // handler to show updated answer
  window.socket.on('answer_added', function (update) {
    if (Number($('.qid').text()) === update.id) {
      $('#answer').text(update.answer);
    }
  });

});