(function () {
  const bodyPrefix = document.body.dataset.prefix || "";
  const movies = Array.isArray(window.SITE_MOVIES) ? window.SITE_MOVIES : [];

  function withPrefix(url) {
    return bodyPrefix + url;
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function markMissingPoster(img) {
    img.classList.add("is-missing");
    img.removeAttribute("src");
  }

  document.addEventListener(
    "error",
    function (event) {
      const target = event.target;
      if (target && target.matches && target.matches(".js-poster")) {
        markMissingPoster(target);
      }
    },
    true
  );

  function initMobileNav() {
    const toggle = document.querySelector("[data-mobile-toggle]");
    const nav = document.querySelector("[data-mobile-nav]");

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener("click", function () {
      const isHidden = nav.hasAttribute("hidden");
      if (isHidden) {
        nav.removeAttribute("hidden");
      } else {
        nav.setAttribute("hidden", "");
      }
    });
  }

  function initHeroSlider() {
    const slider = document.querySelector("[data-hero-slider]");
    if (!slider) {
      return;
    }

    const slides = Array.from(slider.querySelectorAll(".hero-slide"));
    const dots = Array.from(slider.querySelectorAll("[data-hero-dot]"));
    const prev = slider.querySelector("[data-hero-prev]");
    const next = slider.querySelector("[data-hero-next]");
    let active = 0;
    let timer = null;

    function show(index) {
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === active);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === active);
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        show(active + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.dataset.heroDot || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    show(0);
    restart();
  }

  function renderSearch(panel, query) {
    const keyword = normalize(query);
    if (!keyword) {
      panel.setAttribute("hidden", "");
      panel.innerHTML = "";
      return;
    }

    const results = movies
      .filter(function (movie) {
        return normalize(movie.search).includes(keyword);
      })
      .slice(0, 12);

    if (results.length === 0) {
      panel.innerHTML = '<div class="search-empty">没有找到匹配内容</div>';
      panel.removeAttribute("hidden");
      return;
    }

    panel.innerHTML = results
      .map(function (movie) {
        return (
          '<a class="search-item" href="' +
          withPrefix(movie.url) +
          '">' +
          '<img class="js-poster" src="' +
          withPrefix(movie.cover) +
          '" alt="' +
          movie.title.replace(/"/g, "&quot;") +
          '">' +
          '<span><strong>' +
          movie.title +
          '</strong><span>' +
          movie.region +
          ' · ' +
          movie.type +
          ' · ' +
          movie.year +
          '</span></span></a>'
        );
      })
      .join("");
    panel.removeAttribute("hidden");
  }

  function initGlobalSearch() {
    const forms = Array.from(document.querySelectorAll("[data-global-search-form]"));
    const headerPanel = document.querySelector("[data-search-panel]");

    forms.forEach(function (form) {
      const input = form.querySelector("[data-global-search]");
      const panel = form.querySelector("[data-search-panel]") || headerPanel;

      if (!input || !panel) {
        return;
      }

      input.addEventListener("input", function () {
        renderSearch(panel, input.value);
      });

      input.addEventListener("focus", function () {
        renderSearch(panel, input.value);
      });

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        const keyword = normalize(input.value);
        const first = movies.find(function (movie) {
          return normalize(movie.search).includes(keyword);
        });
        if (first) {
          window.location.href = withPrefix(first.url);
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest("[data-global-search-form]")) {
        document.querySelectorAll("[data-search-panel]").forEach(function (panel) {
          panel.setAttribute("hidden", "");
        });
      }
    });
  }

  function initLocalFilters() {
    document.querySelectorAll("[data-local-filters]").forEach(function (panel) {
      const grid = document.querySelector("[data-card-grid]");
      if (!grid) {
        return;
      }

      const cards = Array.from(grid.querySelectorAll("[data-local-card]"));
      const keywordInput = panel.querySelector("[data-filter-keyword]");
      const yearSelect = panel.querySelector("[data-filter-year]");
      const regionSelect = panel.querySelector("[data-filter-region]");
      const typeSelect = panel.querySelector("[data-filter-type]");
      const countNode = panel.querySelector("[data-filter-count]");

      function apply() {
        const keyword = normalize(keywordInput ? keywordInput.value : "");
        const year = yearSelect ? yearSelect.value : "";
        const region = regionSelect ? regionSelect.value : "";
        const type = typeSelect ? typeSelect.value : "";
        let visible = 0;

        cards.forEach(function (card) {
          const matchesKeyword = !keyword || normalize(card.dataset.search).includes(keyword);
          const matchesYear = !year || card.dataset.year === year;
          const matchesRegion = !region || card.dataset.region === region;
          const matchesType = !type || card.dataset.type === type;
          const shouldShow = matchesKeyword && matchesYear && matchesRegion && matchesType;
          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });

        if (countNode) {
          countNode.textContent = visible + " 部";
        }
      }

      [keywordInput, yearSelect, regionSelect, typeSelect].forEach(function (control) {
        if (control) {
          control.addEventListener("input", apply);
          control.addEventListener("change", apply);
        }
      });

      apply();
    });
  }

  initMobileNav();
  initHeroSlider();
  initGlobalSearch();
  initLocalFilters();
})();
