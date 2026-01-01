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

})

async function loadTopProduct(){

    try {
        const response = await fetch("api/data/topProduct");
        if (response.ok) {
            const data = await response.json();
            console.log(data);
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

    const carousel = document.getElementById("topProductCarousel");
    carousel.innerHTML = "";

    products.forEach(product => {

        // Images (fallback safe)
        const img1 = product.images[0] ?? "assets/images/placeholder.jpg";
        const img2 = product.images[1] ?? img1;

        // Price display

        let priceHtml = "";
        if (product.minPrice === product.maxPrice) {
            priceHtml = `$${product.minPrice}`;
        } else {
            priceHtml = `$${product.minPrice} - $${product.maxPrice}`;
        }

        // Color dots
        let colorHtml = "";
        product.colors.forEach((color, index) => {
            colorHtml += `
                <a href="#" class="${index === 0 ? 'active' : ''}"
                   style="background: ${color.hexCode};">
                   <span class="sr-only">${color.name}</span>
                </a>
            `;
        });

        // Product card HTML
        const productHtml = `
            <div class="product product-7 text-center">
                <figure class="product-media">
                    <a href="product.html?id=${product.productId}">
                        <img src="${img1}" class="product-image">
                        <img src="${img2}" class="product-image-hover">
                    </a>

                    <div class="product-action-vertical">
                        <a href="#" class="btn-product-icon btn-wishlist btn-expandable">
                            <span>add to wishlist</span>
                        </a>
                        <a href="#" class="btn-product-icon btn-quickview">
                            <span>Quick view</span>
                        </a>
                    </div>

                    <div class="product-action">
                        <a href="#" class="btn-product btn-cart">
                            <span>add to cart</span>
                        </a>
                    </div>
                </figure>

                <div class="product-body">
                    <h3 class="product-title">
                        <a href="product.html?id=${product.productId}">
                            ${product.title}
                        </a>
                    </h3>

                    <div class="product-price">
                        ${priceHtml}
                    </div>

                    <div class="product-nav product-nav-dots">
                        ${colorHtml}
                    </div>
                </div>
            </div>
        `;

        carousel.insertAdjacentHTML("beforeend", productHtml);
    });

    // Re-init Owl Carousel
    $('#topProductCarousel').owlCarousel(
        $('#topProductCarousel').data('owl-options')
    );
}
