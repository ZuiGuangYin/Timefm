(function($){
	// Settings
	var repeat = localStorage.repeat || 0,
		shuffle = localStorage.shuffle || 'false',
		continous = true,
		autoplay = true,
		playlist = [
		{
title: '那些年',
artist: '胡夏',
album: '那些年，我们一起追的女孩',
cover: 'http://x.libdd.com/farm1/79cec1/7103dc78/01.jpg',
mp3: 'http://zt-ktv.com/uploadfile/20111019/20111019095946928.mp3',
ogg: 'http://music.k618.cn/yd/gnlx/201211/W020121107852694658444.mp3'
},
{
title: '追梦赤子心',
artist: 'GALA',
album: '追梦赤子心',
cover: 'http://x.libdd.com/farm1/79cec1/bbdf900a/02.jpg',
mp3: 'http://file11.mafengwo.net/M00/26/EE/wKgBpU7oFCqeJExUACb_vzP1mRo453.mp3',
ogg: 'http://220.166.62.60:8080/music/zmczx.mp3'
},
{
title: '滴答',
artist: '侃侃',
album: '《那些年 DSD》',
cover: 'http://x.libdd.com/farm1/79cec1/8b318188/03.jpg',
mp3: 'http://bbsimg.shangdu.com/UserFiles/File/060/61616060/1331202052119.mp3',
ogg: 'http://bbsimg.shangdu.com/UserFiles/File/060/61616060/1331202052119.mp3'
},
{
title: '单车带我去西藏',
artist: '网络',
album: '单车带我去西藏',
cover: 'http://x.libdd.com/farm1/79cec1/bbdf900a/02.jpg',
mp3: 'http://mfiles.sohu.com/tv/bike/bike.mp3',
ogg: 'http://mfiles.sohu.com/tv/bike/bike.mp3'
},
{
title: '故乡',
artist: '许巍',
album: '《那一年》',
cover: 'http://x.libdd.com/farm1/79cec1/bbdf900a/02.jpg',
mp3: 'http://stream18.qqmusic.qq.com/30098593.mp3',
ogg: 'http://stream18.qqmusic.qq.com/30098593.mp3'
},
{
title: '我很丑，可是我很温柔',
artist: '赵传',
album: '《我很丑，可是我很温柔》',
cover: 'http://x.libdd.com/farm1/79cec1/8b318188/03.jpg',
mp3: 'http://shiting3.chaishouji.com:553/mp3/304/303409.mp3',
ogg: 'http://shiting5.chaishouji.com:555/file2/225/224599.mp3'
},
{
title: '青春日记',
artist: '沙宝亮',
album: '《爱上一条鱼》',
cover: 'http://x.libdd.com/farm1/79cec1/8b318188/03.jpg',
mp3: 'http://www.czyeya.com/upload/qcrj.mp3',
ogg: 'http://ftp.guqu.net/yh/yinfu/流行/青春日记.MP3'
},
{
title: '老男孩',
artist: '筷子兄弟',
album: 'Love Story',
cover: 'http://x.libdd.com/farm1/79cec1/bbdf900a/02.jpg',
mp3: 'http://media.static.sdo.com/xcb/xcb_act/201011_mp3/201011.mp3',
ogg: 'http://media.static.sdo.com/xcb/xcb_act/201011_mp3/201011.mp3'
},{
title: '我的好兄弟',
artist: '高进',
album: '原来是这样',
cover: 'http://x.libdd.com/farm1/79cec1/8b318188/03.jpg',
mp3: 'http://gcktv.51mike.com/musicfile/20100926/14272.mp3',
ogg: 'http://gcktv.51mike.com/musicfile/20100926/14272.mp3'
},];

	// Load playlist
	for (var i=0; i<playlist.length; i++){
		var item = playlist[i];
		$('#playlist').append('<li>'+item.artist+' - '+item.title+'</li>');
	}

	var time = new Date(),
		currentTrack = shuffle === 'true' ? time.getTime() % playlist.length : 0,
		trigger = false,
		audio, timeout, isPlaying, playCounts;

	var play = function(){
		audio.play();
		$('.playback').addClass('playing');
		timeout = setInterval(updateProgress, 500);
		isPlaying = true;
	}

	var pause = function(){
		audio.pause();
		$('.playback').removeClass('playing');
		clearInterval(updateProgress);
		isPlaying = false;
	}

	// Update progress
	var setProgress = function(value){
		var currentSec = parseInt(value%60) < 10 ? '0' + parseInt(value%60) : parseInt(value%60),
			ratio = value / audio.duration * 100;

		$('.timer').html(parseInt(value/60)+':'+currentSec);
		$('.progress .pace').css('width', ratio + '%');
		$('.progress .slider a').css('left', ratio + '%');
	}

	var updateProgress = function(){
		setProgress(audio.currentTime);
	}

	// Progress slider
	$('.progress .slider').slider({step: 0.1, slide: function(event, ui){
		$(this).addClass('enable');
		setProgress(audio.duration * ui.value / 100);
		clearInterval(timeout);
	}, stop: function(event, ui){
		audio.currentTime = audio.duration * ui.value / 100;
		$(this).removeClass('enable');
		timeout = setInterval(updateProgress, 500);
	}});

	// Volume slider
	var setVolume = function(value){
		audio.volume = localStorage.volume = value;
		$('.volume .pace').css('width', value * 100 + '%');
		$('.volume .slider a').css('left', value * 100 + '%');
	}

	var volume = localStorage.volume || 0.5;
	$('.volume .slider').slider({max: 1, min: 0, step: 0.01, value: volume, slide: function(event, ui){
		setVolume(ui.value);
		$(this).addClass('enable');
		$('.mute').removeClass('enable');
	}, stop: function(){
		$(this).removeClass('enable');
	}}).children('.pace').css('width', volume * 100 + '%');

	$('.mute').click(function(){
		if ($(this).hasClass('enable')){
			setVolume($(this).data('volume'));
			$(this).removeClass('enable');
		} else {
			$(this).data('volume', audio.volume).addClass('enable');
			setVolume(0);
		}
	});

	// Switch track
	var switchTrack = function(i){
		if (i < 0){
			track = currentTrack = playlist.length - 1;
		} else if (i >= playlist.length){
			track = currentTrack = 0;
		} else {
			track = i;
		}

		$('audio').remove();
		loadMusic(track);
		if (isPlaying == true) play();
	}

	// Shuffle
	var shufflePlay = function(){
		var time = new Date(),
			lastTrack = currentTrack;
		currentTrack = time.getTime() % playlist.length;
		if (lastTrack == currentTrack) ++currentTrack;
		switchTrack(currentTrack);
	}

	// Fire when track ended
	var ended = function(){
		pause();
		audio.currentTime = 0;
		playCounts++;
		if (continous == true) isPlaying = true;
		if (repeat == 1){
			play();
		} else {
			if (shuffle === 'true'){
				shufflePlay();
			} else {
				if (repeat == 2){
					switchTrack(++currentTrack);
				} else {
					if (currentTrack < playlist.length) switchTrack(++currentTrack);
				}
			}
		}
	}

	var beforeLoad = function(){
		var endVal = this.seekable && this.seekable.length ? this.seekable.end(0) : 0;
		$('.progress .loaded').css('width', (100 / (this.duration || 1) * endVal) +'%');
	}

	// Fire when track loaded completely
	var afterLoad = function(){
		if (autoplay == true) play();
	}

	// Load track
	var loadMusic = function(i){
		var item = playlist[i],
			newaudio = $('<audio>').html('<source src="'+item.mp3+'"><source src="'+item.ogg+'">').appendTo('#player');
		
		$('.cover').html('<img src="'+item.cover+'" alt="'+item.album+'">');
		$('.tag').html('<strong>'+item.title+'</strong><span class="artist">'+item.artist+'</span><span class="album">'+item.album+'</span>');
		$('#playlist li').removeClass('playing').eq(i).addClass('playing');
		audio = newaudio[0];
		audio.volume = $('.mute').hasClass('enable') ? 0 : volume;
		audio.addEventListener('progress', beforeLoad, false);
		audio.addEventListener('durationchange', beforeLoad, false);
		audio.addEventListener('canplay', afterLoad, false);
		audio.addEventListener('ended', ended, false);
	}

	loadMusic(currentTrack);
	$('.playback').on('click', function(){
		if ($(this).hasClass('playing')){
			pause();
		} else {
			play();
		}
	});
	$('.rewind').on('click', function(){
		if (shuffle === 'true'){
			shufflePlay();
		} else {
			switchTrack(--currentTrack);
		}
	});
	$('.fastforward').on('click', function(){
		if (shuffle === 'true'){
			shufflePlay();
		} else {
			switchTrack(++currentTrack);
		}
	});
	$('#playlist li').each(function(i){
		var _i = i;
		$(this).on('click', function(){
			switchTrack(_i);
		});
	});

	if (shuffle === 'true') $('.shuffle').addClass('enable');
	if (repeat == 1){
		$('.repeat').addClass('once');
	} else if (repeat == 2){
		$('.repeat').addClass('all');
	}

	$('.repeat').on('click', function(){
		if ($(this).hasClass('once')){
			repeat = localStorage.repeat = 2;
			$(this).removeClass('once').addClass('all');
		} else if ($(this).hasClass('all')){
			repeat = localStorage.repeat = 0;
			$(this).removeClass('all');
		} else {
			repeat = localStorage.repeat = 1;
			$(this).addClass('once');
		}
	});

	$('.shuffle').on('click', function(){
		if ($(this).hasClass('enable')){
			shuffle = localStorage.shuffle = 'false';
			$(this).removeClass('enable');
		} else {
			shuffle = localStorage.shuffle = 'true';
			$(this).addClass('enable');
		}
	});
})(jQuery);