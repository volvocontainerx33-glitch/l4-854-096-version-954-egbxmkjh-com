const menuButton = document.querySelector('[data-menu-toggle]');
const mobileNav = document.querySelector('[data-mobile-nav]');

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    mobileNav.classList.toggle('is-open');
  });
}

const hero = document.querySelector('[data-hero]');

if (hero) {
  const slides = Array.from(hero.querySelectorAll('[data-hero-slide]'));
  const dots = Array.from(hero.querySelectorAll('[data-hero-dot]'));
  const nextButton = hero.querySelector('[data-hero-next]');
  const prevButton = hero.querySelector('[data-hero-prev]');
  let current = 0;
  let timer = null;

  const showSlide = (index) => {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, itemIndex) => {
      slide.classList.toggle('is-active', itemIndex === current);
    });
    dots.forEach((dot, itemIndex) => {
      dot.classList.toggle('is-active', itemIndex === current);
    });
  };

  const restart = () => {
    window.clearInterval(timer);
    timer = window.setInterval(() => showSlide(current + 1), 5200);
  };

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      showSlide(Number(dot.dataset.heroDot || 0));
      restart();
    });
  });

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showSlide(current + 1);
      restart();
    });
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showSlide(current - 1);
      restart();
    });
  }

  restart();
}

const setupFilters = () => {
  const scopes = document.querySelectorAll('[data-filter-scope]');

  scopes.forEach((scope) => {
    const search = scope.querySelector('[data-filter-search]');
    const typeSelect = scope.querySelector('[data-filter-type]');
    const regionSelect = scope.querySelector('[data-filter-region]');
    const yearSelect = scope.querySelector('[data-filter-year]');
    const count = scope.querySelector('[data-filter-count]');
    const cards = Array.from(scope.querySelectorAll('[data-card]'));
    const params = new URLSearchParams(window.location.search);

    if (search && params.get('q')) {
      search.value = params.get('q');
    }

    const apply = () => {
      const q = (search?.value || '').trim().toLowerCase();
      const type = typeSelect?.value || '';
      const region = regionSelect?.value || '';
      const year = yearSelect?.value || '';
      let visible = 0;

      cards.forEach((card) => {
        const text = [card.dataset.title, card.dataset.genre, card.dataset.region, card.dataset.type, card.dataset.year]
          .join(' ')
          .toLowerCase();
        const matched = (!q || text.includes(q))
          && (!type || card.dataset.type === type)
          && (!region || card.dataset.region === region)
          && (!year || card.dataset.year === year);

        card.classList.toggle('is-hidden-card', !matched);
        if (matched) {
          visible += 1;
        }
      });

      if (count) {
        count.textContent = `当前显示 ${visible} 部作品`;
      }
    };

    [search, typeSelect, regionSelect, yearSelect].forEach((field) => {
      if (field) {
        field.addEventListener('input', apply);
        field.addEventListener('change', apply);
      }
    });

    apply();
  });
};

setupFilters();

const setupPlayers = () => {
  const players = document.querySelectorAll('[data-player]');
  let hlsModulePromise = null;

  const getHls = async () => {
    if (!hlsModulePromise) {
      hlsModulePromise = import('./hls.js');
    }
    const module = await hlsModulePromise;
    return module.H || module.default || window.Hls;
  };

  players.forEach((player) => {
    const video = player.querySelector('video');
    const overlay = player.querySelector('[data-play-overlay]');
    let loaded = false;
    let hlsInstance = null;

    const loadSource = async () => {
      if (loaded || !video) {
        return;
      }

      loaded = true;
      const source = video.dataset.videoSource || '';

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
        return;
      }

      const Hls = await getHls();

      if (Hls && Hls.isSupported()) {
        hlsInstance = new Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else {
        video.src = source;
      }
    };

    const play = async () => {
      if (!video) {
        return;
      }

      await loadSource();
      video.setAttribute('controls', 'controls');

      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      try {
        await video.play();
      } catch (error) {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      }
    };

    if (overlay) {
      overlay.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', () => {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      });
      video.addEventListener('play', () => {
        if (overlay) {
          overlay.classList.add('is-hidden');
        }
      });
      video.addEventListener('ended', () => {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }

    window.addEventListener('pagehide', () => {
      if (hlsInstance && hlsInstance.destroy) {
        hlsInstance.destroy();
      }
    });
  });
};

setupPlayers();
