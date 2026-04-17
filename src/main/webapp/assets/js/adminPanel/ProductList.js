async function LoadProducts(){

    try {
        const response = await fetch("api/data/productTab");
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            renderProductCard(data)
        } else {
            Notiflix.Notify.failure("Product loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }

}

function renderProductCard(data) {
    const allProducts = [
        ...(data.productsObject.men || []),
        ...(data.productsObject.women || []),
        ...(data.productsObject.kids || [])
    ];

    const productGrid = document.getElementById("product-grid");
    productGrid.innerHTML = "";

    allProducts.forEach((product, index) => {
        const uniqueColors = product.colors?.reduce((acc, current) => {
            const exists = acc.find(item => item.hexCode === current.hexCode);
            if (!exists) acc.push(current);
            return acc;
        }, []) || [];

        const uniqueSize = product.sizes?.reduce((acc, current) => {
            const exists = acc.find(item => item.size === current.size);
            if (!exists) acc.push(current);
            return acc;
        }, []) || [];

        const images = product.images || [];
        const carouselId = `carousel-${product.productId}-${index}`;
        const prevBtnId  = `prev-${product.productId}-${index}`;
        const nextBtnId  = `next-${product.productId}-${index}`;

        const imageHtml = generateCarouselImages(images, carouselId, product.productId);

        // Stock display logic
        const stockClass = product.stock === 0 ? 'out' : product.stock < 10 ? 'low' : 'in';
        const stockLabel = product.stock === 0
            ? '<i class="fas fa-times-circle"></i> Out of Stock'
            : product.stock < 10
                ? `<i class="fas fa-exclamation-circle"></i> Low: ${product.stock}`
                : `<i class="fas fa-check-circle"></i> ${product.stock} in stock`;

        // Price display
        const priceDisplay = product.maxPrice === product.minPrice
            ? `Rs.${product.maxPrice?.toFixed(2) || '0.00'}`
            : `Rs.${product.minPrice?.toFixed(2) || '0.00'} – Rs.${product.maxPrice?.toFixed(2) || '0.00'}`;

        // Status
        const isActive = product.status === 'active';

        // Visible color dots (max 4, then show count)
        const visibleColors = uniqueColors.slice(0, 4);
        const extraColors   = uniqueColors.length - 4;
        const colorDotsHtml = visibleColors.map(c =>
            `<span class="pc-color-dot" style="background:${c.hexCode};" title="${c.name}"></span>`
        ).join('') + (extraColors > 0
            ? `<span class="pc-color-more">+${extraColors}</span>`
            : '');

        // Size tags (max 5 shown)
        const visibleSizes = uniqueSize.slice(0, 5);
        const extraSizes   = uniqueSize.length - 5;
        const sizeTagsHtml = visibleSizes.map(s =>
            `<span class="pc-size-tag">${s.size}</span>`
        ).join('') + (extraSizes > 0
            ? `<span class="pc-size-more">+${extraSizes}</span>`
            : '');

        const productCard = `
            <div class="pc-card" data-product-id="${product.productId}">

                <!-- ── Image + Carousel ─────────────────────────────── -->
                <div class="pc-image-wrap">
                    <div class="pc-carousel-track" id="${carouselId}">
                        ${imageHtml}
                    </div>

                    ${images.length > 1 ? `
                        <button class="pc-nav pc-nav-prev" id="${prevBtnId}">
                            <i class="fas fa-chevron-left"></i>
                        </button>
                        <button class="pc-nav pc-nav-next" id="${nextBtnId}">
                            <i class="fas fa-chevron-right"></i>
                        </button>
                        <div class="pc-dots">
                            ${images.map((_, i) =>
            `<span class="pc-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
        ).join('')}
                        </div>
                    ` : ''}

                    <!-- Hover actions -->
                    <div class="pc-hover-actions">
                        <button class="pc-action-icon" title="Quick View" onclick="quickView(${product.productId})">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="pc-action-icon" title="Edit" onclick="showEditProduct(null, ${product.productId})">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="pc-action-icon danger" title="Delete" onclick="deleteProduct(${product.productId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>

                    <!-- Status badge top-left -->
                    <div class="pc-status-badge ${isActive ? 'active' : 'draft'}">
                        <span class="pc-status-dot"></span>
                        ${isActive ? 'Active' : 'Draft'}
                    </div>
                </div>

                <!-- ── Card Body ────────────────────────────────────── -->
                <div class="pc-body">

                    <!-- Category -->
                    <div class="pc-category">
                        <i class="fas fa-tag"></i>
                        ${product.category || 'Uncategorized'}
                    </div>

                    <!-- Title -->
                    <h5 class="pc-title">
                        <a href="javascript:void(0)" onclick="viewProduct(${product.productId})">
                            ${product.title || 'Product Title'}
                        </a>
                    </h5>

                    <!-- Color swatches -->
                    <div class="pc-colors">
                        ${colorDotsHtml || '<span class="pc-empty-hint">No colors</span>'}
                    </div>

                    <!-- Divider -->
                    <div class="pc-divider"></div>

                    <!-- Price + Stock -->
                    <div class="pc-price-row">
                        <span class="pc-price">${priceDisplay}</span>
                        <span class="pc-stock-badge ${stockClass}">${stockLabel}</span>
                    </div>

                    <!-- Sizes -->
                    <div class="pc-sizes">
                        ${sizeTagsHtml || '<span class="pc-empty-hint">No sizes</span>'}
                    </div>

                    <!-- Footer -->
                    <div class="pc-footer">
                        <div class="pc-footer-actions">
                            <button class="pc-btn pc-btn-edit" title="Edit Product"
                                    onclick="showEditProduct(null, ${product.productId})">
                                <i class="fas fa-edit"></i> Edit
                            </button>
                            <button class="pc-btn pc-btn-dup" title="Duplicate"
                                    onclick="duplicateProduct(${product.productId})">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="pc-btn pc-btn-del" title="Delete"
                                    onclick="deleteProduct(${product.productId})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>

                </div><!-- /pc-body -->
            </div><!-- /pc-card -->
        `;

        productGrid.innerHTML += productCard;
    });

    // Inject card styles once
    injectProductCardStyles();

    // Init carousels
    allProducts.forEach((product, index) => {
        const images = product.images || [];
        if (images.length > 1) {
            const carouselId = `carousel-${product.productId}-${index}`;
            const prevBtnId  = `prev-${product.productId}-${index}`;
            const nextBtnId  = `next-${product.productId}-${index}`;
            const carousel   = document.getElementById(carouselId);
            const prevBtn    = document.getElementById(prevBtnId);
            const nextBtn    = document.getElementById(nextBtnId);
            const dots       = carousel?.closest('.pc-image-wrap')?.querySelectorAll('.pc-dot');
            if (carousel && prevBtn && nextBtn) {
                initCarousel(carousel, prevBtn, nextBtn, dots);
            }
        }
    });
}

// ─── Image HTML ──────────────────────────────────────────────────────────────
function generateCarouselImages(images, carouselId, productId) {
    if (!images || images.length === 0) {
        return `<div class="pc-slide pc-no-image">
                    <i class="fas fa-image"></i>
                    <span>No image</span>
                </div>`;
    }
    return images.map((image, i) => `
        <div class="pc-slide">
            <img src="${image}" alt="Product image ${i + 1}"
                 onerror="this.src='https://via.placeholder.com/300x240/f0f3ff/6777ef?text=No+Image'">
        </div>
    `).join('');
}

// ─── Carousel logic ───────────────────────────────────────────────────────────
function initCarousel(carousel, prevBtn, nextBtn, dots) {
    let current = 0;
    const slides = carousel.querySelectorAll('.pc-slide');
    const total  = slides.length;
    if (total <= 1) return;

    function go(n) {
        current = Math.max(0, Math.min(n, total - 1));
        carousel.style.transform = `translateX(${-current * 100}%)`;
        if (dots) {
            dots.forEach((d, i) => d.classList.toggle('active', i === current));
        }
        prevBtn.style.opacity = current === 0         ? '0.45' : '1';
        nextBtn.style.opacity = current === total - 1 ? '0.45' : '1';
    }

    prevBtn.addEventListener('click', e => { e.stopPropagation(); go(current - 1); });
    nextBtn.addEventListener('click', e => { e.stopPropagation(); go(current + 1); });

    if (dots) {
        dots.forEach((d, i) => d.addEventListener('click', e => { e.stopPropagation(); go(i); }));
    }

    // Auto-advance
    let timer = setInterval(() => go(current < total - 1 ? current + 1 : 0), 5000);
    const wrap = carousel.closest('.pc-image-wrap');
    wrap.addEventListener('mouseenter', () => clearInterval(timer));
    wrap.addEventListener('mouseleave', () => {
        timer = setInterval(() => go(current < total - 1 ? current + 1 : 0), 5000);
    });

    go(0);
}

// ─── Styles ───────────────────────────────────────────────────────────────────
function injectProductCardStyles() {
    if (document.getElementById('pc-styles')) return;
    const style = document.createElement('style');
    style.id = 'pc-styles';
    style.textContent = `

    /* ── Card shell ─────────────────────────────────────────── */
    .pc-card {
        background: #fff;
        border-radius: 14px;
        border: 1px solid #e9ecef;
        overflow: hidden;
        transition: transform .25s ease, box-shadow .25s ease, border-color .25s ease;
        display: flex;
        flex-direction: column;
    }
    .pc-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 16px 40px rgba(103,119,239,.13), 0 4px 12px rgba(0,0,0,.06);
        border-color: #c5caff;
    }

    /* ── Image area ─────────────────────────────────────────── */
    .pc-image-wrap {
        position: relative;
        height: 230px;
        overflow: hidden;
        background: #f8fafd;
        flex-shrink: 0;
    }
    .pc-carousel-track {
        display: flex;
        height: 100%;
        transition: transform .35s cubic-bezier(.4,0,.2,1);
    }
    .pc-slide {
        flex-shrink: 0;
        width: 100%;
        height: 100%;
    }
    .pc-slide img {
        width: 100%; height: 100%;
        object-fit: cover;
        transition: transform .5s ease;
    }
    .pc-card:hover .pc-slide img {
        transform: scale(1.04);
    }
    .pc-no-image {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        color: #ced4da;
        font-size: 13px;
    }
    .pc-no-image i { font-size: 40px; }

    /* Nav arrows */
    .pc-nav {
        position: absolute;
        top: 50%; transform: translateY(-50%);
        width: 34px; height: 34px;
        background: rgba(0,0,0,.55);
        color: #fff;
        border: none; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; z-index: 10;
        font-size: 13px;
        transition: background .2s, opacity .2s, transform .2s;
    }
    .pc-nav:hover { background: rgba(0,0,0,.82); transform: translateY(-50%) scale(1.08); }
    .pc-nav-prev { left: 10px; }
    .pc-nav-next { right: 10px; }

    /* Dots */
    .pc-dots {
        position: absolute; bottom: 10px; left: 50%;
        transform: translateX(-50%);
        display: flex; gap: 6px; z-index: 10;
    }
    .pc-dot {
        width: 7px; height: 7px;
        border-radius: 50%;
        background: rgba(255,255,255,.45);
        cursor: pointer;
        transition: background .25s, transform .25s;
    }
    .pc-dot.active {
        background: #6777ef;
        transform: scale(1.3);
    }

    /* Hover action buttons */
    .pc-hover-actions {
        position: absolute; top: 12px; right: 12px;
        display: flex; flex-direction: column; gap: 7px;
        opacity: 0; transform: translateX(8px);
        transition: opacity .25s, transform .25s;
        z-index: 11;
    }
    .pc-card:hover .pc-hover-actions {
        opacity: 1; transform: translateX(0);
    }
    .pc-action-icon {
        width: 34px; height: 34px;
        border-radius: 50%;
        background: #fff;
        border: none;
        box-shadow: 0 2px 8px rgba(0,0,0,.14);
        color: #495057;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer; font-size: 14px;
        transition: background .2s, color .2s, transform .2s;
    }
    .pc-action-icon:hover { background: #6777ef; color: #fff; transform: scale(1.12); }
    .pc-action-icon.danger:hover { background: #fc544b; }

    /* Status badge */
    .pc-status-badge {
        position: absolute; top: 12px; left: 12px;
        display: flex; align-items: center; gap: 5px;
        padding: 4px 10px;
        border-radius: 30px;
        font-size: 11px; font-weight: 600;
        backdrop-filter: blur(6px);
        z-index: 10;
    }
    .pc-status-badge.active {
        background: rgba(71,195,99,.18);
        color: #2a9a4a;
        border: 1px solid rgba(71,195,99,.35);
    }
    .pc-status-badge.draft {
        background: rgba(252,84,75,.15);
        color: #d63029;
        border: 1px solid rgba(252,84,75,.3);
    }
    .pc-status-dot {
        width: 6px; height: 6px; border-radius: 50%;
        background: currentColor;
    }

    /* ── Card body ──────────────────────────────────────────── */
    .pc-body {
        padding: 18px 18px 0;
        display: flex;
        flex-direction: column;
        flex: 1;
    }

    /* Category */
    .pc-category {
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: .6px;
        color: #98a6ad;
        display: flex; align-items: center; gap: 5px;
        margin-bottom: 7px;
    }

    /* Title */
    .pc-title {
        font-size: 15px;
        font-weight: 700;
        color: #34395e;
        margin: 0 0 12px;
        line-height: 1.4;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
    }
    .pc-title a {
        color: inherit; text-decoration: none;
        transition: color .2s;
    }
    .pc-title a:hover { color: #6777ef; }

    /* Color swatches */
    .pc-colors {
        display: flex; align-items: center; gap: 7px;
        flex-wrap: wrap;
        margin-bottom: 14px;
    }
    .pc-color-dot {
        width: 22px; height: 22px;
        border-radius: 50%;
        border: 2px solid #fff;
        box-shadow: 0 1px 4px rgba(0,0,0,.18);
        display: inline-block;
        cursor: default;
        transition: transform .2s;
    }
    .pc-color-dot:hover { transform: scale(1.22); }
    .pc-color-more {
        font-size: 11px; color: #98a6ad;
        background: #f1f3f5;
        padding: 3px 8px; border-radius: 30px;
    }

    /* Divider */
    .pc-divider {
        height: 1px;
        background: #f0f2f5;
        margin-bottom: 14px;
    }

    /* Price + Stock row */
    .pc-price-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-bottom: 12px;
        flex-wrap: wrap;
    }
    .pc-price {
        font-size: 17px;
        font-weight: 800;
        color: #6777ef;
        white-space: nowrap;
    }
    .pc-stock-badge {
        display: inline-flex; align-items: center; gap: 5px;
        font-size: 12px; font-weight: 600;
        padding: 5px 11px; border-radius: 30px;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .pc-stock-badge.in  { background: #e8f5e9; color: #2e7d32; }
    .pc-stock-badge.low { background: #fff8e1; color: #f57f17; }
    .pc-stock-badge.out { background: #fdecea; color: #c62828; }

    /* Size tags */
    .pc-sizes {
        display: flex; flex-wrap: wrap; gap: 6px;
        margin-bottom: 16px;
    }
    .pc-size-tag {
        padding: 4px 10px;
        background: #f4f5ff;
        color: #6777ef;
        border: 1px solid #dde0ff;
        border-radius: 6px;
        font-size: 12px; font-weight: 600;
        transition: background .2s, color .2s;
        cursor: default;
    }
    .pc-size-tag:hover { background: #6777ef; color: #fff; border-color: #6777ef; }
    .pc-size-more {
        padding: 4px 10px;
        background: #f1f3f5;
        color: #98a6ad;
        border-radius: 6px;
        font-size: 12px; font-weight: 600;
    }

    /* Empty hint */
    .pc-empty-hint { font-size: 12px; color: #ced4da; font-style: italic; }

    /* ── Footer ─────────────────────────────────────────────── */
    .pc-footer {
        border-top: 1px solid #f0f2f5;
        padding: 12px 0;
        margin-top: auto;
    }
    .pc-footer-actions {
        display: flex; align-items: center; gap: 8px;
    }
    .pc-btn {
        display: inline-flex; align-items: center; gap: 6px;
        border: 1px solid #e9ecef;
        background: #fff;
        border-radius: 8px;
        cursor: pointer;
        font-size: 13px; font-weight: 600;
        transition: all .2s;
        padding: 7px 12px;
        color: #495057;
    }
    .pc-btn-edit {
        flex: 1;
        justify-content: center;
        background: #f4f5ff;
        border-color: #dde0ff;
        color: #6777ef;
    }
    .pc-btn-edit:hover { background: #6777ef; color: #fff; border-color: #6777ef; }

    .pc-btn-dup { width: 36px; height: 36px; padding: 0; justify-content: center; }
    .pc-btn-dup:hover { background: #f8f9fa; color: #6777ef; border-color: #c5caff; }

    .pc-btn-del { width: 36px; height: 36px; padding: 0; justify-content: center; }
    .pc-btn-del:hover { background: #fdecea; color: #c62828; border-color: #f5c6cb; }
    `;
    document.head.appendChild(style);
}

// ─── Product action stubs ─────────────────────────────────────────────────────
function quickView(productId) {
    Notiflix.Notify.info(`Quick view for product ${productId}`);
}

function editProduct(productId) {
    showEditProduct(null, productId);
}

function deleteProduct(productId) {
    Notiflix.Confirm.show(
        'Delete Product',
        'Are you sure you want to delete this product? This action cannot be undone.',
        'Yes, Delete', 'Cancel',
        () => Notiflix.Notify.success(`Product ${productId} deleted`),
        () => {}
    );
}

function duplicateProduct(productId) {
    Notiflix.Notify.info(`Duplicate product ${productId}`);
}

function viewProduct(productId) {
    Notiflix.Notify.info(`View product ${productId}`);
}