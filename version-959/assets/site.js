(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileMenu = document.querySelector('[data-mobile-menu]');
  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', function () {
      mobileMenu.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  if (slides.length) {
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var showSlide = function (index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, position) {
        slide.classList.toggle('is-active', position === current);
      });
      dots.forEach(function (dot, position) {
        dot.classList.toggle('is-active', position === current);
      });
    };
    var nextButton = document.querySelector('[data-hero-next]');
    var prevButton = document.querySelector('[data-hero-prev]');
    if (nextButton) {
      nextButton.addEventListener('click', function () {
        showSlide(current + 1);
      });
    }
    if (prevButton) {
      prevButton.addEventListener('click', function () {
        showSlide(current - 1);
      });
    }
    dots.forEach(function (dot, position) {
      dot.addEventListener('click', function () {
        showSlide(position);
      });
    });
    showSlide(0);
    window.setInterval(function () {
      showSlide(current + 1);
    }, 6500);
  }

  var lists = Array.prototype.slice.call(document.querySelectorAll('[data-search-list]'));
  if (lists.length) {
    var input = document.querySelector('[data-filter-input]');
    var select = document.querySelector('[data-filter-select]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input && query) {
      input.value = query;
    }
    var applyFilter = function () {
      var keyword = input ? input.value.trim().toLowerCase() : '';
      var category = select ? select.value : 'all';
      lists.forEach(function (list) {
        Array.prototype.slice.call(list.querySelectorAll('[data-card]')).forEach(function (card) {
          var text = (card.getAttribute('data-title') || '').toLowerCase();
          var cardCategory = card.getAttribute('data-category') || '';
          var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
          var matchCategory = category === 'all' || category === cardCategory;
          card.classList.toggle('hidden-card', !(matchKeyword && matchCategory));
        });
      });
    };
    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (select) {
      select.addEventListener('change', applyFilter);
    }
    applyFilter();
  }

  var frame = document.querySelector('[data-player]');
  if (frame) {
    var video = frame.querySelector('video');
    var startButton = frame.querySelector('.player-start');
    var stream = frame.getAttribute('data-stream') || '';
    var hlsItem = null;
    var loadVideo = function () {
      if (!video || !stream || video.getAttribute('data-ready') === '1') {
        return;
      }
      video.setAttribute('data-ready', '1');
      if (window.Hls && window.Hls.isSupported()) {
        hlsItem = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsItem.loadSource(stream);
        hlsItem.attachMedia(video);
      } else {
        video.src = stream;
      }
    };
    var startVideo = function () {
      loadVideo();
      if (video) {
        var playResult = video.play();
        if (playResult && typeof playResult.catch === 'function') {
          playResult.catch(function () {});
        }
      }
    };
    if (startButton) {
      startButton.addEventListener('click', startVideo);
    }
    if (video) {
      video.addEventListener('play', function () {
        frame.classList.add('is-playing');
      });
      video.addEventListener('click', function () {
        if (video.paused) {
          startVideo();
        }
      });
      video.addEventListener('ended', function () {
        frame.classList.remove('is-playing');
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsItem) {
        hlsItem.destroy();
      }
    });
  }
})();
