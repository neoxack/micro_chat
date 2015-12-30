$(function() {

	var COLORS = [
		'#e21400', '#91580f', '#f8a700', '#f78b00',
		'#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
		'#3b88eb', '#3824aa', '#a700ff', '#d300e7'
	];


	var socket = io();
	var $messages = $('.messages'); 
	var $input = $('.input');
	var $nick =  $('.nick');
	var $form = $("#form");
	var $chatWindow = $('#chat');
	var connected = false;

	window.onbeforeunload = function() {
		return "Эээ. Куда пошёл?";
	};

	function getUsernameColor(username) {
	// Compute hash code
		var hash = 7;
		for (var i = 0; i < username.length; i++) {
			hash = username.charCodeAt(i) + (hash << 5) - hash;
		}
	// Calculate color
		var index = Math.abs(hash % COLORS.length);
		return COLORS[index];
	}

	function getCurrentTime(){
		var now  = new Date();
		return now.toLocaleTimeString();
	}

	function log(text, nickname, event){
		var $msg = $('<div class="msg">');
		var $time = $('<span class="time">').html(getCurrentTime());
		var $user = $('<span class="user">')
			.css('color', getUsernameColor(nickname))
			.html(nickname);
		var $text = $('<span class="text">').html(text);
		if(event){
			$text.addClass('event');
		}

		$msg.append($time);
		$msg.append($user);
		$msg.append($text);
		$messages.append($msg);
		$chatWindow.scrollTop($messages[0].scrollHeight);
	}

	$form.on("submit", function(e) {
		e.preventDefault();
		if(connected){
			var message = $input.val();
			socket.emit('new message', message);
		}else{
			connected = true;
			var nickname = $input.val();
			socket.emit('set nickname', nickname);
			$nick.html(nickname);
		}
		
		$input.val('');
	});

	socket.on('new message', function (data) {
		log(data.message, data.nickname);
	});

	socket.on('user joined', function (user) {
		log('подключился', user, true);
	});

	socket.on('user left', function (data) {
		log('отключился', user, true);
	});
});