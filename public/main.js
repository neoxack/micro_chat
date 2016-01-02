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

	function logPreview(data, nickname){
		var $msg = $('<div class="msg">');
		var $time = $('<span class="time">').html(getCurrentTime());
		var $user = $('<span class="user">')
			.css('color', getUsernameColor(nickname))
			.html(nickname);
		
		var $previewTable = $('<table cellpadding="0" cellspacing="0" class="page_media_thumbed_table">');
		var template = `<tbody><tr>
			<td href="${data.url}" target="_blank" onclick="window.open(this.getAttribute('href'), '_blank');" style="background-image: url(${data.thumbnail_url});" class="page_media_link_thumb">
    		</td>
			<td class="page_media_link_desc_td">
				<div class="page_media_link_desc_wrap ">
					<a href="${data.url}" target="_blank" class="page_media_link_title">${data.title}</a>
					<div class="page_media_link_addr">${data.provider_url}</div>
					<div class="page_media_link_desc">${data.description}</div>
				</div>
    		</td>
    	</tr></tbody>`;
    	$previewTable.html(template);

		$msg.append($time);
		$msg.append($user);
		$msg.append($previewTable);
		$messages.append($msg);
		$chatWindow.scrollTop($messages[0].scrollHeight);
	}

	function log(text, nickname, event){
		var $msg = $('<div class="msg">');
		var $time = $('<span class="time">').html(getCurrentTime());
		var $user = $('<span class="user">')
			.css('color', getUsernameColor(nickname))
			.html(nickname);
		var $text = $('<span class="text">').text(text);
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

	function isLink(str){
		var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
		return urlRegex.test(str);
	}

	function getPreview(url, callback){
		var link = 'http://api.embed.ly/1/oembed?key=0242d929b9b546f09796064ac23d26d2&url='+url;
		$.get(link, callback);
	}

	socket.on('new message', function (data) {
		if(isLink(data.message)){
			getPreview(data.message, function(d){
				console.log(d);
				logPreview(d, data.nickname);
			});
		}
		else
			log(data.message, data.nickname);
	});

	socket.on('user joined', function (user) {
		log('подключился', user, true);
	});

	socket.on('user left', function (user) {
		log('отключился', user, true);
	});
});