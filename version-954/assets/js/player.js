(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function initPlayer() {
        var player = document.querySelector("[data-player]");
        if (!player) {
            return;
        }
        var video = player.querySelector("video");
        var button = player.querySelector("[data-play-button]");
        var status = player.querySelector("[data-player-status]");
        if (!video) {
            return;
        }
        var stream = video.getAttribute("data-video");
        var hls = null;
        function setStatus(message) {
            if (status) {
                status.textContent = message || "";
            }
        }
        function bindStream() {
            if (!stream) {
                setStatus("暂无可用线路");
                return;
            }
            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    setStatus("");
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        setStatus("网络连接异常，正在重新载入");
                        hls.startLoad();
                    } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        setStatus("媒体解析异常，正在恢复");
                        hls.recoverMediaError();
                    } else {
                        setStatus("播放暂时不可用");
                        hls.destroy();
                    }
                });
            } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                setStatus("");
            } else {
                video.src = stream;
                setStatus("当前设备可能无法直接解析该视频格式");
            }
        }
        function playToggle() {
            if (video.paused) {
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        setStatus("点击视频控制栏继续播放");
                    });
                }
            } else {
                video.pause();
            }
        }
        if (button) {
            button.addEventListener("click", playToggle);
        }
        video.addEventListener("play", function () {
            player.classList.add("is-playing");
        });
        video.addEventListener("pause", function () {
            player.classList.remove("is-playing");
        });
        video.addEventListener("ended", function () {
            player.classList.remove("is-playing");
        });
        bindStream();
        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
            }
        });
    }

    ready(initPlayer);
})();
