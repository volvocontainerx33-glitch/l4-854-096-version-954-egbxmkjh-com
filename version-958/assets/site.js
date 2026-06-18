(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('open');
    });
  }

  var slider = document.querySelector('[data-hero-slider]');

  if (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var prev = slider.querySelector('[data-hero-prev]');
    var next = slider.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === current);
      });
    }

    function go(step) {
      show(current + step);
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        go(1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        go(-1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        go(1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function filterCards(panel) {
    var list = document.querySelector('[data-movie-list]');
    if (!list) {
      return;
    }

    var input = panel.querySelector('[data-page-search]');
    var yearSelect = panel.querySelector('[data-year-select]');
    var categorySelect = panel.querySelector('[data-category-select]');
    var activeYearButton = panel.querySelector('[data-filter-year].active');
    var query = normalize(input ? input.value : '');
    var year = yearSelect ? yearSelect.value : (activeYearButton ? activeYearButton.getAttribute('data-filter-year') : '');
    var category = categorySelect ? categorySelect.value : '';
    var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));

    cards.forEach(function (card) {
      var haystack = normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-keywords'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.textContent
      ].join(' '));
      var matchQuery = !query || haystack.indexOf(query) > -1;
      var matchYear = !year || card.getAttribute('data-year') === year;
      var matchCategory = !category || card.textContent.indexOf(category) > -1;
      card.classList.toggle('is-hidden', !(matchQuery && matchYear && matchCategory));
    });
  }

  var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));

  panels.forEach(function (panel) {
    var searchInput = panel.querySelector('[data-page-search]');
    var yearSelect = panel.querySelector('[data-year-select]');
    var categorySelect = panel.querySelector('[data-category-select]');
    var yearButtons = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-year]'));

    if (searchInput) {
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q');
      if (query) {
        searchInput.value = query;
      }
      searchInput.addEventListener('input', function () {
        filterCards(panel);
      });
    }

    if (yearSelect) {
      yearSelect.addEventListener('change', function () {
        filterCards(panel);
      });
    }

    if (categorySelect) {
      categorySelect.addEventListener('change', function () {
        filterCards(panel);
      });
    }

    yearButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        yearButtons.forEach(function (item) {
          item.classList.remove('active');
        });
        button.classList.add('active');
        filterCards(panel);
      });
    });

    filterCards(panel);
  });
})();
