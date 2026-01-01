document.addEventListener("DOMContentLoaded", async () => {

    // Load header
    const headerContainer = document.getElementById("header-container");
    const headerRes = await fetch("header.html");
    headerContainer.innerHTML = await headerRes.text();

    // Load mobile menu into BODY (VERY IMPORTANT)
    const mobileRes = await fetch("mobile-menu.html");
    document.body.insertAdjacentHTML("beforeend", await mobileRes.text());

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
