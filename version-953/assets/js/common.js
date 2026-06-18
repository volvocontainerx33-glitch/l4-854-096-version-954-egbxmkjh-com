(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
      return;
    }
    document.addEventListener("DOMContentLoaded", fn);
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

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

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function setupFilter() {
    var input = document.querySelector("[data-filter-input]");
    var select = document.querySelector("[data-sort-select]");
    var grid = document.querySelector("[data-card-grid]");
    if (!grid) {
      return;
    }
    var cards = Array.prototype.slice.call(grid.querySelectorAll(".movie-card"));
    var original = cards.slice();

    function textOf(card) {
      return [
        card.getAttribute("data-title") || "",
        card.getAttribute("data-region") || "",
        card.getAttribute("data-year") || "",
        card.getAttribute("data-genre") || "",
        card.textContent || ""
      ].join(" ").toLowerCase();
    }

    function applyFilter() {
      var query = input ? input.value.trim().toLowerCase() : "";
      cards.forEach(function (card) {
        var matched = !query || textOf(card).indexOf(query) !== -1;
        card.classList.toggle("is-hidden", !matched);
      });
    }

    function applySort() {
      var mode = select ? select.value : "default";
      var sorted = original.slice();
      if (mode === "year-desc") {
        sorted.sort(function (a, b) {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        });
      } else if (mode === "year-asc") {
        sorted.sort(function (a, b) {
          return Number(a.getAttribute("data-year")) - Number(b.getAttribute("data-year"));
        });
      } else if (mode === "title") {
        sorted.sort(function (a, b) {
          return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
        });
      }
      sorted.forEach(function (card) {
        grid.appendChild(card);
      });
      cards = sorted;
      applyFilter();
    }

    if (input) {
      input.addEventListener("input", applyFilter);
    }
    if (select) {
      select.addEventListener("change", applySort);
    }
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupFilter();
  });
})();
