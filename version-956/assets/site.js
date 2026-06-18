(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileMenu() {
    var toggle = qs('[data-mobile-toggle]');
    var nav = qs('[data-mobile-nav]');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');
    if (!hero) return;
    var slides = qsa('.hero-slide', hero);
    var dots = qsa('[data-hero-dot]', hero);
    if (slides.length < 2) return;
    var index = 0;
    var timer;

    function show(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        play();
      });
    });

    play();
  }

  function initFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var input = qs('[data-filter-input]', scope);
      var region = qs('[data-filter-region]', scope);
      var year = qs('[data-filter-year]', scope);
      var status = qs('[data-filter-status]', scope);
      var cards = qsa('[data-card]', scope);
      var empty = qs('[data-empty]', scope);
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query && input) input.value = query;

      function apply() {
        var keyword = normalize(input ? input.value : '');
        var regionValue = region ? region.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-year'),
            card.getAttribute('data-genre'),
            card.getAttribute('data-tags')
          ].join(' '));
          var passKeyword = !keyword || text.indexOf(keyword) !== -1;
          var passRegion = !regionValue || card.getAttribute('data-region') === regionValue;
          var passYear = !yearValue || card.getAttribute('data-year') === yearValue;
          var pass = passKeyword && passRegion && passYear;
          card.style.display = pass ? '' : 'none';
          if (pass) visible += 1;
        });
        if (status) {
          status.textContent = visible ? '已匹配 ' + visible + ' 部' : '暂无匹配内容';
        }
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }

      [input, region, year].forEach(function (item) {
        if (item) item.addEventListener('input', apply);
        if (item) item.addEventListener('change', apply);
      });
      apply();
    });
  }

  window.initMoviePlayer = function (mediaUrl) {
    var box = qs('[data-player]');
    if (!box) return;
    var video = qs('video', box);
    var cover = qs('[data-player-cover]', box);
    var playButtons = qsa('[data-player-play]', box);
    var muteButton = qs('[data-player-mute]', box);
    var fullButton = qs('[data-player-full]', box);
    var message = qs('[data-player-message]', box);
    var hlsInstance = null;

    function setMessage(text) {
      if (!message) return;
      message.textContent = text || '';
      box.classList.toggle('has-message', Boolean(text));
    }

    function attachMedia() {
      if (!video || !mediaUrl) return;
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(mediaUrl);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
          setMessage('');
        });
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hlsInstance) {
            if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
              hlsInstance.startLoad();
            } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
              hlsInstance.recoverMediaError();
            } else {
              setMessage('视频暂时无法加载，请刷新后重试');
            }
          }
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = mediaUrl;
      } else {
        setMessage('当前设备暂不支持播放');
      }
    }

    function start() {
      if (!video) return;
      var promise = video.play();
      box.classList.add('is-playing');
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          box.classList.remove('is-playing');
        });
      }
    }

    function togglePlay() {
      if (!video) return;
      if (video.paused) {
        start();
      } else {
        video.pause();
        box.classList.remove('is-playing');
      }
    }

    playButtons.forEach(function (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        start();
      });
    });

    if (cover) {
      cover.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('click', togglePlay);
      video.addEventListener('pause', function () {
        box.classList.remove('is-playing');
      });
      video.addEventListener('play', function () {
        box.classList.add('is-playing');
      });
    }

    if (muteButton && video) {
      muteButton.addEventListener('click', function () {
        video.muted = !video.muted;
        muteButton.textContent = video.muted ? '🔇' : '🔊';
      });
    }

    if (fullButton && video) {
      fullButton.addEventListener('click', function () {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        } else if (video.requestFullscreen) {
          video.requestFullscreen();
        }
      });
    }

    attachMedia();
    window.addEventListener('beforeunload', function () {
      if (hlsInstance) hlsInstance.destroy();
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileMenu();
    initHero();
    initFilters();
  });
})();
