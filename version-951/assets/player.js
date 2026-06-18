import { H as Hls } from "./hls-dru42stk.js";

function setStatus(box, message) {
  const status = box.querySelector("[data-player-status]");
  if (status) {
    status.textContent = message;
  }
}

function hideOverlay(box) {
  const overlay = box.querySelector(".js-play-button");
  if (overlay) {
    overlay.classList.add("is-hidden");
  }
}

function setupPlayer(box) {
  const video = box.querySelector(".js-hls-player");
  const button = box.querySelector(".js-play-button");

  if (!video) {
    return;
  }

  const source = video.dataset.src;
  if (!source) {
    setStatus(box, "未找到播放源");
    return;
  }

  let hlsInstance = null;

  if (Hls.isSupported()) {
    hlsInstance = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hlsInstance.loadSource(source);
    hlsInstance.attachMedia(video);
    hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
      setStatus(box, "播放源已就绪");
    });
    hlsInstance.on(Hls.Events.ERROR, function (_, data) {
      if (!data.fatal) {
        return;
      }

      if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
        setStatus(box, "网络错误，正在重新加载");
        hlsInstance.startLoad();
      } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
        setStatus(box, "媒体错误，正在恢复播放");
        hlsInstance.recoverMediaError();
      } else {
        setStatus(box, "播放器出现未知错误");
        hlsInstance.destroy();
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = source;
    video.addEventListener("loadedmetadata", function () {
      setStatus(box, "播放源已就绪");
    });
  } else {
    setStatus(box, "当前浏览器不支持 HLS 播放");
  }

  async function play() {
    try {
      hideOverlay(box);
      await video.play();
      setStatus(box, "正在播放");
    } catch (error) {
      setStatus(box, "请再次点击播放按钮");
    }
  }

  if (button) {
    button.addEventListener("click", play);
  }

  video.addEventListener("play", function () {
    hideOverlay(box);
    setStatus(box, "正在播放");
  });

  video.addEventListener("pause", function () {
    setStatus(box, "已暂停");
  });

  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

document.querySelectorAll("[data-player-box]").forEach(setupPlayer);
