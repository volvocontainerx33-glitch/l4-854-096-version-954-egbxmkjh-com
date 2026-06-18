var MoviePlayer = (function () {
  var hls = null;

  function attachSource(video, source) {
    if (video.dataset.ready === '1') {
      return;
    }

    video.dataset.ready = '1';

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function start(source) {
    var video = document.getElementById('videoPlayer');
    var overlay = document.getElementById('playOverlay');

    if (!video || !overlay || !source) {
      return;
    }

    function play() {
      attachSource(video, source);
      overlay.classList.add('hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    overlay.addEventListener('click', play);
    video.addEventListener('play', function () {
      overlay.classList.add('hidden');
    });
    video.addEventListener('error', function () {
      if (hls && typeof hls.recoverMediaError === 'function') {
        hls.recoverMediaError();
      }
    });
  }

  return {
    start: start
  };
})();
