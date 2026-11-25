// Hand-made Amazon storefront, rendered from data/products.json
(function () {
    const CONFIG = window.SITE_CONFIG || {};
    const { el, reveal } = window;
    const grid = document.getElementById('product-grid');
    const filters = document.getElementById('store-filters');
    if (!grid || !filters) return;

    // The affiliate disclosure is only true once an Associates tag is set
    const disclosure = document.getElementById('affiliate-disclosure');
    if (disclosure && CONFIG.amazonTag) disclosure.hidden = false;

    function amazonUrl(p) {
        const domain = CONFIG.amazonDomain || 'www.amazon.com';
        const url = p.asin
            ? new URL(`https://${domain}/dp/${p.asin}`)
            : new URL(`https://${domain}/s?k=${encodeURIComponent(p.search || p.name)}`);
        if (CONFIG.amazonTag) url.searchParams.set('tag', CONFIG.amazonTag);
        return url.toString();
    }

    function productCard(p, categoryName) {
        const visual = p.image
            ? el('img', { src: p.image, alt: p.name, loading: 'lazy' })
            : el('span', { class: 'product-monogram', 'aria-hidden': 'true' }, 'L');

        return el('article', { class: 'product', 'data-category': p.category },
            el('div', { class: `product-visual product-visual--${p.category}` },
                visual,
                p.example ? el('span', { class: 'product-flag' }, 'Ejemplo') : null
            ),
            el('div', { class: 'product-body' },
                el('span', { class: 'product-cat' }, categoryName),
                el('h3', {}, p.name),
                el('p', { class: 'product-note' }, p.note),
                el('a', {
                    class: 'btn btn-ghost btn-sm',
                    href: amazonUrl(p),
                    target: '_blank',
                    rel: 'noopener sponsored'
                }, 'Ver en Amazon')
            )
        );
    }

    function select(id) {
        filters.querySelectorAll('button').forEach(b => {
            b.setAttribute('aria-selected', String(b.dataset.id === id));
        });
        grid.querySelectorAll('.product').forEach(card => {
            card.hidden = id !== 'all' && card.dataset.category !== id;
        });
    }

    fetch('data/products.json')
        .then(r => r.ok ? r.json() : Promise.reject(r.status))
        .then(({ categories, products }) => {
            const names = Object.fromEntries(categories.map(c => [c.id, c.name]));

            const tabs = [{ id: 'all', name: 'Todo' }, ...categories].map(c => {
                const b = el('button', { type: 'button', role: 'tab', 'data-id': c.id, 'aria-selected': 'false' }, c.name);
                b.addEventListener('click', () => {
                    select(c.id);
                    history.replaceState(null, '', c.id === 'all' ? location.pathname : `#${c.id}`);
                });
                return b;
            });
            filters.replaceChildren(...tabs);

            grid.replaceChildren(...products.map(p => {
                const card = productCard(p, names[p.category] || '');
                reveal(card);
                return card;
            }));

            const fromHash = location.hash.slice(1);
            select(names[fromHash] ? fromHash : 'all');
        })
        .catch(() => {
            grid.replaceChildren(el('p', { class: 'fine-print' }, 'No se pudieron cargar los recursos. Intenta de nuevo en un momento.'));
        });
})();
