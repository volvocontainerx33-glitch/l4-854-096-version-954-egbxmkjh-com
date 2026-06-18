(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearchPanel() {
    var button = document.querySelector("[data-search-toggle]");
    var panel = document.querySelector("[data-search-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
      var input = panel.querySelector("input");
      if (panel.classList.contains("is-open") && input) {
        input.focus();
      }
    });
  }

  function setupCardSearch() {
    var inputs = document.querySelectorAll("[data-card-search]");
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        var scope = input.closest("[data-search-scope]") || document;
        var cards = scope.querySelectorAll(".movie-card, .rank-item");
        var query = input.value.trim().toLowerCase();
        var visibleCount = 0;
        cards.forEach(function (card) {
          var text = (card.getAttribute("data-title") || card.textContent || "").toLowerCase();
          var matched = text.indexOf(query) !== -1;
          card.style.display = matched ? "" : "none";
          if (matched) {
            visibleCount += 1;
          }
        });
        var empty = scope.querySelector("[data-no-results]");
        if (empty) {
          empty.classList.toggle("is-visible", visibleCount === 0);
        }
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll(".hero-dot"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5600);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  window.initMoviePlayer = function (streamUrl, posterUrl) {
    var video = document.getElementById("movie-player");
    var cover = document.querySelector("[data-player-cover]");
    var buttons = document.querySelectorAll("[data-player-play]");
    var hlsInstance = null;
    var attached = false;

    if (!video) {
      return;
    }

    if (posterUrl) {
      video.setAttribute("poster", posterUrl);
      if (cover) {
        cover.style.backgroundImage = "linear-gradient(180deg, rgba(2, 6, 23, 0.14), rgba(0, 0, 0, 0.78)), url('" + posterUrl + "')";
      }
    }

    function attachStream() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function playVideo() {
      attachStream();
      if (cover) {
        cover.classList.add("is-hidden");
      }
      video.controls = true;
      var attempt = video.play();
      if (attempt && typeof attempt.catch === "function") {
        attempt.catch(function () {
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        playVideo();
      });
    });

    if (cover) {
      cover.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", function () {
      if (cover) {
        cover.classList.add("is-hidden");
      }
    });

    video.addEventListener("ended", function () {
      if (cover) {
        cover.classList.remove("is-hidden");
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };

  ready(function () {
    setupMenu();
    setupSearchPanel();
    setupCardSearch();
    setupHero();
  });
}());
