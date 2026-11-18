const links = [...document.querySelectorAll('nav a')];
const cards = [...document.querySelectorAll('main section')];
const visibility = new Map(cards.map(card => [card, 0]));

const observer = new IntersectionObserver(entries => {
  for (const entry of entries) {
    visibility.set(entry.target, entry.intersectionRatio);
  }

  const active = cards.reduce((mostVisible, card) =>
    visibility.get(card) > visibility.get(mostVisible) ? card : mostVisible
  );

  for (const link of links) {
    if (link.hash === `#${active.id}`) {
      link.setAttribute('aria-current', 'location');
    } else {
      link.removeAttribute('aria-current');
    }
  }
}, { threshold: [0, 0.25, 0.5, 0.75, 1] });

cards.forEach(card => observer.observe(card));

const heroArt = document.querySelector('.identity');
const parallax = matchMedia('(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)');

function resetParallax() {
  heroArt.style.removeProperty('--art-x');
  heroArt.style.removeProperty('--art-y');
}

heroArt.addEventListener('pointermove', event => {
  if (!parallax.matches || event.pointerType !== 'mouse') return;

  const bounds = heroArt.getBoundingClientRect();
  const x = (event.clientX - bounds.left) / bounds.width - .5;
  const y = (event.clientY - bounds.top) / bounds.height - .5;
  heroArt.style.setProperty('--grid-x', `${(x + .5) * 100}%`);
  heroArt.style.setProperty('--grid-y', `${(y + .5) * 100}%`);
  heroArt.style.setProperty('--art-x', `${x * 24}px`);
  heroArt.style.setProperty('--art-y', `${y * 20}px`);
});

heroArt.addEventListener('pointerleave', resetParallax);
parallax.addEventListener('change', resetParallax);

const feed = document.querySelector('main');
const hero = document.querySelector('.hello');
const scrollShine = matchMedia('(max-width: 700px) and (prefers-reduced-motion: no-preference)');
let shineProgress = 0;

function updateScrollShine() {
  const progress = scrollShine.matches
    ? Math.min(1, Math.max(0, feed.scrollTop / hero.offsetHeight))
    : 0;

  if (progress === shineProgress) return;

  shineProgress = progress;
  heroArt.style.setProperty('--shine-scroll', progress);
}

feed.addEventListener('scroll', updateScrollShine, { passive: true });
window.addEventListener('resize', updateScrollShine);
scrollShine.addEventListener('change', updateScrollShine);
updateScrollShine();


heroArt.addEventListener('click', event => {
  if (event.pointerType !== 'touch' || !scrollShine.matches) return;

  const bounds = heroArt.getBoundingClientRect();
  const origin = {
    left: `${event.clientX - bounds.left - heroArt.clientLeft}px`,
    top: `${event.clientY - bounds.top - heroArt.clientTop}px`,
  };
  const ripple = document.createElement('span');
  ripple.className = 'tap-ripple';
  Object.assign(ripple.style, origin);
  heroArt.append(ripple);
  ripple.animate([
    { transform: 'translate(-50%, -50%) scale(.25)', opacity: .8 },
    { transform: 'translate(-50%, -50%) scale(2.6)', opacity: 0 },
  ], { duration: 560, easing: 'ease-out' }).onfinish = () => ripple.remove();

  for (const [x, y] of [[-26, -16], [19, -26], [32, 4], [14, 26], [-20, 21]]) {
    const spark = document.createElement('span');
    spark.className = 'tap-particle';
    Object.assign(spark.style, origin);
    heroArt.append(spark);
    spark.animate([
      { transform: 'translate(-50%, -50%) scale(1)', opacity: .9 },
      { transform: `translate(${x}px, ${y}px) scale(.25)`, opacity: 0 },
    ], { duration: 460, easing: 'ease-out' }).onfinish = () => spark.remove();
  }
});
