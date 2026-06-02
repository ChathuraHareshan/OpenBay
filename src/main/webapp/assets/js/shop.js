let allProducts = [];
let currentFilters = {
    categories: [],
    colors: [],
    sizes: []
};

let priceSliderInstance = null;
let originalMinPrice = 0;
let originalMaxPrice = 0;

window.addEventListener("load", async () => {
    try {
        Notiflix.Loading.pulse("Loading...", {
            clickToClose: false,
            svgColor: '#0284c7'
        });

        await LoadProducts();
        await loadCategory();
        await loadColors();
        await loadSizes();
        setupPriceFilter();

        const clearFiltersBtn = document.querySelector('.sidebar-filter-clear');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', function(e) {
                e.preventDefault();
                clearAllFilters();
            });
        }

    } finally {
        Notiflix.Loading.remove();
    }
});

async function LoadProducts() {
    try {
        const response = await fetch("api/data/productTab");
        if (response.ok) {
            const data = await response.json();
            console.log("Products loaded:", data);

            allProducts = [
                ...(data.productsObject.men || []),
                ...(data.productsObject.women || []),
                ...(data.productsObject.kids || [])
            ];

            renderProductCard({ productsObject: { men: allProducts, women: [], kids: [] } });
            updateProductCount(allProducts.length);
        } else {
            Notiflix.Notify.failure("Product loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
        console.error("LoadProducts Error:", e);
    }
}

function renderProductCard(data) {
    const products = [
        ...(data.productsObject.men || []),
        ...(data.productsObject.women || []),
        ...(data.productsObject.kids || [])
    ];

    const productGrid = document.getElementById("product-grid");
    if (!productGrid) return;

    productGrid.innerHTML = "";

    if (products.length === 0) {
        showNoProductsMessage();
        return;
    }

    products.forEach((product, index) => {
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

        const imageHtml = generateCarouselImages(images, carouselId, product.productId);

        const priceDisplay = product.maxPrice === product.minPrice
            ? `Rs.${(product.maxPrice || 0).toFixed(2)}`
            : `Rs.${(product.minPrice || 0).toFixed(2)} – Rs.${(product.maxPrice || 0).toFixed(2)}`;

        const visibleColors = uniqueColors.slice(0, 4);
        const extraColors = uniqueColors.length - 4;
        const colorDotsHtml = visibleColors.map(c =>
            `<span class="pc-color-dot" style="background:${c.hexCode};" title="${c.name}"></span>`
        ).join('') + (extraColors > 0 ? `<span class="pc-color-more">+${extraColors}</span>` : '');

        const visibleSizes = uniqueSize.slice(0, 5);
        const extraSizes = uniqueSize.length - 5;
        const sizeTagsHtml = visibleSizes.map(s =>
            `<span class="pc-size-tag">${s.size}</span>`
        ).join('') + (extraSizes > 0 ? `<span class="pc-size-more">+${extraSizes}</span>` : '');

        const productCard = `
            <div class="col-6 col-md-4 col-lg-4 col-xl-3">
                <div class="product product-7 text-center">
                    <figure class="product-media">
                        <span class="product-label label-new">${product.category}</span>
                        <a href="product.html?id=${product.productId}">
                            <div class="pc-image-wrap">
                                <div class="pc-carousel-track" id="${carouselId}">
                                    ${imageHtml}
                                </div>
                            </div>
                        </a>
                        <div class="product-action-vertical">
                            <a href="#" class="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                            <a href="popup/quickView.html" class="btn-product-icon btn-quickview" title="Quick view"><span>Quick view</span></a>
                            <a href="#" class="btn-product-icon btn-compare" title="Compare"><span>Compare</span></a>
                        </div>
                        <div class="product-action">
                            <a href="#" class="btn-product btn-cart"><span>add to cart</span></a>
                        </div>
                    </figure>
                    <div class="product-body">
                        <div class="product-cat">
                            <a href="#">${product.category}</a>
                        </div>
                        <h3 class="product-title pc-title"><a href="product.html?id=${product.productId}">${product.title}</a></h3>
                        <div class="pc-price">
                            ${priceDisplay}
                        </div>
                        <div class="pc-body">
                            <div class="pc-category">
                                <i class="fas fa-tag"></i>
                                ${product.category || 'Uncategorized'}
                            </div>
                            <div class="pc-colors">
                                ${colorDotsHtml || '<span class="pc-empty-hint">No colors</span>'}
                            </div>
                            <div class="pc-divider"></div>
                            <div class="pc-sizes">
                                ${sizeTagsHtml || '<span class="pc-empty-hint">No sizes</span>'}
                            </div>
                        </div>
                        <div class="ratings-container">
                            <div class="ratings">
                                <div class="ratings-val" style="width: 20%;"></div>
                            </div>
                            <span class="ratings-text">( 2 Reviews )</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        productGrid.innerHTML += productCard;
    });

    injectProductCardStyles();
}

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

function injectProductCardStyles() {
    if (document.getElementById('pc-styles')) return;
    const style = document.createElement('style');
    style.id = 'pc-styles';
    style.textContent = `
        .pc-image-wrap {
            position: relative;
            height: 230px;
            overflow: hidden;
            background: #f8fafd;
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
        .pc-body {
            padding: 18px 18px 0;
            display: flex;
            flex-direction: column;
            flex: 1;
        }
        .pc-category {
            font-size: 11px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: .6px;
            color: #98a6ad;
            display: flex;
            align-items: center;
            gap: 5px;
            margin-bottom: 7px;
        }
        .pc-title {
            font-size: 15px;
            font-weight: 700;
            color: #34395e;
            margin: 0 0 12px;
            line-height: 1.4;
        }
        .pc-price {
            font-size: 17px;
            font-weight: 800;
            color: #6777ef;
        }
        .pc-colors {
            display: flex;
            align-items: center;
            gap: 7px;
            flex-wrap: wrap;
            margin-bottom: 14px;
        }
        .pc-color-dot {
            width: 22px;
            height: 22px;
            border-radius: 50%;
            border: 2px solid #fff;
            box-shadow: 0 1px 4px rgba(0,0,0,.18);
            display: inline-block;
            cursor: default;
        }
        .pc-color-more, .pc-size-more {
            font-size: 11px;
            color: #98a6ad;
            background: #f1f3f5;
            padding: 3px 8px;
            border-radius: 30px;
        }
        .pc-divider {
            height: 1px;
            background: #f0f2f5;
            margin-bottom: 14px;
        }
        .pc-sizes {
            display: flex;
            flex-wrap: wrap;
            gap: 6px;
            margin-bottom: 16px;
        }
        .pc-size-tag {
            padding: 4px 10px;
            background: #f4f5ff;
            color: #6777ef;
            border: 1px solid #dde0ff;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 600;
        }
        .pc-empty-hint { font-size: 12px; color: #ced4da; font-style: italic; }
        .color-filter-item {
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            display: inline-block;
            margin: 5px;
        }
        .color-filter-item:hover {
            transform: scale(1.1);
        }
        .color-filter-item.selected {
            box-shadow: 0 0 0 2px #fff, 0 0 0 4px #6777ef;
            transform: scale(1.15);
        }
        .no-products-found {
            text-align: center;
            padding: 60px 20px;
            background: #f8f9fa;
            border-radius: 8px;
            margin: 20px 0;
        }
        .no-products-found i {
            font-size: 48px;
            color: #dee2e6;
            margin-bottom: 20px;
        }
        .no-products-found h4 {
            font-size: 24px;
            color: #495057;
            margin-bottom: 10px;
        }
        .no-products-found p {
            color: #6c757d;
            margin-bottom: 20px;
        }
    `;
    document.head.appendChild(style);
}

async function loadCategory() {
    const categoryContainer = document.getElementById('categoryCantainer');
    if (!categoryContainer) return;

    try {
        const res = await fetch("api/data/productTab");
        if (res.ok) {
            const data = await res.json();
            const categoriesArray = data.categories || [];
            const productsObject = data.productsObject || {};

            if (categoriesArray.length > 0) {
                const categoriesHtml = categoriesArray.map(category => {
                    const categoryKey = category.name.toLowerCase();
                    const productCount = productsObject[categoryKey] ? productsObject[categoryKey].length : 0;
                    return `
                        <div class="filter-item">
                            <div class="custom-control custom-checkbox">
                                <input type="checkbox" class="custom-control-input category-filter" 
                                       id="cat-${category.id}"
                                       data-category="${category.name}">
                                <label class="custom-control-label" for="cat-${category.id}">
                                    ${category.name}
                                </label>
                            </div>
                            <span class="item-count">${productCount}</span>
                        </div>
                    `;
                }).join('');
                categoryContainer.innerHTML = categoriesHtml;

                document.querySelectorAll('.category-filter').forEach(checkbox => {
                    checkbox.addEventListener('change', handleFilterChange);
                });
            }
        }
    } catch (e) {
        console.error("loadCategory Error:", e);
    }
}

async function loadColors() {
    const colorContainer = document.getElementById('colorContainer');
    if (!colorContainer) return;

    try {
        const res = await fetch("api/data/colors");
        if (res.ok) {
            const data = await res.json();
            const colorsArray = data.colors || [];

            if (colorsArray.length > 0) {
                const colorsHtml = colorsArray.map(color => `
                    <a href="#" 
                       class="color-filter-item" 
                       data-color-name="${color.name}"
                       data-color-code="${color.hexCode}"
                       style="background: ${color.hexCode}; display: inline-block; width: 30px; height: 30px; border-radius: 50%; margin: 5px;" 
                       title="${color.name}">
                        <span class="sr-only">${color.name}</span>
                    </a>
                `).join('');
                colorContainer.innerHTML = colorsHtml;

                document.querySelectorAll('.color-filter-item').forEach(colorItem => {
                    colorItem.addEventListener('click', handleColorFilter);
                });
            }
        }
    } catch (e) {
        console.error("loadColors Error:", e);
    }
}

async function loadSizes() {
    const sizeContainer = document.getElementById('sizeContainer');
    if (!sizeContainer) return;

    try {
        const res = await fetch("api/data/sizes");
        if (res.ok) {
            const data = await res.json();
            const sizeArray = data.sizes || [];

            if (sizeArray.length > 0) {
                const sizesHtml = sizeArray.map(size => `
                    <div class="filter-item">
                        <div class="custom-control custom-checkbox">
                            <input type="checkbox" class="custom-control-input size-filter" 
                                   id="size-${size.id}"
                                   data-size="${size.name}">
                            <label class="custom-control-label" for="size-${size.id}">${size.name}</label>
                        </div>
                    </div>
                `).join('');
                sizeContainer.innerHTML = sizesHtml;

                document.querySelectorAll('.size-filter').forEach(checkbox => {
                    checkbox.addEventListener('change', handleFilterChange);
                });
            }
        }
    } catch (e) {
        console.error("loadSizes Error:", e);
    }
}

function handleFilterChange(e) {
    const checkbox = e.target;
    const filterType = checkbox.classList.contains('category-filter') ? 'categories' : 'sizes';
    const filterValue = checkbox.dataset.category || checkbox.dataset.size;

    if (checkbox.checked) {
        if (!currentFilters[filterType].includes(filterValue)) {
            currentFilters[filterType].push(filterValue);
        }
    } else {
        currentFilters[filterType] = currentFilters[filterType].filter(v => v !== filterValue);
    }

    applyFilters();
}

function handleColorFilter(e) {
    e.preventDefault();
    const colorItem = e.currentTarget;
    const colorName = colorItem.dataset.colorName;

    if (colorItem.classList.contains('selected')) {
        colorItem.classList.remove('selected');
        currentFilters.colors = currentFilters.colors.filter(c => c !== colorName);
    } else {
        colorItem.classList.add('selected');
        if (!currentFilters.colors.includes(colorName)) {
            currentFilters.colors.push(colorName);
        }
    }

    applyFilters();
}

function setupPriceFilter() {
    const priceSlider = document.getElementById('price-slider');
    if (!priceSlider) return;

    if (!allProducts.length) {
        console.log("Waiting for products to load...");
        return;
    }

    const allPrices = [];
    allProducts.forEach(product => {
        const minP = product.minPrice || 0;
        const maxP = product.maxPrice || product.minPrice || 0;
        allPrices.push(minP, maxP);
    });

    originalMinPrice = Math.min(...allPrices);
    originalMaxPrice = Math.max(...allPrices);

    console.log("Price range:", originalMinPrice, "to", originalMaxPrice);

    if (priceSlider.noUiSlider) {
        priceSlider.noUiSlider.destroy();
    }

    noUiSlider.create(priceSlider, {
        start: [originalMinPrice, originalMaxPrice],
        connect: true,
        step: 100,
        range: {
            'min': originalMinPrice,
            'max': originalMaxPrice
        },
        format: {
            to: function(value) {
                return Math.round(value);
            },
            from: function(value) {
                return Number(value);
            }
        }
    });

    priceSliderInstance = priceSlider.noUiSlider;

    priceSlider.noUiSlider.on('update', function(values) {
        const min = Math.round(values[0]);
        const max = Math.round(values[1]);
        const priceRangeSpan = document.getElementById('filter-price-range');
        if (priceRangeSpan) {
            priceRangeSpan.textContent = `Rs.${min.toLocaleString()} - Rs.${max.toLocaleString()}`;
        }
    });

    priceSlider.noUiSlider.on('change', function(values) {
        const min = Math.round(values[0]);
        const max = Math.round(values[1]);

        console.log("Price filter changed:", min, "to", max);

        applyFiltersWithPrice(min, max);
    });
}

function applyFiltersWithPrice(minPrice, maxPrice) {
    if (!allProducts.length) return;

    let filteredProducts = [...allProducts];

    filteredProducts = filteredProducts.filter(product => {
        const productMinPrice = product.minPrice || 0;
        const productMaxPrice = product.maxPrice || product.minPrice || 0;


        return (productMinPrice <= maxPrice && productMaxPrice >= minPrice);
    });

    if (currentFilters.categories.length > 0) {
        filteredProducts = filteredProducts.filter(product =>
            currentFilters.categories.includes(product.category)
        );
    }

    if (currentFilters.colors.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
            if (!product.colors || product.colors.length === 0) return false;
            return product.colors.some(color =>
                currentFilters.colors.includes(color.name)
            );
        });
    }

    if (currentFilters.sizes.length > 0) {
        filteredProducts = filteredProducts.filter(product => {
            if (!product.sizes || product.sizes.length === 0) return false;
            return product.sizes.some(size =>
                currentFilters.sizes.includes(size.size)
            );
        });
    }

    updateProductCount(filteredProducts.length);

    if (filteredProducts.length === 0) {
        showNoProductsMessage();
    } else {
        renderProductCard({ productsObject: { men: filteredProducts, women: [], kids: [] } });
    }
}

function applyFilters() {
    let minPrice = originalMinPrice;
    let maxPrice = originalMaxPrice;

    if (priceSliderInstance) {
        const values = priceSliderInstance.get();
        minPrice = Math.round(values[0]);
        maxPrice = Math.round(values[1]);
    }

    applyFiltersWithPrice(minPrice, maxPrice);
}

function updateProductCount(count) {
    const toolboxInfo = document.querySelector('.toolbox-info');
    if (toolboxInfo) {
        toolboxInfo.innerHTML = `Showing <span>${count}</span> of ${allProducts.length} Products`;
    }
}

function clearAllFilters() {
    currentFilters = {
        categories: [],
        colors: [],
        sizes: []
    };

    document.querySelectorAll('.category-filter').forEach(checkbox => {
        checkbox.checked = false;
    });

    document.querySelectorAll('.size-filter').forEach(checkbox => {
        checkbox.checked = false;
    });

    document.querySelectorAll('.color-filter-item').forEach(colorItem => {
        colorItem.classList.remove('selected');
    });

    if (priceSliderInstance) {
        priceSliderInstance.set([originalMinPrice, originalMaxPrice]);
    }

    renderProductCard({ productsObject: { men: allProducts, women: [], kids: [] } });
    updateProductCount(allProducts.length);
}

function showNoProductsMessage() {
    const productGrid = document.getElementById("product-grid");
    if (productGrid) {
        productGrid.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="no-products-found">
                    <i class="fas fa-search"></i>
                    <h4>No products found</h4>
                    <p>Try adjusting your filters or clear all filters to see more products.</p>
                    <button class="btn btn-primary mt-3" onclick="clearAllFilters()">
                        <i class="fas fa-eraser"></i> Clear All Filters
                    </button>
                </div>
            </div>
        `;
    }
}