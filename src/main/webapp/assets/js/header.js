document.addEventListener("DOMContentLoaded", async () => {
    // Load header
    const headerContainer = document.getElementById("header-container");
    const headerRes = await fetch("header.html");
    headerContainer.innerHTML = await headerRes.text();

    // Load mobile menu into BODY (VERY IMPORTANT)
    const mobileRes = await fetch("mobile-menu.html");
    document.body.insertAdjacentHTML("beforeend", await mobileRes.text());

    // ✅ CART COUNT: Initialize and update cart count
    await initializeCartCount();

    // Initialize Mobile Menu functionality
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

            if ( $this.find('ul').length ) {
                $('<span/>', {
                    'class': 'mmenu-btn'
                }).appendTo($this.children('a'));
            }
        });

        // Mobile Menu toggle children menu
        $('body').on('click', '.mmenu-btn', function (e) {
            var $parent = $(this).closest('li'),
                $targetUl = $parent.find('ul').eq(0);

            if ( !$parent.hasClass('open') ) {
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

});

// ✅ CART COUNT FUNCTIONS:

// 1. Global function to update cart count
// ✅ GLOBAL FUNCTION DECLARATIONS - Add at the end of your file
window.updateCartCount = async function() {
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
                const cartCountElements = document.querySelectorAll('.cart-count, .cart-badge, #cart-count');

                cartCountElements.forEach(element => {
                    element.innerText = data.count;

                    if (data.count > 0) {
                        element.style.display = 'inline-block';
                        element.classList.remove('d-none');
                    } else {
                        element.style.display = 'none';
                        element.classList.add('d-none');
                    }
                });
                return data.count;
            }
        }
    } catch (error) {
        console.error('Error updating cart count:', error);
    }
    return 0;
};

// ✅ Also add this utility function
window.triggerCartUpdate = function() {
    if (window.updateCartCount) {
        window.updateCartCount();
    }
};

// ✅ Initialize on window load
window.addEventListener('load', function() {
    if (window.updateCartCount) {
        window.updateCartCount();
    }
});
// 2. Initialize cart count on page load
async function initializeCartCount() {
    // Initial update
    await updateCartCount();

    // Optional: Auto-refresh every 30 seconds
    setInterval(updateCartCount, 30000);

    // ✅ Listen for cart updates from other parts of the app
    document.addEventListener('cartUpdated', updateCartCount);
}

// 3. Global event to trigger cart count update
function triggerCartUpdate() {
    const event = new CustomEvent('cartUpdated');
    document.dispatchEvent(event);
}

// 4. Make functions globally available
window.updateCartCount = updateCartCount;
window.triggerCartUpdate = triggerCartUpdate;
window.initializeCartCount = initializeCartCount;