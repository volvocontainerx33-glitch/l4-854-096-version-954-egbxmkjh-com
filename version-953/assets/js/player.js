(function () {
  function setupMoviePlayer(options) {
    var video = document.getElementById(options.videoId);
    var overlay = document.getElementById(options.overlayId);
    var state = document.getElementById(options.stateId);
    if (!video || !options.source) {
      return;
    }
    var shell = video.closest(".player-shell");
    var hlsInstance = null;

    function showState(message) {
      if (!state) {
        return;
      }
      state.textContent = message || "";
      state.classList.toggle("is-visible", Boolean(message));
      if (message) {
        window.setTimeout(function () {
          state.classList.remove("is-visible");
        }, 2600);
      }
    }

    function attachSource() {
      if (video.getAttribute("data-ready") === "1") {
        return;
      }
      video.setAttribute("data-ready", "1");
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = options.source;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(options.source);
        hlsInstance.attachMedia(video);
        hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hlsInstance.startLoad();
          } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hlsInstance.recoverMediaError();
          } else {
            showState("视频暂时无法播放");
            hlsInstance.destroy();
          }
        });
      } else {
        showState("视频暂时无法播放");
      }
    }

    function playVideo() {
      attachSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === "function") {
        playPromise.then(function () {
          if (shell) {
            shell.classList.add("is-started");
          }
        }).catch(function () {
          showState("点击播放器开始播放");
        });
      } else if (shell) {
        shell.classList.add("is-started");
      }
    }

    function toggleVideo() {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
      }
    }

    if (overlay) {
      overlay.addEventListener("click", playVideo);
    }

    video.addEventListener("click", toggleVideo);
    video.addEventListener("play", function () {
      if (shell) {
        shell.classList.add("is-started");
      }
    });
    video.addEventListener("pause", function () {
      if (shell && video.currentTime === 0) {
        shell.classList.remove("is-started");
      }
    });
    video.addEventListener("error", function () {
      showState("视频暂时无法播放");
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });

    attachSource();
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
