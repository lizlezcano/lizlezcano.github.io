const CONFIG = window.SITE_CONFIG || {};

// Booking links (Calendly) — set once in js/config.js
document.querySelectorAll('[data-link="booking"]').forEach(a => {
    a.href = CONFIG.bookingUrl || 'https://instagram.com/lizlezcano_';
});

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');

function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    menu.classList.toggle('open', open);
}

toggle.addEventListener('click', () => {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

// Hairline under the nav once the page scrolls
const nav = document.querySelector('.nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 8);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Slow editorial fade-up as elements enter the viewport
const revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;

function reveal(el) {
    el.classList.add('reveal');
    if (revealObserver) revealObserver.observe(el);
    else el.classList.add('visible');
}
window.reveal = reveal;
document.querySelectorAll('.reveal').forEach(reveal);

// Small DOM helper shared with store.js
function el(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
        if (k === 'class') node.className = v;
        else node.setAttribute(k, v);
    }
    children.flat().forEach(c => c != null && node.append(c));
    return node;
}
window.el = el;

// Letters from Substack (data/letters.json, refreshed daily by GitHub Actions)
const letterGrid = document.getElementById('letter-grid');
if (letterGrid) {
    const limit = Number(letterGrid.dataset.limit) || 6;
    const fmt = new Intl.DateTimeFormat('es', { day: 'numeric', month: 'short', year: 'numeric' });

    fetch('data/letters.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(letters => {
            letterGrid.replaceChildren(...letters.slice(0, limit).map(l => {
                const img = el('img', { src: l.image, alt: '', loading: 'lazy' });
                const card = el('a', { class: 'letter', href: l.url, target: '_blank', rel: 'noopener' },
                    el('div', { class: 'letter-img' }, img),
                    el('time', { datetime: l.date }, fmt.format(new Date(l.date + 'T12:00:00')).replace('.', '')),
                    el('h3', {}, l.title),
                    el('p', {}, l.subtitle)
                );
                reveal(card);
                return card;
            }));
        })
        .catch(() => {
            letterGrid.replaceChildren(el('p', { class: 'fine-print' },
                'Lee todas mis cartas en ',
                el('a', { href: 'https://lezcanoliz.substack.com/archive' }, 'lezcanoliz.substack.com'), '.'));
        });
}

// Footer year
const year = document.getElementById('year');
if (year) year.textContent = new Date().getFullYear();
