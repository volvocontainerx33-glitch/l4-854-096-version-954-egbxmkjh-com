(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var menu = document.querySelector("[data-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("is-open");
        });
    }

    function setupHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        if (slides.length === 0) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-search"));
        inputs.forEach(function (input) {
            var scope = input.closest("section") || document;
            var items = Array.prototype.slice.call(scope.querySelectorAll(".movie-card, .rank-row"));
            input.addEventListener("input", function () {
                var value = input.value.trim().toLowerCase();
                items.forEach(function (item) {
                    var text = ((item.getAttribute("data-title") || "") + " " + (item.getAttribute("data-meta") || "")).toLowerCase();
                    item.classList.toggle("is-hidden", value.length > 0 && text.indexOf(value) === -1);
                });
            });
        });
    }

    function setupQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q");
        if (!query) {
            return;
        }
        var input = document.querySelector(".js-search");
        if (!input) {
            return;
        }
        input.value = query;
        input.dispatchEvent(new Event("input"));
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupQuerySearch();
    });
})();
