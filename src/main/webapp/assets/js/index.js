window.addEventListener("load", async () => {
    Notiflix.Loading.pulse("Wait...", {
        clickToClose: false,
        svgColor: '#0284c7'
    });

    try {
        await loadTopProduct();
        await loadTabPanel();
    } finally {
        Notiflix.Loading.remove();
    }
});

async function loadTabPanel(){

    try {
        const response = await fetch("api/data/productTab");
        if (response.ok) {
            const data = await response.json();
            console.log(data);
            renderCategoryTabs(data);
        } else {
            Notiflix.Notify.failure("Product Tab loading failed!", {
                position: 'center-top'
            });
        }
    } catch (e) {
        Notiflix.Notify.failure(e.message, {
            position: 'center-top'
        });
    }

}

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
        const productHtml = createProductCard(product);
        carousel.append(productHtml);
    });

    if (products.length > 0) {
        carousel.owlCarousel(carousel.data('owl-options'));
    }
}

function renderCategoryTabs(data){
    const tabContainer = document.getElementById("categoryTabs");
    const tabContentContainer = document.getElementById("categoryTabContent");

    tabContainer.innerHTML = '';
    tabContentContainer.innerHTML = '';

    let firstTab = true;

    data.categories.forEach(category => {
        const categoryKey = category.name.toLowerCase()
            .replace("'s","")
            .replace(" ", "_")
            .replace("_fashion","");

        const products = data.productsObject[categoryKey] || [];

        const tabId = `tab-${category.id}`;
        const contentId = `content-${category.id}`;

        const tabHtml = `
            <li class="nav-item">
                <a class="nav-link ${firstTab ? 'active' : ''}" 
                   id="${tabId}" 
                   data-toggle="tab" 
                   href="#${contentId}"
                   role="tab">
                   ${category.name}
                </a>
            </li>
        `;
        tabContainer.innerHTML += tabHtml;

        let productsHtml = '';
        if (products.length > 0) {
            products.forEach(product => {
                const productCard = createProductCard(product, category.name);

                productsHtml += `
                    <div class="col-6 col-md-4 col-lg-3 col-xl-5col mb-4">
                        ${productCard}
                    </div>
                `;
            });
        } else {
            productsHtml = `
                <div class="col-12 text-center py-5">
                    <div class="alert alert-info">
                        <i class="fas fa-box-open mr-2"></i>
                        No products found in ${category.name}
                    </div>
                </div>
            `;
        }

        const contentHtml = `
            <div class="tab-pane p-0 fade ${firstTab ? 'show active' : ''}" 
                 id="${contentId}" 
                 role="tabpanel" 
                 aria-labelledby="${tabId}">
                <div class="products">
                    <div class="row justify-content-center">
                        ${productsHtml}
                    </div>
                </div>
            </div>
        `;
        tabContentContainer.innerHTML += contentHtml;

        firstTab = false;
    });
}

function createProductCard(product, categoryName = null) {
    const img1 = product.images && product.images[0] ? product.images[0] : "assets/images/placeholder.jpg";
    const img2 = product.images && product.images[1] ? product.images[1] : img1;

    const rating = product.rating || 4.5;
    const reviewCount = product.reviewCount || Math.floor(Math.random() * 50) + 5;

    const starWidth = (rating / 5) * 100;

    const starRatingHtml = `
        <div class="ratings-container">
            <div class="ratings">
                <div class="ratings-val" style="width: ${starWidth}%;"></div>
            </div>
            <span class="ratings-text">(${reviewCount} Reviews)</span>
        </div>`;

    const priceHtml = product.minPrice === product.maxPrice ?
        `Rs.${product.minPrice}.00` :
        `Rs.${product.minPrice}.00 - Rs.${product.maxPrice}.00`;

    const uniqueColors = [...new Map(product.colors.map(item => [item.hexCode, item])).values()];
    let colorHtml = '';
    uniqueColors.forEach((color, index) => {
        colorHtml += `<a href="#" class="${index === 0 ? 'active' : 'active'} mr-2" style="background:${color.hexCode};"><span class="sr-only">${color.name}</span></a>`;
    });


    const categoryBadge = categoryName ? `
        <div class="category-name-badge">
            ${categoryName}
        </div>
    ` : '';

    return `
        <div class="product product-7 text-center modern-product-card mb-5" style="margin-bottom: 20px" >
            <figure class="product-media product-media-wrapper" style="aspect-ratio: 1 / 1.1; overflow: hidden;">
                <a href="product.html?id=${product.productId}">
                    <img src="${img1}" alt="${product.title}" class="product-image" style="width: 100%; height: 100%; object-fit: cover;">
                    <img src="${img2}" alt="${product.title}" class="product-image-hover" style="width: 100%; height: 100%; object-fit: cover;">
                </a>
                ${categoryBadge}
                <div class="product-action-vertical">
                    <a class="btn-product-icon btn-wishlist btn-expandable" onclick="addTowatchlist(${product.productId})"><span>add to wishlist</span></a>
                </div>
                <div class="product-action">
                    <a  class="btn-product btn-cart" href="product.html?id=${product.productId}"><span>add to cart</span></a>
                </div>
            </figure>
            <div class="product-body">
                <h3 class="product-title"><a href="product.html?id=${product.productId}">${product.title}</a></h3>
                <h4 class="product-price">${priceHtml}</h4>
                <div class="product-nav product-nav-dots">${colorHtml}</div>
                ${starRatingHtml}
            </div>
        </div>
    `;
}
