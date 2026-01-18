// ✅ Main initialization when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
    // Load header
    const headerContainer = document.getElementById("header-container");
    if (headerContainer) {
        try {
            const headerRes = await fetch("header.html");
            headerContainer.innerHTML = await headerRes.text();
        } catch (error) {
            console.error("Error loading header:", error);
        }
    }

    // Load mobile menu into BODY
    try {
        const mobileRes = await fetch("mobile-menu.html");
        document.body.insertAdjacentHTML("beforeend", await mobileRes.text());
    } catch (error) {
        console.error("Error loading mobile menu:", error);
    }

    // ✅ Initialize cart count
    await initializeCartCount();

    // Initialize Mobile Menu functionality
    initializeMobileMenu();
});

// ✅ Mobile Menu Initialization
function initializeMobileMenu() {
    if (window.jQuery) {
        const $ = window.jQuery;
        const $body = $('body');

        // Mobile Menu Toggle - Show & Hide
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

        // Add Mobile menu icon arrows to items with children
        $('.mobile-menu').find('li').each(function () {
            var $this = $(this);

            if ($this.find('ul').length) {
                $('<span/>', {
                    'class': 'mmenu-btn'
                }).appendTo($this.children('a'));
            }
        });

        // Mobile Menu toggle children menu
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
    // Only run if cart count wasn't already initialized
    if (!window.cartCountInitialized) {
        initializeCartCount();
        window.cartCountInitialized = true;
    }
});

