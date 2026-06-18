(function () {
  function setupPlayer(player) {
    var video = player.querySelector('video[data-stream]');
    var cover = player.querySelector('[data-play-trigger]');
    var playToggle = player.querySelector('[data-play-toggle]');
    var muteToggle = player.querySelector('[data-mute-toggle]');
    var fullscreenToggle = player.querySelector('[data-fullscreen-toggle]');
    var message = player.querySelector('[data-player-message]');
    var stream = video ? video.getAttribute('data-stream') : '';
    var attached = false;
    var hls = null;

    if (!video || !stream) return;

    function showMessage(text) {
      if (!message) return;
      message.textContent = text;
      message.hidden = false;
    }

    function attachStream() {
      if (attached) return;
      attached = true;
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) return;
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
          } else {
            showMessage('视频暂时无法加载');
          }
        });
      } else {
        showMessage('视频暂时无法加载');
      }
    }

    function updateButtons() {
      var label = video.paused ? '播放' : '暂停';
      if (playToggle) playToggle.textContent = label;
      if (muteToggle) muteToggle.textContent = video.muted ? '取消静音' : '静音';
    }

    function playVideo() {
      attachStream();
      player.classList.add('is-ready');
      if (cover) cover.hidden = true;
      video.setAttribute('controls', 'controls');
      var action = video.play();
      if (action && typeof action.catch === 'function') {
        action.catch(function () {
          showMessage('点击播放器继续观看');
        });
      }
      updateButtons();
    }

    function togglePlay() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
        updateButtons();
      }
    }

    if (cover) cover.addEventListener('click', playVideo);
    if (playToggle) playToggle.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('play', updateButtons);
    video.addEventListener('pause', updateButtons);

    if (muteToggle) {
      muteToggle.addEventListener('click', function () {
        video.muted = !video.muted;
        updateButtons();
      });
    }

    if (fullscreenToggle) {
      fullscreenToggle.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (player.requestFullscreen) {
          player.requestFullscreen();
        }
      });
    }

    window.addEventListener('beforeunload', function () {
      if (hls) hls.destroy();
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(setupPlayer);
  });
})();
