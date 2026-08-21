document.addEventListener("DOMContentLoaded", async () => {

    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
        try {
            const headerRes = await fetch("header.html");
            headerContainer.innerHTML = await headerRes.text();
        } catch (error) {
            console.error("Error loading header:", error);
        }
    }


    try {
        const mobileRes = await fetch("mobile-menu.html");
        document.body.insertAdjacentHTML("beforeend", await mobileRes.text());
    } catch (error) {
        console.error("Error loading mobile menu:", error);
    }


    await initializeCartCount();

    initializeSearch();

    initializeMobileMenu();
});


function initializeMobileMenu() {
    if (window.jQuery) {
        const $ = window.jQuery;
        const $body = $('body');


        $('.mobile-menu-toggler').on('click', function (e) {
            $body.toggleClass('mmenu-active');
            $(this).toggleClass('active');
            e.preventDefault();
        });

        $('.mobile-menu-overlay, .mobile-menu-close').on('click', function (e) {
            $body.removeClass('mmenu-active');
            $('.mobile-menu-toggler').removeClass('active');
            e.preventDefault();
        });


        $('.mobile-menu').find('li').each(function () {
            var $this = $(this);

            if ($this.find('ul').length) {
                $('<span/>', {
                    'class': 'mmenu-btn'
                }).appendTo($this.children('a'));
            }
        });


        $('body').on('click', '.mmenu-btn', function (e) {
            var $parent = $(this).closest('li'),
                $targetUl = $parent.find('ul').eq(0);

            if (!$parent.hasClass('open')) {
                $targetUl.slideDown(300, function () {
                    $parent.addClass('open');
                });
            } else {
                $targetUl.slideUp(300, function () {
                    $parent.removeClass('open');
                });
            }

            e.stopPropagation();
            e.preventDefault();
        });
    }
}

function initializeSearch() {
    const searchInput = document.getElementById('q');
    const searchForm = document.getElementById('header-search-form');
    const resultsDropdown = document.getElementById('search-results-dropdown');

    if (!searchInput || !resultsDropdown) return;

    let debounceTimer = null;

    searchInput.addEventListener('input', function () {
        const keyword = this.value.trim();

        clearTimeout(debounceTimer);

        if (keyword.length < 2) {
            closeSearchResults();
            return;
        }

        debounceTimer = setTimeout(() => {
            runProductSearch(keyword);
        }, 300);
    });

    searchInput.addEventListener('focus', function () {
        if (this.value.trim().length >= 2 && resultsDropdown.innerHTML.trim() !== '') {
            resultsDropdown.classList.add('active');
        }
    });

    if (searchForm) {
        searchForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const keyword = searchInput.value.trim();
            if (keyword.length >= 2) {
                runProductSearch(keyword);
            }
        });
    }

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.header-search-wrapper')) {
            closeSearchResults();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
            closeSearchResults();
        }
    });
}

async function runProductSearch(keyword) {
    const resultsDropdown = document.getElementById('search-results-dropdown');
    if (!resultsDropdown) return;

    resultsDropdown.innerHTML = '<div class="search-result-loading">Searching...</div>';
    resultsDropdown.classList.add('active');

    try {
        const response = await fetch(`api/data/search?q=${encodeURIComponent(keyword)}`);

        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                renderSearchResults(data.results || []);
            } else {
                resultsDropdown.innerHTML = `<div class="search-result-empty">${data.message || 'No products found.'}</div>`;
            }
        } else {
            resultsDropdown.innerHTML = '<div class="search-result-empty">Search failed. Please try again.</div>';
        }
    } catch (error) {
        console.error('Search error:', error);
        resultsDropdown.innerHTML = '<div class="search-result-empty">Search failed. Please try again.</div>';
    }
}

function renderSearchResults(results) {
    const resultsDropdown = document.getElementById('search-results-dropdown');
    if (!resultsDropdown) return;

    if (!results.length) {
        resultsDropdown.innerHTML = '<div class="search-result-empty">No products found.</div>';
        resultsDropdown.classList.add('active');
        return;
    }

    const rowsHtml = results.map(product => {
        const image = (product.images && product.images[0]) ? product.images[0] : 'assets/images/placeholder.jpg';
        const minPrice = product.minPrice || 0;
        const maxPrice = product.maxPrice || 0;
        const priceText = minPrice === maxPrice
            ? `Rs.${minPrice.toFixed(2)}`
            : `Rs.${minPrice.toFixed(2)} - Rs.${maxPrice.toFixed(2)}`;

        return `
            <a href="product.html?id=${product.productId}" class="search-result-row">
                <img src="${image}" alt="${product.title}" onerror="this.src='assets/images/placeholder.jpg'">
                <div class="search-result-info">
                    <span class="search-result-title">${product.title}</span>
                    <span class="search-result-category">${product.category || ''}</span>
                </div>
                <span class="search-result-price">${priceText}</span>
            </a>
        `;
    }).join('');

    resultsDropdown.innerHTML = rowsHtml;
    resultsDropdown.classList.add('active');
}

function closeSearchResults() {
    const resultsDropdown = document.getElementById('search-results-dropdown');
    if (resultsDropdown) {
        resultsDropdown.classList.remove('active');
        resultsDropdown.innerHTML = '';
    }
}

async function updateCartCount() {
    try {
        const response = await fetch('api/carts/get-count', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        });

        if (response.ok) {
            const data = await response.json();
            if (data.status) {
                const cartCountElements = document.querySelectorAll('.cart-count, .cart-badge, #cart-count, .cart-count-number');

                cartCountElements.forEach(element => {
                    element.textContent = data.count;

                    if (data.count > 0) {
                        element.style.display = 'inline-block';
                        element.classList.remove('d-none', 'hidden');
                    } else {
                        element.style.display = 'none';
                        element.classList.add('d-none', 'hidden');
                    }
                });
                return data.count;
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
    return 0;
}

async function initializeCartCount() {
    try {
        await updateCartCount();

        setInterval(updateCartCount, 30000);

        document.addEventListener('cartUpdated', updateCartCount);
    } catch (error) {
        console.error("Error initializing cart count:", error);
    }
}

function triggerCartUpdate() {
    const event = new CustomEvent('cartUpdated');
    document.dispatchEvent(event);
}

window.updateCartCount = updateCartCount;
window.triggerCartUpdate = triggerCartUpdate;
window.initializeCartCount = initializeCartCount;

window.addEventListener('load', function() {

    if (!window.cartCountInitialized) {
        initializeCartCount();
        window.cartCountInitialized = true;
    }
});