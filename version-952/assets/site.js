(function () {
  function toggleMenu() {
    var button = document.querySelector('[data-menu-button]');
    var menu = document.querySelector('[data-mobile-nav]');
    if (!button || !menu) return;
    button.addEventListener('click', function () {
      menu.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) return;
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        render(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        render(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        render(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        render(i);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function setupFilters() {
    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-list]');
    var empty = document.querySelector('[data-empty-state]');
    if (!input || !list) return;
    var items = Array.prototype.slice.call(list.querySelectorAll('[data-search]'));

    function filter() {
      var value = input.value.trim().toLowerCase();
      var visible = 0;
      items.forEach(function (item) {
        var text = (item.getAttribute('data-search') || '').toLowerCase();
        var match = value === '' || text.indexOf(value) !== -1;
        item.classList.toggle('is-hidden', !match);
        if (match) visible += 1;
      });
      if (empty) empty.hidden = visible !== 0;
    }

    input.addEventListener('input', filter);
  }

  document.addEventListener('DOMContentLoaded', function () {
    toggleMenu();
    setupHero();
    setupFilters();
  });
})();
