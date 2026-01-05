window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        await loadTopProduct();
    } finally {
        Notiflix.Loading.remove();
    }
});

async function loadTopProduct() {
    try {
        const response = await fetch("api/data/topProduct");
        if (response.ok) {
            const data = await response.json();
            renderingNewArrivals(data.newArrivals);
        } else {
            Notiflix.Notify.failure("Product data loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }
}

function renderingNewArrivals(products) {
    const carousel = $('#topProductCarousel');

    if (carousel.hasClass('owl-loaded')) {
        carousel.trigger('destroy.owl.carousel');
    }
    carousel.html('');

    products.forEach(product => {
        const img1 = product.images[0] ?? "assets/images/placeholder.jpg";
        const img2 = product.images[1] ?? img1;

        const priceHtml = product.minPrice === product.maxPrice ?
            `Rs.${product.minPrice}.00` :
            `Rs.${product.minPrice}.00 - Rs.${product.maxPrice}.00`;

        const uniqueColors = [...new Map(product.colors.map(item => [item.hexCode, item])).values()];
        let colorHtml = '';
        uniqueColors.forEach((color, index) => {
            colorHtml += `<a href="#" class="${index === 0 ? 'active' : ''}" style="background:${color.hexCode};"><span class="sr-only">${color.name}</span></a>`;
        });

        const productHtml = `
            <div class="product product-7 text-center modern-product-card">
                <figure class="product-media product-media-wrapper" style="aspect-ratio: 1 / 1.1; overflow: hidden;">
                    <a href="product.html?id=${product.productId}">
                        <img src="${img1}" alt="${product.title}" class="product-image" style="width: 100%; height: 100%; object-fit: cover;">
                        <img src="${img2}" alt="${product.title}" class="product-image-hover" style="width: 100%; height: 100%; object-fit: cover;">
                    </a>
                    <div class="product-action-vertical">
                        <a href="#" class="btn-product-icon btn-wishlist btn-expandable"><span>add to wishlist</span></a>
                    </div>
                    <div class="product-action">
                        <a href="#" class="btn-product btn-cart"><span>add to cart</span></a>
                    </div>
                </figure>
                <div class="product-body">
                    <h3 class="product-title"><a href="product.html?id=${product.productId}">${product.title}</a></h3>
                    <h4 class="product-price">${priceHtml}</h4>
                    <div class="product-nav product-nav-dots">${colorHtml}</div>
                </div>
            </div>
        `;
        carousel.append(productHtml);
    });

    if (products.length > 0) {
        carousel.owlCarousel(carousel.data('owl-options'));
    }
}